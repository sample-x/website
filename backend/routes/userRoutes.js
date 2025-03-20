const express = require('express');
const router = express.Router();
const { getCurrentUser, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes in this file are protected and prefixed with /api/users
router.use(protect);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', getCurrentUser);

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', updateUserProfile);

module.exports = router;
