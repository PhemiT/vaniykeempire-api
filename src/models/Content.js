const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'audio'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  fileUrl: {
    type: String,
    required: true
  },
  filePublicId: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  thumbnailPublicId: {
    type: String
  },
  duration: {
    // For video/audio - in seconds
    type: Number
  },
  fileSize: {
    // In bytes
    type: Number
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  tags: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

contentSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Content', contentSchema);