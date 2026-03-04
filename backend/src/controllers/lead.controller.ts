import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import fs from 'fs';
import csv from 'csv-parser';
import { getTimezone } from '../utils/timezone.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const createLead = async (req: AuthRequest, res: Response) => {
  const { companyId, contactName, role, email, linkedinProfile, timezone } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const lead = await prisma.lead.create({
      data: {
        companyId,
        contactName,
        role,
        email,
        linkedinProfile,
        timezone: timezone || 'UTC',
        pipelineStatus: 'FOUND',
      },
    });

    res.status(201).json(lead);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating lead', error: error.message });
  }
};

export const getLeads = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const leads = await prisma.lead.findMany({
      where: { company: { organizationId } },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leads', error: error.message });
  }
};

export const uploadLeads = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ message: 'Legacy CSV upload disabled. Please use the AI Discovery Hub to seed companies and then find decision makers.' });
};
