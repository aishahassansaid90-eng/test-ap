const { Router } = require('express');
const studentsController = require('./students.controller');
const { createStudentSchema, updateStudentSchema, studentQuerySchema } = require('./students.validator');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

const router = Router();

// Student self-profile endpoint
router.get('/me', authenticate, requireRole('STUDENT'), studentsController.getMyStudentProfile);

// Admin & Staff can list and register students
router.get('/', authenticate, requireRole('ADMIN', 'STAFF'), validate(studentQuerySchema, 'query'), studentsController.listStudents);
router.post('/', authenticate, requireRole('ADMIN', 'STAFF'), validate(createStudentSchema), studentsController.createStudent);

// Get student detail (Admin, Staff, or Student themselves)
router.get('/:id', authenticate, studentsController.getStudent);

// Update student (Admin or Staff)
router.patch('/:id', authenticate, requireRole('ADMIN', 'STAFF'), validate(updateStudentSchema), studentsController.updateStudent);

module.exports = router;
