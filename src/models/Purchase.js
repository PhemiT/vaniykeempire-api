const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  // Optional: guest purchases have guestEmail instead until the account is claimed
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  guestEmail: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
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
  stripePaymentIntentId: {
    type: String,
  },
  paystackReference: {
    type: String,
  },
  korapayReference: {
    type: String,
  },
  paypalOrderId: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paystack', 'korapay', 'paypal', 'free'],
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

// A purchase must belong to either a user or a guest email
purchaseSchema.pre('validate', function () {
  if (!this.user && !this.guestEmail) {
    throw new Error('Purchase requires a user or guestEmail');
  }
});

purchaseSchema.index({ user: 1, content: 1 });
purchaseSchema.index({ guestEmail: 1, content: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);