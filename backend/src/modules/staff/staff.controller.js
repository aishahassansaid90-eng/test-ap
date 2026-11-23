const staffService = require('./staff.service');
const { successResponse, paginatedResponse } = require('../../utils/apiResponse');

async function listStaff(req, res, next) {
  try {
    const { page, limit, search, status } = req.query;
    const result = await staffService.listStaff({ page, limit, search, status });
    return paginatedResponse(res, {
      items: result.staffList,
      total: result.total,
      page: result.page,
      limit: result.limit,
      message: 'Staff list retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

async function getStaff(req, res, next) {
  try {
    const { id } = req.params;
    const staff = await staffService.getStaffById(id);
    return successResponse(res, {
      statusCode: 200,
      message: 'Staff member retrieved successfully',
      data: staff
    });
  } catch (error) {
    next(error);
  }
}

async function createStaff(req, res, next) {
  try {
    const staff = await staffService.createStaff(req.body, req.user);
    return successResponse(res, {
      statusCode: 201,
      message: 'Staff member created successfully',
      data: staff
    });
  } catch (error) {
    next(error);
  }
}

async function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const staff = await staffService.updateStaff(id, req.body, req.user);
    return successResponse(res, {
      statusCode: 200,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listStaff,
  getStaff,
  createStaff,
  updateStaff
};
