> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/payments/list-payments#content-area)

cURL - All Payments

cURL - Filter by Status

JavaScript

Python

```
curl -X GET "https://api.vaniykempire.com/api/payments/admin/all?page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

```
curl -X GET "https://api.vaniykempire.com/api/payments/admin/all?status=completed&page=1&limit=50" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

```
// Fetch all completed payments
const response = await fetch(
  '/api/payments/admin/all?status=completed&page=1&limit=50',
  {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  }
);

const { purchases, totalPages, currentPage, totalPurchases } = await response.json();

console.log(`Showing page ${currentPage} of ${totalPages}`);
console.log(`Total purchases: ${totalPurchases}`);
```

```
import requests

response = requests.get(
    'https://api.vaniykempire.com/api/payments/admin/all',
    headers={'Authorization': f'Bearer {admin_token}'},
    params={
        'status': 'completed',
        'page': 1,
        'limit': 50
    }
)

data = response.json()
for purchase in data['purchases']:
    print(f"{purchase['user']['email']} - {purchase['content']['title']} - ${purchase['amount']}")
```

200 Success

200 Success - Empty Results

401 Not Authenticated

403 Forbidden

500 Server Error

```
{
  "purchases": [\
    {\
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",\
      "user": {\
        "_id": "507f1f77bcf86cd799439011",\
        "name": "John Doe",\
        "email": "john.doe@example.com"\
      },\
      "content": {\
        "_id": "507f191e810c19729de860ea",\
        "title": "Advanced React Patterns",\
        "type": "course"\
      },\
      "amount": 29.99,\
      "stripePaymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",\
      "status": "completed",\
      "purchasedAt": "2024-03-15T10:30:00.000Z"\
    },\
    {\
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",\
      "user": {\
        "_id": "507f1f77bcf86cd799439012",\
        "name": "Jane Smith",\
        "email": "jane.smith@example.com"\
      },\
      "content": {\
        "_id": "507f191e810c19729de860eb",\
        "title": "Node.js Masterclass",\
        "type": "course"\
      },\
      "amount": 39.99,\
      "stripePaymentIntentId": "pi_3MtwCxLkdIwHu7ix29b4urQb",\
      "status": "completed",\
      "purchasedAt": "2024-03-15T09:15:00.000Z"\
    }\
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalPurchases": 87
}
```

```
{
  "purchases": [],
  "totalPages": 0,
  "currentPage": 1,
  "totalPurchases": 0
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

GET

/

api

/

payments

/

admin

/

all

Try it

cURL - All Payments

cURL - Filter by Status

JavaScript

Python

```
curl -X GET "https://api.vaniykempire.com/api/payments/admin/all?page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

```
curl -X GET "https://api.vaniykempire.com/api/payments/admin/all?status=completed&page=1&limit=50" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

```
// Fetch all completed payments
const response = await fetch(
  '/api/payments/admin/all?status=completed&page=1&limit=50',
  {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  }
);

const { purchases, totalPages, currentPage, totalPurchases } = await response.json();

console.log(`Showing page ${currentPage} of ${totalPages}`);
console.log(`Total purchases: ${totalPurchases}`);
```

```
import requests

response = requests.get(
    'https://api.vaniykempire.com/api/payments/admin/all',
    headers={'Authorization': f'Bearer {admin_token}'},
    params={
        'status': 'completed',
        'page': 1,
        'limit': 50
    }
)

data = response.json()
for purchase in data['purchases']:
    print(f"{purchase['user']['email']} - {purchase['content']['title']} - ${purchase['amount']}")
```

200 Success

200 Success - Empty Results

401 Not Authenticated

403 Forbidden

500 Server Error

```
{
  "purchases": [\
    {\
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",\
      "user": {\
        "_id": "507f1f77bcf86cd799439011",\
        "name": "John Doe",\
        "email": "john.doe@example.com"\
      },\
      "content": {\
        "_id": "507f191e810c19729de860ea",\
        "title": "Advanced React Patterns",\
        "type": "course"\
      },\
      "amount": 29.99,\
      "stripePaymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",\
      "status": "completed",\
      "purchasedAt": "2024-03-15T10:30:00.000Z"\
    },\
    {\
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",\
      "user": {\
        "_id": "507f1f77bcf86cd799439012",\
        "name": "Jane Smith",\
        "email": "jane.smith@example.com"\
      },\
      "content": {\
        "_id": "507f191e810c19729de860eb",\
        "title": "Node.js Masterclass",\
        "type": "course"\
      },\
      "amount": 39.99,\
      "stripePaymentIntentId": "pi_3MtwCxLkdIwHu7ix29b4urQb",\
      "status": "completed",\
      "purchasedAt": "2024-03-15T09:15:00.000Z"\
    }\
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalPurchases": 87
}
```

```
{
  "purchases": [],
  "totalPages": 0,
  "currentPage": 1,
  "totalPurchases": 0
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

Administrator endpoint for viewing all payment transactions across the platform. Supports pagination and filtering by payment status.

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#authentication)  Authentication

Requires authentication with administrator privileges. Include JWT token in Authorization header.

This endpoint requires admin role. Regular users will receive a 403 Forbidden response.

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#query-parameters)  Query Parameters

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-page)

page

number

default:"1"

Page number for pagination (1-based)

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-limit)

limit

number

default:"20"

Number of purchases per page (max: 100)

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-status)

status

string

Filter by payment status. Options:

- `pending` \- Payment intent created but not completed
- `completed` \- Successfully processed payment
- `failed` \- Payment failed
- `refunded` \- Payment refunded by admin

Omit to show all statuses.

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#response)  Response

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-purchases)

purchases

array

Array of purchase objects with populated user and content details

Show Purchase object properties

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-id)

\_id

string

MongoDB ObjectId of the purchase record

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-user)

user

object

Populated user details (limited fields)

Show user properties

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-id-1)

\_id

string

User MongoDB ObjectId

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-name)

name

string

User’s full name

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-email)

email

string

User’s email address

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-content)

content

object

Populated content details (limited fields)

Show content properties

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-id-2)

\_id

string

Content MongoDB ObjectId

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-title)

title

string

Content title

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-type)

type

string

Content type (e.g., “video”, “article”, “course”)

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-amount)

amount

number

Purchase amount in USD

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-stripe-payment-intent-id)

stripePaymentIntentId

string

Stripe payment intent ID

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-status-1)

status

string

Payment status: `pending`, `completed`, `failed`, or `refunded`

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-purchased-at)

purchasedAt

string

ISO 8601 timestamp of when the purchase record was created

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-total-pages)

totalPages

number

Total number of pages available

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-current-page)

currentPage

number

Current page number

[​](https://kunmi.mintlify.app/api/payments/list-payments#param-total-purchases)

totalPurchases

number

Total count of purchases matching the filter

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#sorting)  Sorting

Results are automatically sorted by `purchasedAt` in descending order (newest first).

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#status-filter-examples)  Status Filter Examples

| Query | Description |
| --- | --- |
| `?status=completed` | Only successful payments |
| `?status=pending` | Payments awaiting completion |
| `?status=failed` | Failed payment attempts |
| `?status=refunded` | Refunded transactions |
| No status parameter | All payments regardless of status |

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#pagination-example)  Pagination Example

To iterate through all pages:

```
let page = 1;
let hasMore = true;

while (hasMore) {
  const response = await fetch(
    `/api/payments/admin/all?page=${page}&limit=20`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  const data = await response.json();

  // Process purchases
  data.purchases.forEach(purchase => {
    console.log(purchase);
  });

  // Check if there are more pages
  hasMore = page < data.totalPages;
  page++;
}
```

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#use-cases)  Use Cases

- Generate financial reports
- Monitor payment success rates
- Identify failed payments requiring follow-up
- Track refunded transactions
- Export payment data for accounting
- Customer support investigation

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#performance-considerations)  Performance Considerations

- Default limit of 20 items balances performance and usability
- Consider implementing cursor-based pagination for very large datasets
- Populating user and content adds database queries; consider caching for frequent access
- Add indexes on `status` and `purchasedAt` fields for faster filtering and sorting

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#related-endpoints)  Related Endpoints

- [Get Payment Status](https://kunmi.mintlify.app/api/payments/payment-status) \- View single payment details
- [Refund Payment](https://kunmi.mintlify.app/api/payments/refund) \- Process refunds for completed payments
- [Create Payment Intent](https://kunmi.mintlify.app/api/payments/create-payment-intent) \- How payments are created

## [​](https://kunmi.mintlify.app/api/payments/list-payments\#implementation-notes)  Implementation Notes

- Requires `authenticate` and `requireAdmin` middleware
- User is populated with `name` and `email` fields only
- Content is populated with `title` and `type` fields only
- Results are sorted by `purchasedAt` descending (newest first)
- Query parameters are coerced to numbers where needed
- Source: `src/controllers/paymentController.js:154-179`