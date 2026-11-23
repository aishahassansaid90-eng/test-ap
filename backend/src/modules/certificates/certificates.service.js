const prisma = require('../../config/prisma');
const { generateCertificateNumber } = require('../../utils/numberGenerators');

async function listCertificates({ page = 1, limit = 10, search = '', status = 'ALL', studentId, requestingUser }) {
  const skip = (page - 1) * limit;
  const where = {};

  if (requestingUser.role === 'STUDENT') {
    if (!requestingUser.studentProfile) {
      return { certificates: [], total: 0, page, limit };
    }
    where.studentId = requestingUser.studentProfile.id;
  } else if (studentId) {
    where.studentId = studentId;
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { certificateNumber: { contains: q } },
      { student: { fullName: { contains: q } } },
      { course: { title: { contains: q } } },
      { course: { courseCode: { contains: q } } }
    ];
  }

  const [total, certificates] = await Promise.all([
    prisma.certificate.count({ where }),
    prisma.certificate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { issueDate: 'desc' },
      include: {
        student: {
          select: { id: true, studentNumber: true, fullName: true, email: true }
        },
        course: {
          select: { id: true, courseCode: true, title: true, duration: true }
        },
        issuedBy: {
          select: { id: true, fullName: true, role: true }
        }
      }
    })
  ]);

  return { certificates, total, page, limit };
}

async function getCertificateById(id, requestingUser) {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      student: {
        select: { id: true, userId: true, studentNumber: true, fullName: true, email: true }
      },
      course: true,
      issuedBy: {
        select: { id: true, fullName: true, role: true }
      },
      enrollment: true
    }
  });

  if (!certificate) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  // Student isolation
  if (requestingUser.role === 'STUDENT' && certificate.student.userId !== requestingUser.id) {
    const error = new Error('Forbidden: You can only view your own certificates');
    error.statusCode = 403;
    throw error;
  }

  return certificate;
}

async function issueCertificate(data, actorUser) {
  // 1. Verify enrollment exists
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: data.enrollmentId },
    include: {
      student: true,
      course: true,
      certificate: true
    }
  });

  if (!enrollment) {
    const error = new Error('Enrollment record not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Completion requirements check
  if (enrollment.status !== 'COMPLETED' && enrollment.progressPercent < 100) {
    const error = new Error(
      `Cannot issue certificate: Enrollment is not completed (Current status: ${enrollment.status}, Progress: ${enrollment.progressPercent}%)`
    );
    error.statusCode = 400;
    throw error;
  }

  // 3. Duplicate check
  if (enrollment.certificate) {
    const error = new Error(
      `Certificate has already been issued for this enrollment (Certificate Number: ${enrollment.certificate.certificateNumber})`
    );
    error.statusCode = 409;
    throw error;
  }

  // 4. Generate unique certificate number
  let certificateNumber = generateCertificateNumber();
  let exists = await prisma.certificate.findUnique({ where: { certificateNumber } });
  while (exists) {
    certificateNumber = generateCertificateNumber();
    exists = await prisma.certificate.findUnique({ where: { certificateNumber } });
  }

  const templateData = JSON.stringify({
    studentName: enrollment.student.fullName,
    studentNumber: enrollment.student.studentNumber,
    courseTitle: enrollment.course.title,
    courseCode: enrollment.course.courseCode,
    duration: enrollment.course.duration,
    instructor: enrollment.course.instructor,
    grade: data.grade || 'Pass with Distinction',
    honors: data.honors || 'Official Academic Honors',
    centerName: 'Bakka Training Center',
    authorizedSignatory: 'Director of Academic Affairs & Certification'
  });

  const certificate = await prisma.$transaction(async (tx) => {
    const cert = await tx.certificate.create({
      data: {
        certificateNumber,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        enrollmentId: enrollment.id,
        issuedById: actorUser.id,
        issueDate: new Date(),
        status: 'VALID',
        templateData
      },
      include: {
        student: { select: { id: true, studentNumber: true, fullName: true, email: true } },
        course: { select: { id: true, courseCode: true, title: true } },
        issuedBy: { select: { id: true, fullName: true } }
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actorUser.id,
        action: 'CERTIFICATE_ISSUED',
        entityType: 'CERTIFICATE',
        entityId: cert.id,
        metadata: JSON.stringify({
          certificateNumber,
          studentName: enrollment.student.fullName,
          courseCode: enrollment.course.courseCode
        })
      }
    });

    return cert;
  });

  return certificate;
}

// Public verification: strictly returns non-sensitive validation data
async function verifyCertificate(certificateNumber) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateNumber: certificateNumber.trim() },
    include: {
      student: {
        select: {
          fullName: true,
          studentNumber: true
        }
      },
      course: {
        select: {
          courseCode: true,
          title: true,
          duration: true
        }
      }
    }
  });

  if (!certificate) {
    return {
      isValid: false,
      message: 'Certificate not found. The certificate number provided is invalid or does not exist.'
    };
  }

  return {
    isValid: certificate.status === 'VALID',
    status: certificate.status,
    certificateNumber: certificate.certificateNumber,
    studentName: certificate.student.fullName,
    studentNumber: certificate.student.studentNumber,
    courseCode: certificate.course.courseCode,
    courseTitle: certificate.course.title,
    duration: certificate.course.duration,
    issueDate: certificate.issueDate,
    institution: 'Bakka Training Center'
  };
}

module.exports = {
  listCertificates,
  getCertificateById,
  issueCertificate,
  verifyCertificate
};
