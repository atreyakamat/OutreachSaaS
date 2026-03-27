import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes.js';
import prisma from '../config/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Tests', () => {
  const testEmail = `test-auth-${Date.now()}@example.com`;
  let token: string;
  let userId: string;

  afterAll(async () => {
    // Cleanup
    try {
      if (userId) {
        await prisma.user.delete({ where: { id: userId } });
      }
    } catch (e) {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with organization', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'SecurePass123!',
          organizationName: 'Test Organization'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', testEmail);
      expect(res.body.user).toHaveProperty('organizationId');

      token = res.body.token;
      userId = res.body.user.id;
    });

    it('should not register user with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'SecurePass123!',
          organizationName: 'Another Org'
        });

      expect(res.status).toBe(400);
    });

    it('should require all fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'SecurePass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should reject incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!'
        });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        });

      expect(res.status).toBe(401);
    });
  });
});
