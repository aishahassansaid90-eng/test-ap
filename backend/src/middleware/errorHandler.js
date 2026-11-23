const { ZodError } = require('zod');
const logger = require('../utils/logger');
const config = require('../config/env');

function notFoundHandler(req, res, next) {
  return res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists`
    });
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Requested record was not found'
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.isOperational || config.nodeEnv !== 'production'
    ? err.message
    : 'An unexpected internal server error occurred';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv !== 'production' && { stack: err.stack })
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
