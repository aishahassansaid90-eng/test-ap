const prisma = require('../../config/prisma');

async function getStudentRegistrationReport({ startDate, endDate, status }) {
  const where = {};
  if (status && status !== 'ALL') where.status = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const students = await prisma.student.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { enrollments: true, certificates: true }
      }
    }
  });

  return students;
}

async function getCourseRostersReport({ courseId }) {
  const where = {};
  if (courseId) where.id = courseId;
  else where.status = 'PUBLISHED';

  const courses = await prisma.course.findMany({
    where,
    include: {
      enrollments: {
        where: { status: { in: ['APPROVED', 'COMPLETED'] } },
        include: {
          student: {
            select: { id: true, studentNumber: true, fullName: true, email: true, phone: true }
          }
        },
        orderBy: { enrolledAt: 'asc' }
      }
    }
  });

  return courses;
}

async function getEnrollmentSummaryReport({ startDate, endDate, status, courseId }) {
  const where = {};
  if (status && status !== 'ALL') where.status = status;
  if (courseId) where.courseId = courseId;
  if (startDate || endDate) {
    where.enrolledAt = {};
    if (startDate) where.enrolledAt.gte = new Date(startDate);
    if (endDate) where.enrolledAt.lte = new Date(endDate);
  }

  const [total, byStatus] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.groupBy({
      by: ['status'],
      _count: { id: true },
      where
    })
  ]);

  return { total, byStatus };
}

async function getCertificatesReport({ startDate, endDate, courseId }) {
  const where = {};
  if (courseId) where.courseId = courseId;
  if (startDate || endDate) {
    where.issueDate = {};
    if (startDate) where.issueDate.gte = new Date(startDate);
    if (endDate) where.issueDate.lte = new Date(endDate);
  }

  const certificates = await prisma.certificate.findMany({
    where,
    orderBy: { issueDate: 'desc' },
    include: {
      student: { select: { studentNumber: true, fullName: true } },
      course: { select: { courseCode: true, title: true } },
      issuedBy: { select: { fullName: true } }
    }
  });

  return certificates;
}

module.exports = {
  getStudentRegistrationReport,
  getCourseRostersReport,
  getEnrollmentSummaryReport,
  getCertificatesReport
};
