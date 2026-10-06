> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/guides/purchasing-content#content-area)

This guide walks through the complete content purchase flow: browsing available content, creating payment intents, completing purchases with Stripe, and accessing purchased content.

## [​](https://kunmi.mintlify.app/guides/purchasing-content\#browse-available-content)  Browse Available Content

1

List all published content

Retrieve paginated content with optional filters:

```
curl -X GET "https://api.vaniykempire.com/content?page=1&limit=10&category=64abc123def456789&type=video&minPrice=10&maxPrice=50"
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category ID
- `type` (optional): Filter by type (`video`, `audio`, `pdf`)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `search` (optional): Full-text search

**Response:**

```
{
  "content": [\
    {\
      "_id": "64def789abc123456",\
      "title": "Advanced JavaScript Patterns",\
      "description": "Deep dive into modern JavaScript design patterns and best practices",\
      "type": "video",\
      "category": "64abc123def456789",\
      "price": 29.99,\
      "thumbnailUrl": "https://res.cloudinary.com/vaniyk/image/upload/v1/content/thumbnails/xyz123.jpg",\
      "duration": 3600,\
      "fileSize": 524288000,\
      "status": "published",\
      "tags": ["javascript", "patterns", "advanced"],\
      "createdBy": {\
        "_id": "64abc789def123456",\
        "name": "Admin User"\
      },\
      "createdAt": "2026-03-01T10:00:00.000Z"\
    }\
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalContent": 47
}
```

File URLs are excluded from public listings for security. They’re only available after purchase.

2

View content details

Get detailed information about a specific content item:

```
curl -X GET https://api.vaniykempire.com/content/64def789abc123456
```

**Response:**

```
{
  "content": {
    "_id": "64def789abc123456",
    "title": "Advanced JavaScript Patterns",
    "description": "Deep dive into modern JavaScript design patterns...",
    "type": "video",
    "category": "64abc123def456789",
    "price": 29.99,
    "thumbnailUrl": "https://res.cloudinary.com/vaniyk/image/upload/v1/content/thumbnails/xyz123.jpg",
    "duration": 3600,
    "fileSize": 524288000,
    "status": "published",
    "tags": ["javascript", "patterns", "advanced"],
    "createdBy": {
      "_id": "64abc789def123456",
      "name": "Admin User"
    },
    "createdAt": "2026-03-01T10:00:00.000Z",
    "updatedAt": "2026-03-01T10:00:00.000Z"
  }
}
```

## [​](https://kunmi.mintlify.app/guides/purchasing-content\#purchase-workflow)  Purchase Workflow

1

Create a payment intent

Initiate a purchase by creating a Stripe payment intent:

```
curl -X POST https://api.vaniykempire.com/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "contentId": "64def789abc123456"
  }'
```

**Response:**

```
{
  "clientSecret": "pi_3AbCdEfGhIjKlMnO_secret_pQrStUvWxYzAbCdEfGhIjKlMnO",
  "amount": 29.99
}
```

**What happens:**

1. The API validates the content exists and is published
2. Checks if you’ve already purchased this content
3. Creates a Stripe PaymentIntent for the content price
4. Creates a pending purchase record in MongoDB
5. Returns a `clientSecret` for completing payment

Users receive a 400 error if they attempt to purchase content they already own.

2

Complete payment with Stripe

Use the `clientSecret` with Stripe.js or Stripe Elements to collect payment:**Frontend example (React with Stripe.js):**

```
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://yourapp.com/payment-success',
      },
    });

    if (error) {
      console.error(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Payment successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>Pay</button>
    </form>
  );
}

function App({ clientSecret }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}
```

Stripe handles all payment processing. When payment succeeds, Stripe sends a webhook to your API to complete the purchase.

3

Check payment status

Verify the payment status using the payment intent ID:

```
curl -X GET https://api.vaniykempire.com/payments/status/pi_3AbCdEfGhIjKlMnO \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```
{
  "purchase": {
    "_id": "64xyz789abc456def",
    "user": "64abc123def456789",
    "content": {
      "_id": "64def789abc123456",
      "title": "Advanced JavaScript Patterns",
      "description": "Deep dive into modern JavaScript design patterns...",
      "type": "video",
      "thumbnailUrl": "https://res.cloudinary.com/vaniyk/..."
    },
    "amount": 29.99,
    "stripePaymentIntentId": "pi_3AbCdEfGhIjKlMnO",
    "status": "completed",
    "purchasedAt": "2026-03-03T14:30:00.000Z"
  }
}
```

**Purchase statuses:**

- `pending`: Payment intent created, awaiting payment
- `completed`: Payment successful, content available
- `failed`: Payment failed
- `refunded`: Purchase refunded by admin

## [​](https://kunmi.mintlify.app/guides/purchasing-content\#access-purchased-content)  Access Purchased Content

1

View your purchases

List all content you’ve purchased:

```
curl -X GET "https://api.vaniykempire.com/content/purchases?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```
{
  "purchases": [\
    {\
      "_id": "64xyz789abc456def",\
      "content": {\
        "_id": "64def789abc123456",\
        "title": "Advanced JavaScript Patterns",\
        "description": "Deep dive into modern JavaScript design patterns...",\
        "type": "video",\
        "category": "64abc123def456789",\
        "price": 29.99,\
        "thumbnailUrl": "https://res.cloudinary.com/vaniyk/..."\
      },\
      "amount": 29.99,\
      "status": "completed",\
      "purchasedAt": "2026-03-03T14:30:00.000Z"\
    }\
  ],
  "totalPages": 2,
  "currentPage": 1,
  "totalPurchases": 12
}
```

2

Access content file

Once purchased, retrieve the content with file URLs:

```
curl -X GET https://api.vaniykempire.com/content/64def789abc123456/access \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```
{
  "content": {
    "_id": "64def789abc123456",
    "title": "Advanced JavaScript Patterns",
    "description": "Deep dive into modern JavaScript design patterns...",
    "type": "video",
    "category": "64abc123def456789",
    "price": 29.99,
    "fileUrl": "https://res.cloudinary.com/vaniyk/video/upload/v1/content/videos/abc123.mp4",
    "filePublicId": "content/videos/abc123",
    "thumbnailUrl": "https://res.cloudinary.com/vaniyk/image/upload/v1/content/thumbnails/xyz123.jpg",
    "duration": 3600,
    "fileSize": 524288000,
    "status": "published",
    "tags": ["javascript", "patterns", "advanced"],
    "createdBy": {
      "_id": "64abc789def123456",
      "name": "Admin User"
    },
    "createdAt": "2026-03-01T10:00:00.000Z",
    "updatedAt": "2026-03-01T10:00:00.000Z"
  }
}
```

This endpoint returns 403 Forbidden if you haven’t purchased the content.

## [​](https://kunmi.mintlify.app/guides/purchasing-content\#error-handling)  Error Handling

Common error scenarios:

| Status Code | Error | Description |
| --- | --- | --- |
| 400 | Already purchased | User already owns this content |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Attempting to access unpurchased content |
| 404 | Not found | Content doesn’t exist or isn’t published |
| 500 | Server error | Internal error during payment processing |

**Example error response:**

```
{
  "error": "You have already purchased this content"
}
```

## [​](https://kunmi.mintlify.app/guides/purchasing-content\#payment-flow-diagram)  Payment Flow Diagram

WebhookStripeAPIFrontendUserWebhookStripeAPIFrontendUserBrowse contentGET /contentContent listSelect contentPOST /payments/create-payment-intentCreate PaymentIntentclientSecretclientSecretEnter payment detailsConfirm paymentPayment successpayment\_intent.succeededUpdate purchase statusSuccessAccess contentGET /content/:id/accessContent with file URL

## [​](https://kunmi.mintlify.app/guides/purchasing-content\#implementation-tips)  Implementation Tips

**Stripe Testing**: Use Stripe test cards for development:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Use any future expiration date and any 3-digit CVC.

**Webhook Processing**: The purchase status is updated asynchronously via webhooks. After payment confirmation:

1. Poll the `/payments/status/:paymentIntentId` endpoint
2. Wait for status to change from `pending` to `completed`
3. Then redirect to the content access page

### [​](https://kunmi.mintlify.app/guides/purchasing-content\#source-code-references)  Source Code References

- List content: `src/controllers/contentController.js:152`
- Create payment intent: `src/controllers/paymentController.js:6`
- Access purchased content: `src/controllers/contentController.js:221`
- Webhook handler: `src/controllers/paymentController.js:64`

## [​](https://kunmi.mintlify.app/guides/purchasing-content\#next-steps)  Next Steps

[**Webhooks Setup** \\
\\
Configure Stripe webhooks for payment processing](https://kunmi.mintlify.app/guides/webhooks)

[**Payment API Reference** \\
\\
Detailed payment API documentation](https://kunmi.mintlify.app/api-reference/payments/create-payment-intent)