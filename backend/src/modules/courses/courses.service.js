const prisma = require('../../config/prisma');

async function listCourses({ page = 1, limit = 10, search = '', status = 'ALL', requestingUser = null }) {
  const skip = (page - 1) * limit;
  const where = {};

  // If user is not ADMIN, strictly restrict to PUBLISHED courses
  if (!requestingUser || requestingUser.role !== 'ADMIN') {
    where.status = 'PUBLISHED';
  } else if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search && search.trim()) {
    const query = search.trim();
    where.OR = [
      { courseCode: { contains: query } },
      { title: { contains: query } },
      { instructor: { contains: query } },
      { description: { contains: query } }
    ];
  }

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                status: { in: ['APPROVED', 'COMPLETED'] }
              }
            }
          }
        }
      }
    })
  ]);

  const coursesWithCapacity = courses.map(course => {
    const activeEnrollments = course._count.enrollments;
    const remainingCapacity = Math.max(0, course.capacity - activeEnrollments);
    const isFull = remainingCapacity === 0;

    return {
      ...course,
      activeEnrollments,
      remainingCapacity,
      isFull
    };
  });

  return { courses: coursesWithCapacity, total, page, limit };
}

async function getCourseById(id, requestingUser = null) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, fullName: true, role: true }
      },
      _count: {
        select: {
          enrollments: {
            where: {
              status: { in: ['APPROVED', 'COMPLETED'] }
            }
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

  // Non-admin can only access PUBLISHED courses
  if ((!requestingUser || requestingUser.role !== 'ADMIN') && course.status !== 'PUBLISHED') {
    const error = new Error('Forbidden: Course is not published');
    error.statusCode = 403;
    throw error;
  }

  const activeEnrollments = course._count.enrollments;
  const remainingCapacity = Math.max(0, course.capacity - activeEnrollments);

  return {
    ...course,
    activeEnrollments,
    remainingCapacity,
    isFull: remainingCapacity === 0
  };
}

async function createCourse(data, actorUser) {
  const existing = await prisma.course.findUnique({
    where: { courseCode: data.courseCode.toUpperCase().trim() }
  });

  if (existing) {
    const error = new Error('Course code already exists');
    error.statusCode = 409;
    throw error;
  }

  const course = await prisma.course.create({
    data: {
      courseCode: data.courseCode.toUpperCase().trim(),
      title: data.title,
      description: data.description,
      duration: data.duration,
      schedule: data.schedule,
      fee: data.fee,
      capacity: data.capacity,
      instructor: data.instructor,
      status: data.status || 'DRAFT',
      createdById: actorUser.id
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: actorUser.id,
      action: 'COURSE_CREATED',
      entityType: 'COURSE',
      entityId: course.id,
      metadata: JSON.stringify({
        courseCode: course.courseCode,
        title: course.title,
        status: course.status
      })
    }
  });

  return course;
}

async function updateCourse(id, data, actorUser) {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.courseCode && data.courseCode.toUpperCase().trim() !== existing.courseCode) {
    const codeTaken = await prisma.course.findUnique({
      where: { courseCode: data.courseCode.toUpperCase().trim() }
    });
    if (codeTaken) {
      const error = new Error('Course code already in use');
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      ...(data.courseCode && { courseCode: data.courseCode.toUpperCase().trim() }),
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.duration && { duration: data.duration }),
      ...(data.schedule && { schedule: data.schedule }),
      ...(data.fee !== undefined && { fee: data.fee }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.instructor && { instructor: data.instructor }),
      ...(data.status && { status: data.status })
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: actorUser.id,
      action: 'COURSE_UPDATED',
      entityType: 'COURSE',
      entityId: updated.id,
      metadata: JSON.stringify({ changes: Object.keys(data) })
    }
  });

  return updated;
}

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse
};
