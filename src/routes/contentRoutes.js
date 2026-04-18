const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController_');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadContent, uploadVideo } = require('../config/cloudinary');

// ─── Public routes ─────────────────────────────────────────────────────────
router.get('/', contentController.listContent);

// ─── User routes (authenticated) ───────────────────────────────────────────
router.get('/user/purchases', authenticate, contentController.getUserPurchases);
router.get('/:contentId/access', authenticate, contentController.accessContent);

// ─── Admin routes ──────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, requireAdmin, contentController.getAllContent);

// Non-video content (PDFs, audio) — streamed directly to Cloudinary
router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadContent.fields([
    { name: 'file',      maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  contentController.createContent
);

// Video content — saved to disk first, then chunked upload to Cloudinary
// Use this route when the content type is 'video' (>1GB support)
router.post(
  '/video',
  authenticate,
  requireAdmin,
  uploadVideo.fields([
    { name: 'file',      maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  contentController.createContent
);

// Update non-video content
router.put(
  '/:contentId',
  authenticate,
  requireAdmin,
  uploadContent.fields([
    { name: 'file',      maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  contentController.updateContent
);

// Update video content
router.put(
  '/video/:contentId',
  authenticate,
  requireAdmin,
  uploadVideo.fields([
    { name: 'file',      maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  contentController.updateContent
);

router.post(
  '/direct',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.createContentDirect
);

router.put(
  '/direct/:contentId',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.updateContentDirect
);

router.get('/upload-signature', authenticate, requireAdmin, contentController.getUploadSignature);

router.delete('/:contentId', authenticate, requireAdmin, contentController.deleteContent);
router.get('/admin/:contentId', authenticate, requireAdmin, contentController.getContentAdmin);
router.get('/:contentId', contentController.getContent);

module.exports = router;