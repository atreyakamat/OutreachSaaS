import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const updatePipelineStage = async (req: AuthRequest, res: Response) => {
  const { leadId } = req.params;
  const { stage, notes, nextFollowup } = req.body;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { company: true },
    });

    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        pipelineStage: stage || lead.pipelineStage,
        notes: notes !== undefined ? notes : lead.notes,
        nextFollowup: nextFollowup ? new Date(nextFollowup) : lead.nextFollowup,
      },
    });

    // Create Activity Log
    await prisma.activityLog.create({
      data: {
        companyId: lead.companyId,
        leadId: lead.id,
        action: 'Pipeline Update',
        details: `Moved to stage: ${stage || lead.pipelineStage}. Notes: ${notes || 'N/A'}`,
      },
    });

    res.json(updatedLead);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating pipeline', error: error.message });
  }
};

export const getFollowups = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  const now = new Date();

  try {
    const leads = await prisma.lead.findMany({
      where: {
        company: { organizationId },
        nextFollowup: { lte: now },
      },
      include: { company: true },
      orderBy: { nextFollowup: 'asc' },
    });
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching follow-ups', error: error.message });
  }
};

export const getActivityLogs = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;

  try {
    const logs = await prisma.activityLog.findMany({
      where: { company: { organizationId } },
      include: { company: true, lead: true },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
  }
};
