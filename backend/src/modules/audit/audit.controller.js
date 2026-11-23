const auditService = require('./audit.service');
const { paginatedResponse } = require('../../utils/apiResponse');

async function listAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const { entityType, action } = req.query;

    const result = await auditService.listAuditLogs({ page, limit, entityType, action });
    return paginatedResponse(res, {
      items: result.logs,
      total: result.total,
      page: result.page,
      limit: result.limit,
      message: 'Audit logs retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAuditLogs
};
