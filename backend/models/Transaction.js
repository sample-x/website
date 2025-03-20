const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  sample: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sample',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stripeSessionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
