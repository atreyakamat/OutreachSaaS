import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes.js';
import sequenceRoutes from '../routes/sequence.routes.js';
import prisma from '../config/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/sequences', sequenceRoutes);

describe('Sequence Management Tests', () => {
  let token: string;
  let organizationId: string;
  let sequenceId: string;
  const testEmail = `test-sequence-${Date.now()}@example.com`;

  beforeAll(async () => {
    // Register a test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        organizationName: 'Test Sequence Org'
      });

    token = res.body.token;
    organizationId = res.body.user.organizationId;
  });

  afterAll(async () => {
    // Cleanup
    try {
      if (sequenceId) {
        await prisma.sequence.delete({ where: { id: sequenceId } });
      }
      await prisma.user.deleteMany({ where: { email: testEmail } });
      await prisma.organization.deleteMany({ where: { id: organizationId } });
    } catch (e) {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
  });

  describe('POST /api/sequences', () => {
    it('should create a new sequence', async () => {
      const res = await request(app)
        .post('/api/sequences')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Welcome Sequence',
          status: 'DRAFT'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Welcome Sequence');
      expect(res.body.status).toBe('DRAFT');

      sequenceId = res.body.id;
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/sequences')
        .send({
          name: 'Test Sequence'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/sequences', () => {
    it('should retrieve all sequences', async () => {
      const res = await request(app)
        .get('/api/sequences')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/sequences/:id', () => {
    it('should retrieve a specific sequence with steps', async () => {
      const res = await request(app)
        .get(`/api/sequences/${sequenceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(sequenceId);
      expect(res.body).toHaveProperty('steps');
    });
  });

  describe('POST /api/sequences/:id/steps', () => {
    it('should add a step to sequence', async () => {
      const res = await request(app)
        .post(`/api/sequences/${sequenceId}/steps`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderIndex: 0,
          waitDays: 0,
          subjectTemplate: 'Welcome to {{companyName}}!',
          bodyTemplate: 'Hi {{contactName}}, welcome aboard!'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.orderIndex).toBe(0);
      expect(res.body.subjectTemplate).toContain('Welcome');
    });
  });

  describe('DELETE /api/sequences/:id', () => {
    it('should delete a sequence', async () => {
      // Create a sequence to delete
      const createRes = await request(app)
        .post('/api/sequences')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Delete Me Sequence'
        });

      const deleteId = createRes.body.id;

      const res = await request(app)
        .delete(`/api/sequences/${deleteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      // Verify deletion
      const getRes = await request(app)
        .get(`/api/sequences/${deleteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });
  });
});
