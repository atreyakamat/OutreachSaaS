import { Request, Response } from 'express';
import axios from 'axios';
import prisma from '../config/prisma';
import { getTimezone } from '../utils/timezone';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const processAILeads = async (req: AuthRequest, res: Response) => {
  const { rawData } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  const prompt = `
    You are an expert data entry assistant. Convert the following messy text into a structured JSON array of leads.
    Each lead object must have:
    - company_name
    - domain
    - country
    - city
    - contact_name
    - email

    Text to process:
    """
    ${rawData}
    """

    Return ONLY the JSON array. Do not include any explanation or other text.
    If information is missing, use an empty string. Ensure the JSON is valid.
  `;

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
    });

    let jsonResponse: any[];
    try {
      const content = response.data.response.trim();
      // Remove possible markdown formatting from Ollama
      const cleaned = content.replace(/```json|```/g, '').trim();
      jsonResponse = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Ollama output was not valid JSON:', response.data.response);
      return res.status(422).json({ message: 'AI output was not valid JSON', rawOutput: response.data.response });
    }

    // Process and enrich leads
    const leadsData = jsonResponse.map((row: any) => ({
      companyName: row.company_name || 'Unknown',
      domain: row.domain || '',
      country: row.country || 'Unknown',
      city: row.city || 'Unknown',
      contactName: row.contact_name || 'Unknown',
      email: row.email || '',
      timezone: getTimezone(row.country || '', row.city || ''),
      organizationId,
    }));

    // In this "Finalize and Proceed" logic, we might just return the preview 
    // or save directly. Let's return it for the user to review in the tabs.
    res.json(leadsData);
  } catch (error: any) {
    console.error('AI Processing Error:', error.message);
    res.status(500).json({ message: 'AI lead processing failed', error: error.message });
  }
};

export const bulkSaveLeads = async (req: AuthRequest, res: Response) => {
  const { leads } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const savedLeads = await prisma.lead.createMany({
      data: leads.map((l: any) => ({
        ...l,
        organizationId,
      })),
      skipDuplicates: true,
    });
    res.status(201).json({ count: savedLeads.count });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to save leads', error: error.message });
  }
};
