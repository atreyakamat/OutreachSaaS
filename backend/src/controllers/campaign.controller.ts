import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const createCampaign = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const campaign = await prisma.outreachCampaign.create({
      data: { name, organizationId }
    });
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const campaigns = await prisma.outreachCampaign.findMany({
      where: { organizationId },
      include: { templates: true }
    });
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
  const { campaignId } = req.params;
  const { name, subject, body } = req.body;

  try {
    const template = await prisma.messageTemplate.create({
      data: { campaignId, name, subject, body }
    });
    res.status(201).json(template);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};
