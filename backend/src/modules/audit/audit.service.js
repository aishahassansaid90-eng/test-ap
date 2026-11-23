const prisma = require('../../config/prisma');

async function listAuditLogs({ page = 1, limit = 20, entityType, action }) {
  const skip = (page - 1) * limit;
  const where = {};

  if (entityType && entityType !== 'ALL') where.entityType = entityType;
  if (action && action !== 'ALL') where.action = action;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actorUser: {
          select: { id: true, fullName: true, email: true, role: true }
        }
      }
    })
  ]);

  return { logs, total, page, limit };
}

module.exports = {
  listAuditLogs
};
