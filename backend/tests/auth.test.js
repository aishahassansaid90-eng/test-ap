const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Auth Module & Health Check', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/v1/health should return 200 OK', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toContain('Bakka Training Center');
  });

  test('POST /api/v1/auth/login with valid admin credentials returns token and user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@bakka.edu',
        password: 'Admin@123456'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@bakka.edu');
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Password hash must never leak
  });

  test('POST /api/v1/auth/login with invalid password returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@bakka.edu',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/auth/login with non-existent email returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nobody@bakka.edu',
        password: 'Password123'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/auth/me with valid Bearer token returns current user', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@bakka.edu',
        password: 'Student@123456'
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('student@bakka.edu');
    expect(meRes.body.data.user.role).toBe('STUDENT');
  });

  test('POST /api/v1/auth/logout clears cookie and returns 200', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
