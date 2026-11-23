const { Router } = require('express');
const auditController = require('./audit.controller');
const authenticate = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

const router = Router();

// Audit logs are restricted to ADMIN only
router.use(authenticate, requireRole('ADMIN'));

router.get('/', auditController.listAuditLogs);

module.exports = router;
