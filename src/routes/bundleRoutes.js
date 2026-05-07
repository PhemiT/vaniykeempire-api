const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/bundleController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadContent } = require('../config/cloudinary');

const thumbOnly = uploadContent.fields([{ name: 'thumbnail', maxCount: 1 }]);

// Public
router.get('/',           ctrl.listBundles);
router.get('/:bundleId',  ctrl.getBundle);

// User
router.post('/:bundleId/purchase', authenticate, ctrl.purchaseBundle);
router.post('/:bundleId/claim', authenticate, ctrl.claimFree);

// Admin
router.get('/admin/:bundleId',    authenticate, requireAdmin, ctrl.getBundleAdmin);
router.post('/',                  authenticate, requireAdmin, thumbOnly, ctrl.createBundle);
router.put('/:bundleId',          authenticate, requireAdmin, thumbOnly, ctrl.putBundle);
router.patch('/:bundleId',        authenticate, requireAdmin, thumbOnly, ctrl.patchBundle);
router.delete('/:bundleId',       authenticate, requireAdmin, ctrl.deleteBundle);

module.exports = router;