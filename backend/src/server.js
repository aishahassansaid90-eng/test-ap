const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const prisma = require('./config/prisma');

const server = app.listen(config.port, () => {
  logger.info(`Bakka Training Center API listening on port ${config.port} (${config.nodeEnv})`);
  logger.info(`Health check endpoint: http://localhost:${config.port}/api/v1/health`);
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully terminating server after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = server;
