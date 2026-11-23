function getRandomDigits(length = 4) {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
}

function generateStudentNumber() {
  const year = new Date().getFullYear();
  const digits = getRandomDigits(4);
  return `STU-${year}-${digits}`;
}

function generateStaffNumber() {
  const year = new Date().getFullYear();
  const digits = getRandomDigits(4);
  return `STF-${year}-${digits}`;
}

function generateCertificateNumber() {
  const year = new Date().getFullYear();
  const digits = getRandomDigits(6);
  return `BK-${year}-${digits}`;
}

module.exports = {
  generateStudentNumber,
  generateStaffNumber,
  generateCertificateNumber
};
