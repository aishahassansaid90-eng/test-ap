const { Router } = require('express');
const staffController = require('./staff.controller');
const { createStaffSchema, updateStaffSchema, staffQuerySchema } = require('./staff.validator');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

const router = Router();

// Staff management is strictly ADMIN only
router.use(authenticate, requireRole('ADMIN'));

router.get('/', validate(staffQuerySchema, 'query'), staffController.listStaff);
router.post('/', validate(createStaffSchema), staffController.createStaff);
router.get('/:id', staffController.getStaff);
router.patch('/:id', validate(updateStaffSchema), staffController.updateStaff);

module.exports = router;
