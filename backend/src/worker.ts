import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import prisma from './config/prisma.js';
import { getNext10AMUTC } from './utils/timezone.js';
import { addEmailJob } from './services/queue.service.js';
import { enrichCompany } from './services/enrichment.service.js';
import moment from 'moment-timezone';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

// Main Email and Engine Worker
const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    if (job.name === 'send-email') {
      const { emailJobId, to, subjectTemplate, bodyTemplate, leadData } = job.data;
      console.log(`Processing email job ${emailJobId} for ${to}`);

      try {
        const emailJob = await prisma.emailJob.findUnique({
          where: { id: emailJobId },
          include: { contact: true, sequenceStep: { include: { sequence: true } } },
        });

        if (!emailJob || emailJob.contact.status !== 'ACTIVE') {
          await prisma.emailJob.update({
            where: { id: emailJobId },
            data: { status: 'CANCELLED' },
          });
          return;
        }

        console.log(`[OUTREACH ENGINE] Sending email to ${to}`);
        
        await prisma.emailJob.update({
          where: { id: emailJobId },
          data: { status: 'SENT', sentAt: new Date() },
        });

        // Sequence Progression
        const currentStep = emailJob.sequenceStep;
        const nextStep = await prisma.sequenceStep.findFirst({
          where: { sequenceId: currentStep.sequenceId, orderIndex: { gt: currentStep.orderIndex } },
          orderBy: { orderIndex: 'asc' },
        });

        if (nextStep) {
          const leadTimezone = emailJob.contact.timezone || 'UTC';
          let targetDate = moment.tz(leadTimezone).add(nextStep.waitDays, 'days').hour(10).minute(0).second(0).millisecond(0);
          if (targetDate.isBefore(moment())) targetDate.add(1, 'day');

          const scheduledAt = targetDate.toDate();
          const nextEmailJob = await prisma.emailJob.create({
            data: {
              organizationId: emailJob.organizationId,
              contactId: emailJob.contactId,
              sequenceStepId: nextStep.id,
              scheduledAt,
              status: 'QUEUED',
            },
          });

          await addEmailJob(nextEmailJob.id, {
            emailJobId: nextEmailJob.id,
            to: emailJob.contact.email,
            subjectTemplate: nextStep.subjectTemplate,
            bodyTemplate: nextStep.bodyTemplate,
            leadData: { contactName: emailJob.contact.name, companyName: 'N/A' }, // Fetch company name if needed
          }, Math.max(0, scheduledAt.getTime() - Date.now()));

          await prisma.leadSequenceState.update({
            where: { contactId_sequenceId: { contactId: emailJob.contactId, sequenceId: currentStep.sequenceId } },
            data: { currentStepId: nextStep.id },
          });
        }
      } catch (err: any) {
        console.error(`Email job failed: ${err.message}`);
        throw err;
      }
    }
  },
  { connection }
);

// Enrichment and Reminders Worker
const automationWorker = new Worker(
  'automation-queue',
  async (job) => {
    if (job.name === 'enrich-company') {
      const { companyId } = job.data;
      await enrichCompany(companyId);
    }
    
    if (job.name === 'check-reminders') {
      console.log('Checking for follow-up reminders...');
      // Logic to send notifications or mark as overdue
    }
  },
  { connection }
);

console.log('Outreach Engine Workers are running...');
