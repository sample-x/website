const passport = require('passport');
const jwt = require('jsonwebtoken');
const { generateToken } = require('./userController');

// @desc    Google OAuth login
// @route   GET /auth/google
// @access  Public
const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// @desc    Google OAuth callback
// @route   GET /auth/google/callback
// @access  Public
const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
  })(req, res, next);
};

// @desc    Logout user
// @route   GET /auth/logout
// @access  Public
const logout = (req, res) => {
  // Since we're using JWT, we don't need to do anything on the server
  // The client will handle removing the token
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  googleAuth,
  googleCallback,
  logout
};
