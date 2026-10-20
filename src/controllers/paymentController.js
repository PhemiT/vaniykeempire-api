const crypto = require('crypto');
const stripe = require('../config/stripe');
const paystack = require('../config/paystack');
const korapay = require('../config/korapay');
const axios = require('axios');
const { toNaira, getUsdToNgnRate } = require('../config/fxRate');
const Content = require('../models/Content');
const Purchase = require('../models/Purchase');
const Bundle = require('../models/Bundle');

// ═══════════════════════════════════════════════════════════
// GUEST CHECKOUT HELPERS
// ═══════════════════════════════════════════════════════════

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Who is paying: the logged-in user, or a guest identified by req.body.email
const getBuyer = (req) => {
  if (req.mongoUser) {
    return {
      userId: req.mongoUser._id,
      email: req.mongoUser.email,
      name: req.mongoUser.name,
    };
  }

  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) {
    throw { status: 400, message: 'A valid email is required to check out' };
  }
  return { userId: null, email, name: email.split('@')[0] };
};

// Fields to set on new Purchase records
const ownerFields = (buyer) =>
  buyer.userId ? { user: buyer.userId } : { guestEmail: buyer.email };

// Query for "purchases this buyer already has"
const ownerQuery = ownerFields;

// Filter for verify/capture/status: a logged-in user only touches their own
// purchases; a guest only touches guest purchases (proof of ownership is the
// unguessable reference / order id).
const sessionOwnerFilter = (req) =>
  req.mongoUser ? { user: req.mongoUser._id } : { user: { $exists: false } };

// Guest references are random UUIDs, since the reference is the guest's proof
// of ownership on the payment-complete page.
const makeReference = (prefix, buyer, parts = []) =>
  buyer.userId
    ? [prefix, buyer.userId, ...parts, Date.now()].join('_')
    : `${prefix}_guest_${crypto.randomUUID()}`;

const buyerMeta = (buyer) =>
  buyer.userId
    ? { userId: buyer.userId.toString() }
    : { userId: 'guest', guestEmail: buyer.email };

const sendError = (res, error) => {
  const status = error.status && error.status !== 401 ? error.status : 500;
  res
    .status(status)
    .json({ error: error.response?.data?.message || error.message });
};

// ═══════════════════════════════════════════════════════════
// BUNDLE CHECKOUT PREP
// ═══════════════════════════════════════════════════════════

const prepareBundleCheckout = async (bundleId, buyer) => {
  const bundle = await Bundle.findOne({
    _id: bundleId,
    status: 'published',
  }).populate('items', 'price title type');
  if (!bundle) throw { status: 404, message: 'Bundle not found' };

  // Find which items the buyer already owns
  const existingPurchases = await Purchase.find({
    ...ownerQuery(buyer),
    content: { $in: bundle.items.map((i) => i._id) },
    status: 'completed',
  }).select('content');

  const ownedIds = new Set(existingPurchases.map((p) => p.content.toString()));
  const itemsToBuy = bundle.items.filter(
    (i) => !ownedIds.has(i._id.toString())
  );

  if (itemsToBuy.length === 0) {
    throw { status: 400, message: 'You already own all items in this bundle' };
  }

  // Pro-rated amount — same logic as bundleController.purchaseBundle
  const totalOriginal =
    bundle.originalPrice || bundle.items.reduce((s, i) => s + i.price, 0);
  const ownedOriginal = bundle.items
    .filter((i) => ownedIds.has(i._id.toString()))
    .reduce((sum, i) => sum + i.price, 0);
  const discountRatio = totalOriginal > 0 ? bundle.price / totalOriginal : 1;
  const chargeAmount = Math.max(
    0,
    (totalOriginal - ownedOriginal) * discountRatio
  );

  // Round to 2 dp to avoid floating-point drift
  const chargeRounded = Math.round(chargeAmount * 100) / 100;

  if (chargeRounded === 0) {
    throw {
      status: 400,
      message: 'Nothing to charge — you already own all items in this bundle',
    };
  }

  return { bundle, itemsToBuy, chargeAmount: chargeRounded };
};

// ─── Paystack: bundle checkout ────────────────────────────────────────────────
exports.createBundlePaymentIntent = async (req, res) => {
  try {
    const { bundleId } = req.body;
    const buyer = getBuyer(req);

    const { bundle, itemsToBuy, chargeAmount } = await prepareBundleCheckout(
      bundleId,
      buyer
    );

    const amountKobo = Math.round(chargeAmount * 100);
    const reference = makeReference('ps_bundle', buyer, [bundleId]);

    const paystackRes = await paystack.initializeTransaction({
      email: buyer.email,
      amount: amountKobo,
      currency: 'NGN',
      reference,
      metadata: {
        bundleId: bundle._id.toString(),
        ...buyerMeta(buyer),
        cartType: 'bundle',
        contentIds: itemsToBuy.map((i) => i._id.toString()).join(','),
        title: bundle.title,
      },
      callback_url: `${process.env.FRONTEND_URL}/payment-complete?ref=${reference}`,
    });

    // Create one pending Purchase per item being bought
    const purchaseRecords = itemsToBuy.map((item) => ({
      ...ownerFields(buyer),
      content: item._id,
      amount: Math.round((chargeAmount / itemsToBuy.length) * 100) / 100,
      paystackReference: reference,
      paymentMethod: 'paystack',
      status: 'pending',
    }));
    await Purchase.insertMany(purchaseRecords);

    res.json({
      authorizationUrl: paystackRes.data.authorization_url,
      reference,
      amount: chargeAmount,
      itemCount: itemsToBuy.length,
      items: itemsToBuy.map((i) => ({
        _id: i._id,
        title: i.title,
        price: i.price,
        type: i.type,
      })),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// ─── PayPal: bundle checkout ──────────────────────────────────────────────────
exports.createBundlePaypalOrder = async (req, res) => {
  try {
    const { bundleId } = req.body;
    const buyer = getBuyer(req);

    const { bundle, itemsToBuy, chargeAmount } = await prepareBundleCheckout(
      bundleId,
      buyer
    );

    const order = await paypalRequest('POST', '/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: chargeAmount.toFixed(2) },
          description: bundle.title,
          payee: { email_address: process.env.PAYPAL_RECEIVER_EMAIL },
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment-complete?provider=paypal`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        user_action: 'PAY_NOW',
      },
    });

    const purchaseRecords = itemsToBuy.map((item) => ({
      ...ownerFields(buyer),
      content: item._id,
      amount: Math.round((chargeAmount / itemsToBuy.length) * 100) / 100,
      paypalOrderId: order.id,
      paymentMethod: 'paypal',
      status: 'pending',
    }));
    await Purchase.insertMany(purchaseRecords);

    const approvalUrl = order.links.find((l) => l.rel === 'approve')?.href;
    res.json({
      approvalUrl,
      orderId: order.id,
      amount: chargeAmount,
      itemCount: itemsToBuy.length,
      items: itemsToBuy.map((i) => ({
        _id: i._id,
        title: i.title,
        price: i.price,
        type: i.type,
      })),
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.createBundleStripePaymentIntent = async (req, res) => {
  try {
    const { bundleId } = req.body;
    const buyer = getBuyer(req);

    const { bundle, itemsToBuy, chargeAmount } = await prepareBundleCheckout(
      bundleId,
      buyer
    );

    const amountCents = Math.round(chargeAmount * 100);
    if (amountCents === 0) {
      return res.status(400).json({ error: 'Nothing to charge' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: {
        bundleId: bundle._id.toString(),
        ...buyerMeta(buyer),
        cartType: 'bundle',
        contentIds: itemsToBuy.map((i) => i._id.toString()).join(','),
        title: bundle.title,
      },
    });

    const purchaseRecords = itemsToBuy.map((item) => ({
      ...ownerFields(buyer),
      content: item._id,
      amount: Math.round((chargeAmount / itemsToBuy.length) * 100) / 100,
      stripePaymentIntentId: paymentIntent.id,
      paymentMethod: 'stripe',
      status: 'pending',
    }));
    await Purchase.insertMany(purchaseRecords);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: chargeAmount,
      itemCount: itemsToBuy.length,
      items: itemsToBuy.map((i) => ({
        _id: i._id,
        title: i.title,
        price: i.price,
        type: i.type,
      })),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// ─── PayPal helpers ────────────────────────────────────────
const getPaypalAccessToken = async () => {
  const res = await axios({
    method: 'POST',
    url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECRET,
    },
    data: 'grant_type=client_credentials',
  });
  return res.data.access_token;
};

const paypalRequest = async (method, path, data) => {
  const token = await getPaypalAccessToken();
  const res = await axios({
    method,
    url: `${process.env.PAYPAL_BASE_URL}${path}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  });
  return res.data;
};

// ─── Shared: validate content + check existing purchase ───
const validateItems = async (contentIds, buyer) => {
  const contents = await Content.find({
    _id: { $in: contentIds },
    status: 'published',
  });

  if (contents.length !== contentIds.length) {
    throw {
      status: 404,
      message: 'One or more content items not found or not published',
    };
  }

  const alreadyPurchased = await Purchase.find({
    ...ownerQuery(buyer),
    content: { $in: contentIds },
    status: 'completed',
  });

  if (alreadyPurchased.length > 0) {
    const titles = alreadyPurchased.map((p) => {
      const c = contents.find((c) => c._id.toString() === p.content.toString());
      return c?.title ?? p.content;
    });
    throw {
      status: 400,
      message: `You have already purchased: ${titles.join(', ')}`,
    };
  }

  return contents;
};

// Shared: single-item lookup + already-purchased check
const validateSingleItem = async (contentId, buyer) => {
  const content = await Content.findOne({
    _id: contentId,
    status: 'published',
  });
  if (!content) throw { status: 404, message: 'Content not found' };

  const existingPurchase = await Purchase.findOne({
    ...ownerQuery(buyer),
    content: contentId,
    status: 'completed',
  });
  if (existingPurchase) {
    throw { status: 400, message: 'You have already purchased this content' };
  }

  return content;
};

// ═══════════════════════════════════════════════════════════
// STRIPE
// ═══════════════════════════════════════════════════════════

// ─── Stripe: single item ───────────────────────────────────
exports.createStripePaymentIntent = async (req, res) => {
  try {
    const { contentId } = req.body;
    const buyer = getBuyer(req);
    const content = await validateSingleItem(contentId, buyer);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(content.price * 100),
      currency: 'usd',
      // payment_method_types omitted so Stripe automatically enables
      // card, Apple Pay, and Google Pay based on the customer's device
      metadata: {
        contentId: content._id.toString(),
        ...buyerMeta(buyer),
        contentTitle: content.title,
      },
    });

    await Purchase.create({
      ...ownerFields(buyer),
      content: contentId,
      amount: content.price,
      stripePaymentIntentId: paymentIntent.id,
      paymentMethod: 'stripe',
      status: 'pending',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: content.price,
    });
  } catch (error) {
    sendError(res, error);
  }
};

// ─── Stripe: cart ──────────────────────────────────────────
exports.createStripeCartPaymentIntent = async (req, res) => {
  try {
    const { contentIds } = req.body;
    const buyer = getBuyer(req);

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'contentIds must be a non-empty array' });
    }

    const contents = await validateItems(contentIds, buyer);

    const totalAmount = contents.reduce((sum, c) => sum + c.price, 0);
    const totalCents = Math.round(totalAmount * 100);

    if (totalCents === 0) {
      return res
        .status(400)
        .json({ error: 'Cannot create a payment for $0 total' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: {
        ...buyerMeta(buyer),
        contentIds: contentIds.join(','),
        itemCount: String(contents.length),
        titles: contents
          .map((c) => c.title)
          .join(' | ')
          .slice(0, 499),
      },
    });

    const purchaseRecords = contents.map((c) => ({
      ...ownerFields(buyer),
      content: c._id,
      amount: c.price,
      stripePaymentIntentId: paymentIntent.id,
      paymentMethod: 'stripe',
      status: 'pending',
    }));

    await Purchase.insertMany(purchaseRecords);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
      itemCount: contents.length,
      items: contents.map((c) => ({
        _id: c._id,
        title: c.title,
        price: c.price,
        type: c.type,
      })),
    });
  } catch (error) {
    sendError(res, error);
  }
};

// ─── Stripe: webhook ───────────────────────────────────────
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handleStripePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handleStripePaymentFailed(event.data.object);
      break;
    default:
      break;
  }

  res.json({ received: true });
};

const handleStripePaymentSuccess = async (paymentIntent) => {
  try {
    await Purchase.updateMany(
      { stripePaymentIntentId: paymentIntent.id },
      { $set: { status: 'completed' } }
    );
  } catch (error) {
    console.error('Error handling Stripe payment success:', error);
  }
};

const handleStripePaymentFailed = async (paymentIntent) => {
  try {
    await Purchase.updateMany(
      { stripePaymentIntentId: paymentIntent.id },
      { $set: { status: 'failed' } }
    );
  } catch (error) {
    console.error('Error handling Stripe payment failure:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// PAYSTACK
// ═══════════════════════════════════════════════════════════

exports.createPaymentIntent = async (req, res) => {
  try {
    const { contentId } = req.body;
    const buyer = getBuyer(req);
    const content = await validateSingleItem(contentId, buyer);

    const amountKobo = Math.round(content.price * 100);
    const reference = makeReference('ps_single', buyer, [contentId]);

    const paystackRes = await paystack.initializeTransaction({
      email: buyer.email,
      amount: amountKobo,
      currency: 'NGN',
      reference,
      metadata: {
        contentId: content._id.toString(),
        ...buyerMeta(buyer),
        contentTitle: content.title,
        cartType: 'single',
      },
      callback_url: `${process.env.FRONTEND_URL}/payment-complete?ref=${reference}`,
    });

    await Purchase.create({
      ...ownerFields(buyer),
      content: contentId,
      amount: content.price,
      paystackReference: reference,
      paymentMethod: 'paystack',
      status: 'pending',
    });

    res.json({
      authorizationUrl: paystackRes.data.authorization_url,
      reference,
      amount: content.price,
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.createCartPaymentIntent = async (req, res) => {
  try {
    const { contentIds } = req.body;
    const buyer = getBuyer(req);

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'contentIds must be a non-empty array' });
    }

    const contents = await validateItems(contentIds, buyer);
    const totalAmount = contents.reduce((sum, c) => sum + c.price, 0);
    const amountKobo = Math.round(totalAmount * 100);

    if (amountKobo === 0) {
      return res
        .status(400)
        .json({ error: 'Cannot create a payment for $0 total' });
    }

    const reference = makeReference('ps_cart', buyer);

    const paystackRes = await paystack.initializeTransaction({
      email: buyer.email,
      amount: amountKobo,
      currency: 'NGN',
      reference,
      metadata: {
        ...buyerMeta(buyer),
        contentIds: contentIds.join(','),
        itemCount: String(contents.length),
        titles: contents
          .map((c) => c.title)
          .join(' | ')
          .slice(0, 499),
        cartType: 'cart',
      },
      callback_url: `${process.env.FRONTEND_URL}/payment-complete?ref=${reference}`,
    });

    const purchaseRecords = contents.map((c) => ({
      ...ownerFields(buyer),
      content: c._id,
      amount: c.price,
      paystackReference: reference,
      paymentMethod: 'paystack',
      status: 'pending',
    }));

    await Purchase.insertMany(purchaseRecords);

    res.json({
      authorizationUrl: paystackRes.data.authorization_url,
      reference,
      amount: totalAmount,
      itemCount: contents.length,
      items: contents.map((c) => ({
        _id: c._id,
        title: c.title,
        price: c.price,
        type: c.type,
      })),
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const ownerFilter = sessionOwnerFilter(req);

    const verification = await paystack.verifyTransaction(reference);

    if (verification.data.status !== 'success') {
      await Purchase.updateMany(
        { paystackReference: reference, ...ownerFilter },
        { $set: { status: 'failed' } }
      );
      return res.status(400).json({ error: 'Payment not successful' });
    }

    await Purchase.updateMany(
      { paystackReference: reference, ...ownerFilter },
      { $set: { status: 'completed' } }
    );

    const purchases = await Purchase.find({
      paystackReference: reference,
      ...ownerFilter,
    }).populate('content', 'title description type thumbnailUrl');

    res.json({ purchases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handlePaystackWebhook = async (req, res) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const { reference } = event.data;
    await Purchase.updateMany(
      { paystackReference: reference },
      { $set: { status: 'completed' } }
    );
  }

  res.json({ received: true });
};

// ═══════════════════════════════════════════════════════════
// PAYPAL
// ═══════════════════════════════════════════════════════════

exports.createPaypalOrder = async (req, res) => {
  try {
    const { contentId } = req.body;
    const buyer = getBuyer(req);
    const content = await validateSingleItem(contentId, buyer);

    const order = await paypalRequest('POST', '/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: content.price.toFixed(2) },
          description: content.title,
          payee: { email_address: process.env.PAYPAL_RECEIVER_EMAIL },
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment-complete?provider=paypal`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        user_action: 'PAY_NOW',
      },
    });

    await Purchase.create({
      ...ownerFields(buyer),
      content: contentId,
      amount: content.price,
      paypalOrderId: order.id,
      paymentMethod: 'paypal',
      status: 'pending',
    });

    const approvalUrl = order.links.find((l) => l.rel === 'approve')?.href;
    res.json({ approvalUrl, orderId: order.id, amount: content.price });
  } catch (error) {
    sendError(res, error);
  }
};

exports.createPaypalCartOrder = async (req, res) => {
  try {
    const { contentIds } = req.body;
    const buyer = getBuyer(req);

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'contentIds must be a non-empty array' });
    }

    const contents = await validateItems(contentIds, buyer);
    const totalAmount = contents.reduce((sum, c) => sum + c.price, 0);

    if (totalAmount === 0) {
      return res
        .status(400)
        .json({ error: 'Cannot create a payment for $0 total' });
    }

    const order = await paypalRequest('POST', '/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: totalAmount.toFixed(2) },
          description: `${contents.length} item(s)`,
          payee: { email_address: process.env.PAYPAL_RECEIVER_EMAIL },
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment-complete?provider=paypal`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        user_action: 'PAY_NOW',
      },
    });

    const purchaseRecords = contents.map((c) => ({
      ...ownerFields(buyer),
      content: c._id,
      amount: c.price,
      paypalOrderId: order.id,
      paymentMethod: 'paypal',
      status: 'pending',
    }));

    await Purchase.insertMany(purchaseRecords);

    const approvalUrl = order.links.find((l) => l.rel === 'approve')?.href;
    res.json({
      approvalUrl,
      orderId: order.id,
      amount: totalAmount,
      itemCount: contents.length,
      items: contents.map((c) => ({
        _id: c._id,
        title: c.title,
        price: c.price,
        type: c.type,
      })),
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.capturePaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const ownerFilter = sessionOwnerFilter(req);

    const capture = await paypalRequest(
      'POST',
      `/v2/checkout/orders/${orderId}/capture`,
      {}
    );

    if (capture.status !== 'COMPLETED') {
      await Purchase.updateMany(
        { paypalOrderId: orderId, ...ownerFilter },
        { $set: { status: 'failed' } }
      );
      return res.status(400).json({ error: 'PayPal payment not completed' });
    }

    await Purchase.updateMany(
      { paypalOrderId: orderId, ...ownerFilter },
      { $set: { status: 'completed' } }
    );

    const purchases = await Purchase.find({
      paypalOrderId: orderId,
      ...ownerFilter,
    }).populate('content', 'title description type thumbnailUrl');

    res.json({ purchases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════════════════════

exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const purchase = await Purchase.findOne({
      $or: [
        { stripePaymentIntentId: paymentIntentId },
        { korapayReference: paymentIntentId },
        { paystackReference: paymentIntentId },
        { paypalOrderId: paymentIntentId },
      ],
      ...sessionOwnerFilter(req),
    }).populate('content', 'title description type thumbnailUrl');

    if (!purchase) return res.status(404).json({ error: 'Payment not found' });

    res.json({ purchase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════

exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const purchases = await Purchase.find(query)
      .populate('user', 'name email')
      .populate('content', 'title type thumbnailUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ purchasedAt: -1 });

    const count = await Purchase.countDocuments(query);

    res.json({
      purchases,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalPurchases: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    if (purchase.status !== 'completed') {
      return res
        .status(400)
        .json({ error: 'Only completed purchases can be refunded' });
    }

    if (purchase.paymentMethod === 'paypal') {
      return res.status(400).json({
        error:
          'PayPal refunds must be processed manually via the PayPal dashboard',
      });
    }

    if (purchase.paymentMethod === 'korapay') {
      return res.status(400).json({
        error:
          'Korapay refunds must be processed manually via the Kora dashboard',
      });
    }

    if (purchase.paymentMethod === 'stripe') {
      const refund = await stripe.refunds.create({
        payment_intent: purchase.stripePaymentIntentId,
      });
      if (refund.status === 'succeeded') {
        purchase.status = 'refunded';
        await purchase.save();
        return res.json({ message: 'Refund successful', purchase });
      }
      return res.status(400).json({ error: 'Stripe refund failed' });
    }

    // Paystack
    const refundRes = await paystack.refund({
      transaction: purchase.paystackReference,
    });
    if (refundRes.status) {
      purchase.status = 'refunded';
      await purchase.save();
      return res.json({ message: 'Refund successful', purchase });
    }
    res.status(400).json({ error: 'Refund failed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// KORAPAY
// ═══════════════════════════════════════════════════════════

exports.createKorapayPaymentIntent = async (req, res) => {
  try {
    const { contentId } = req.body;
    const buyer = getBuyer(req);
    const content = await validateSingleItem(contentId, buyer);

    const reference = makeReference('kp_single', buyer, [contentId]);

    const korapayRes = await korapay.initializeCharge({
      amount: content.price,
      currency: 'USD',
      payment_currency: 'NGN',
      settlement_currency: 'USD',
      reference,
      redirect_url: `${process.env.FRONTEND_URL}/payment-complete?ref=${reference}&provider=korapay`,
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook/korapay`,
      customer: { email: buyer.email, name: buyer.name },
    });

    await Purchase.create({
      ...ownerFields(buyer),
      content: contentId,
      amount: content.price,
      korapayReference: reference,
      paymentMethod: 'korapay',
      status: 'pending',
    });

    res.json({
      checkoutUrl: korapayRes.data.checkout_url,
      reference,
      amount: content.price,
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.createKorapayCartPaymentIntent = async (req, res) => {
  try {
    const { contentIds } = req.body;
    const buyer = getBuyer(req);

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'contentIds must be a non-empty array' });
    }

    const contents = await validateItems(contentIds, buyer);
    const totalAmount = contents.reduce((sum, c) => sum + c.price, 0);

    if (totalAmount === 0) {
      return res
        .status(400)
        .json({ error: 'Cannot create a payment for $0 total' });
    }

    const reference = makeReference('kp_cart', buyer);

    const korapayPayload = {
      amount: await toNaira(totalAmount),
      currency: 'NGN',
      reference,
      redirect_url: `${process.env.FRONTEND_URL}/payment-complete?ref=${reference}&provider=korapay`,
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook/korapay`,
      customer: { email: buyer.email, name: buyer.name },
    };
    const korapayRes = await korapay.initializeCharge(korapayPayload);

    const purchaseRecords = contents.map((c) => ({
      ...ownerFields(buyer),
      content: c._id,
      amount: c.price,
      korapayReference: reference,
      paymentMethod: 'korapay',
      status: 'pending',
    }));
    await Purchase.insertMany(purchaseRecords);

    res.json({
      checkoutUrl: korapayRes.data.checkout_url,
      reference,
      amount: totalAmount,
      itemCount: contents.length,
      items: contents.map((c) => ({
        _id: c._id,
        title: c.title,
        price: c.price,
        type: c.type,
      })),
    });
  } catch (error) {
    console.error('Korapay error response:', error.response?.data);
    sendError(res, error);
  }
};

exports.createBundleKorapayIntent = async (req, res) => {
  try {
    const { bundleId } = req.body;
    const buyer = getBuyer(req);

    const { itemsToBuy, chargeAmount } = await prepareBundleCheckout(
      bundleId,
      buyer
    );

    const reference = makeReference('kp_bundle', buyer, [bundleId]);

    const korapayPayload = {
      amount: await toNaira(chargeAmount), // was totalAmount (undefined → ReferenceError)
      currency: 'NGN',
      reference,
      redirect_url: `${process.env.FRONTEND_URL}/payment-complete?ref=${reference}&provider=korapay`,
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook/korapay`,
      customer: { email: buyer.email, name: buyer.name },
    };
    const korapayRes = await korapay.initializeCharge(korapayPayload);

    const purchaseRecords = itemsToBuy.map((item) => ({
      ...ownerFields(buyer),
      content: item._id,
      amount: Math.round((chargeAmount / itemsToBuy.length) * 100) / 100,
      korapayReference: reference,
      paymentMethod: 'korapay',
      status: 'pending',
    }));
    await Purchase.insertMany(purchaseRecords);

    res.json({
      checkoutUrl: korapayRes.data.checkout_url,
      reference,
      amount: chargeAmount,
      itemCount: itemsToBuy.length,
      items: itemsToBuy.map((i) => ({
        _id: i._id,
        title: i.title,
        price: i.price,
        type: i.type,
      })),
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.verifyKorapayPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const ownerFilter = sessionOwnerFilter(req);

    const verification = await korapay.verifyCharge(reference);

    if (verification.data.status !== 'success') {
      await Purchase.updateMany(
        { korapayReference: reference, ...ownerFilter },
        { $set: { status: 'failed' } }
      );
      return res.status(400).json({ error: 'Payment not successful' });
    }

    await Purchase.updateMany(
      { korapayReference: reference, ...ownerFilter },
      { $set: { status: 'completed' } }
    );

    const purchases = await Purchase.find({
      korapayReference: reference,
      ...ownerFilter,
    }).populate('content', 'title description type thumbnailUrl');

    res.json({ purchases });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.response?.data?.message || error.message });
  }
};

exports.handleKorapayWebhook = async (req, res) => {
  const hash = crypto
    .createHmac('sha256', process.env.KORAPAY_SECRET_KEY)
    .update(JSON.stringify(req.body.data))
    .digest('hex');

  if (hash !== req.headers['x-korapay-signature']) {
    return res.sendStatus(200); // ack but don't act — not a genuine Kora request
  }

  const { event, data } = req.body;

  if (event === 'charge.success') {
    await Purchase.updateMany(
      { korapayReference: data.reference },
      { $set: { status: 'completed' } }
    );
  } else if (event === 'charge.failed') {
    await Purchase.updateMany(
      { korapayReference: data.reference },
      { $set: { status: 'failed' } }
    );
  }

  res.sendStatus(200);
};

exports.getKorapayFxRate = async (req, res) => {
  try {
    const rate = await getUsdToNgnRate();
    res.json({ rate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};