const express = require('express');
const router  = express.Router();
const contentController = require('../controllers/contentController_');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadContent } = require('../config/cloudinary');

// ─── Public routes ─────────────────────────────────────────────────────────
router.get('/', contentController.listContent);

// ─── Transcode webhook (no user auth — verified by webhook secret header) ──
router.post('/transcode-complete', contentController.transcodeComplete);

// ─── User routes (authenticated) ───────────────────────────────────────────
router.get('/user/purchases', authenticate, contentController.getUserPurchases);
router.get('/:contentId/access', authenticate, contentController.accessContent);

// ─── Admin routes ──────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, requireAdmin, contentController.getAllContent);
router.get('/admin/:contentId', authenticate, requireAdmin, contentController.getContentAdmin);
router.get('/upload-signature', authenticate, requireAdmin, contentController.getUploadSignature);

// Presigned R2 upload URL — browser calls this to get a direct-upload URL
// Query params: contentId, contentType (e.g. video/mp4)
router.get('/video-upload-url', authenticate, requireAdmin, contentController.getVideoUploadUrl);

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

// Video content — no file multer needed; browser uploaded directly to R2.
// Only thumbnail may be included (still goes through Cloudinary).
router.post(
  '/video',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.createContent
);

// Direct upload (browser -> Cloudinary, then POST metadata)
router.post(
  '/direct',
  authenticate,
  requireAdmin,
  uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]),
  contentController.createContentDirect
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

// Update video content — only thumbnail via multer; r2Key comes in the body
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

router.post('/:contentId/claim', authenticate, contentController.claimFree);
router.delete('/:contentId', authenticate, requireAdmin, contentController.deleteContent);
router.get('/:contentId', contentController.getContent);

// Views 
router.post('/:contentId/view', contentController.incrementView);
router.patch('/admin/:contentId/views', authenticate, requireAdmin, contentController.setViews);
router.delete('/admin/:contentId/views', authenticate, requireAdmin, contentController.resetViews);

module.exports = router;