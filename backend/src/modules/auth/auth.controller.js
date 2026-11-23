const authService = require('./auth.service');
const { successResponse } = require('../../utils/apiResponse');
const config = require('../../config/env');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const { user, token } = await authService.loginUser(email, password, ipAddress, userAgent);

    // Set secure httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax'
  });

  return successResponse(res, {
    statusCode: 200,
    message: 'Logged out successfully',
    data: null
  });
}

async function getCurrentUser(req, res) {
  const { passwordHash, ...safeUser } = req.user;
  return successResponse(res, {
    statusCode: 200,
    message: 'Current user retrieved successfully',
    data: {
      user: safeUser
    }
  });
}

module.exports = {
  login,
  logout,
  getCurrentUser
};
