const { z } = require('zod');

const createStaffSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().min(2, 'Job title is required'),
  department: z.string().optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable()
});

const updateStaffSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().min(2, 'Job title is required').optional(),
  department: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

const staffQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).optional()
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
  staffQuerySchema
};
