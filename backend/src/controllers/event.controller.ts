import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const handleEvent = async (req: Request, res: Response) => {
  const { type, email, emailJobId, metadata } = req.body;

  try {
    // 1. Record Event
    const event = await prisma.event.create({
      data: {
        emailJobId,
        type,
        metadata,
      },
    });

    // 2. If it's a reply, stop the sequence for this lead
    if (type === 'REPLY') {
      const emailJob = await prisma.emailJob.findUnique({
        where: { id: emailJobId },
        include: { lead: true },
      });

      if (emailJob) {
        // Mark lead as REPLIED
        await prisma.lead.update({
          where: { id: emailJob.leadId },
          data: { status: 'REPLIED' },
        });

        // Update all active sequence states for this lead to STOPPED_REPLY
        await prisma.leadSequenceState.updateMany({
          where: { leadId: emailJob.leadId, status: 'ENROLLED' },
          data: { status: 'STOPPED_REPLY' },
        });

        console.log(`[OUTREACH ENGINE] Sequence stopped for ${emailJob.lead.email} due to REPLY`);
      }
    }

    res.status(200).json({ message: 'Event handled' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error handling event', error: error.message });
  }
};
