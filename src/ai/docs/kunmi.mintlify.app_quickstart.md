> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/quickstart#content-area)

## [​](https://kunmi.mintlify.app/quickstart\#prerequisites)  Prerequisites

Before you begin, make sure you have:

- A code editor or API client (we’ll use cURL in examples)
- The API base URL: `https://api.vaniykempire.com`
- Basic understanding of REST APIs and HTTP requests

This guide walks through the complete user journey: signup, authentication, browsing content, making a purchase, and accessing purchased content.

## [​](https://kunmi.mintlify.app/quickstart\#step-1-create-an-account)  Step 1: Create an Account

First, create a user account by calling the signup endpoint:

cURL

JavaScript (Fetch)

Python (Requests)

```
curl -X POST https://api.vaniykempire.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

```
const response = await fetch('https://api.vaniykempire.com/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    name: 'John Doe'
  })
});

const data = await response.json();
console.log(data);
```

```
import requests

response = requests.post(
    'https://api.vaniykempire.com/api/auth/signup',
    json={
        'email': 'user@example.com',
        'password': 'SecurePassword123!',
        'name': 'John Doe'
    }
)

data = response.json()
print(data)
```

### [​](https://kunmi.mintlify.app/quickstart\#response)  Response

```
{
  "message": "User created successfully",
  "user": {
    "id": "65f7b3c8e1234567890abcde",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "v1.Mr0hBPHxxx...",
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "email": "user@example.com"
    }
  }
}
```

Save the `access_token` from the response. You’ll need it for authenticated requests. The token expires in 3600 seconds (1 hour).

## [​](https://kunmi.mintlify.app/quickstart\#step-2-browse-available-content)  Step 2: Browse Available Content

Browse the content catalog without authentication:

cURL

JavaScript

Python

```
curl https://api.vaniykempire.com/api/content?page=1&limit=10
```

```
const response = await fetch('https://api.vaniykempire.com/api/content?page=1&limit=10');
const data = await response.json();
console.log(data.content);
```

```
import requests

response = requests.get(
    'https://api.vaniykempire.com/api/content',
    params={'page': 1, 'limit': 10}
)

data = response.json()
print(data['content'])
```

### [​](https://kunmi.mintlify.app/quickstart\#response-2)  Response

```
{
  "content": [\
    {\
      "_id": "65f7b3c8e1234567890abcdf",\
      "title": "Advanced React Patterns",\
      "description": "Master advanced React patterns and best practices",\
      "type": "video",\
      "category": "65f7b3c8e1234567890abcd0",\
      "price": 29.99,\
      "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/thumbnail.jpg",\
      "duration": 3600,\
      "status": "published",\
      "createdAt": "2024-03-15T10:30:00.000Z"\
    }\
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalContent": 48
}
```

Note that the file URL is not included in the public listing. You must purchase content to access the actual files.

## [​](https://kunmi.mintlify.app/quickstart\#step-3-get-content-details)  Step 3: Get Content Details

View detailed information about specific content:

```
curl https://api.vaniykempire.com/api/content/65f7b3c8e1234567890abcdf
```

### [​](https://kunmi.mintlify.app/quickstart\#response-3)  Response

```
{
  "content": {
    "_id": "65f7b3c8e1234567890abcdf",
    "title": "Advanced React Patterns",
    "description": "Master advanced React patterns including compound components, render props, custom hooks, and state management strategies. This comprehensive course covers everything you need to build scalable React applications.",
    "type": "video",
    "category": {
      "_id": "65f7b3c8e1234567890abcd0",
      "name": "Web Development"
    },
    "price": 29.99,
    "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/thumbnail.jpg",
    "duration": 3600,
    "fileSize": 1048576000,
    "tags": ["react", "javascript", "frontend", "advanced"],
    "status": "published",
    "createdBy": {
      "_id": "65f7b3c8e1234567890abcd1",
      "name": "Sarah Johnson"
    },
    "createdAt": "2024-03-15T10:30:00.000Z"
  }
}
```

## [​](https://kunmi.mintlify.app/quickstart\#step-4-create-a-payment-intent)  Step 4: Create a Payment Intent

To purchase content, create a payment intent with Stripe:

cURL

JavaScript

Python

```
curl -X POST https://api.vaniykempire.com/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "contentId": "65f7b3c8e1234567890abcdf"
  }'
```

```
const response = await fetch(
  'https://api.vaniykempire.com/api/payments/create-payment-intent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
    body: JSON.stringify({
      contentId: '65f7b3c8e1234567890abcdf'
    })
  }
);

const { clientSecret, amount } = await response.json();
```

```
import requests

response = requests.post(
    'https://api.vaniykempire.com/api/payments/create-payment-intent',
    headers={
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
    json={'contentId': '65f7b3c8e1234567890abcdf'}
)

data = response.json()
client_secret = data['clientSecret']
```

### [​](https://kunmi.mintlify.app/quickstart\#response-4)  Response

```
{
  "clientSecret": "pi_3MtwBwLkdIwHu7ix28a3tqPa_secret_YrKJUKribcBjcG8HVhfZluoGH",
  "amount": 29.99
}
```

1

Backend Creates Payment Intent

The API creates a Stripe payment intent and a pending purchase record in MongoDB.

2

Frontend Processes Payment

Use the `clientSecret` with Stripe.js or Stripe SDK to complete the payment on your frontend.

3

Webhook Confirms Payment

When payment succeeds, Stripe sends a webhook to `/api/payments/webhook`, which updates the purchase status to `completed`.

The API automatically checks for duplicate purchases. If a user already owns the content, the request will be rejected with a 400 error.

## [​](https://kunmi.mintlify.app/quickstart\#step-5-check-payment-status)  Step 5: Check Payment Status

Verify the payment status using the payment intent ID:

```
curl https://api.vaniykempire.com/api/payments/status/pi_3MtwBwLkdIwHu7ix28a3tqPa \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### [​](https://kunmi.mintlify.app/quickstart\#response-5)  Response

```
{
  "purchase": {
    "_id": "65f7b3c8e1234567890abce0",
    "user": "65f7b3c8e1234567890abcde",
    "content": {
      "_id": "65f7b3c8e1234567890abcdf",
      "title": "Advanced React Patterns",
      "description": "Master advanced React patterns and best practices",
      "type": "video",
      "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/thumbnail.jpg"
    },
    "amount": 29.99,
    "status": "completed",
    "stripePaymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "purchasedAt": "2024-03-15T14:22:30.000Z"
  }
}
```

## [​](https://kunmi.mintlify.app/quickstart\#step-6-access-purchased-content)  Step 6: Access Purchased Content

Once payment is confirmed, access the content file URL:

cURL

JavaScript

Python

```
curl https://api.vaniykempire.com/api/content/65f7b3c8e1234567890abcdf/access \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```
const response = await fetch(
  'https://api.vaniykempire.com/api/content/65f7b3c8e1234567890abcdf/access',
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }
);

const { content } = await response.json();
const videoUrl = content.fileUrl;
```

```
import requests

response = requests.get(
    'https://api.vaniykempire.com/api/content/65f7b3c8e1234567890abcdf/access',
    headers={
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
)

content = response.json()['content']
file_url = content['fileUrl']
```

### [​](https://kunmi.mintlify.app/quickstart\#response-6)  Response

```
{
  "content": {
    "_id": "65f7b3c8e1234567890abcdf",
    "title": "Advanced React Patterns",
    "description": "Master advanced React patterns and best practices",
    "type": "video",
    "category": "65f7b3c8e1234567890abcd0",
    "price": 29.99,
    "fileUrl": "https://res.cloudinary.com/demo/video/upload/v1234567890/react-patterns.mp4",
    "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/thumbnail.jpg",
    "duration": 3600,
    "fileSize": 1048576000,
    "tags": ["react", "javascript", "frontend", "advanced"],
    "createdBy": {
      "_id": "65f7b3c8e1234567890abcd1",
      "name": "Sarah Johnson"
    }
  }
}
```

The `/access` endpoint verifies that the authenticated user has purchased the content. Attempting to access content without purchasing it will result in a 403 Forbidden error.

## [​](https://kunmi.mintlify.app/quickstart\#step-7-view-your-purchases)  Step 7: View Your Purchases

Get a list of all content you’ve purchased:

```
curl https://api.vaniykempire.com/api/content/user/purchases?page=1&limit=10 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### [​](https://kunmi.mintlify.app/quickstart\#response-7)  Response

```
{
  "purchases": [\
    {\
      "_id": "65f7b3c8e1234567890abce0",\
      "content": {\
        "_id": "65f7b3c8e1234567890abcdf",\
        "title": "Advanced React Patterns",\
        "description": "Master advanced React patterns and best practices",\
        "type": "video",\
        "category": "65f7b3c8e1234567890abcd0",\
        "price": 29.99,\
        "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/thumbnail.jpg"\
      },\
      "amount": 29.99,\
      "status": "completed",\
      "purchasedAt": "2024-03-15T14:22:30.000Z"\
    }\
  ],
  "totalPages": 1,
  "currentPage": 1,
  "totalPurchases": 1
}
```

## [​](https://kunmi.mintlify.app/quickstart\#next-steps)  Next Steps

[**Authentication Deep Dive** \\
\\
Learn about token management, refresh tokens, and session handling](https://kunmi.mintlify.app/authentication)

[**API Reference** \\
\\
Explore all available endpoints and parameters](https://kunmi.mintlify.app/api/auth/signup)

[**Content API** \\
\\
Browse and manage digital content](https://kunmi.mintlify.app/api/content/list-content)

[**Webhooks** \\
\\
Set up Stripe webhooks for production](https://kunmi.mintlify.app/guides/webhooks)

## [​](https://kunmi.mintlify.app/quickstart\#common-issues)  Common Issues

401 Unauthorized - Invalid token

This error occurs when your access token has expired or is invalid. Login again to get a fresh token:

```
curl -X POST https://api.vaniykempire.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePassword123!"}'
```

403 Forbidden - Content not purchased

You’re trying to access content you haven’t purchased. Complete the purchase flow (Steps 4-5) before accessing the content.

400 Bad Request - Already purchased

You’ve already purchased this content. You can access it directly via the `/access` endpoint without creating a new payment intent.

404 Not Found - Content not found

The content ID doesn’t exist or the content is not published. Use the `/api/content` endpoint to get a list of available content.

## [​](https://kunmi.mintlify.app/quickstart\#example-complete-flow-in-javascript)  Example: Complete Flow in JavaScript

Here’s a complete example that ties everything together:

```
const API_BASE = 'https://api.vaniykempire.com';
let accessToken = null;

// 1. Sign up
async function signup(email, password, name) {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  const data = await response.json();
  accessToken = data.session.access_token;
  return data;
}

// 2. Browse content
async function listContent() {
  const response = await fetch(`${API_BASE}/api/content?page=1&limit=10`);
  return await response.json();
}

// 3. Purchase content
async function purchaseContent(contentId) {
  const response = await fetch(`${API_BASE}/api/payments/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ contentId })
  });
  return await response.json();
}

// 4. Access purchased content
async function accessContent(contentId) {
  const response = await fetch(`${API_BASE}/api/content/${contentId}/access`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return await response.json();
}

// Usage
(async () => {
  try {
    // Create account
    await signup('user@example.com', 'SecurePass123!', 'John Doe');

    // Browse content
    const { content } = await listContent();
    const contentId = content[0]._id;

    // Purchase (then complete payment with Stripe on frontend)
    const { clientSecret } = await purchaseContent(contentId);
    // ... process payment with Stripe ...

    // Access purchased content
    const { content: purchasedContent } = await accessContent(contentId);
    console.log('File URL:', purchasedContent.fileUrl);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

This example shows the backend flow. In production, you’ll need to integrate Stripe.js on your frontend to securely collect payment information and confirm the payment intent.