const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback, logout } = require('../controllers/authController');

// @route   GET /auth/google
// @desc    Auth with Google
// @access  Public
router.get('/google', googleAuth);

// @route   GET /auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback', googleCallback);

// @route   GET /auth/logout
// @desc    Logout user
// @access  Public
router.get('/logout', logout);

module.exports = router;
