const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aboutController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.getAbout);
router.put('/', authenticate, requireAdmin, ctrl.putAbout);
router.patch('/', authenticate, requireAdmin, ctrl.patchAbout);

module.exports = router;
