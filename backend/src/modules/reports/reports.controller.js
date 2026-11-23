const reportsService = require('./reports.service');
const { successResponse } = require('../../utils/apiResponse');

async function getStudentRegistrations(req, res, next) {
  try {
    const { startDate, endDate, status } = req.query;
    const data = await reportsService.getStudentRegistrationReport({ startDate, endDate, status });
    return successResponse(res, {
      statusCode: 200,
      message: 'Student registration report generated',
      data
    });
  } catch (error) {
    next(error);
  }
}

async function getCourseRosters(req, res, next) {
  try {
    const { courseId } = req.query;
    const data = await reportsService.getCourseRostersReport({ courseId });
    return successResponse(res, {
      statusCode: 200,
      message: 'Course rosters report generated',
      data
    });
  } catch (error) {
    next(error);
  }
}

async function getEnrollmentSummary(req, res, next) {
  try {
    const { startDate, endDate, status, courseId } = req.query;
    const data = await reportsService.getEnrollmentSummaryReport({ startDate, endDate, status, courseId });
    return successResponse(res, {
      statusCode: 200,
      message: 'Enrollment summary report generated',
      data
    });
  } catch (error) {
    next(error);
  }
}

async function getCertificatesReport(req, res, next) {
  try {
    const { startDate, endDate, courseId } = req.query;
    const data = await reportsService.getCertificatesReport({ startDate, endDate, courseId });
    return successResponse(res, {
      statusCode: 200,
      message: 'Certificates report generated',
      data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudentRegistrations,
  getCourseRosters,
  getEnrollmentSummary,
  getCertificatesReport
};
