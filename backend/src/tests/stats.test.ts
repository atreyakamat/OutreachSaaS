import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes.js';
import statsRoutes from '../routes/stats.routes.js';
import prisma from '../config/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);

describe('Statistics API Tests', () => {
  let token: string;
  const testEmail = `test-stats-${Date.now()}@example.com`;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        organizationName: 'Test Stats Org'
      });

    token = res.body.token;
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({ where: { email: testEmail } });
    } catch (e) {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
  });

  describe('GET /api/stats/dashboard', () => {
    it('should retrieve dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalCompanies');
      expect(res.body).toHaveProperty('totalContacts');
      expect(res.body).toHaveProperty('activeSequences');
      expect(res.body).toHaveProperty('emailsSent');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/stats/dashboard');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/stats/analytics', () => {
    it('should retrieve analytics data', async () => {
      const res = await request(app)
        .get('/api/stats/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('conversionRate');
      expect(res.body).toHaveProperty('regionalPerformance');
    });
  });
});
