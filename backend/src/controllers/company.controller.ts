import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const createCompany = async (req: AuthRequest, res: Response) => {
  const { name, domain, industry, city, country, sizeRange } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const company = await prisma.company.create({
      data: {
        name,
        domain,
        industry,
        city,
        country,
        sizeRange,
        organizationId,
      },
    });
    res.status(201).json(company);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
};

export const getCompanies = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const companies = await prisma.company.findMany({
      where: { organizationId },
      include: { leads: true },
      orderBy: { score: 'desc' },
    });
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
};

export const updateCompanyStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const company = await prisma.company.update({
      where: { id },
      data: { status },
    });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};
