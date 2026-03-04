import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export let emailQueue: Queue | null = null;
export let automationQueue: Queue | null = null;

const connectionConfig = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
};

try {
  // We use the config object instead of the instance to avoid type conflicts with BullMQ
  emailQueue = new Queue('email-queue', { connection: connectionConfig });
  automationQueue = new Queue('automation-queue', { connection: connectionConfig });
} catch (err) {
  console.warn('Queue Warning: Could not initialize BullMQ. Redis might be offline.');
}

export const addEmailJob = async (jobId: string, data: any, delay: number) => {
  if (!emailQueue) return;
  try {
    await emailQueue.add('send-email', data, { jobId, delay });
  } catch (err) {
    // Fail silently if Redis is down
  }
};

export const addEnrichmentJob = async (companyId: string) => {
  if (!automationQueue) return;
  try {
    await automationQueue.add('enrich-company', { companyId });
  } catch (err) {
    // Fail silently
  }
};

export const scheduleReminderCheck = async () => {
  if (!automationQueue) return;
  try {
    await automationQueue.add('check-reminders', {}, {
      repeat: { pattern: '0 9 * * *' } 
    });
  } catch (err) {
    // Fail silently
  }
};
