const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Stripe webhook (must be before express.json() middleware)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// User routes
router.post('/create-payment-intent', authenticate, paymentController.createPaymentIntent);
router.get('/status/:paymentIntentId', authenticate, paymentController.getPaymentStatus);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, paymentController.getAllPayments);
router.post('/admin/refund/:purchaseId', authenticate, requireAdmin, paymentController.refundPayment);

module.exports = router;