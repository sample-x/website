const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const Sample = require('../models/Sample');

// @desc    Create checkout session
// @route   POST /api/checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { sampleId } = req.body;

    // Find the sample
    const sample = await Sample.findById(sampleId).populate('seller', 'email');

    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }

    // Check if sample is already sold (if it's a one-time purchase)
    if (sample.isSold) {
      return res.status(400).json({ message: 'This sample has already been sold' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: sample.title,
              description: sample.description,
              images: sample.imageURL ? [sample.imageURL] : [],
            },
            unit_amount: Math.round(sample.price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: req.user.email,
      metadata: {
        sampleId: sample._id.toString(),
        sellerId: sample.seller._id.toString(),
        buyerId: req.user.id,
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/samples/${sampleId}`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
};

// @desc    Webhook handler for Stripe events
// @route   POST /api/webhook/stripe
// @access  Public
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Get metadata from the session
      const { sampleId, sellerId, buyerId } = session.metadata;

      // Create transaction record
      await Transaction.create({
        sample: sampleId,
        buyer: buyerId,
        seller: sellerId,
        price: session.amount_total / 100, // Convert from cents
        stripeSessionId: session.id,
        status: 'paid',
      });

      // Update sample as sold if it's a one-time purchase
      await Sample.findByIdAndUpdate(sampleId, { isSold: true });

      // You could also send email notifications here
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.json({ received: true });
};

// @desc    Get user's transactions
// @route   GET /api/transactions/my
// @access  Private
const getUserTransactions = async (req, res) => {
  try {
    // Find transactions where user is either buyer or seller
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }],
    })
      .populate('sample', 'title price imageURL')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
  getUserTransactions,
};
