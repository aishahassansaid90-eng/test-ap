const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development database for Bakka Training Center...');

  // Clean existing seed data safely if running re-seed
  await prisma.auditLog.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = await bcrypt.hash('Admin@123456', 10);
  const staffPassword = await bcrypt.hash('Staff@123456', 10);
  const studentPassword = await bcrypt.hash('Student@123456', 10);

  // 1. Admin User
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: 'admin@bakka.edu',
      phone: '+252 61 5000001',
      passwordHash: defaultPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  // 2. Staff User and Profile
  const staffUser = await prisma.user.create({
    data: {
      fullName: 'Dr. Maryan Yusuf',
      email: 'staff@bakka.edu',
      phone: '+252 61 5000002',
      passwordHash: staffPassword,
      role: 'STAFF',
      status: 'ACTIVE',
      staffProfile: {
        create: {
          staffNumber: 'STF-2026-0001',
          jobTitle: 'Senior Training Coordinator',
          department: 'Academic Affairs',
          status: 'ACTIVE'
        }
      }
    },
    include: { staffProfile: true }
  });

  // 3. Student 1: Fatima Ali
  const studentUser1 = await prisma.user.create({
    data: {
      fullName: 'Fatima Ali',
      email: 'student@bakka.edu',
      phone: '+252 61 5000003',
      passwordHash: studentPassword,
      role: 'STUDENT',
      status: 'ACTIVE',
      studentProfile: {
        create: {
          studentNumber: 'STU-2026-0001',
          fullName: 'Fatima Ali',
          email: 'student@bakka.edu',
          phone: '+252 61 5000003',
          dateOfBirth: new Date('2002-05-14'),
          gender: 'Female',
          address: 'Waberi District, Mogadishu',
          emergencyContactName: 'Ali Ahmed (Father)',
          emergencyContactPhone: '+252 61 5111111',
          status: 'ACTIVE'
        }
      }
    },
    include: { studentProfile: true }
  });

  // 4. Student 2: Ahmed Mohamed
  const studentUser2 = await prisma.user.create({
    data: {
      fullName: 'Ahmed Mohamed',
      email: 'ahmed@bakka.edu',
      phone: '+252 61 5000004',
      passwordHash: studentPassword,
      role: 'STUDENT',
      status: 'ACTIVE',
      studentProfile: {
        create: {
          studentNumber: 'STU-2026-0002',
          fullName: 'Ahmed Mohamed',
          email: 'ahmed@bakka.edu',
          phone: '+252 61 5000004',
          dateOfBirth: new Date('2001-09-22'),
          gender: 'Male',
          address: 'Hodan District, Mogadishu',
          emergencyContactName: 'Mohamed Nur',
          emergencyContactPhone: '+252 61 5222222',
          status: 'ACTIVE'
        }
      }
    },
    include: { studentProfile: true }
  });

  // 5. Courses
  const courseWD = await prisma.course.create({
    data: {
      courseCode: 'WD-101',
      title: 'Full-Stack Web Development with React & Node',
      description: 'Comprehensive modern full-stack development covering JavaScript, React, Next.js, Node.js, Express, databases, and deployment best practices.',
      duration: '12 Weeks (120 Hours)',
      schedule: 'Mon / Wed / Fri 18:00 - 20:30',
      fee: 450.00,
      capacity: 25,
      instructor: 'Eng. Abdullahi Osman',
      status: 'PUBLISHED',
      createdById: adminUser.id
    }
  });

  const courseDS = await prisma.course.create({
    data: {
      courseCode: 'DS-201',
      title: 'Data Science & Python Analytics',
      description: 'Data analysis, statistics, data visualization, Pandas, NumPy, and introduction to predictive machine learning models.',
      duration: '8 Weeks (80 Hours)',
      schedule: 'Tue / Thu 18:00 - 21:00',
      fee: 380.00,
      capacity: 20,
      instructor: 'Dr. Maryan Yusuf',
      status: 'PUBLISHED',
      createdById: adminUser.id
    }
  });

  const courseCC = await prisma.course.create({
    data: {
      courseCode: 'CC-301',
      title: 'Cloud Computing & DevOps Engineering',
      description: 'Linux systems administration, Docker containerization, CI/CD pipelines, AWS/GCP essentials, and infrastructure automation.',
      duration: '10 Weeks (100 Hours)',
      schedule: 'Sat / Sun 09:00 - 13:00',
      fee: 500.00,
      capacity: 15,
      instructor: 'Eng. Farhan Hassan',
      status: 'PUBLISHED',
      createdById: adminUser.id
    }
  });

  const courseUX = await prisma.course.create({
    data: {
      courseCode: 'UX-102',
      title: 'UI/UX Design & Product Prototyping',
      description: 'Human-centered user experience design, wireframing, high-fidelity Figma prototyping, and design system creation.',
      duration: '6 Weeks (60 Hours)',
      schedule: 'Tue / Thu 16:00 - 18:00',
      fee: 300.00,
      capacity: 18,
      instructor: 'Amina Jama',
      status: 'DRAFT',
      createdById: adminUser.id
    }
  });

  // 6. Enrollments
  // Enrollment 1: Fatima in WD-101 (COMPLETED)
  const enrollment1 = await prisma.enrollment.create({
    data: {
      studentId: studentUser1.studentProfile.id,
      courseId: courseWD.id,
      status: 'COMPLETED',
      progressPercent: 100,
      enrolledAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      reviewedById: staffUser.id,
      reviewedAt: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000),
      notes: 'Completed all required coursework and capstone project with distinction.'
    }
  });

  // Enrollment 2: Fatima in DS-201 (APPROVED, Active)
  await prisma.enrollment.create({
    data: {
      studentId: studentUser1.studentProfile.id,
      courseId: courseDS.id,
      status: 'APPROVED',
      progressPercent: 65,
      enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      reviewedById: staffUser.id,
      reviewedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
      notes: 'Active enrollment in good standing.'
    }
  });

  // Enrollment 3: Ahmed in WD-101 (APPROVED, Active)
  await prisma.enrollment.create({
    data: {
      studentId: studentUser2.studentProfile.id,
      courseId: courseWD.id,
      status: 'APPROVED',
      progressPercent: 40,
      enrolledAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      reviewedById: adminUser.id,
      reviewedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
      notes: 'Fee payment confirmed. Approved.'
    }
  });

  // Enrollment 4: Ahmed in CC-301 (PENDING)
  await prisma.enrollment.create({
    data: {
      studentId: studentUser2.studentProfile.id,
      courseId: courseCC.id,
      status: 'PENDING',
      progressPercent: 0,
      enrolledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Student self-registered online. Awaiting document verification.'
    }
  });

  // 7. Certificate for Fatima Ali (WD-101)
  const certNumber = 'BK-2026-001099';
  await prisma.certificate.create({
    data: {
      certificateNumber: certNumber,
      studentId: studentUser1.studentProfile.id,
      courseId: courseWD.id,
      enrollmentId: enrollment1.id,
      issuedById: adminUser.id,
      issueDate: new Date(),
      status: 'VALID',
      templateData: JSON.stringify({
        studentName: 'Fatima Ali',
        studentNumber: 'STU-2026-0001',
        courseTitle: 'Full-Stack Web Development with React & Node',
        courseCode: 'WD-101',
        duration: '12 Weeks (120 Hours)',
        instructor: 'Eng. Abdullahi Osman',
        grade: 'Distinction (A+)',
        centerName: 'Bakka Training Center',
        authorizedSignatory: 'Academic Director'
      })
    }
  });

  // 8. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: adminUser.id,
        action: 'SYSTEM_INITIALIZED',
        entityType: 'SYSTEM',
        entityId: 'SYSTEM-ROOT',
        metadata: JSON.stringify({ note: 'Initial development database seed complete' })
      },
      {
        actorUserId: staffUser.id,
        action: 'ENROLLMENT_APPROVED',
        entityType: 'ENROLLMENT',
        entityId: enrollment1.id,
        metadata: JSON.stringify({ student: 'Fatima Ali', course: 'WD-101' })
      },
      {
        actorUserId: adminUser.id,
        action: 'CERTIFICATE_ISSUED',
        entityType: 'CERTIFICATE',
        entityId: certNumber,
        metadata: JSON.stringify({ student: 'Fatima Ali', certificateNumber: certNumber })
      }
    ]
  });

  console.log('Seed completed successfully!');
  console.log('--- Development Demo Accounts ---');
  console.log('ADMIN   : admin@bakka.edu   / Admin@123456');
  console.log('STAFF   : staff@bakka.edu   / Staff@123456');
  console.log('STUDENT : student@bakka.edu / Student@123456');
  console.log('STUDENT : ahmed@bakka.edu   / Student@123456');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
