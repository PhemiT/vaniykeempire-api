> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/payments/payment-status#content-area)

cURL

JavaScript

```
curl -X GET https://api.vaniykempire.com/api/payments/status/pi_3MtwBwLkdIwHu7ix28a3tqPa \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

```
const response = await fetch(
  `/api/payments/status/${paymentIntentId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const { purchase } = await response.json();
console.log(`Payment status: ${purchase.status}`);
```

200 Success - Completed

200 Success - Pending

404 Not Found

500 Server Error

```
{
  "purchase": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": "507f1f77bcf86cd799439011",
    "content": {
      "_id": "507f191e810c19729de860ea",
      "title": "Advanced React Patterns",
      "description": "Learn advanced React patterns and best practices",
      "type": "course",
      "thumbnailUrl": "https://cdn.vaniykempire.com/thumbnails/react-course.jpg"
    },
    "amount": 29.99,
    "stripePaymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "status": "completed",
    "purchasedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

```
{
  "purchase": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": "507f1f77bcf86cd799439011",
    "content": {
      "_id": "507f191e810c19729de860ea",
      "title": "Advanced React Patterns",
      "description": "Learn advanced React patterns and best practices",
      "type": "course",
      "thumbnailUrl": "https://cdn.vaniykempire.com/thumbnails/react-course.jpg"
    },
    "amount": 29.99,
    "stripePaymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "status": "pending",
    "purchasedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

```
{
  "error": "Payment not found"
}
```

```
{
  "error": "Error message details"
}
```

GET

/

api

/

payments

/

status

/

:paymentIntentId

Try it

cURL

JavaScript

```
curl -X GET https://api.vaniykempire.com/api/payments/status/pi_3MtwBwLkdIwHu7ix28a3tqPa \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

```
const response = await fetch(
  `/api/payments/status/${paymentIntentId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const { purchase } = await response.json();
console.log(`Payment status: ${purchase.status}`);
```

200 Success - Completed

200 Success - Pending

404 Not Found

500 Server Error

```
{
  "purchase": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": "507f1f77bcf86cd799439011",
    "content": {
      "_id": "507f191e810c19729de860ea",
      "title": "Advanced React Patterns",
      "description": "Learn advanced React patterns and best practices",
      "type": "course",
      "thumbnailUrl": "https://cdn.vaniykempire.com/thumbnails/react-course.jpg"
    },
    "amount": 29.99,
    "stripePaymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "status": "completed",
    "purchasedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

```
{
  "purchase": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": "507f1f77bcf86cd799439011",
    "content": {
      "_id": "507f191e810c19729de860ea",
      "title": "Advanced React Patterns",
      "description": "Learn advanced React patterns and best practices",
      "type": "course",
      "thumbnailUrl": "https://cdn.vaniykempire.com/thumbnails/react-course.jpg"
    },
    "amount": 29.99,
    "stripePaymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "status": "pending",
    "purchasedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

```
{
  "error": "Payment not found"
}
```

```
{
  "error": "Error message details"
}
```

Retrieves the purchase record and status for a specific Stripe payment intent. This endpoint is used to check whether a payment has been completed, is still pending, has failed, or has been refunded.

## [​](https://kunmi.mintlify.app/api/payments/payment-status\#authentication)  Authentication

Requires authentication. Users can only view their own payment status.

## [​](https://kunmi.mintlify.app/api/payments/payment-status\#path-parameters)  Path Parameters

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-payment-intent-id)

paymentIntentId

string

required

The Stripe payment intent ID (starts with `pi_`). This is returned when creating a payment intent or can be obtained from Stripe webhooks.

## [​](https://kunmi.mintlify.app/api/payments/payment-status\#response)  Response

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-purchase)

purchase

object

The purchase record with populated content details

Show purchase properties

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-id)

\_id

string

MongoDB ObjectId of the purchase record

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-user)

user

string

MongoDB ObjectId of the user who made the purchase

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-content)

content

object

Populated content details

Show content properties

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-id-1)

\_id

string

Content MongoDB ObjectId

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-title)

title

string

Content title

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-description)

description

string

Content description

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-type)

type

string

Content type (e.g., “video”, “article”, “course”)

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-thumbnail-url)

thumbnailUrl

string

URL to content thumbnail image

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-amount)

amount

number

Purchase amount in USD

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-stripe-payment-intent-id)

stripePaymentIntentId

string

Stripe payment intent ID

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-status)

status

string

Payment status: `pending`, `completed`, `failed`, or `refunded`

[​](https://kunmi.mintlify.app/api/payments/payment-status#param-purchased-at)

purchasedAt

string

ISO 8601 timestamp of when the purchase record was created

## [​](https://kunmi.mintlify.app/api/payments/payment-status\#purchase-status-values)  Purchase Status Values

| Status | Description |
| --- | --- |
| `pending` | Payment intent created, waiting for payment completion |
| `completed` | Payment successfully processed by Stripe |
| `failed` | Payment failed (card declined, insufficient funds, etc.) |
| `refunded` | Payment was refunded by an administrator |

## [​](https://kunmi.mintlify.app/api/payments/payment-status\#error-codes)  Error Codes

| Status Code | Description |
| --- | --- |
| 200 | Payment status retrieved successfully |
| 401 | Not authenticated |
| 404 | Payment intent not found or doesn’t belong to user |
| 500 | Server error |

## [​](https://kunmi.mintlify.app/api/payments/payment-status\#security)  Security

- Users can only view payment status for their own purchases
- The query filters by both `paymentIntentId` and authenticated `userId`
- Payment intents from other users will return 404

## [​](https://kunmi.mintlify.app/api/payments/payment-status\#use-cases)  Use Cases

- Poll this endpoint after payment to check if webhook processed successfully
- Display payment history to users
- Verify purchase before granting content access
- Show refund status to users

## [​](https://kunmi.mintlify.app/api/payments/payment-status\#related-endpoints)  Related Endpoints

- [Create Payment Intent](https://kunmi.mintlify.app/api/payments/create-payment-intent) \- Start a new payment
- [Webhook](https://kunmi.mintlify.app/api/payments/webhook) \- How payment status gets updated
- [List Payments](https://kunmi.mintlify.app/api/payments/list-payments) \- Admin endpoint to view all payments

## [​](https://kunmi.mintlify.app/api/payments/payment-status\#implementation-notes)  Implementation Notes

- Content is populated with `title`, `description`, `type`, and `thumbnailUrl` fields
- User field is not populated in the response (only the ObjectId is returned)
- Source: `src/controllers/paymentController.js:133-151`