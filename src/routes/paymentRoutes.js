const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const {
  authenticate,
  optionalAuthenticate,
  requireAdmin,
} = require('../middleware/auth');

// Webhooks — raw body required, no auth
router.post('/webhook/stripe', paymentController.handleStripeWebhook);
router.post('/webhook/paystack', paymentController.handlePaystackWebhook);
router.post('/webhook/korapay', paymentController.handleKorapayWebhook);

// Checkout: works for logged-in users and guests (guests send `email` in body)

// Stripe
router.post(
  '/stripe/create-payment-intent',
  optionalAuthenticate,
  paymentController.createStripePaymentIntent
);
router.post(
  '/stripe/create-cart-checkout',
  optionalAuthenticate,
  paymentController.createStripeCartPaymentIntent
);

// Paystack
router.post(
  '/create-payment-intent',
  optionalAuthenticate,
  paymentController.createPaymentIntent
);
router.post(
  '/create-cart-checkout',
  optionalAuthenticate,
  paymentController.createCartPaymentIntent
);
router.get(
  '/verify/paystack/:reference',
  optionalAuthenticate,
  paymentController.verifyPaystackPayment
);

// PayPal
router.post(
  '/paypal/create-order',
  optionalAuthenticate,
  paymentController.createPaypalOrder
);
router.post(
  '/paypal/create-cart-order',
  optionalAuthenticate,
  paymentController.createPaypalCartOrder
);
router.post(
  '/paypal/capture/:orderId',
  optionalAuthenticate,
  paymentController.capturePaypalOrder
);

// Korapay
router.post(
  '/korapay/create-payment-intent',
  optionalAuthenticate,
  paymentController.createKorapayPaymentIntent
);
router.post(
  '/korapay/create-cart-checkout',
  optionalAuthenticate,
  paymentController.createKorapayCartPaymentIntent
);
router.get(
  '/verify/korapay/:reference',
  optionalAuthenticate,
  paymentController.verifyKorapayPayment
);

router.post(
  '/bundle/korapay',
  optionalAuthenticate,
  paymentController.createBundleKorapayIntent
);

// Public: just an exchange rate
router.get('/korapay/fx-rate', paymentController.getKorapayFxRate);

// Shared
router.get(
  '/status/:paymentIntentId',
  optionalAuthenticate,
  paymentController.getPaymentStatus
);

router.post(
  '/bundle/paystack',
  optionalAuthenticate,
  paymentController.createBundlePaymentIntent
);
router.post(
  '/bundle/paypal',
  optionalAuthenticate,
  paymentController.createBundlePaypalOrder
);
router.post(
  '/bundle/stripe',
  optionalAuthenticate,
  paymentController.createBundleStripePaymentIntent
);

// Admin
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  paymentController.getAllPayments
);
router.post(
  '/admin/refund/:purchaseId',
  authenticate,
  requireAdmin,
  paymentController.refundPayment
);

module.exports = router;