const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Webhooks — raw body required, no auth
router.post('/webhook/stripe', paymentController.handleStripeWebhook);
router.post('/webhook/paystack', paymentController.handlePaystackWebhook);

// User: Stripe
router.post('/stripe/create-payment-intent',   authenticate, paymentController.createStripePaymentIntent);
router.post('/stripe/create-cart-checkout',    authenticate, paymentController.createStripeCartPaymentIntent);

// User: Paystack
router.post('/create-payment-intent',          authenticate, paymentController.createPaymentIntent);
router.post('/create-cart-checkout',           authenticate, paymentController.createCartPaymentIntent);
router.get('/verify/paystack/:reference',      authenticate, paymentController.verifyPaystackPayment);

// User: PayPal
router.post('/paypal/create-order',            authenticate, paymentController.createPaypalOrder);
router.post('/paypal/create-cart-order',       authenticate, paymentController.createPaypalCartOrder);
router.post('/paypal/capture/:orderId',        authenticate, paymentController.capturePaypalOrder);

// Shared
router.get('/status/:paymentIntentId',         authenticate, paymentController.getPaymentStatus);

router.post('/bundle/paystack', authenticate, paymentController.createBundlePaymentIntent);
router.post('/bundle/paypal',   authenticate, paymentController.createBundlePaypalOrder);
router.post('/bundle/stripe', authenticate, paymentController.createBundleStripePaymentIntent)

// Admin
router.get('/admin/all',                       authenticate, requireAdmin, paymentController.getAllPayments);
router.post('/admin/refund/:purchaseId',       authenticate, requireAdmin, paymentController.refundPayment);

module.exports = router;