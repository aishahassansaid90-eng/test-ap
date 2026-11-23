const prisma = require('../../config/prisma');

async function getDashboardMetrics(user) {
  if (user.role === 'ADMIN') {
    const [
      totalStudents,
      activeStaff,
      activeCourses,
      pendingEnrollments,
      certificatesIssued,
      recentActivity,
      recentEnrollments
    ] = await Promise.all([
      prisma.student.count(),
      prisma.staff.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.count({ where: { status: 'PENDING' } }),
      prisma.certificate.count({ where: { status: 'VALID' } }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          actorUser: {
            select: { fullName: true, role: true, email: true }
          }
        }
      }),
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: { select: { fullName: true, studentNumber: true } },
          course: { select: { courseCode: true, title: true } }
        }
      })
    ]);

    return {
      role: 'ADMIN',
      metrics: {
        totalStudents,
        activeStaff,
        activeCourses,
        pendingEnrollments,
        certificatesIssued
      },
      recentActivity,
      recentEnrollments
    };
  }

  if (user.role === 'STAFF') {
    const [
      totalStudents,
      activeCourses,
      pendingEnrollments,
      recentEnrollments
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.count({ where: { status: 'PENDING' } }),
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: { select: { fullName: true, studentNumber: true } },
          course: { select: { courseCode: true, title: true } }
        }
      })
    ]);

    return {
      role: 'STAFF',
      metrics: {
        totalStudents,
        activeCourses,
        pendingEnrollments
      },
      recentEnrollments
    };
  }

  if (user.role === 'STUDENT') {
    if (!user.studentProfile) {
      return {
        role: 'STUDENT',
        metrics: {
          enrolledCoursesCount: 0,
          activeEnrollmentsCount: 0,
          completedCoursesCount: 0,
          certificatesCount: 0,
          profileCompletion: 50
        },
        recentEnrollments: []
      };
    }

    const studentId = user.studentProfile.id;
    const [
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      certificatesCount,
      recentEnrollments,
      studentData
    ] = await Promise.all([
      prisma.enrollment.count({ where: { studentId } }),
      prisma.enrollment.count({ where: { studentId, status: 'APPROVED' } }),
      prisma.enrollment.count({ where: { studentId, status: 'COMPLETED' } }),
      prisma.certificate.count({ where: { studentId, status: 'VALID' } }),
      prisma.enrollment.findMany({
        where: { studentId },
        take: 5,
        orderBy: { enrolledAt: 'desc' },
        include: {
          course: { select: { courseCode: true, title: true, instructor: true } },
          certificate: { select: { id: true, certificateNumber: true } }
        }
      }),
      prisma.student.findUnique({ where: { id: studentId } })
    ]);

    // Calculate profile completion percentage
    let profileFields = ['fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'address', 'emergencyContactName'];
    let completedFields = profileFields.filter(f => Boolean(studentData && studentData[f]));
    let profileCompletion = Math.round((completedFields.length / profileFields.length) * 100);

    return {
      role: 'STUDENT',
      student: {
        studentNumber: studentData.studentNumber,
        fullName: studentData.fullName
      },
      metrics: {
        enrolledCoursesCount: totalEnrollments,
        activeEnrollmentsCount: activeEnrollments,
        completedCoursesCount: completedEnrollments,
        certificatesCount,
        profileCompletion
      },
      recentEnrollments
    };
  }
}

module.exports = {
  getDashboardMetrics
};
