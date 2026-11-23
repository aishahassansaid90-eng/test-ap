require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/bakka_training_center',
  jwtSecret: process.env.JWT_SECRET || 'bakka_training_center_super_secret_jwt_key_2026_dev',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'bakka_cookie_signing_secret_dev',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production'
};

module.exports = config;
