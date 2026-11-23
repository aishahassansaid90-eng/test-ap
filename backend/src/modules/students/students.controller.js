const studentsService = require('./students.service');
const { successResponse, paginatedResponse } = require('../../utils/apiResponse');

async function listStudents(req, res, next) {
  try {
    const { page, limit, search, status } = req.query;
    const result = await studentsService.listStudents({ page, limit, search, status });
    return paginatedResponse(res, {
      items: result.students,
      total: result.total,
      page: result.page,
      limit: result.limit,
      message: 'Students list retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

async function getStudent(req, res, next) {
  try {
    const { id } = req.params;
    const student = await studentsService.getStudentById(id, req.user);
    return successResponse(res, {
      statusCode: 200,
      message: 'Student retrieved successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
}

async function getMyStudentProfile(req, res, next) {
  try {
    if (req.user.role !== 'STUDENT' || !req.user.studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'No student profile linked to this user'
      });
    }
    const student = await studentsService.getStudentById(req.user.studentProfile.id, req.user);
    return successResponse(res, {
      statusCode: 200,
      message: 'Student profile retrieved successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
}

async function createStudent(req, res, next) {
  try {
    const student = await studentsService.createStudent(req.body, req.user);
    return successResponse(res, {
      statusCode: 201,
      message: 'Student registered successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const student = await studentsService.updateStudent(id, req.body, req.user);
    return successResponse(res, {
      statusCode: 200,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listStudents,
  getStudent,
  getMyStudentProfile,
  createStudent,
  updateStudent
};
