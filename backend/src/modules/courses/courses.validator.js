const { z } = require('zod');

const createCourseSchema = z.object({
  courseCode: z.string().min(2, 'Course code is required').max(50),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.string().min(2, 'Duration is required'),
  schedule: z.string().min(2, 'Schedule is required'),
  fee: z.number().min(0, 'Fee cannot be negative'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  instructor: z.string().min(2, 'Instructor name is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT')
});

const updateCourseSchema = z.object({
  courseCode: z.string().min(2).max(50).optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  duration: z.string().min(2).optional(),
  schedule: z.string().min(2).optional(),
  fee: z.number().min(0).optional(),
  capacity: z.number().int().min(1).optional(),
  instructor: z.string().min(2).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional()
});

const courseQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ALL']).optional()
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema
};
