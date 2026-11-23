const coursesService = require('./courses.service');
const { successResponse, paginatedResponse } = require('../../utils/apiResponse');

async function listCourses(req, res, next) {
  try {
    const { page, limit, search, status } = req.query;
    const result = await coursesService.listCourses({
      page,
      limit,
      search,
      status,
      requestingUser: req.user || null
    });

    return paginatedResponse(res, {
      items: result.courses,
      total: result.total,
      page: result.page,
      limit: result.limit,
      message: 'Courses retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

async function getCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await coursesService.getCourseById(id, req.user || null);
    return successResponse(res, {
      statusCode: 200,
      message: 'Course retrieved successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const course = await coursesService.createCourse(req.body, req.user);
    return successResponse(res, {
      statusCode: 201,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
}

async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await coursesService.updateCourse(id, req.body, req.user);
    return successResponse(res, {
      statusCode: 200,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse
};
