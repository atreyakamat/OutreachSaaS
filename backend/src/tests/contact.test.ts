import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes.js';
import contactRoutes from '../routes/contact.routes.js';
import companyRoutes from '../routes/company.routes.js';
import prisma from '../config/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/companies', companyRoutes);

describe('Contact Management Tests', () => {
  let token: string;
  let organizationId: string;
  let companyId: string;
  let contactId: string;
  const testEmail = `test-contact-${Date.now()}@example.com`;

  beforeAll(async () => {
    // Register a test user
    const authRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        organizationName: 'Test Contact Org'
      });

    token = authRes.body.token;
    organizationId = authRes.body.user.organizationId;

    // Create a test company
    const companyRes = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyName: 'Contact Test Corp',
        domain: `contacttest-${Date.now()}.com`
      });

    companyId = companyRes.body.id;
  });

  afterAll(async () => {
    // Cleanup
    try {
      if (contactId) {
        await prisma.contact.delete({ where: { id: contactId } });
      }
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

  describe('POST /api/contacts', () => {
    it('should create a new contact', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyId,
          name: 'John Doe',
          role: 'CEO',
          email: `john-${Date.now()}@contacttest.com`,
          timezone: 'America/New_York'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('John Doe');
      expect(res.body.role).toBe('CEO');

      contactId = res.body.id;
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({
          companyId,
          name: 'Jane Doe',
          email: 'jane@example.com'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/contacts', () => {
    it('should retrieve all contacts', async () => {
      const res = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should retrieve a specific contact', async () => {
      const res = await request(app)
        .get(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(contactId);
      expect(res.body.name).toBe('John Doe');
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('should update a contact', async () => {
      const res = await request(app)
        .put(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          role: 'Founder & CEO',
          phone: '+1-555-0123'
        });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('Founder & CEO');
      expect(res.body.phone).toBe('+1-555-0123');
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete a contact', async () => {
      // Create a contact to delete
      const createRes = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyId,
          name: 'Delete Me',
          email: `deleteme-${Date.now()}@test.com`
        });

      const deleteId = createRes.body.id;

      const res = await request(app)
        .delete(`/api/contacts/${deleteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      // Verify deletion
      const getRes = await request(app)
        .get(`/api/contacts/${deleteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });
  });
});
