const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/instagramController');

router.get('/', ctrl.verifyWebhook);
router.post('/', ctrl.handleMessage);

module.exports = router;