import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const createCompany = async (req: AuthRequest, res: Response) => {
  const { companyName, domain, industry, city, country, companySize, source, website, linkedinUrl } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const company = await prisma.company.create({
      data: {
        companyName,
        domain,
        industry,
        city,
        country,
        companySize,
        source,
        website,
        linkedinUrl,
        organizationId,
      },
    });

    // Automatically create a pipeline entry
    await prisma.outreachPipeline.create({
      data: {
        companyId: company.id,
        stage: 'discovered',
      }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        companyId: company.id,
        action: 'Company Discovered',
        details: `Discovered company: ${companyName}`,
      }
    });

    // Trigger background enrichment job
    import('../services/queue.service.js').then(qs => qs.addEnrichmentJob(company.id));

    res.status(201).json(company);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
};

export const getCompanies = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  const { industry, city, stage, score } = req.query;

  try {
    const companies = await prisma.company.findMany({
      where: { 
        organizationId,
        ...(industry && { industry: industry as string }),
        ...(city && { city: city as string }),
        ...(score && { score: { gte: parseInt(score as string) } }),
        ...(stage && { pipelineEntries: { some: { stage: stage as string } } }),
      },
      include: { 
        contacts: true,
        pipelineEntries: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
};

export const getCompanyById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: { 
        contacts: true,
        pipelineEntries: {
          include: { contact: true }
        },
        activityLogs: {
          include: { contact: true },
          orderBy: { timestamp: 'desc' }
        }
      },
    });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching company', error: error.message });
  }
};
