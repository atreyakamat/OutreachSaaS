import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from './config/prisma';

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
      const subject = replacePlaceholders(subjectTemplate, leadData);
      const body = replacePlaceholders(bodyTemplate, leadData);

      // Simulate sending email (integration with Amazon SES or SendGrid later)
      console.log(`Sending email to ${to}: ${subject}`);
      
      // Update EmailJob status
      await prisma.emailJob.update({
        where: { id: emailJobId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

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

console.log('Worker is running...');
