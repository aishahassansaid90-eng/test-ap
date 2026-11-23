const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Certificates & Public Verification', () => {
  let adminToken;
  let studentToken;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@bakka.edu', password: 'Admin@123456' });
    adminToken = adminRes.body.data.token;

    const sRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student@bakka.edu', password: 'Student@123456' });
    studentToken = sRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Public verification of valid certificate returns safe details', async () => {
    const res = await request(app).get('/api/v1/certificates/verify/BK-2026-001099');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isValid).toBe(true);
    expect(res.body.data.studentName).toBe('Fatima Ali');
    expect(res.body.data.courseTitle).toBe('Full-Stack Web Development with React & Node');
    expect(res.body.data.institution).toBe('Bakka Training Center');
    // Ensure sensitive secrets or passwords are not exposed
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.email).toBeUndefined();
  });

  test('Public verification of invalid certificate number returns isValid: false', async () => {
    const res = await request(app).get('/api/v1/certificates/verify/INVALID-999999');

    expect(res.status).toBe(200);
    expect(res.body.data.isValid).toBe(false);
  });

  test('Student CANNOT issue certificates directly (returns 403)', async () => {
    const res = await request(app)
      .post('/api/v1/certificates')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ enrollmentId: '00000000-0000-0000-0000-000000000000' });

    expect(res.status).toBe(403);
  });
});
