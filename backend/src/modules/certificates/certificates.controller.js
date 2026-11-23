const certificatesService = require('./certificates.service');
const { successResponse, paginatedResponse } = require('../../utils/apiResponse');

async function listCertificates(req, res, next) {
  try {
    const { page, limit, search, status, studentId } = req.query;
    const result = await certificatesService.listCertificates({
      page,
      limit,
      search,
      status,
      studentId,
      requestingUser: req.user
    });

    return paginatedResponse(res, {
      items: result.certificates,
      total: result.total,
      page: result.page,
      limit: result.limit,
      message: 'Certificates retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

async function getCertificate(req, res, next) {
  try {
    const { id } = req.params;
    const certificate = await certificatesService.getCertificateById(id, req.user);
    return successResponse(res, {
      statusCode: 200,
      message: 'Certificate retrieved successfully',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
}

async function issueCertificate(req, res, next) {
  try {
    const certificate = await certificatesService.issueCertificate(req.body, req.user);
    return successResponse(res, {
      statusCode: 201,
      message: 'Certificate issued successfully',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
}

// Public verification endpoint
async function verifyCertificate(req, res, next) {
  try {
    const { certificateNumber } = req.params;
    const verification = await certificatesService.verifyCertificate(certificateNumber);
    return successResponse(res, {
      statusCode: 200,
      message: verification.isValid ? 'Certificate verified successfully' : 'Certificate verification failed',
      data: verification
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCertificates,
  getCertificate,
  issueCertificate,
  verifyCertificate
};
