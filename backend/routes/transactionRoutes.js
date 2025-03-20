const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleStripeWebhook,
  getUserTransactions
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// @route   POST /api/checkout-session
// @desc    Create Stripe checkout session
// @access  Private
router.post('/checkout-session', protect, createCheckoutSession);

// @route   POST /api/webhook/stripe
// @desc    Handle Stripe webhook events
// @access  Public
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// @route   GET /api/transactions/my
// @desc    Get user's transactions
// @access  Private
router.get('/my', protect, getUserTransactions);

module.exports = router;
