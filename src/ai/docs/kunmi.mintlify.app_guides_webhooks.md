> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/guides/webhooks#content-area)

This guide covers setting up and securing Stripe webhooks for processing payment events in the Vaniyk Empire API.

## [​](https://kunmi.mintlify.app/guides/webhooks\#why-webhooks)  Why Webhooks?

Webhooks enable Stripe to notify your API when payment events occur. This is essential because:

- Payments are processed asynchronously
- Users may close their browser before payment completes
- Network issues can prevent frontend notification
- Webhooks provide server-side confirmation of payment status

The API uses webhooks to update purchase status from `pending` to `completed` when payments succeed.

## [​](https://kunmi.mintlify.app/guides/webhooks\#webhook-events)  Webhook Events

The API handles these Stripe events:

| Event | Description | Handler |
| --- | --- | --- |
| `payment_intent.succeeded` | Payment completed successfully | Updates purchase to `completed` |
| `payment_intent.payment_failed` | Payment declined or failed | Updates purchase to `failed` |

Other Stripe events are ignored. See `src/controllers/paymentController.js:80-91` for event handling logic.

## [​](https://kunmi.mintlify.app/guides/webhooks\#setup-webhooks)  Setup Webhooks

1

Create webhook endpoint in Stripe

**For Development (using Stripe CLI):**

1. Install the Stripe CLI:

```
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows
# Download from https://github.com/stripe/stripe-cli/releases
```

2. Login to Stripe:

```
stripe login
```

3. Forward webhooks to your local server:

```
stripe listen --forward-to localhost:3000/webhooks/stripe
```

**Output:**

```
> Ready! Your webhook signing secret is whsec_abc123def456ghi789jkl012mno345pqr678stu (^C to quit)
```

4. Copy the webhook signing secret and add to `.env`:

```
STRIPE_WEBHOOK_SECRET=whsec_abc123def456ghi789jkl012mno345pqr678stu
```

Keep the `stripe listen` command running during development. It will log all webhook events.

2

Create webhook endpoint in Stripe (Production)

**For Production:**

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click “Add endpoint”
3. Enter your webhook URL:

```
https://api.vaniykempire.com/webhooks/stripe
```

4. Select events to listen to:   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click “Add endpoint”
6. Copy the “Signing secret” (starts with `whsec_`)
7. Add to production environment variables:

```
STRIPE_WEBHOOK_SECRET=whsec_prod_abc123...
```

Never commit webhook secrets to version control. Use environment variables or secret management services.

3

Verify webhook configuration

Test the webhook by triggering a test payment:

```
stripe trigger payment_intent.succeeded
```

**Expected console output:**

```
Payment completed for purchase 64xyz789abc456def
```

Check the webhook logs in Stripe Dashboard to verify successful delivery.

## [​](https://kunmi.mintlify.app/guides/webhooks\#webhook-security)  Webhook Security

The API verifies webhook authenticity using Stripe signatures. This prevents malicious actors from sending fake webhook events.

### [​](https://kunmi.mintlify.app/guides/webhooks\#how-signature-verification-works)  How Signature Verification Works

**Request flow:**

```
// 1. Stripe sends webhook with signature header
POST /webhooks/stripe
Headers:
  stripe-signature: t=1678886400,v1=abc123...,v0=def456...

// 2. API verifies signature (src/controllers/paymentController.js:69-76)
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,          // Raw request body (important!)
  sig,               // Signature from header
  process.env.STRIPE_WEBHOOK_SECRET
);

// 3. If signature invalid, return 400 error
if (verification_fails) {
  return res.status(400).send('Webhook Error: Invalid signature');
}

// 4. If valid, process the event
```

**Critical**: The webhook endpoint must receive the **raw request body**, not parsed JSON. Express must be configured to preserve raw body for webhook routes.

### [​](https://kunmi.mintlify.app/guides/webhooks\#express-configuration)  Express Configuration

Ensure your Express app is configured correctly:

```
const express = require('express');
const app = express();

// Webhook route MUST come BEFORE express.json() middleware
app.post('/webhooks/stripe',
  express.raw({ type: 'application/json' }),  // Use raw body
  webhookController.handleWebhook
);

// Other routes can use JSON parsing
app.use(express.json());
app.use('/api', otherRoutes);
```

## [​](https://kunmi.mintlify.app/guides/webhooks\#webhook-handler-implementation)  Webhook Handler Implementation

The webhook handler processes payment events:

```
// src/controllers/paymentController.js:64-94
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
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

  // Return 200 to acknowledge receipt
  res.json({ received: true });
};
```

### [​](https://kunmi.mintlify.app/guides/webhooks\#payment-success-handler)  Payment Success Handler

```
// src/controllers/paymentController.js:96-112
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    // Find purchase by payment intent ID
    const purchase = await Purchase.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (purchase) {
      // Update status to completed
      purchase.status = 'completed';
      await purchase.save();

      console.log(`Payment completed for purchase ${purchase._id}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};
```

### [​](https://kunmi.mintlify.app/guides/webhooks\#payment-failure-handler)  Payment Failure Handler

```
// src/controllers/paymentController.js:114-130
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const purchase = await Purchase.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (purchase) {
      // Update status to failed
      purchase.status = 'failed';
      await purchase.save();

      console.log(`Payment failed for purchase ${purchase._id}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};
```

## [​](https://kunmi.mintlify.app/guides/webhooks\#testing-webhooks)  Testing Webhooks

### [​](https://kunmi.mintlify.app/guides/webhooks\#using-stripe-cli)  Using Stripe CLI

**Forward webhooks to local server:**

```
stripe listen --forward-to localhost:3000/webhooks/stripe
```

**Trigger test events:**

```
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed
```

**View webhook logs:**

```
stripe logs tail
```

### [​](https://kunmi.mintlify.app/guides/webhooks\#using-stripe-dashboard)  Using Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Click “Send test webhook”
4. Select event type (e.g., `payment_intent.succeeded`)
5. Optionally customize the payload
6. Click “Send test webhook”
7. View the response and logs

### [​](https://kunmi.mintlify.app/guides/webhooks\#manual-testing-with-curl)  Manual Testing with cURL

This will fail signature verification (expected behavior):

```
curl -X POST http://localhost:3000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test123"
      }
    }
  }'
```

**Expected response:**

```
Webhook Error: No signatures found matching the expected signature for payload
```

This confirms signature verification is working correctly.

## [​](https://kunmi.mintlify.app/guides/webhooks\#webhook-reliability)  Webhook Reliability

### [​](https://kunmi.mintlify.app/guides/webhooks\#stripe-retry-logic)  Stripe Retry Logic

If your webhook endpoint returns a non-2xx status code, Stripe automatically retries:

- **Retry schedule**: Exponential backoff over 3 days
- **First retry**: Immediately
- **Subsequent retries**: 1 hour, 2 hours, 4 hours, etc.
- **Maximum attempts**: ~10 retries over 72 hours

### [​](https://kunmi.mintlify.app/guides/webhooks\#idempotency)  Idempotency

Webhook handlers should be idempotent (safe to process multiple times):

```
// Good: Uses findOne which handles duplicates
const purchase = await Purchase.findOne({
  stripePaymentIntentId: paymentIntent.id
});

if (purchase && purchase.status !== 'completed') {
  purchase.status = 'completed';
  await purchase.save();
}
```

The current implementation is idempotent. Reprocessing a `payment_intent.succeeded` event for an already-completed purchase has no effect.

### [​](https://kunmi.mintlify.app/guides/webhooks\#monitoring-webhooks)  Monitoring Webhooks

**Check webhook health in Stripe Dashboard:**

1. Go to Developers → Webhooks
2. View delivery success rate
3. Investigate failed deliveries
4. Check response times

**Set up alerts for webhook failures:**

- Configure email notifications in Stripe Dashboard
- Monitor error logs in your application
- Use uptime monitoring services

## [​](https://kunmi.mintlify.app/guides/webhooks\#common-issues)  Common Issues

| Issue | Cause | Solution |
| --- | --- | --- |
| 400 Webhook Error | Invalid signature | Verify `STRIPE_WEBHOOK_SECRET` is correct |
| 400 Webhook Error | Body parsed as JSON | Use `express.raw()` for webhook route |
| Purchase not updating | Wrong environment (test vs live) | Ensure webhook secret matches Stripe mode |
| Webhook not received | Firewall blocking Stripe IPs | Whitelist Stripe IP ranges |
| High latency | Slow database queries | Add indexes on `stripePaymentIntentId` |

## [​](https://kunmi.mintlify.app/guides/webhooks\#production-checklist)  Production Checklist

1

Environment configuration

- [ ] Production webhook endpoint created in Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` set to production secret
- [ ] HTTPS enabled on webhook URL (required by Stripe)
- [ ] Domain verified and SSL certificate valid

2

Security

- [ ] Webhook signature verification enabled
- [ ] Raw body parsing configured for webhook route
- [ ] Webhook secret stored securely (not in code)
- [ ] Rate limiting configured (prevent DoS)

3

Monitoring

- [ ] Webhook delivery monitoring enabled
- [ ] Error alerting configured
- [ ] Logging implemented for webhook events
- [ ] Database indexes on `stripePaymentIntentId`

4

Testing

- [ ] Test webhook with `stripe trigger` command
- [ ] Verify purchase status updates correctly
- [ ] Test retry behavior (simulate failures)
- [ ] Confirm idempotency (reprocess events)

## [​](https://kunmi.mintlify.app/guides/webhooks\#advanced-configuration)  Advanced Configuration

### [​](https://kunmi.mintlify.app/guides/webhooks\#webhook-timeouts)  Webhook Timeouts

Stripe expects webhook responses within 5 seconds. If your handler takes longer:

```
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Respond immediately
  res.json({ received: true });

  // Process event asynchronously
  processEventAsync(event);
};

async function processEventAsync(event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    // ...
  }
}
```

### [​](https://kunmi.mintlify.app/guides/webhooks\#multiple-webhook-endpoints)  Multiple Webhook Endpoints

For microservices, you can configure multiple endpoints:

```
https://api.vaniykempire.com/webhooks/stripe/payments
https://api.vaniykempire.com/webhooks/stripe/subscriptions
```

Each can have different event selections and signing secrets.

### [​](https://kunmi.mintlify.app/guides/webhooks\#webhook-event-filtering)  Webhook Event Filtering

In Stripe Dashboard, select only required events to reduce noise:

- `payment_intent.succeeded` ✓
- `payment_intent.payment_failed` ✓
- `charge.succeeded` ✗ (not needed)
- `customer.created` ✗ (not needed)

## [​](https://kunmi.mintlify.app/guides/webhooks\#source-code-references)  Source Code References

- Webhook handler: `src/controllers/paymentController.js:64`
- Payment success: `src/controllers/paymentController.js:97`
- Payment failure: `src/controllers/paymentController.js:115`
- Stripe configuration: `src/config/stripe.js`

## [​](https://kunmi.mintlify.app/guides/webhooks\#next-steps)  Next Steps

[**Payment Flow** \\
\\
Learn the complete payment workflow](https://kunmi.mintlify.app/guides/purchasing-content)

[**Stripe API Reference** \\
\\
Official Stripe webhook documentation](https://stripe.com/docs/api/webhooks)