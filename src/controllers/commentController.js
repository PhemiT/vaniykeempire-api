const Comment = require('../models/Comment');
const Content = require('../models/Content');

// ─── Public: List comments for a content item ─────────────────────────────
exports.listComments = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({ content: contentId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Comment.countDocuments({ content: contentId });

    res.json({
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalComments: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── User: Post a comment ─────────────────────────────────────────────────
exports.createComment = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Comment body is required' });
    }
    if (body.length > 1000) {
      return res
        .status(400)
        .json({ error: 'Comment must be 1000 characters or fewer' });
    }

    const content = await Content.findOne({
      _id: contentId,
      status: 'published',
    });
    if (!content) return res.status(404).json({ error: 'Content not found' });

    const comment = await Comment.create({
      content: contentId,
      user: req.mongoUser._id,
      body: body.trim(),
    });

    await comment.populate('user', 'name');
    res.status(201).json({ message: 'Comment posted', comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── User: Edit own comment ───────────────────────────────────────────────
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Comment body is required' });
    }
    if (body.length > 1000) {
      return res
        .status(400)
        .json({ error: 'Comment must be 1000 characters or fewer' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.user.toString() !== req.mongoUser._id.toString()) {
      return res
        .status(403)
        .json({ error: 'You can only edit your own comments' });
    }

    comment.body = body.trim();
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();
    await comment.populate('user', 'name');

    res.json({ message: 'Comment updated', comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── User: Delete own comment ─────────────────────────────────────────────
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.user.toString() !== req.mongoUser._id.toString()) {
      return res
        .status(403)
        .json({ error: 'You can only delete your own comments' });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: List all comments ─────────────────────────────────────────────
exports.adminListComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, contentId } = req.query;

    const query = contentId ? { content: contentId } : {};

    const comments = await Comment.find(query)
      .populate('user', 'name email')
      .populate('content', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Comment.countDocuments(query);

    res.json({
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalComments: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Edit any comment ──────────────────────────────────────────────
exports.adminUpdateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Comment body is required' });
    }
    if (body.length > 1000) {
      return res
        .status(400)
        .json({ error: 'Comment must be 1000 characters or fewer' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.body = body.trim();
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();
    await comment.populate('user', 'name email');
    await comment.populate('content', 'title');

    res.json({ message: 'Comment updated', comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Delete any comment ────────────────────────────────────────────
exports.adminDeleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
