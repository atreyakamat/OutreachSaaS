import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { getNext10AMUTC } from '../utils/timezone.js';
import { addEmailJob } from '../services/queue.service.js';
import moment from 'moment-timezone';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const createSequence = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const sequence = await prisma.sequence.create({
      data: {
        name,
        organizationId,
      },
    });
    res.status(201).json(sequence);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating sequence', error: error.message });
  }
};

export const getSequences = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const sequences = await prisma.sequence.findMany({
      where: { organizationId },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sequences);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching sequences', error: error.message });
  }
};

export const addSequenceStep = async (req: AuthRequest, res: Response) => {
  const { sequenceId } = req.params;
  const { subjectTemplate, bodyTemplate, waitDays, orderIndex } = req.body;

  try {
    const step = await prisma.sequenceStep.create({
      data: {
        sequenceId,
        subjectTemplate,
        bodyTemplate,
        waitDays: waitDays || 0,
        orderIndex: orderIndex || 0,
      },
    });
    res.status(201).json(step);
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding step', error: error.message });
  }
};

export const enrollLeads = async (req: AuthRequest, res: Response) => {
  const { sequenceId } = req.params;
  const { leadIds } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const sequence = await prisma.sequence.findUnique({
      where: { id: sequenceId },
      include: { steps: { orderBy: { orderIndex: 'asc' }, take: 1 } },
    });

    if (!sequence || sequence.organizationId !== organizationId) {
      return res.status(404).json({ message: 'Sequence not found' });
    }

    if (sequence.steps.length === 0) {
      return res.status(400).json({ message: 'Sequence has no steps' });
    }

    const firstStep = sequence.steps[0];
    const now = new Date();

    for (const leadId of leadIds) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead || lead.organizationId !== organizationId) continue;

      // Create enrollment state
      await prisma.leadSequenceState.upsert({
        where: { leadId_sequenceId: { leadId, sequenceId } },
        update: { currentStepId: firstStep.id, status: 'ENROLLED' },
        create: { leadId, sequenceId, currentStepId: firstStep.id, status: 'ENROLLED' },
      });

      // Schedule first step
      const scheduledAt = getNext10AMUTC(lead.timezone);
      const delay = Math.max(0, scheduledAt.getTime() - now.getTime());

      const emailJob = await prisma.emailJob.create({
        data: {
          organizationId,
          leadId: lead.id,
          sequenceStepId: firstStep.id,
          scheduledAt,
          status: 'QUEUED',
        },
      });

      await addEmailJob(emailJob.id, {
        emailJobId: emailJob.id,
        to: lead.email,
        subjectTemplate: firstStep.subjectTemplate,
        bodyTemplate: firstStep.bodyTemplate,
        leadData: {
          contactName: lead.contactName,
          companyName: lead.companyName,
        },
      }, delay);
    }

    res.json({ message: 'Leads enrolled and first steps scheduled' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error enrolling leads', error: error.message });
  }
};
