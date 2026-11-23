const { z } = require('zod');

const issueCertificateSchema = z.object({
  enrollmentId: z.string().uuid('Valid enrollment ID is required'),
  grade: z.string().optional().default('Pass with Distinction'),
  honors: z.string().optional(),
  notes: z.string().optional()
});

const certificateQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
  search: z.string().optional(),
  status: z.enum(['VALID', 'REVOKED', 'ALL']).optional(),
  studentId: z.string().optional()
});

module.exports = {
  issueCertificateSchema,
  certificateQuerySchema
};
