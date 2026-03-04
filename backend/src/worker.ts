import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from './config/prisma.js';
import { getNext10AMUTC } from './utils/timezone.js';
import { addEmailJob } from './services/queue.service.js';
import moment from 'moment-timezone';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

const replacePlaceholders = (template: string, data: any) => {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return data[key] || match;
  });
};

const worker = new Worker(
  'email-queue',
  async (job) => {
    const { emailJobId, to, subjectTemplate, bodyTemplate, leadData } = job.data;

    console.log(`Processing email job ${emailJobId} for ${to}`);

    try {
      // 1. Pre-send checks (Stop if lead replied or unsubscribed)
      const emailJob = await prisma.emailJob.findUnique({
        where: { id: emailJobId },
        include: { lead: true, sequenceStep: { include: { sequence: true } } },
      });

      if (!emailJob || emailJob.lead.status !== 'ACTIVE') {
        console.log(`Job ${emailJobId} cancelled: Lead is not ACTIVE`);
        await prisma.emailJob.update({
          where: { id: emailJobId },
          data: { status: 'CANCELLED' },
        });
        return;
      }

      // 2. Perform Send (Simulated)
      const subject = replacePlaceholders(subjectTemplate, leadData);
      const body = replacePlaceholders(bodyTemplate, leadData);

      console.log(`[OUTREACH ENGINE] Sending email to ${to}: ${subject}`);
      
      // 3. Update Current Job
      await prisma.emailJob.update({
        where: { id: emailJobId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // 4. Progress Sequence
      const currentStep = emailJob.sequenceStep;
      const sequence = currentStep.sequence;

      const nextStep = await prisma.sequenceStep.findFirst({
        where: {
          sequenceId: sequence.id,
          orderIndex: { gt: currentStep.orderIndex },
        },
        orderBy: { orderIndex: 'asc' },
      });

      if (nextStep) {
        // Calculate next scheduled time
        // Current time + nextStep.waitDays + 10 AM Local
        const leadTimezone = emailJob.lead.timezone;
        let targetDate = moment.tz(leadTimezone).add(nextStep.waitDays, 'days').hour(10).minute(0).second(0).millisecond(0);
        
        // Ensure it's in the future
        if (targetDate.isBefore(moment())) {
          targetDate.add(1, 'day');
        }

        const scheduledAt = targetDate.toDate();
        const now = new Date();
        const delay = Math.max(0, scheduledAt.getTime() - now.getTime());

        const nextEmailJob = await prisma.emailJob.create({
          data: {
            organizationId: emailJob.organizationId,
            leadId: emailJob.leadId,
            sequenceStepId: nextStep.id,
            scheduledAt,
            status: 'QUEUED',
          },
        });

        await addEmailJob(nextEmailJob.id, {
          emailJobId: nextEmailJob.id,
          to: emailJob.lead.email,
          subjectTemplate: nextStep.subjectTemplate,
          bodyTemplate: nextStep.bodyTemplate,
          leadData: {
            contactName: emailJob.lead.contactName,
            companyName: emailJob.lead.companyName,
          },
        }, delay);

        // Update sequence state for lead
        await prisma.leadSequenceState.update({
          where: { leadId_sequenceId: { leadId: emailJob.leadId, sequenceId: sequence.id } },
          data: { currentStepId: nextStep.id },
        });

        console.log(`Lead ${emailJob.leadId} progressed to step ${nextStep.orderIndex} in sequence ${sequence.name}`);
      } else {
        // Mark as FINISHED
        await prisma.leadSequenceState.update({
          where: { leadId_sequenceId: { leadId: emailJob.leadId, sequenceId: sequence.id } },
          data: { status: 'FINISHED' },
        });
        console.log(`Lead ${emailJob.leadId} finished sequence ${sequence.name}`);
      }

    } catch (error: any) {
      console.error(`Failed to process email job ${emailJobId}:`, error.message);
      await prisma.emailJob.update({
        where: { id: emailJobId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('Outreach Engine Worker is running...');
