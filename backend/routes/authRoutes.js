const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route to verify JWT and retrieve authenticated user profile
router.get('/me', protect, getMe);

module.exports = router;

