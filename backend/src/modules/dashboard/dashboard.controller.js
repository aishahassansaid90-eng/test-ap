const dashboardService = require('./dashboard.service');
const { successResponse } = require('../../utils/apiResponse');

async function getMetrics(req, res, next) {
  try {
    const data = await dashboardService.getDashboardMetrics(req.user);
    return successResponse(res, {
      statusCode: 200,
      message: 'Dashboard metrics retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMetrics
};
