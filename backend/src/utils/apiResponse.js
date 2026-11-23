function successResponse(res, { statusCode = 200, message = 'Success', data = null, meta = undefined } = {}) {
  const payload = {
    success: true,
    message,
    data
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

function errorResponse(res, { statusCode = 500, message = 'An error occurred', errors = null } = {}) {
  const payload = {
    success: false,
    message
  };
  if (errors) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
}

function paginatedResponse(res, { items, total, page = 1, limit = 10, message = 'Data retrieved successfully' }) {
  const totalPages = Math.ceil(total / limit) || 1;
  return successResponse(res, {
    statusCode: 200,
    message,
    data: items,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
