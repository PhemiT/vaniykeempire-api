const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const ctrl = require('../controllers/chatController');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please wait a moment and try again.' },
});

router.post('/', chatLimiter, ctrl.postChat);

module.exports = router;