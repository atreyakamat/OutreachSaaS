import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { getNext10AMUTC } from '../utils/timezone';
import { addEmailJob } from '../services/queue.service';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const createCampaign = async (req: AuthRequest, res: Response) => {
  const { name, subjectTemplate, bodyTemplate } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const campaign = await prisma.campaign.create({
      data: {
        name,
        subjectTemplate,
        bodyTemplate,
        organizationId,
      },
    });

    // Link all active leads from this organization to the campaign for MVP
    const leads = await prisma.lead.findMany({
      where: { organizationId, status: 'ACTIVE' },
    });

    await prisma.campaignLead.createMany({
      data: leads.map((lead) => ({
        campaignId: campaign.id,
        leadId: lead.id,
      })),
    });

    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
};

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
};

export const startCampaign = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { campaignLeads: { include: { lead: true } } },
    });

    if (!campaign || campaign.organizationId !== organizationId) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Campaign is already active' });
    }

    // Update campaign status
    await prisma.campaign.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    const now = new Date();

    for (const cl of campaign.campaignLeads) {
      const scheduledAt = getNext10AMUTC(cl.lead.timezone);
      const delay = Math.max(0, scheduledAt.getTime() - now.getTime());

      const emailJob = await prisma.emailJob.create({
        data: {
          organizationId,
          campaignId: campaign.id,
          leadId: cl.lead.id,
          scheduledAt,
          status: 'QUEUED',
        },
      });

      await addEmailJob(emailJob.id, {
        emailJobId: emailJob.id,
        to: cl.lead.email,
        subjectTemplate: campaign.subjectTemplate,
        bodyTemplate: campaign.bodyTemplate,
        leadData: {
          contactName: cl.lead.contactName,
          companyName: cl.lead.companyName,
        },
      }, delay);
    }

    res.json({ message: 'Campaign started and emails scheduled' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error starting campaign', error: error.message });
  }
};
