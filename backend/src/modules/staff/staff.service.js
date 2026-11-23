const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const { generateStaffNumber } = require('../../utils/numberGenerators');

async function listStaff({ page = 1, limit = 10, search = '', status = 'ALL' }) {
  const skip = (page - 1) * limit;
  const where = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search && search.trim()) {
    const query = search.trim();
    where.OR = [
      { staffNumber: { contains: query } },
      { jobTitle: { contains: query } },
      { department: { contains: query } },
      { user: { fullName: { contains: query } } },
      { user: { email: { contains: query } } }
    ];
  }

  const [total, staffList] = await Promise.all([
    prisma.staff.count({ where }),
    prisma.staff.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, status: true, role: true }
        }
      }
    })
  ]);

  return { staffList, total, page, limit };
}

async function getStaffById(id) {
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, status: true, role: true, createdAt: true }
      }
    }
  });

  if (!staff) {
    const error = new Error('Staff member not found');
    error.statusCode = 404;
    throw error;
  }

  return staff;
}

async function createStaff(data, actorUser) {
  const email = data.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    const error = new Error('A user with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  let staffNumber = generateStaffNumber();
  let exists = await prisma.staff.findUnique({ where: { staffNumber } });
  while (exists) {
    staffNumber = generateStaffNumber();
    exists = await prisma.staff.findUnique({ where: { staffNumber } });
  }

  const rawPassword = data.password || 'Staff@123456';
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        fullName: data.fullName,
        email,
        phone: data.phone || null,
        passwordHash,
        role: 'STAFF',
        status: 'ACTIVE'
      }
    });

    const newStaff = await tx.staff.create({
      data: {
        userId: newUser.id,
        staffNumber,
        jobTitle: data.jobTitle,
        department: data.department || null,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, status: true, role: true }
        }
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actorUser.id,
        action: 'STAFF_CREATED',
        entityType: 'STAFF',
        entityId: newStaff.id,
        metadata: JSON.stringify({
          staffNumber,
          fullName: data.fullName,
          jobTitle: data.jobTitle
        })
      }
    });

    return newStaff;
  });

  return result;
}

async function updateStaff(id, data, actorUser) {
  const existing = await prisma.staff.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existing) {
    const error = new Error('Staff member not found');
    error.statusCode = 404;
    throw error;
  }

  const staffUpdate = {};
  if (data.jobTitle) staffUpdate.jobTitle = data.jobTitle;
  if (data.department !== undefined) staffUpdate.department = data.department;
  if (data.status) staffUpdate.status = data.status;

  const userUpdate = {};
  if (data.fullName) userUpdate.fullName = data.fullName;
  if (data.email) userUpdate.email = data.email.toLowerCase().trim();
  if (data.phone !== undefined) userUpdate.phone = data.phone;
  if (data.status) userUpdate.status = data.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';

  const updated = await prisma.$transaction(async (tx) => {
    const staff = await tx.staff.update({
      where: { id },
      data: staffUpdate,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, status: true, role: true }
        }
      }
    });

    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({
        where: { id: existing.userId },
        data: userUpdate
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: actorUser.id,
        action: 'STAFF_UPDATED',
        entityType: 'STAFF',
        entityId: staff.id,
        metadata: JSON.stringify({ changes: Object.keys({ ...staffUpdate, ...userUpdate }) })
      }
    });

    return staff;
  });

  return updated;
}

module.exports = {
  listStaff,
  getStaffById,
  createStaff,
  updateStaff
};
