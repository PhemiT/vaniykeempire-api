const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.index({ content: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

module.exports = mongoose.model('Comment', commentSchema);
