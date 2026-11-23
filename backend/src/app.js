const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./modules/auth/auth.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const studentsRoutes = require('./modules/students/students.routes');
const staffRoutes = require('./modules/staff/staff.routes');
const coursesRoutes = require('./modules/courses/courses.routes');
const enrollmentsRoutes = require('./modules/enrollments/enrollments.routes');
const certificatesRoutes = require('./modules/certificates/certificates.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const auditRoutes = require('./modules/audit/audit.routes');

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));

// Health check endpoint (Prompt 1 requirement)
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Bakka Training Center Administration System API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API version 1 route mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/students', studentsRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/enrollments', enrollmentsRoutes);
app.use('/api/v1/certificates', certificatesRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/audit-logs', auditRoutes);

// Centralized 404 & error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
