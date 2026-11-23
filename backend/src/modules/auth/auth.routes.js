const { Router } = require('express');
const authController = require('./auth.controller');
const { loginSchema } = require('./auth.validator');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
