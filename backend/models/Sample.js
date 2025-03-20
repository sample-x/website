const mongoose = require('mongoose');

const SampleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  category: { 
    type: String, 
    required: true 
  },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  imageURL: { 
    type: String 
  },
  isSold: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Sample', SampleSchema);
