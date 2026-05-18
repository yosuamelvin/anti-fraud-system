const express = require('express');
const router = express.Router();
const { getCaseStatistics, exportCases } = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Statistics (accessible by management & kepala dept)
router.get('/statistics', 
  checkRole('kepala_departemen', 'kepala_divisi', 'direktur', 'presiden_direktur', 'superuser'),
  getCaseStatistics
);

// Export (accessible by kepala dept & above)
router.get('/export',
  checkRole('kepala_departemen', 'kepala_divisi', 'direktur', 'presiden_direktur', 'superuser'),
  exportCases
);

module.exports = router;