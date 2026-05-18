const express = require('express');
const router = express.Router();
const {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  assignCase,
  changeStatus,
  getMyCases,
  getDashboardStats
} = require('../controllers/caseController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// My cases (investigator)
router.get('/my-cases', checkRole('investigator'), getMyCases);

// Get all cases (with filters)
router.get('/', getAllCases);

// Get case by ID
router.get('/:id', getCaseById);

// Create case (investigator only)
router.post('/', checkRole('investigator', 'kepala_departemen', 'kepala_divisi', 'superuser'), createCase);

// Update case
router.put('/:id', updateCase);

// Assign case (kepala divisi only)
router.post('/:id/assign', checkRole('kepala_divisi'), assignCase);

// Change status
router.patch('/:id/status', changeStatus);

module.exports = router;