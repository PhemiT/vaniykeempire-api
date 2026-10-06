> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/payments/refund#content-area)

cURL

JavaScript

Python

```
curl -X POST https://api.vaniykempire.com/api/payments/admin/refund/65f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

```
const purchaseId = '65f1a2b3c4d5e6f7g8h9i0j1';

const response = await fetch(
  `/api/payments/admin/refund/${purchaseId}`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  }
);

const { message, purchase } = await response.json();
console.log(message); // "Refund successful"
console.log(purchase.status); // "refunded"
```

```
import requests

purchase_id = '65f1a2b3c4d5e6f7g8h9i0j1'

response = requests.post(
    f'https://api.vaniykempire.com/api/payments/admin/refund/{purchase_id}',
    headers={'Authorization': f'Bearer {admin_token}'}
)

data = response.json()
print(data['message'])  # "Refund successful"
print(data['purchase']['status'])  # "refunded"
```

200 Success

404 Purchase Not Found

400 Not Completed

400 Refund Failed

401 Not Authenticated

403 Forbidden

500 Server Error

```
{
  "message": "Refund successful",
  "purchase": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": "507f1f77bcf86cd799439011",
    "content": "507f191e810c19729de860ea",
    "amount": 29.99,
    "stripePaymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "status": "refunded",
    "purchasedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

```
{
  "error": "Purchase not found"
}
```

```
{
  "error": "Only completed purchases can be refunded"
}
```

```
{
  "error": "Refund failed"
}
```

```
{
  "error": "Not authenticated"
}
```

```
{
  "error": "Admin access required"
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

admin

/

refund

/

:purchaseId

Try it

cURL

JavaScript

Python

```
curl -X POST https://api.vaniykempire.com/api/payments/admin/refund/65f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

```
const purchaseId = '65f1a2b3c4d5e6f7g8h9i0j1';

const response = await fetch(
  `/api/payments/admin/refund/${purchaseId}`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  }
);

const { message, purchase } = await response.json();
console.log(message); // "Refund successful"
console.log(purchase.status); // "refunded"
```

```
import requests

purchase_id = '65f1a2b3c4d5e6f7g8h9i0j1'

response = requests.post(
    f'https://api.vaniykempire.com/api/payments/admin/refund/{purchase_id}',
    headers={'Authorization': f'Bearer {admin_token}'}
)

data = response.json()
print(data['message'])  # "Refund successful"
print(data['purchase']['status'])  # "refunded"
```

200 Success

404 Purchase Not Found

400 Not Completed

400 Refund Failed

401 Not Authenticated

403 Forbidden

500 Server Error

```
{
  "message": "Refund successful",
  "purchase": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": "507f1f77bcf86cd799439011",
    "content": "507f191e810c19729de860ea",
    "amount": 29.99,
    "stripePaymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "status": "refunded",
    "purchasedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

```
{
  "error": "Purchase not found"
}
```

```
{
  "error": "Only completed purchases can be refunded"
}
```

```
{
  "error": "Refund failed"
}
```

```
{
  "error": "Not authenticated"
}
```

```
{
  "error": "Admin access required"
}
```

```
{
  "error": "Error message details"
}
```

Administrator endpoint for issuing refunds on completed purchases. Creates a refund in Stripe and updates the purchase status to `refunded`.

## [​](https://kunmi.mintlify.app/api/payments/refund\#authentication)  Authentication

Requires authentication with administrator privileges.

This endpoint requires admin role. Regular users will receive a 403 Forbidden response.

## [​](https://kunmi.mintlify.app/api/payments/refund\#path-parameters)  Path Parameters

[​](https://kunmi.mintlify.app/api/payments/refund#param-purchase-id)

purchaseId

string

required

The MongoDB ObjectId of the purchase to refund. Must be a completed purchase.

## [​](https://kunmi.mintlify.app/api/payments/refund\#refund-rules)  Refund Rules

- Only purchases with status `completed` can be refunded
- Cannot refund purchases that are `pending`, `failed`, or already `refunded`
- Refund is processed through Stripe’s refund API
- Full amount is refunded (partial refunds not supported)
- Purchase status is updated to `refunded` upon success

## [​](https://kunmi.mintlify.app/api/payments/refund\#response)  Response

[​](https://kunmi.mintlify.app/api/payments/refund#param-message)

message

string

Success message confirming the refund

[​](https://kunmi.mintlify.app/api/payments/refund#param-purchase)

purchase

object

Updated purchase object with `refunded` status

Show purchase properties

[​](https://kunmi.mintlify.app/api/payments/refund#param-id)

\_id

string

MongoDB ObjectId of the purchase

[​](https://kunmi.mintlify.app/api/payments/refund#param-user)

user

string

MongoDB ObjectId of the user (not populated)

[​](https://kunmi.mintlify.app/api/payments/refund#param-content)

content

string

MongoDB ObjectId of the content (not populated)

[​](https://kunmi.mintlify.app/api/payments/refund#param-amount)

amount

number

Purchase amount in USD

[​](https://kunmi.mintlify.app/api/payments/refund#param-stripe-payment-intent-id)

stripePaymentIntentId

string

Stripe payment intent ID

[​](https://kunmi.mintlify.app/api/payments/refund#param-status)

status

string

Will be `refunded` after successful refund

[​](https://kunmi.mintlify.app/api/payments/refund#param-purchased-at)

purchasedAt

string

ISO 8601 timestamp of original purchase

## [​](https://kunmi.mintlify.app/api/payments/refund\#stripe-refund-process)  Stripe Refund Process

1. Endpoint receives refund request with `purchaseId`
2. Server validates purchase exists and has status `completed`
3. Server calls Stripe refund API: `stripe.refunds.create({ payment_intent: stripePaymentIntentId })`
4. Stripe processes full refund to original payment method
5. If Stripe refund succeeds, purchase status updated to `refunded`
6. Refunded amount returns to customer’s card in 5-10 business days

## [​](https://kunmi.mintlify.app/api/payments/refund\#stripe-refund-details)  Stripe Refund Details

- Refund amount: Full payment amount (partial refunds not supported)
- Refund destination: Original payment method
- Refund timeline: 5-10 business days for card refunds
- Stripe fees: Stripe fees are not returned for refunds
- Refund status: Must be `succeeded` for purchase to be marked as refunded

## [​](https://kunmi.mintlify.app/api/payments/refund\#error-scenarios)  Error Scenarios

| Scenario | Status Code | Error Message |
| --- | --- | --- |
| Purchase not found | 404 | ”Purchase not found” |
| Purchase is pending | 400 | ”Only completed purchases can be refunded” |
| Purchase is failed | 400 | ”Only completed purchases can be refunded” |
| Already refunded | 400 | ”Only completed purchases can be refunded” |
| Stripe refund fails | 400 | ”Refund failed” |
| Not authenticated | 401 | ”Not authenticated” |
| Not admin | 403 | ”Admin access required” |
| Server error | 500 | Error message details |

## [​](https://kunmi.mintlify.app/api/payments/refund\#refund-limitations)  Refund Limitations

- Stripe charges are not refunded
- Only full refunds are supported (no partial refunds)
- Refunds cannot be reversed once processed
- Some payment methods may take longer than 10 business days

## [​](https://kunmi.mintlify.app/api/payments/refund\#best-practices)  Best Practices

1. **Verify purchase details** before refunding
2. **Document refund reason** in admin logs or external system
3. **Notify the customer** about the refund via email
4. **Check Stripe Dashboard** to confirm refund processed
5. **Consider partial refunds** for specific use cases (requires code modification)

## [​](https://kunmi.mintlify.app/api/payments/refund\#use-cases)  Use Cases

- Customer requests refund for purchased content
- Content was incorrectly charged
- Quality issues with content
- Duplicate purchase by user
- Accidental purchase
- Customer service resolution

## [​](https://kunmi.mintlify.app/api/payments/refund\#notifications)  Notifications

This endpoint does NOT automatically notify users. Implement email notifications separately to inform customers about refunds.

## [​](https://kunmi.mintlify.app/api/payments/refund\#idempotency)  Idempotency

Calling this endpoint multiple times on the same purchase:

1. First call: Creates refund, updates status to `refunded`, returns success
2. Subsequent calls: Returns 400 error “Only completed purchases can be refunded”

This prevents accidental double refunds.

## [​](https://kunmi.mintlify.app/api/payments/refund\#stripe-dashboard)  Stripe Dashboard

After issuing a refund:

1. Go to Stripe Dashboard → Payments
2. Search for payment intent ID
3. View refund details and status
4. Monitor refund completion

## [​](https://kunmi.mintlify.app/api/payments/refund\#related-endpoints)  Related Endpoints

- [List All Payments](https://kunmi.mintlify.app/api/payments/list-payments) \- Find purchases to refund
- [Get Payment Status](https://kunmi.mintlify.app/api/payments/payment-status) \- Verify purchase status
- [Create Payment Intent](https://kunmi.mintlify.app/api/payments/create-payment-intent) \- How purchases are created

## [​](https://kunmi.mintlify.app/api/payments/refund\#implementation-notes)  Implementation Notes

- Requires `authenticate` and `requireAdmin` middleware
- Full refund only (entire payment intent amount)
- User and content fields are not populated in response
- Refund is synchronous (waits for Stripe response)
- Stripe refund status must be `succeeded` for purchase update
- Source: `src/controllers/paymentController.js:182-217`

## [​](https://kunmi.mintlify.app/api/payments/refund\#testing)  Testing

### [​](https://kunmi.mintlify.app/api/payments/refund\#test-mode)  Test Mode

Use Stripe test mode to test refunds without real money:

```
// Use test API keys
const stripe = require('stripe')('sk_test_...');

// Create test payment
// Issue refund using test purchase ID
// Verify refund in Stripe test dashboard
```

### [​](https://kunmi.mintlify.app/api/payments/refund\#test-cards)  Test Cards

Stripe provides test cards that simulate different refund scenarios:

- `4242 4242 4242 4242` \- Successful refunds
- `4000 0000 0000 0259` \- Successful charges with dispute risk

## [​](https://kunmi.mintlify.app/api/payments/refund\#monitoring)  Monitoring

Track refund metrics:

- Total refunds per month
- Refund rate (refunds / total purchases)
- Average refund amount
- Common refund reasons (requires manual tracking)
- Refund processing time