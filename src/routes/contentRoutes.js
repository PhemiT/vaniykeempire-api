const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController_');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadContent } = require('../config/cloudinary');

// ─── Public routes ─────────────────────────────────────────────────────────
router.get('/', contentController.listContent);
router.get('/:contentId/preview', contentController.getPreview);

// ─── Transcode webhooks (no user auth — verified by webhook secret header) ──
router.post('/transcode-complete', contentController.transcodeComplete);
router.post(
  '/preview-transcode-complete',
  contentController.previewTranscodeComplete
);

// ─── User routes (authenticated) ───────────────────────────────────────────
router.get('/user/purchases', authenticate, contentController.getUserPurchases);
router.get('/:contentId/access', authenticate, contentController.accessContent);

// ─── Admin: static-segment routes MUST come before /:contentId wildcard ────
router.get(
  '/audio-upload-signature',
  authenticate,
  requireAdmin,
  contentController.getAudioUploadSignature
);
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  contentController.getAllContent
);
router.get(
  '/admin/:contentId',
  authenticate,
  requireAdmin,
  contentController.getContentAdmin
);
router.get(
  '/upload-signature',
  authenticate,
  requireAdmin,
  contentController.getUploadSignature
);
router.get(
  '/video-upload-url',
  authenticate,
  requireAdmin,
  contentController.getVideoUploadUrl
);
router.get(
  '/:contentId/preview-upload-url',
  authenticate,
  requireAdmin,
  contentController.getPreviewUploadUrl
);

// Admin views — patch/delete must be above the /:contentId wildcard group
router.patch(
  '/admin/:contentId/views',
  authenticate,
  requireAdmin,
  contentController.setViews
);
router.delete(
  '/admin/:contentId/views',
  authenticate,
  requireAdmin,
  contentController.resetViews
);

// ─── Create routes ─────────────────────────────────────────────────────────

// Album create — only thumbnail via multer now; tracks uploaded directly from browser
router.post(
  '/album',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.createAlbum
);

// Non-video content (PDFs, audio) — streamed directly to Cloudinary
router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadContent.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  contentController.createContent
);

// Video content — browser uploaded directly to R2; only thumbnail via multer
router.post(
  '/video',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.createContent
);

// Direct upload (browser → Cloudinary, then POST metadata)
router.post(
  '/direct',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.createContentDirect
);

// ─── Update routes ─────────────────────────────────────────────────────────

// Album update
router.put(
  '/album/:contentId',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.updateAlbum
);

// Update non-video content
router.put(
  '/:contentId',
  authenticate,
  requireAdmin,
  uploadContent.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  contentController.updateContent
);

// Update video content — only thumbnail via multer; r2Key comes in body
router.put(
  '/video/:contentId',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.updateContent
);

// Direct upload update
router.put(
  '/direct/:contentId',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.updateContentDirect
);

// ─── Per-item routes (wildcard last) ───────────────────────────────────────
router.post('/:contentId/claim', authenticate, contentController.claimFree);
router.post('/:contentId/view', contentController.incrementView);
router.post(
  '/:contentId/queue-preview-transcode',
  authenticate,
  requireAdmin,
  contentController.queuePreviewTranscode
);
router.delete(
  '/:contentId',
  authenticate,
  requireAdmin,
  contentController.deleteContent
);
router.get('/:contentId', contentController.getContent);

module.exports = router;
