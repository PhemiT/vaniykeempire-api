> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/payments/webhook#content-area)

cURL (Simulated)

Testing Webhooks Locally

```
# This is how Stripe calls your webhook
curl -X POST https://api.vaniykempire.com/api/payments/webhook \
  -H "stripe-signature: t=1678886400,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_1MtwBwLkdIwHu7ix28a3tqPa",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
        "amount": 2999,
        "currency": "usd",
        "status": "succeeded",
        "metadata": {
          "contentId": "507f191e810c19729de860ea",
          "userId": "507f1f77bcf86cd799439011",
          "contentTitle": "Advanced React Patterns"
        }
      }
    }
  }'
```

```
// Use Stripe CLI to forward webhooks to localhost
// stripe listen --forward-to localhost:3000/api/payments/webhook

// Trigger test events
// stripe trigger payment_intent.succeeded
// stripe trigger payment_intent.payment_failed
```

200 Success

400 Verification Failed

```
{
  "received": true
}
```

```
Webhook Error: No signatures found matching the expected signature for payload
```

POST

/

api

/

payments

/

webhook

Try it

cURL (Simulated)

Testing Webhooks Locally

```
# This is how Stripe calls your webhook
curl -X POST https://api.vaniykempire.com/api/payments/webhook \
  -H "stripe-signature: t=1678886400,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_1MtwBwLkdIwHu7ix28a3tqPa",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
        "amount": 2999,
        "currency": "usd",
        "status": "succeeded",
        "metadata": {
          "contentId": "507f191e810c19729de860ea",
          "userId": "507f1f77bcf86cd799439011",
          "contentTitle": "Advanced React Patterns"
        }
      }
    }
  }'
```

```
// Use Stripe CLI to forward webhooks to localhost
// stripe listen --forward-to localhost:3000/api/payments/webhook

// Trigger test events
// stripe trigger payment_intent.succeeded
// stripe trigger payment_intent.payment_failed
```

200 Success

400 Verification Failed

```
{
  "received": true
}
```

```
Webhook Error: No signatures found matching the expected signature for payload
```

Secure webhook endpoint that receives events from Stripe when payment status changes. This endpoint handles payment intent success and failure events, updating the Purchase record status accordingly.

## [​](https://kunmi.mintlify.app/api/payments/webhook\#important-notes)  Important Notes

This endpoint requires raw request body parsing and must be placed before the `express.json()` middleware in your Express application. The Stripe signature verification requires access to the raw request body.

This endpoint is called by Stripe servers, not by your frontend application. Configure this webhook URL in your Stripe Dashboard under Developers → Webhooks.

## [​](https://kunmi.mintlify.app/api/payments/webhook\#webhook-configuration)  Webhook Configuration

1. In Stripe Dashboard, go to Developers → Webhooks
2. Click “Add endpoint”
3. Enter URL: `https://api.vaniykempire.com/api/payments/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` environment variable

## [​](https://kunmi.mintlify.app/api/payments/webhook\#signature-verification)  Signature Verification

The endpoint verifies webhook authenticity using Stripe’s signature verification:

```
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

## [​](https://kunmi.mintlify.app/api/payments/webhook\#handled-events)  Handled Events

### [​](https://kunmi.mintlify.app/api/payments/webhook\#payment_intent-succeeded)  payment\_intent.succeeded

Fired when a payment successfully completes. The webhook handler:

1. Finds the Purchase record by `stripePaymentIntentId`
2. Updates Purchase status to `completed`
3. Logs the successful payment

### [​](https://kunmi.mintlify.app/api/payments/webhook\#payment_intent-payment_failed)  payment\_intent.payment\_failed

Fired when a payment fails (card declined, insufficient funds, etc.). The webhook handler:

1. Finds the Purchase record by `stripePaymentIntentId`
2. Updates Purchase status to `failed`
3. Logs the failed payment

## [​](https://kunmi.mintlify.app/api/payments/webhook\#request-headers)  Request Headers

[​](https://kunmi.mintlify.app/api/payments/webhook#param-stripe-signature)

stripe-signature

string

required

Stripe webhook signature for verifying the request authenticity. Automatically added by Stripe.

[​](https://kunmi.mintlify.app/api/payments/webhook#param-content-type)

content-type

string

Should be `application/json`

## [​](https://kunmi.mintlify.app/api/payments/webhook\#request-body)  Request Body

The raw Stripe event object. Common fields include:

[​](https://kunmi.mintlify.app/api/payments/webhook#param-id)

id

string

Unique identifier for the event (e.g., `evt_1MtwBwLkdIwHu7ix28a3tqPa`)

[​](https://kunmi.mintlify.app/api/payments/webhook#param-type)

type

string

Event type (e.g., `payment_intent.succeeded`, `payment_intent.payment_failed`)

[​](https://kunmi.mintlify.app/api/payments/webhook#param-data)

data

object

Event data containing the payment intent object

Show data.object properties

[​](https://kunmi.mintlify.app/api/payments/webhook#param-id-1)

id

string

Payment intent ID (e.g., `pi_3MtwBwLkdIwHu7ix28a3tqPa`)

[​](https://kunmi.mintlify.app/api/payments/webhook#param-amount)

amount

number

Amount in cents

[​](https://kunmi.mintlify.app/api/payments/webhook#param-currency)

currency

string

Three-letter ISO currency code (e.g., `usd`)

[​](https://kunmi.mintlify.app/api/payments/webhook#param-status)

status

string

Payment intent status

[​](https://kunmi.mintlify.app/api/payments/webhook#param-metadata)

metadata

object

Custom metadata attached when creating payment intent

Show metadata properties

[​](https://kunmi.mintlify.app/api/payments/webhook#param-content-id)

contentId

string

MongoDB ObjectId of purchased content

[​](https://kunmi.mintlify.app/api/payments/webhook#param-user-id)

userId

string

MongoDB ObjectId of purchasing user

[​](https://kunmi.mintlify.app/api/payments/webhook#param-content-title)

contentTitle

string

Title of purchased content

## [​](https://kunmi.mintlify.app/api/payments/webhook\#response)  Response

[​](https://kunmi.mintlify.app/api/payments/webhook#param-received)

received

boolean

Always returns `true` to acknowledge receipt of the webhook

## [​](https://kunmi.mintlify.app/api/payments/webhook\#error-handling)  Error Handling

If signature verification fails, returns:

- **Status Code**: 400
- **Body**: `Webhook Error: <error message>`

## [​](https://kunmi.mintlify.app/api/payments/webhook\#security-best-practices)  Security Best Practices

1. **Always verify webhook signatures** \- Prevents unauthorized requests from spoofing Stripe
2. **Use raw body parsing** \- Required for signature verification
3. **Store webhook secret securely** \- Use environment variables, never commit to git
4. **Implement idempotency** \- Handle duplicate webhook events gracefully
5. **Return 200 quickly** \- Stripe will retry if endpoint times out

## [​](https://kunmi.mintlify.app/api/payments/webhook\#webhook-retry-logic)  Webhook Retry Logic

Stripe automatically retries failed webhooks:

- If endpoint returns non-2xx status code
- If endpoint times out (after 30 seconds)
- Retries for up to 3 days with exponential backoff
- View retry attempts in Stripe Dashboard

## [​](https://kunmi.mintlify.app/api/payments/webhook\#testing)  Testing

### [​](https://kunmi.mintlify.app/api/payments/webhook\#local-development)  Local Development

```
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

### [​](https://kunmi.mintlify.app/api/payments/webhook\#test-mode)  Test Mode

Use Stripe test mode webhook endpoints with test API keys to safely test without affecting production data.

## [​](https://kunmi.mintlify.app/api/payments/webhook\#troubleshooting)  Troubleshooting

| Issue | Solution |
| --- | --- |
| Signature verification fails | Ensure raw body parsing is enabled and webhook secret is correct |
| Purchase not found | Check that payment intent was created through your API |
| Webhooks not received | Verify webhook URL is correct in Stripe Dashboard |
| Duplicate events | Implement idempotency using event ID |

## [​](https://kunmi.mintlify.app/api/payments/webhook\#related-endpoints)  Related Endpoints

- [Create Payment Intent](https://kunmi.mintlify.app/api/payments/create-payment-intent) \- Creates the payment intent that triggers webhooks
- [Get Payment Status](https://kunmi.mintlify.app/api/payments/payment-status) \- Check payment status after webhook processing

## [​](https://kunmi.mintlify.app/api/payments/webhook\#environment-variables)  Environment Variables

[​](https://kunmi.mintlify.app/api/payments/webhook#param-stripe-webhook-secret)

STRIPE\_WEBHOOK\_SECRET

string

required

Webhook signing secret from Stripe Dashboard. Format: `whsec_...`

## [​](https://kunmi.mintlify.app/api/payments/webhook\#implementation-notes)  Implementation Notes

- Middleware: `express.raw({ type: 'application/json' })`
- Must be registered before `express.json()` middleware
- Unhandled event types are logged but don’t cause errors
- Purchase updates are wrapped in try-catch to prevent webhook failures
- Source: `src/controllers/paymentController.js:64-130`
- Route configuration: `src/routes/paymentRoutes.js:7-11`