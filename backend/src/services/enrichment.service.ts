import axios from 'axios';
import prisma from '../config/prisma.js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

export const enrichCompany = async (companyId: string) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return;

  console.log(`Enriching company: ${company.companyName}`);

  const prompt = `
    You are a business intelligence assistant. Provide enrichment for this company:
    Name: ${company.companyName}
    Domain: ${company.domain}
    
    Please provide:
    1. A brief description (1-2 sentences).
    2. Primary industry.
    3. Estimated company size (e.g. 10-50, 51-200, 201-500).
    4. Any hiring signals (e.g. "actively hiring interns", "expanding tech team").
    
    Return ONLY a JSON object with keys: description, industry, sizeRange, hiringSignal.
  `;

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
    });

    const content = response.data.response.trim();
    const cleaned = content.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleaned);

    // Calculate score
    let score = company.score || 0;
    if (data.sizeRange && (data.sizeRange.includes('10') || data.sizeRange.includes('50') || data.sizeRange.includes('100') || data.sizeRange.includes('200'))) score += 3;
    if (data.hiringSignal && data.hiringSignal.toLowerCase().includes('hiring')) score += 5;
    if (['SaaS', 'Tech', 'Marketing', 'Design', 'Consulting'].includes(data.industry)) score += 2;

    await prisma.company.update({
      where: { id: companyId },
      data: {
        description: data.description,
        industry: data.industry || company.industry,
        companySize: data.sizeRange || company.companySize,
        hiringSignal: data.hiringSignal,
        score: score,
        status: 'ENRICHED'
      }
    });

    console.log(`Successfully enriched ${company.companyName}`);
  } catch (error: any) {
    console.error(`Failed to enrich company ${company.companyName}:`, error.message);
  }
};
