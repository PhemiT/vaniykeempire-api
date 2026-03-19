const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController_');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadContent } = require('../config/cloudinary');

// Public routes
router.get('/', contentController.listContent);
router.get('/:contentId', contentController.getContent);

// User routes (authenticated)
router.get('/:contentId/access', authenticate, contentController.accessContent);
router.get('/user/purchases', authenticate, contentController.getUserPurchases);

// Admin routes with file upload
router.get('/admin/all', authenticate, requireAdmin, contentController.getAllContent);

router.post('/', 
  authenticate, 
  requireAdmin, 
  uploadContent.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  contentController.createContent
);

router.put('/:contentId', 
  authenticate, 
  requireAdmin,
  uploadContent.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  contentController.updateContent
);

router.delete('/:contentId', authenticate, requireAdmin, contentController.deleteContent);

module.exports = router;