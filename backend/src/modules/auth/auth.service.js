const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const { signToken } = require('../../utils/token');

async function loginUser(email, password, ipAddress, userAgent) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      studentProfile: true,
      staffProfile: true
    }
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== 'ACTIVE') {
    const error = new Error('Your account is currently disabled. Please contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  // Log audit event asynchronously without failing the login if audit log fails
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        metadata: JSON.stringify({ role: user.role, email: user.email }),
        ipAddress,
        userAgent
      }
    });
  } catch (auditErr) {
    console.error('Failed to write login audit log:', auditErr.message);
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token
  };
}

module.exports = {
  loginUser
};
