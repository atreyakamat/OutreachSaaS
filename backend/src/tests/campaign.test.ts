import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes.js';
import campaignRoutes from '../routes/campaign.routes.js';
import prisma from '../config/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

describe('Campaign Management Tests', () => {
  let token: string;
  let organizationId: string;
  let campaignId: string;
  const testEmail = `test-campaign-${Date.now()}@example.com`;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        organizationName: 'Test Campaign Org'
      });

    token = res.body.token;
    organizationId = res.body.user.organizationId;
  });

  afterAll(async () => {
    try {
      if (campaignId) {
        await prisma.outreachCampaign.delete({ where: { id: campaignId } });
      }
      await prisma.user.deleteMany({ where: { email: testEmail } });
      await prisma.organization.deleteMany({ where: { id: organizationId } });
    } catch (e) {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
  });

  describe('POST /api/campaigns', () => {
    it('should create a new campaign', async () => {
      const res = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Summer Outreach 2026'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Summer Outreach 2026');

      campaignId = res.body.id;
    });
  });

  describe('GET /api/campaigns', () => {
    it('should retrieve all campaigns', async () => {
      const res = await request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
