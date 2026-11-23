const enrollmentsService = require('./enrollments.service');
const { successResponse, paginatedResponse } = require('../../utils/apiResponse');

async function listEnrollments(req, res, next) {
  try {
    const { page, limit, status, courseId, studentId } = req.query;
    const result = await enrollmentsService.listEnrollments({
      page,
      limit,
      status,
      courseId,
      studentId,
      requestingUser: req.user
    });

    return paginatedResponse(res, {
      items: result.enrollments,
      total: result.total,
      page: result.page,
      limit: result.limit,
      message: 'Enrollments retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

async function getEnrollment(req, res, next) {
  try {
    const { id } = req.params;
    const enrollment = await enrollmentsService.getEnrollmentById(id, req.user);
    return successResponse(res, {
      statusCode: 200,
      message: 'Enrollment retrieved successfully',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
}

async function createEnrollment(req, res, next) {
  try {
    const enrollment = await enrollmentsService.createEnrollment(req.body, req.user);
    return successResponse(res, {
      statusCode: 201,
      message: 'Enrollment submitted successfully',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
}

async function updateEnrollmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const enrollment = await enrollmentsService.updateEnrollmentStatus(id, req.body, req.user);
    return successResponse(res, {
      statusCode: 200,
      message: `Enrollment status updated to ${req.body.status}`,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollmentStatus
};
