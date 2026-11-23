const { Router } = require('express');
const certificatesController = require('./certificates.controller');
const { issueCertificateSchema, certificateQuerySchema } = require('./certificates.validator');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

const router = Router();

// Public certificate verification endpoint (no authentication required)
router.get('/verify/:certificateNumber', certificatesController.verifyCertificate);

// Protected endpoints
router.use(authenticate);

// Listing: Admin sees all; Staff sees all/permitted; Student sees only own
router.get('/', validate(certificateQuerySchema, 'query'), certificatesController.listCertificates);

// Detail: Admin, Staff, or Student recipient
router.get('/:id', certificatesController.getCertificate);

// Issuance: Restricted to ADMIN (and authorized staff)
router.post(
  '/',
  requireRole('ADMIN'),
  validate(issueCertificateSchema),
  certificatesController.issueCertificate
);

module.exports = router;
