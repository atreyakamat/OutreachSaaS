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

    // 2. If it's a reply, stop the sequence for this contact
    if (type === 'REPLY') {
      const emailJob = await prisma.emailJob.findUnique({
        where: { id: emailJobId },
        include: { contact: true },
      });

      if (emailJob) {
        // Update all active sequence states for this contact to STOPPED_REPLY
        await prisma.leadSequenceState.updateMany({
          where: { contactId: emailJob.contactId, status: 'ENROLLED' },
          data: { status: 'STOPPED_REPLY' },
        });

        console.log(`[OUTREACH ENGINE] Sequence stopped for ${emailJob.contact.email} due to REPLY`);
      }
    }

    res.status(200).json({ message: 'Event handled' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error handling event', error: error.message });
  }
};
