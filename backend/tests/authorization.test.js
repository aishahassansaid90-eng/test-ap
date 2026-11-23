const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Role-Based Access Control & Isolation', () => {
  let adminToken;
  let staffToken;
  let student1Token;
  let student1Id;
  let student2Token;
  let student2Id;

  beforeAll(async () => {
    // 1. Login Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@bakka.edu', password: 'Admin@123456' });
    adminToken = adminRes.body.data.token;

    // 2. Login Staff
    const staffRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'staff@bakka.edu', password: 'Staff@123456' });
    staffToken = staffRes.body.data.token;

    // 3. Login Student 1 (Fatima)
    const s1Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student@bakka.edu', password: 'Student@123456' });
    student1Token = s1Res.body.data.token;
    student1Id = s1Res.body.data.user.studentProfile.id;

    // 4. Login Student 2 (Ahmed)
    const s2Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ahmed@bakka.edu', password: 'Student@123456' });
    student2Token = s2Res.body.data.token;
    student2Id = s2Res.body.data.user.studentProfile.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Staff CANNOT access Admin-only staff management endpoints (returns 403)', async () => {
    const res = await request(app)
      .get('/api/v1/staff')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Student CANNOT access Admin-only staff management endpoints (returns 403)', async () => {
    const res = await request(app)
      .get('/api/v1/staff')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Admin CAN access staff management endpoints (returns 200)', async () => {
    const res = await request(app)
      .get('/api/v1/staff')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Student Fatima CANNOT access Ahmed student detail record (returns 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/students/${student2Id}`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Forbidden');
  });

  test('Student Fatima CAN access her own student detail record (returns 200)', async () => {
    const res = await request(app)
      .get(`/api/v1/students/${student1Id}`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Fatima Ali');
  });

  test('Student CANNOT access Audit Logs (returns 403)', async () => {
    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(403);
  });

  test('Admin CAN access Audit Logs (returns 200)', async () => {
    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
