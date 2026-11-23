const { z } = require('zod');

const createEnrollmentSchema = z.object({
  courseId: z.string().uuid('Valid course ID is required'),
  studentId: z.string().uuid('Valid student ID is required').optional(),
  notes: z.string().optional()
});

const updateEnrollmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'DROPPED']),
  notes: z.string().optional(),
  progressPercent: z.number().int().min(0).max(100).optional()
});

const enrollmentQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'DROPPED', 'ALL']).optional(),
  courseId: z.string().optional(),
  studentId: z.string().optional()
});

module.exports = {
  createEnrollmentSchema,
  updateEnrollmentStatusSchema,
  enrollmentQuerySchema
};
