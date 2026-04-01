const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paystackReference: {
    type: String,
  },
  paypalOrderId: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'paypal'],
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

purchaseSchema.index({ user: 1, content: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);