import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth.routes.js';
import contactRoutes from '../routes/contact.routes.js';
import companyRoutes from '../routes/company.routes.js';
import networkRoutes from '../routes/network.routes.js';
import prisma from '../config/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/network', networkRoutes);

describe('Employer Outreach Engine - System Tests', () => {
  let token: string;
  let organizationId: string;
  let companyId: string;
  let universityId: string;

  beforeAll(async () => {
    // Cleanup test data if needed
    // In a real scenario, use a separate test database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication & Multi-Tenancy', () => {
    const testEmail = `test-${Date.now()}@engine.com`;

    it('should register a new organization and user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          organizationName: 'Test Corp'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
      organizationId = res.body.user.organizationId;
    });

    it('should login and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('2. Company Management', () => {
    it('should create a new company', async () => {
      const res = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyName: 'FutureAI',
          domain: `futureai-${Date.now()}.com`,
          industry: 'Tech',
          city: 'Goa',
          country: 'India'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      companyId = res.body.id;
    });

    it('should retrieve companies for the organization', async () => {
      const res = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('3. Decision Maker Finder (CRM Hierarchy)', () => {
    it('should add a ranked contact to a company', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyId,
          name: 'Jane Doe',
          role: 'Founder',
          email: `jane-${Date.now()}@futureai.com`,
          linkedinUrl: 'https://linkedin.com/in/janedoe'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.priorityScore).toBe(100); // Founder priority
      expect(res.body.isPrimary).toBe(true); // First contact should be primary
    });
  });

  describe('4. Talent Network Graph', () => {
    it('should create a university', async () => {
      const res = await request(app)
        .post('/api/network/universities')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Goa University',
          city: 'Taleigao',
          state: 'Goa',
          country: 'India'
        });
      
      expect(res.status).toBe(201);
      universityId = res.body.id;
    });

    it('should list universities with college counts', async () => {
      const res = await request(app)
        .get('/api/network/universities')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('colleges');
    });
  });
});
