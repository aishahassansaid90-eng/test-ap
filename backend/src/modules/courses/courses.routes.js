const { Router } = require('express');
const coursesController = require('./courses.controller');
const { createCourseSchema, updateCourseSchema, courseQuerySchema } = require('./courses.validator');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

const router = Router();

// Optional authentication helper: if a token is passed, attaches user, but allows public browsing of published courses
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  if (authHeader || cookieToken) {
    return authenticate(req, res, (err) => {
      // Proceed even if token is invalid or absent
      next();
    });
  }
  next();
};

// Course browsing is accessible to public / all roles
router.get('/', optionalAuth, validate(courseQuerySchema, 'query'), coursesController.listCourses);
router.get('/:id', optionalAuth, coursesController.getCourse);

// Course creation and modification is ADMIN only
router.post('/', authenticate, requireRole('ADMIN'), validate(createCourseSchema), coursesController.createCourse);
router.patch('/:id', authenticate, requireRole('ADMIN'), validate(updateCourseSchema), coursesController.updateCourse);

module.exports = router;
