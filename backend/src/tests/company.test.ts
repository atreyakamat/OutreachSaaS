import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes.js';
import companyRoutes from '../routes/company.routes.js';
import prisma from '../config/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);

describe('Company Management Tests', () => {
  let token: string;
  let organizationId: string;
  let companyId: string;
  const testEmail = `test-company-${Date.now()}@example.com`;

  beforeAll(async () => {
    // Register a test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        organizationName: 'Test Company Org'
      });

    token = res.body.token;
    organizationId = res.body.user.organizationId;
  });

  afterAll(async () => {
    // Cleanup
    try {
      if (companyId) {
        await prisma.company.delete({ where: { id: companyId } });
      }
      await prisma.user.deleteMany({ where: { email: testEmail } });
      await prisma.organization.deleteMany({ where: { id: organizationId } });
    } catch (e) {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
  });

  describe('POST /api/companies', () => {
    it('should create a new company', async () => {
      const res = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyName: 'Acme Corp',
          domain: `acme-${Date.now()}.com`,
          industry: 'Technology',
          city: 'San Francisco',
          country: 'USA'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.companyName).toBe('Acme Corp');
      expect(res.body.organizationId).toBe(organizationId);

      companyId = res.body.id;
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/companies')
        .send({
          companyName: 'Test Company'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/companies', () => {
    it('should retrieve all companies for organization', async () => {
      const res = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/companies');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should retrieve a specific company', async () => {
      const res = await request(app)
        .get(`/api/companies/${companyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(companyId);
      expect(res.body.companyName).toBe('Acme Corp');
    });

    it('should return 404 for non-existent company', async () => {
      const res = await request(app)
        .get('/api/companies/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('should update a company', async () => {
      const res = await request(app)
        .put(`/api/companies/${companyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          industry: 'Software',
          companySize: '100-500'
        });

      expect(res.status).toBe(200);
      expect(res.body.industry).toBe('Software');
      expect(res.body.companySize).toBe('100-500');
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('should delete a company', async () => {
      // Create a company to delete
      const createRes = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyName: 'Delete Me Corp',
          domain: `deleteme-${Date.now()}.com`
        });

      const deleteId = createRes.body.id;

      const res = await request(app)
        .delete(`/api/companies/${deleteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      // Verify deletion
      const getRes = await request(app)
        .get(`/api/companies/${deleteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });
  });
});
