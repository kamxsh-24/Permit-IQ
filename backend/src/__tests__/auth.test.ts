import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';

describe('Authentication API Suite (STEP 3)', () => {
  it('POST /api/auth/login - should authenticate valid credentials and issue JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'requester@safework.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toMatchObject({
      email: 'requester@safework.com',
      role: 'REQUESTER',
      name: 'Alex Miller',
    });
  });

  it('POST /api/auth/login - should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'requester@safework.com',
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/auth/login - should reject nonexistent user with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@nowhere.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/auth/login - should reject missing credentials with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me - should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/auth/me - should reject malformed token with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.garbage');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('INVALID_TOKEN');
  });

  it('GET /api/auth/me - should return authenticated user profile with valid JWT', async () => {
    // Login first
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'safety@safework.com',
        password: 'Password123!',
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.email).toBe('safety@safework.com');
    expect(meRes.body.data.role).toBe('SAFETY_OFFICER');
  });
});
