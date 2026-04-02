const paystack = require('../config/paystack');
const axios = require('axios');
const Content = require('../models/Content');
const Purchase = require('../models/Purchase');

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
const validateItems = async (contentIds, userId) => {
  const contents = await Content.find({
    _id: { $in: contentIds },
    status: 'published',
  });

  if (contents.length !== contentIds.length) {
    throw { status: 404, message: 'One or more content items not found or not published' };
  }

  const alreadyPurchased = await Purchase.find({
    user: userId,
    content: { $in: contentIds },
    status: 'completed',
  });

  if (alreadyPurchased.length > 0) {
    const titles = alreadyPurchased.map(p => {
      const c = contents.find(c => c._id.toString() === p.content.toString());
      return c?.title ?? p.content;
    });
    throw { status: 400, message: `You have already purchased: ${titles.join(', ')}` };
  }

  return contents;
};

// ─── Paystack: single item ─────────────────────────────────
exports.createPaymentIntent = async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.mongoUser._id;
    const userEmail = req.mongoUser.email;

    const content = await Content.findOne({ _id: contentId, status: 'published' });
    if (!content) return res.status(404).json({ error: 'Content not found' });

    const existingPurchase = await Purchase.findOne({
      user: userId,
      content: contentId,
      status: 'completed',
    });
    if (existingPurchase) {
      return res.status(400).json({ error: 'You have already purchased this content' });
    }

    const amountKobo = Math.round(content.price * 100);
    const reference = `ps_single_${userId}_${contentId}_${Date.now()}`;

    const paystackRes = await paystack.initializeTransaction({
      email: userEmail,
      amount: amountKobo,
      currency: 'NGN',
      reference,
      metadata: {
        contentId: content._id.toString(),
        userId: userId.toString(),
        contentTitle: content.title,
        cartType: 'single',
      },
      callback_url: `${process.env.FRONTEND_URL}/payment-complete?ref=${reference}`,
    });

    await Purchase.create({
      user: userId,
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
    const status = error.status && error.status !== 401 ? error.status : 500;
    res.status(status).json({ error: error.message });
  }
};

// ─── Paystack: cart ────────────────────────────────────────
exports.createCartPaymentIntent = async (req, res) => {
  try {
    const { contentIds } = req.body;
    const userId = req.mongoUser._id;
    const userEmail = req.mongoUser.email;

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ error: 'contentIds must be a non-empty array' });
    }

    const contents = await validateItems(contentIds, userId);

    const totalAmount = contents.reduce((sum, c) => sum + c.price, 0);
    const amountKobo = Math.round(totalAmount * 100);

    if (amountKobo === 0) {
      return res.status(400).json({ error: 'Cannot create a payment for $0 total' });
    }

    const reference = `ps_cart_${userId}_${Date.now()}`;

    const paystackRes = await paystack.initializeTransaction({
      email: userEmail,
      amount: amountKobo,
      currency: 'NGN',
      reference,
      metadata: {
        userId: userId.toString(),
        contentIds: contentIds.join(','),
        itemCount: String(contents.length),
        titles: contents.map(c => c.title).join(' | ').slice(0, 499),
        cartType: 'cart',
      },
      callback_url: `${process.env.FRONTEND_URL}/payment-complete?ref=${reference}`,
    });

    const purchaseRecords = contents.map(c => ({
      user: userId,
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
      items: contents.map(c => ({ _id: c._id, title: c.title, price: c.price, type: c.type })),
    });
  } catch (error) {
    const status = error.status && error.status !== 401 ? error.status : 500;
    res.status(status).json({ error: error.message });
  }
};

// ─── Paystack: verify (called after redirect back) ─────────
exports.verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.mongoUser._id;

    const verification = await paystack.verifyTransaction(reference);

    if (verification.data.status !== 'success') {
      await Purchase.updateMany(
        { paystackReference: reference, user: userId },
        { $set: { status: 'failed' } }
      );
      return res.status(400).json({ error: 'Payment not successful' });
    }

    await Purchase.updateMany(
      { paystackReference: reference, user: userId },
      { $set: { status: 'completed' } }
    );

    const purchases = await Purchase.find({
      paystackReference: reference,
      user: userId,
    }).populate('content', 'title description type thumbnailUrl');

    res.json({ purchases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Paystack: webhook ─────────────────────────────────────
exports.handlePaystackWebhook = async (req, res) => {
  const crypto = require('crypto');
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

// ─── PayPal: create order — single item ───────────────────
exports.createPaypalOrder = async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.mongoUser._id;

    const content = await Content.findOne({ _id: contentId, status: 'published' });
    if (!content) return res.status(404).json({ error: 'Content not found' });

    const existingPurchase = await Purchase.findOne({
      user: userId,
      content: contentId,
      status: 'completed',
    });
    if (existingPurchase) {
      return res.status(400).json({ error: 'You have already purchased this content' });
    }

    const order = await paypalRequest('POST', '/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: content.price.toFixed(2),
          },
          description: content.title,
          payee: {
            email_address: process.env.PAYPAL_RECEIVER_EMAIL,
          },
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment-complete?provider=paypal`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        user_action: 'PAY_NOW',
      },
    });

    await Purchase.create({
      user: userId,
      content: contentId,
      amount: content.price,
      paypalOrderId: order.id,
      paymentMethod: 'paypal',
      status: 'pending',
    });

    const approvalUrl = order.links.find(l => l.rel === 'approve')?.href;

    res.json({ approvalUrl, orderId: order.id, amount: content.price });
  } catch (error) {
    const status = error.status && error.status !== 401 ? error.status : 500;
    res.status(status).json({ error: error.message });
  }
};

// ─── PayPal: create order — cart ──────────────────────────
exports.createPaypalCartOrder = async (req, res) => {
  try {
    const { contentIds } = req.body;
    const userId = req.mongoUser._id;

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ error: 'contentIds must be a non-empty array' });
    }

    const contents = await validateItems(contentIds, userId);
    const totalAmount = contents.reduce((sum, c) => sum + c.price, 0);

    if (totalAmount === 0) {
      return res.status(400).json({ error: 'Cannot create a payment for $0 total' });
    }

    const order = await paypalRequest('POST', '/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
          },
          description: `${contents.length} item(s)`,
          payee: {
            email_address: process.env.PAYPAL_RECEIVER_EMAIL,
          },
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment-complete?provider=paypal`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        user_action: 'PAY_NOW',
      },
    });

    const purchaseRecords = contents.map(c => ({
      user: userId,
      content: c._id,
      amount: c.price,
      paypalOrderId: order.id,
      paymentMethod: 'paypal',
      status: 'pending',
    }));

    await Purchase.insertMany(purchaseRecords);

    const approvalUrl = order.links.find(l => l.rel === 'approve')?.href;

    res.json({
      approvalUrl,
      orderId: order.id,
      amount: totalAmount,
      itemCount: contents.length,
      items: contents.map(c => ({ _id: c._id, title: c.title, price: c.price, type: c.type })),
    });
  } catch (error) {
    const status = error.status && error.status !== 401 ? error.status : 500;
    res.status(status).json({ error: error.message });
  }
};

// ─── PayPal: capture order (called after redirect back) ───
exports.capturePaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.mongoUser._id;

    const capture = await paypalRequest('POST', `/v2/checkout/orders/${orderId}/capture`, {});

    if (capture.status !== 'COMPLETED') {
      await Purchase.updateMany(
        { paypalOrderId: orderId, user: userId },
        { $set: { status: 'failed' } }
      );
      return res.status(400).json({ error: 'PayPal payment not completed' });
    }

    await Purchase.updateMany(
      { paypalOrderId: orderId, user: userId },
      { $set: { status: 'completed' } }
    );

    const purchases = await Purchase.find({
      paypalOrderId: orderId,
      user: userId,
    }).populate('content', 'title description type thumbnailUrl');

    res.json({ purchases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get payment status ────────────────────────────────────
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.mongoUser._id;

    const purchase = await Purchase.findOne({
      $or: [
        { paystackReference: paymentIntentId },
        { paypalOrderId: paymentIntentId },
      ],
      user: userId,
    }).populate('content', 'title description type thumbnailUrl');

    if (!purchase) return res.status(404).json({ error: 'Payment not found' });

    res.json({ purchase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: all payments ───────────────────────────────────
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

// ─── Admin: refund (Paystack only) ────────────────────────
exports.refundPayment = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    if (purchase.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed purchases can be refunded' });
    }

    if (purchase.paymentMethod === 'paypal') {
      return res.status(400).json({ error: 'PayPal refunds must be processed manually via the PayPal dashboard' });
    }

    const refundRes = await paystack.refund({
      transaction: purchase.paystackReference,
    });

    if (refundRes.status) {
      purchase.status = 'refunded';
      await purchase.save();
      res.json({ message: 'Refund successful', purchase });
    } else {
      res.status(400).json({ error: 'Refund failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};