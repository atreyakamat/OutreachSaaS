import { Request, Response } from 'express';
import axios from 'axios';
import prisma from '../config/prisma.js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const discoverCompanies = async (req: AuthRequest, res: Response) => {
  const { rawData } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  const prompt = `
    You are an expert market research assistant. Extract a list of companies from the following text.
    For each company, identify:
    - name
    - domain (website)
    - industry
    - city
    - country
    - description (brief)
    - sizeRange (e.g. 10-50, 51-200, 201-500)
    - hiringSignal (e.g. "hiring interns", "active careers page", "recently funded")

    Text to process:
    """
    ${rawData}
    """

    Return ONLY a JSON array of objects. Do not include any explanation.
    If info is missing, use null.
  `;

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
    });

    let companies: any[];
    try {
      const content = response.data.response.trim();
      const cleaned = content.replace(/```json|```/g, '').trim();
      companies = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(422).json({ message: 'AI output was not valid JSON', rawOutput: response.data.response });
    }

    // Scoring logic
    const enrichedCompanies = companies.map(c => {
      let score = 0;
      if (c.sizeRange && (c.sizeRange.includes('10') || c.sizeRange.includes('50') || c.sizeRange.includes('100') || c.sizeRange.includes('200'))) score += 3;
      if (c.hiringSignal && c.hiringSignal.toLowerCase().includes('hiring')) score += 5;
      if (['SaaS', 'Tech', 'Marketing', 'Design', 'Consulting'].includes(c.industry)) score += 2;
      
      return { ...c, score, organizationId };
    });

    res.json(enrichedCompanies);
  } catch (error: any) {
    res.status(500).json({ message: 'AI discovery failed', error: error.message });
  }
};

export const bulkSaveCompanies = async (req: AuthRequest, res: Response) => {
  const { companies } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const saved = await prisma.company.createMany({
      data: companies.map((c: any) => ({
        ...c,
        organizationId,
      })),
      skipDuplicates: true,
    });
    res.status(201).json({ count: saved.count });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to save companies', error: error.message });
  }
};
