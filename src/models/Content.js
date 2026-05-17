const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'audio', 'album'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  fileUrl: {
    type: String,
    // Not required at schema level — albums use tracks[] instead
  },
  filePublicId: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  thumbnailPublicId: {
    type: String,
  },
  // HLS master playlist R2 key (videos only)
  hlsMasterUrl: {
    type: String,
  },
  previewUrl: {
    type: String,
  },
  previewHlsKey: {
    type: String,
    default: null,
  },
  previewProcessing: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: Number,
  },
  fileSize: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'processing'],
    default: 'draft',
  },
  tags: [{ type: String }],
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Album tracks — populated for type === 'album'
  tracks: {
    type: [trackSchema],
    default: undefined,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

contentSchema.index({ title: 'text', description: 'text', tags: 'text' });
module.exports = mongoose.model('Content', contentSchema);
