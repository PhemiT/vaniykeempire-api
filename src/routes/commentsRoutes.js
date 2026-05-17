const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/commentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public
router.get('/content/:contentId/comments', ctrl.listComments);

// User (authenticated)
router.post('/content/:contentId/comments', authenticate, ctrl.createComment);
router.patch('/comments/:commentId', authenticate, ctrl.updateComment);
router.delete('/comments/:commentId', authenticate, ctrl.deleteComment);

// Admin
router.get(
  '/admin/comments',
  authenticate,
  requireAdmin,
  ctrl.adminListComments
);
router.patch(
  '/admin/comments/:commentId',
  authenticate,
  requireAdmin,
  ctrl.adminUpdateComment
);
router.delete(
  '/admin/comments/:commentId',
  authenticate,
  requireAdmin,
  ctrl.adminDeleteComment
);

module.exports = router;
