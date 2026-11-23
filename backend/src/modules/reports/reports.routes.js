const { Router } = require('express');
const reportsController = require('./reports.controller');
const authenticate = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

const router = Router();

// Reports are restricted to ADMIN and STAFF
router.use(authenticate, requireRole('ADMIN', 'STAFF'));

router.get('/students', reportsController.getStudentRegistrations);
router.get('/rosters', reportsController.getCourseRosters);
router.get('/enrollments', reportsController.getEnrollmentSummary);
router.get('/certificates', reportsController.getCertificatesReport);

module.exports = router;
