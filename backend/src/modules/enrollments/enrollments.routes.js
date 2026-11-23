const { Router } = require('express');
const enrollmentsController = require('./enrollments.controller');
const {
  createEnrollmentSchema,
  updateEnrollmentStatusSchema,
  enrollmentQuerySchema
} = require('./enrollments.validator');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

const router = Router();

// All enrollment operations require authentication
router.use(authenticate);

// Listing: Admin & Staff see all / filtered; Students see only their own
router.get('/', validate(enrollmentQuerySchema, 'query'), enrollmentsController.listEnrollments);

// Student self-submission or Staff/Admin submission
router.post('/', validate(createEnrollmentSchema), enrollmentsController.createEnrollment);

// Detail: Admin, Staff, or student themselves
router.get('/:id', enrollmentsController.getEnrollment);

// Review & Approval: strictly ADMIN and STAFF only
router.patch(
  '/:id/status',
  requireRole('ADMIN', 'STAFF'),
  validate(updateEnrollmentStatusSchema),
  enrollmentsController.updateEnrollmentStatus
);

module.exports = router;
