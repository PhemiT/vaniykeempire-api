const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  items: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 2,
      message: 'A bundle must contain at least 2 content items.',
    },
  },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  thumbnailUrl: { type: String },
  thumbnailPublicId: { type: String },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  tags: [{ type: String }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bundle', bundleSchema);
