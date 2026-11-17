const express = require('express');
const router = express.Router();
const {
  analyzeProfile,
  matchSchemes,
  getAllSchemes,
  seedSampleSchemes,
} = require('../controllers/schemeController');
const { protect } = require('../middleware/authMiddleware');

// Public route to view all schemes
router.get('/', getAllSchemes);

// Route to seed standard MoSJE/NSFDC welfare schemes for testing & initialization
router.post('/seed', seedSampleSchemes);

// Main AI extraction & deterministic scheme matching route (Protected by JWT)
router.post('/analyze', protect, analyzeProfile);

module.exports = router;

