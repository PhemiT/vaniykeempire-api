const stripe = require('../config/stripe');
const Content = require('../models/Content');
const Purchase = require('../models/Purchase');

// Create payment intent for content purchase
exports.createPaymentIntent = async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.mongoUser._id;

    // Get content details
    const content = await Content.findOne({ 
      _id: contentId, 
      status: 'published' 
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check if user already purchased this content
    const existingPurchase = await Purchase.findOne({
      user: userId,
      content: contentId,
      status: 'completed'
    });

    if (existingPurchase) {
      return res.status(400).json({ 
        error: 'You have already purchased this content' 
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(content.price * 100), // Stripe uses cents
      currency: 'usd',
      metadata: {
        contentId: content._id.toString(),
        userId: userId.toString(),
        contentTitle: content.title
      }
    });

    // Create pending purchase record
    await Purchase.create({
      user: userId,
      content: contentId,
      amount: content.price,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: content.price
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stripe webhook handler
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

  // Handle the event
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

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const purchase = await Purchase.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (purchase) {
      purchase.status = 'completed';
      await purchase.save();
      
      console.log(`Payment completed for purchase ${purchase._id}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

// Handle failed payment
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const purchase = await Purchase.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (purchase) {
      purchase.status = 'failed';
      await purchase.save();
      
      console.log(`Payment failed for purchase ${purchase._id}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.mongoUser._id;

    const purchase = await Purchase.findOne({
      stripePaymentIntentId: paymentIntentId,
      user: userId
    }).populate('content', 'title description type thumbnailUrl');

    if (!purchase) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ purchase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const purchases = await Purchase.find(query)
      .populate('user', 'name email')
      .populate('content', 'title type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ purchasedAt: -1 });

    const count = await Purchase.countDocuments(query);

    res.json({
      purchases,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalPurchases: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Refund payment
exports.refundPayment = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    if (purchase.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Only completed purchases can be refunded' 
      });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: purchase.stripePaymentIntentId
    });

    if (refund.status === 'succeeded') {
      purchase.status = 'refunded';
      await purchase.save();

      res.json({ 
        message: 'Refund successful',
        purchase 
      });
    } else {
      res.status(400).json({ error: 'Refund failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};