const prisma = require('../../config/prisma');

async function listEnrollments({ page = 1, limit = 10, status = 'ALL', courseId, studentId, requestingUser }) {
  const skip = (page - 1) * limit;
  const where = {};

  // If Student, enforce reading only their own enrollments
  if (requestingUser.role === 'STUDENT') {
    if (!requestingUser.studentProfile) {
      return { enrollments: [], total: 0, page, limit };
    }
    where.studentId = requestingUser.studentProfile.id;
  } else if (studentId) {
    where.studentId = studentId;
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (courseId) {
    where.courseId = courseId;
  }

  const [total, enrollments] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { enrolledAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        course: {
          select: {
            id: true,
            courseCode: true,
            title: true,
            fee: true,
            duration: true,
            capacity: true,
            instructor: true
          }
        },
        reviewedBy: {
          select: { id: true, fullName: true, role: true }
        },
        certificate: {
          select: { id: true, certificateNumber: true, status: true, issueDate: true }
        }
      }
    })
  ]);

  return { enrollments, total, page, limit };
}

async function getEnrollmentById(id, requestingUser) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          userId: true,
          studentNumber: true,
          fullName: true,
          email: true,
          phone: true,
          address: true
        }
      },
      course: true,
      reviewedBy: {
        select: { id: true, fullName: true, role: true }
      },
      certificate: true
    }
  });

  if (!enrollment) {
    const error = new Error('Enrollment not found');
    error.statusCode = 404;
    throw error;
  }

  // Student privacy check
  if (requestingUser.role === 'STUDENT' && enrollment.student.userId !== requestingUser.id) {
    const error = new Error('Forbidden: You can only view your own enrollments');
    error.statusCode = 403;
    throw error;
  }

  return enrollment;
}

async function createEnrollment(data, requestingUser) {
  let targetStudentId = null;

  if (requestingUser.role === 'STUDENT') {
    if (!requestingUser.studentProfile) {
      const error = new Error('No student profile found for this account');
      error.statusCode = 400;
      throw error;
    }
    targetStudentId = requestingUser.studentProfile.id;
  } else {
    // Admin or Staff registering student
    if (!data.studentId) {
      const error = new Error('studentId is required when enrolling on behalf of a student');
      error.statusCode = 400;
      throw error;
    }
    targetStudentId = data.studentId;
  }

  // 1. Verify Course exists and is PUBLISHED
  const course = await prisma.course.findUnique({
    where: { id: data.courseId },
    include: {
      _count: {
        select: {
          enrollments: {
            where: { status: { in: ['APPROVED', 'COMPLETED'] } }
          }
        }
      }
    }
  });

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  if (course.status !== 'PUBLISHED') {
    const error = new Error('Enrollment is not available for this course: Course is not published');
    error.statusCode = 400;
    throw error;
  }

  // 2. Check capacity
  const activeCount = course._count.enrollments;
  if (activeCount >= course.capacity) {
    const error = new Error(`Course is currently full (Capacity: ${course.capacity})`);
    error.statusCode = 400;
    throw error;
  }

  // 3. Prevent duplicate active enrollment (PENDING or APPROVED or COMPLETED)
  const existingActiveEnrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: targetStudentId,
      courseId: data.courseId,
      status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] }
    }
  });

  if (existingActiveEnrollment) {
    const error = new Error(`Student already has an active enrollment (${existingActiveEnrollment.status}) in this course`);
    error.statusCode = 409;
    throw error;
  }

  // 4. Create enrollment (Staff/Admin enrollments auto-approve if specified, otherwise PENDING)
  const isAutoApproved = requestingUser.role === 'ADMIN' || requestingUser.role === 'STAFF';
  const initialStatus = isAutoApproved ? 'APPROVED' : 'PENDING';

  const newEnrollment = await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.create({
      data: {
        studentId: targetStudentId,
        courseId: data.courseId,
        status: initialStatus,
        progressPercent: 0,
        notes: data.notes || (isAutoApproved ? 'Registered by staff' : 'Student self-enrolled'),
        ...(isAutoApproved && {
          reviewedById: requestingUser.id,
          reviewedAt: new Date()
        })
      },
      include: {
        student: { select: { id: true, studentNumber: true, fullName: true } },
        course: { select: { id: true, courseCode: true, title: true } }
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: requestingUser.id,
        action: 'ENROLLMENT_REQUESTED',
        entityType: 'ENROLLMENT',
        entityId: enrollment.id,
        metadata: JSON.stringify({
          studentId: targetStudentId,
          courseId: data.courseId,
          status: initialStatus
        })
      }
    });

    return enrollment;
  });

  return newEnrollment;
}

async function updateEnrollmentStatus(id, { status, notes, progressPercent }, actorUser) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          _count: {
            select: {
              enrollments: {
                where: { status: { in: ['APPROVED', 'COMPLETED'] } }
              }
            }
          }
        }
      },
      student: true
    }
  });

  if (!enrollment) {
    const error = new Error('Enrollment not found');
    error.statusCode = 404;
    throw error;
  }

  // If changing to APPROVED, verify course capacity again
  if (status === 'APPROVED' && enrollment.status !== 'APPROVED') {
    const activeCount = enrollment.course._count.enrollments;
    if (activeCount >= enrollment.course.capacity) {
      const error = new Error(`Cannot approve: Course capacity reached (${activeCount}/${enrollment.course.capacity})`);
      error.statusCode = 400;
      throw error;
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.enrollment.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined && { notes }),
        ...(progressPercent !== undefined && { progressPercent }),
        reviewedById: actorUser.id,
        reviewedAt: new Date()
      },
      include: {
        student: { select: { id: true, studentNumber: true, fullName: true, email: true } },
        course: { select: { id: true, courseCode: true, title: true } },
        reviewedBy: { select: { id: true, fullName: true, role: true } }
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actorUser.id,
        action: `ENROLLMENT_${status}`,
        entityType: 'ENROLLMENT',
        entityId: id,
        metadata: JSON.stringify({
          previousStatus: enrollment.status,
          newStatus: status,
          studentName: enrollment.student.fullName,
          courseCode: enrollment.course.courseCode
        })
      }
    });

    return res;
  });

  return updated;
}

module.exports = {
  listEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollmentStatus
};
