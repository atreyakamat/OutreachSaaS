import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const emailQueue = new Queue('email-queue', { connection });
export const automationQueue = new Queue('automation-queue', { connection });

export const addEmailJob = async (jobId: string, data: any, delay: number) => {
  await emailQueue.add('send-email', data, {
    jobId,
    delay,
  });
};

export const addEnrichmentJob = async (companyId: string) => {
  await automationQueue.add('enrich-company', { companyId });
};

export const scheduleReminderCheck = async () => {
  await automationQueue.add('check-reminders', {}, {
    repeat: { cron: '0 9 * * *' } // Every day at 9 AM
  });
};
