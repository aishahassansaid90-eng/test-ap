const { Router } = require('express');
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middleware/auth');

const router = Router();

router.get('/metrics', authenticate, dashboardController.getMetrics);

module.exports = router;
