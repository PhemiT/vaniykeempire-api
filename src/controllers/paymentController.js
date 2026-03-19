const stripe = require('../config/stripe');
const Content = require('../models/Content');
const Purchase = require('../models/Purchase');

// ─── Single item purchase ──────────────────────────────────
exports.createPaymentIntent = async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.mongoUser._id;

    const content = await Content.findOne({
      _id: contentId,
      status: 'published',
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const existingPurchase = await Purchase.findOne({
      user: userId,
      content: contentId,
      status: 'completed',
    });

    if (existingPurchase) {
      return res.status(400).json({
        error: 'You have already purchased this content',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(content.price * 100),
      currency: 'usd',
      metadata: {
        contentId:    content._id.toString(),
        userId:       userId.toString(),
        contentTitle: content.title,
      },
    });

    await Purchase.create({
      user:                  userId,
      content:               contentId,
      amount:                content.price,
      stripePaymentIntentId: paymentIntent.id,
      status:                'pending',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount:       content.price,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Cart checkout — multiple items, one PaymentIntent ─────
exports.createCartPaymentIntent = async (req, res) => {
  try {
    const { contentIds } = req.body;
    const userId = req.mongoUser._id;

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ error: 'contentIds must be a non-empty array' });
    }

    // Load all requested content items
    const contents = await Content.find({
      _id:    { $in: contentIds },
      status: 'published',
    });

    if (contents.length !== contentIds.length) {
      return res.status(404).json({
        error: 'One or more content items not found or not published',
      });
    }

    // Block items the user has already purchased
    const alreadyPurchased = await Purchase.find({
      user:    userId,
      content: { $in: contentIds },
      status:  'completed',
    });

    if (alreadyPurchased.length > 0) {
      const titles = alreadyPurchased.map(p => {
        const c = contents.find(c => c._id.toString() === p.content.toString());
        return c?.title ?? p.content;
      });
      return res.status(400).json({
        error: `You have already purchased: ${titles.join(', ')}`,
      });
    }

    const totalAmount = contents.reduce((sum, c) => sum + c.price, 0);
    const totalCents  = Math.round(totalAmount * 100);

    if (totalCents === 0) {
      return res.status(400).json({ error: 'Cannot create a payment for $0 total' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   totalCents,
      currency: 'usd',
      metadata: {
        userId:     userId.toString(),
        contentIds: contentIds.join(','),
        itemCount:  String(contents.length),
        titles:     contents.map(c => c.title).join(' | ').slice(0, 499),
      },
    });

    // One pending Purchase record per item, all sharing the same PaymentIntent
    const purchaseRecords = contents.map(c => ({
      user:                  userId,
      content:               c._id,
      amount:                c.price,
      stripePaymentIntentId: paymentIntent.id,
      status:                'pending',
    }));

    await Purchase.insertMany(purchaseRecords);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount:       totalAmount,
      itemCount:    contents.length,
      items: contents.map(c => ({
        _id:   c._id,
        title: c.title,
        price: c.price,
        type:  c.type,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Stripe webhook ────────────────────────────────────────
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Handles both single-item and cart PaymentIntents
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const purchases = await Purchase.find({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (purchases.length > 0) {
      await Purchase.updateMany(
        { stripePaymentIntentId: paymentIntent.id },
        { $set: { status: 'completed' } }
      );
      console.log(
        `Payment completed: ${purchases.length} purchase(s) for intent ${paymentIntent.id}`
      );
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  try {
    await Purchase.updateMany(
      { stripePaymentIntentId: paymentIntent.id },
      { $set: { status: 'failed' } }
    );
    console.log(`Payment failed for intent ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

// ─── Get payment status ────────────────────────────────────
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.mongoUser._id;

    const purchase = await Purchase.findOne({
      stripePaymentIntentId: paymentIntentId,
      user:                  userId,
    }).populate('content', 'title description type thumbnailUrl');

    if (!purchase) {
      return res.status(404).json({ error: 'Payment not found' });
    }

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
      .populate('user',    'name email')
      .populate('content', 'title type thumbnailUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ purchasedAt: -1 });

    const count = await Purchase.countDocuments(query);

    res.json({
      purchases,
      totalPages:     Math.ceil(count / limit),
      currentPage:    Number(page),
      totalPurchases: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: refund ─────────────────────────────────────────
exports.refundPayment = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    if (purchase.status !== 'completed') {
      return res.status(400).json({
        error: 'Only completed purchases can be refunded',
      });
    }

    const refund = await stripe.refunds.create({
      payment_intent: purchase.stripePaymentIntentId,
    });

    if (refund.status === 'succeeded') {
      purchase.status = 'refunded';
      await purchase.save();

      res.json({
        message: 'Refund successful',
        purchase,
      });
    } else {
      res.status(400).json({ error: 'Refund failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};