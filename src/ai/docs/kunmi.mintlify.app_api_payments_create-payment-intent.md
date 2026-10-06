> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/payments/create-payment-intent#content-area)

cURL

JavaScript

```
curl -X POST https://api.vaniykempire.com/api/payments/create-payment-intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "507f1f77bcf86cd799439011"
  }'
```

```
const response = await fetch('/api/payments/create-payment-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contentId: '507f1f77bcf86cd799439011'
  })
});

const { clientSecret, amount } = await response.json();

// Use clientSecret with Stripe.js
const stripe = Stripe('pk_test_...');
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'Customer Name' }
  }
});
```

200 Success

404 Content Not Found

400 Already Purchased

500 Server Error

```
{
  "clientSecret": "pi_3MtwBwLkdIwHu7ix28a3tqPa_secret_YrKJUKribcBjcG8HVhfZluoGH",
  "amount": 29.99
}
```

```
{
  "error": "Content not found"
}
```

```
{
  "error": "You have already purchased this content"
}
```

```
{
  "error": "Error message details"
}
```

POST

/

api

/

payments

/

create-payment-intent

Try it

cURL

JavaScript

```
curl -X POST https://api.vaniykempire.com/api/payments/create-payment-intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "507f1f77bcf86cd799439011"
  }'
```

```
const response = await fetch('/api/payments/create-payment-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contentId: '507f1f77bcf86cd799439011'
  })
});

const { clientSecret, amount } = await response.json();

// Use clientSecret with Stripe.js
const stripe = Stripe('pk_test_...');
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'Customer Name' }
  }
});
```

200 Success

404 Content Not Found

400 Already Purchased

500 Server Error

```
{
  "clientSecret": "pi_3MtwBwLkdIwHu7ix28a3tqPa_secret_YrKJUKribcBjcG8HVhfZluoGH",
  "amount": 29.99
}
```

```
{
  "error": "Content not found"
}
```

```
{
  "error": "You have already purchased this content"
}
```

```
{
  "error": "Error message details"
}
```

Creates a Stripe payment intent to initiate the payment flow for content purchase. This endpoint verifies the content exists, checks for duplicate purchases, and creates a pending purchase record.

## [​](https://kunmi.mintlify.app/api/payments/create-payment-intent\#authentication)  Authentication

Requires authentication. Include the JWT token in the Authorization header.

## [​](https://kunmi.mintlify.app/api/payments/create-payment-intent\#request-body)  Request Body

[​](https://kunmi.mintlify.app/api/payments/create-payment-intent#param-content-id)

contentId

string

required

The MongoDB ObjectId of the content to purchase

## [​](https://kunmi.mintlify.app/api/payments/create-payment-intent\#response)  Response

[​](https://kunmi.mintlify.app/api/payments/create-payment-intent#param-client-secret)

clientSecret

string

Stripe client secret for completing the payment on the frontend. Pass this to Stripe Elements or Stripe.js to collect payment details.

[​](https://kunmi.mintlify.app/api/payments/create-payment-intent#param-amount)

amount

number

The purchase amount in USD (dollars, not cents)

## [​](https://kunmi.mintlify.app/api/payments/create-payment-intent\#payment-intent-metadata)  Payment Intent Metadata

The created Stripe payment intent includes the following metadata:

- `contentId` \- The MongoDB ObjectId of the content
- `userId` \- The MongoDB ObjectId of the purchasing user
- `contentTitle` \- The title of the content being purchased

## [​](https://kunmi.mintlify.app/api/payments/create-payment-intent\#payment-flow)  Payment Flow

1. Client calls this endpoint with `contentId`
2. Server validates content exists and is published
3. Server checks user hasn’t already purchased the content
4. Server creates Stripe payment intent with amount in cents (price × 100)
5. Server creates pending Purchase record in database
6. Client receives `clientSecret` to complete payment
7. User completes payment using Stripe on frontend
8. Stripe sends webhook to `/api/payments/webhook`
9. Server updates Purchase status to `completed`

## [​](https://kunmi.mintlify.app/api/payments/create-payment-intent\#validation)  Validation

- Content must exist and have status `published`
- User cannot purchase the same content twice
- User must be authenticated

## [​](https://kunmi.mintlify.app/api/payments/create-payment-intent\#error-codes)  Error Codes

| Status Code | Description |
| --- | --- |
| 200 | Payment intent created successfully |
| 400 | Content already purchased by user |
| 401 | Not authenticated |
| 404 | Content not found or not published |
| 500 | Server error or Stripe API error |

## [​](https://kunmi.mintlify.app/api/payments/create-payment-intent\#related-endpoints)  Related Endpoints

- [Get Payment Status](https://kunmi.mintlify.app/api/payments/payment-status) \- Check status of a payment
- [Webhook](https://kunmi.mintlify.app/api/payments/webhook) \- Stripe webhook handler for payment events

## [​](https://kunmi.mintlify.app/api/payments/create-payment-intent\#implementation-notes)  Implementation Notes

- Currency is hardcoded to USD
- Stripe amounts are in cents (price is multiplied by 100)
- A pending Purchase record is created immediately
- The Purchase status is updated to `completed` via webhook when payment succeeds
- Source: `src/controllers/paymentController.js:6-61`