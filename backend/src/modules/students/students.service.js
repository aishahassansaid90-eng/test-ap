const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const { generateStudentNumber } = require('../../utils/numberGenerators');

async function listStudents({ page = 1, limit = 10, search = '', status = 'ALL' }) {
  const skip = (page - 1) * limit;
  const where = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search && search.trim()) {
    const query = search.trim();
    where.OR = [
      { fullName: { contains: query } },
      { studentNumber: { contains: query } },
      { email: { contains: query } },
      { phone: { contains: query } }
    ];
  }

  const [total, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, status: true, role: true }
        },
        _count: {
          select: {
            enrollments: true,
            certificates: true
          }
        }
      }
    })
  ]);

  return { students, total, page, limit };
}

async function getStudentById(id, requestingUser) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, email: true, status: true, role: true, createdAt: true }
      },
      enrollments: {
        include: {
          course: {
            select: { id: true, courseCode: true, title: true, fee: true, duration: true, instructor: true }
          },
          reviewedBy: {
            select: { id: true, fullName: true, role: true }
          },
          certificate: {
            select: { id: true, certificateNumber: true, issueDate: true, status: true }
          }
        },
        orderBy: { enrolledAt: 'desc' }
      },
      certificates: {
        include: {
          course: {
            select: { id: true, courseCode: true, title: true }
          },
          issuedBy: {
            select: { id: true, fullName: true }
          }
        },
        orderBy: { issueDate: 'desc' }
      }
    }
  });

  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Resource-level authorization: STUDENT role can only access their own record
  if (requestingUser.role === 'STUDENT' && student.userId !== requestingUser.id) {
    const error = new Error('Forbidden: You can only access your own student record');
    error.statusCode = 403;
    throw error;
  }

  return student;
}

async function createStudent(data, actorUser) {
  const studentEmail = data.email.toLowerCase().trim();

  // Check if email already registered in User table
  const existingUser = await prisma.user.findUnique({
    where: { email: studentEmail }
  });
  if (existingUser) {
    const error = new Error('A user with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // Ensure unique student number
  let studentNumber = generateStudentNumber();
  let exists = await prisma.student.findUnique({ where: { studentNumber } });
  while (exists) {
    studentNumber = generateStudentNumber();
    exists = await prisma.student.findUnique({ where: { studentNumber } });
  }

  const rawPassword = data.password || 'Student@123456';
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  // Use transaction to create both User and Student Profile
  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        fullName: data.fullName,
        email: studentEmail,
        phone: data.phone || null,
        passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    });

    const newStudent = await tx.student.create({
      data: {
        userId: newUser.id,
        studentNumber,
        fullName: data.fullName,
        email: studentEmail,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        address: data.address || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: { id: true, email: true, status: true, role: true }
        }
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actorUser.id,
        action: 'STUDENT_REGISTERED',
        entityType: 'STUDENT',
        entityId: newStudent.id,
        metadata: JSON.stringify({
          studentNumber,
          fullName: data.fullName,
          email: studentEmail
        })
      }
    });

    return newStudent;
  });

  return result;
}

async function updateStudent(id, data, actorUser) {
  const existing = await prisma.student.findUnique({
    where: { id }
  });
  if (!existing) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Only Admin can change status or staff can edit details
  const updateData = {
    ...(data.fullName && { fullName: data.fullName }),
    ...(data.email && { email: data.email.toLowerCase().trim() }),
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null }),
    ...(data.gender !== undefined && { gender: data.gender }),
    ...(data.address !== undefined && { address: data.address }),
    ...(data.emergencyContactName !== undefined && { emergencyContactName: data.emergencyContactName }),
    ...(data.emergencyContactPhone !== undefined && { emergencyContactPhone: data.emergencyContactPhone })
  };

  if (data.status) {
    if (actorUser.role !== 'ADMIN' && (data.status === 'DEACTIVATED' || data.status === 'SUSPENDED')) {
      const error = new Error('Only administrators can suspend or deactivate a student account');
      error.statusCode = 403;
      throw error;
    }
    updateData.status = data.status;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const student = await tx.student.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, status: true, role: true }
        }
      }
    });

    // Also sync User name and email if linked
    if (student.userId && (data.fullName || data.email)) {
      await tx.user.update({
        where: { id: student.userId },
        data: {
          ...(data.fullName && { fullName: data.fullName }),
          ...(data.email && { email: data.email.toLowerCase().trim() })
        }
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: actorUser.id,
        action: 'STUDENT_UPDATED',
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: JSON.stringify({ changes: Object.keys(updateData) })
      }
    });

    return student;
  });

  return updated;
}

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent
};
