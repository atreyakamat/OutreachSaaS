import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const getPipeline = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const pipeline = await prisma.outreachPipeline.findMany({
      where: { company: { organizationId } },
      include: { 
        company: true,
        contact: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(pipeline);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching pipeline', error: error.message });
  }
};

export const updatePipelineStage = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { stage, contactId, nextFollowup, notes, status } = req.body;

  try {
    const entry = await prisma.outreachPipeline.findUnique({
      where: { id },
      include: { company: true }
    });

    if (!entry) return res.status(404).json({ message: 'Pipeline entry not found' });

    const updatedEntry = await prisma.outreachPipeline.update({
      where: { id },
      data: {
        stage: stage || entry.stage,
        contactId: contactId || entry.contactId,
        nextFollowup: nextFollowup ? new Date(nextFollowup) : entry.nextFollowup,
        notes: notes !== undefined ? notes : entry.notes,
        status: status || entry.status,
        lastContacted: stage && stage.includes('sent') ? new Date() : entry.lastContacted,
      }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        companyId: entry.companyId,
        contactId: contactId || entry.contactId,
        action: 'Pipeline Stage Updated',
        details: `Moved to stage: ${stage || entry.stage}`,
      }
    });

    res.json(updatedEntry);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating pipeline', error: error.message });
  }
};

export const getFollowupsDue = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  const now = new Date();

  try {
    const followups = await prisma.outreachPipeline.findMany({
      where: {
        company: { organizationId },
        nextFollowup: { lte: now },
        status: 'active'
      },
      include: { 
        company: true,
        contact: true
      },
      orderBy: { nextFollowup: 'asc' }
    });
    res.json(followups);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching followups', error: error.message });
  }
};
