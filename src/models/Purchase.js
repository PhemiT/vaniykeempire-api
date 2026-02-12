const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  stripePaymentIntentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate purchases and for quick lookup
purchaseSchema.index({ user: 1, content: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);