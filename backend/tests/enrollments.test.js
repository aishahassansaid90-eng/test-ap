const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Enrollment Workflows & Capacity Checks', () => {
  let adminToken;
  let student1Token;
  let publishedCourseId;
  let draftCourseId;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@bakka.edu', password: 'Admin@123456' });
    adminToken = adminRes.body.data.token;

    const s1Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student@bakka.edu', password: 'Student@123456' });
    student1Token = s1Res.body.data.token;

    const wdCourse = await prisma.course.findUnique({ where: { courseCode: 'WD-101' } });
    publishedCourseId = wdCourse.id;

    const uxCourse = await prisma.course.findUnique({ where: { courseCode: 'UX-102' } });
    draftCourseId = uxCourse.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Student cannot submit duplicate enrollment for course they are already enrolled in', async () => {
    // Fatima is already enrolled in WD-101
    const res = await request(app)
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({ courseId: publishedCourseId });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already has an active enrollment');
  });

  test('Student cannot enroll in a DRAFT (unpublished) course', async () => {
    const res = await request(app)
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({ courseId: draftCourseId });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not published');
  });

  test('Student CANNOT approve or change enrollment status (returns 403)', async () => {
    // Find an existing enrollment
    const enrollment = await prisma.enrollment.findFirst();

    const res = await request(app)
      .patch(`/api/v1/enrollments/${enrollment.id}/status`)
      .set('Authorization', `Bearer ${student1Token}`)
      .send({ status: 'APPROVED' });

    expect(res.status).toBe(403);
  });
});
