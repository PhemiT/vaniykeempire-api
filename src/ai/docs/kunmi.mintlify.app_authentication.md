> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/authentication#content-area)

## [​](https://kunmi.mintlify.app/authentication\#overview)  Overview

The Vaniyk Empire API uses **Supabase Auth** for authentication, which provides secure JWT (JSON Web Token) based authentication. All protected endpoints require a valid access token in the `Authorization` header.

The API uses a dual-database architecture: Supabase manages authentication and sessions, while MongoDB stores user profiles and application data.

## [​](https://kunmi.mintlify.app/authentication\#authentication-flow)  Authentication Flow

1

User Signs Up or Logs In

The user provides credentials (email and password) to either `/api/auth/signup` or `/api/auth/login`.

2

Supabase Creates Session

Supabase Auth validates credentials and generates a session with an `access_token` and `refresh_token`.

3

API Creates User Record

For signups, the API creates a corresponding user record in MongoDB linked to the Supabase user ID.

4

Client Stores Tokens

The client application stores the access token (and optionally the refresh token) securely.

5

Client Includes Token in Requests

The client includes the access token in the `Authorization` header for all authenticated requests.

6

API Validates Token

The authentication middleware validates the token with Supabase and attaches user data to the request.

## [​](https://kunmi.mintlify.app/authentication\#creating-an-account)  Creating an Account

### [​](https://kunmi.mintlify.app/authentication\#signup-endpoint)  Signup Endpoint

```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

cURL

JavaScript

Python

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
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    name: 'John Doe'
  })
});

const data = await response.json();
const accessToken = data.session.access_token;
const refreshToken = data.session.refresh_token;

// Store tokens securely (e.g., in localStorage or secure cookie)
localStorage.setItem('access_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);
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
access_token = data['session']['access_token']
refresh_token = data['session']['refresh_token']
```

### [​](https://kunmi.mintlify.app/authentication\#response)  Response

```
{
  "message": "User created successfully",
  "user": {
    "id": "65f7b3c8e1234567890abcde",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzEwNTEyNDAwLCJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6e30sInVzZXJfbWV0YWRhdGEiOnt9LCJyb2xlIjoiYXV0aGVudGljYXRlZCJ9.abcdefghijklmnopqrstuvwxyz123456789",
    "token_type": "bearer",
    "expires_in": 3600,
    "expires_at": 1710512400,
    "refresh_token": "v1.Mr0hBPHnhKMpTjEXWKgBp2g3zXpLqr5u",
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "aud": "authenticated",
      "email": "user@example.com",
      "email_confirmed_at": "2024-03-15T14:00:00.000Z",
      "created_at": "2024-03-15T14:00:00.000Z"
    }
  }
}
```

The `access_token` expires in 3600 seconds (1 hour). Use the `refresh_token` to obtain a new access token when it expires.

### [​](https://kunmi.mintlify.app/authentication\#password-requirements)  Password Requirements

Supabase enforces the following password requirements by default:

- Minimum length: 6 characters
- We recommend using at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols

## [​](https://kunmi.mintlify.app/authentication\#logging-in)  Logging In

### [​](https://kunmi.mintlify.app/authentication\#login-endpoint)  Login Endpoint

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

cURL

JavaScript

Python

```
curl -X POST https://api.vaniykempire.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

```
const response = await fetch('https://api.vaniykempire.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});

const data = await response.json();
localStorage.setItem('access_token', data.session.access_token);
localStorage.setItem('refresh_token', data.session.refresh_token);
```

```
import requests

response = requests.post(
    'https://api.vaniykempire.com/api/auth/login',
    json={
        'email': 'user@example.com',
        'password': 'SecurePassword123!'
    }
)

data = response.json()
access_token = data['session']['access_token']
```

### [​](https://kunmi.mintlify.app/authentication\#response-2)  Response

```
{
  "message": "Login successful",
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

## [​](https://kunmi.mintlify.app/authentication\#making-authenticated-requests)  Making Authenticated Requests

Include the access token in the `Authorization` header using the Bearer scheme:

```
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

cURL

JavaScript

Python

```
curl https://api.vaniykempire.com/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```
const accessToken = localStorage.getItem('access_token');

const response = await fetch('https://api.vaniykempire.com/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();
```

```
import requests

headers = {
    'Authorization': f'Bearer {access_token}'
}

response = requests.get(
    'https://api.vaniykempire.com/api/auth/profile',
    headers=headers
)

data = response.json()
```

### [​](https://kunmi.mintlify.app/authentication\#authentication-middleware-implementation)  Authentication Middleware Implementation

Here’s how the API validates tokens (from `src/middleware/auth.js:4-31`):

```
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Validate token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get full user data from MongoDB including role
    const mongoUser = await User.findOne({ supabaseId: user.id });

    if (!mongoUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach user data to request
    req.user = user;        // Supabase user object
    req.mongoUser = mongoUser;  // MongoDB user object with role
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
```

The middleware attaches both `req.user` (Supabase user) and `req.mongoUser` (MongoDB user with role) to authenticated requests.

## [​](https://kunmi.mintlify.app/authentication\#token-expiration-and-refresh)  Token Expiration and Refresh

Access tokens expire after 1 hour (3600 seconds). When a token expires, you’ll receive a 401 Unauthorized response:

```
{
  "error": "Invalid token"
}
```

### [​](https://kunmi.mintlify.app/authentication\#refreshing-tokens)  Refreshing Tokens

To refresh an expired access token, you need to use Supabase’s client library directly:

JavaScript (Supabase JS)

Python (Supabase Py)

```
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// Refresh the session
const { data, error } = await supabase.auth.refreshSession({
  refresh_token: localStorage.getItem('refresh_token')
})

if (data.session) {
  const newAccessToken = data.session.access_token
  const newRefreshToken = data.session.refresh_token

  localStorage.setItem('access_token', newAccessToken)
  localStorage.setItem('refresh_token', newRefreshToken)
}
```

```
from supabase import create_client, Client

supabase: Client = create_client(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
)

# Refresh the session
data = supabase.auth.refresh_session(refresh_token)

if data.session:
    new_access_token = data.session.access_token
    new_refresh_token = data.session.refresh_token
```

The Vaniyk Empire API does not currently expose a refresh endpoint. You must use the Supabase client library to refresh tokens, or implement a custom refresh endpoint.

### [​](https://kunmi.mintlify.app/authentication\#automatic-token-refresh)  Automatic Token Refresh

Implement automatic token refresh to provide a seamless user experience:

```
class APIClient {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.baseUrl = 'https://api.vaniykempire.com';
  }

  async request(endpoint, options = {}) {
    // Get current session
    const { data: { session }, error } = await this.supabase.auth.getSession();

    if (error || !session) {
      throw new Error('Not authenticated');
    }

    // Make request with current token
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    // If token expired, refresh and retry
    if (response.status === 401) {
      const { data: refreshData } = await this.supabase.auth.refreshSession();

      if (refreshData.session) {
        // Retry request with new token
        return fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${refreshData.session.access_token}`
          }
        });
      }
    }

    return response;
  }
}

// Usage
const client = new APIClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

const response = await client.request('/api/auth/profile');
const data = await response.json();
```

## [​](https://kunmi.mintlify.app/authentication\#admin-authentication)  Admin Authentication

The API supports admin users with elevated privileges for content management.

### [​](https://kunmi.mintlify.app/authentication\#admin-signup)  Admin Signup

Create an admin account using a secret key:

```
POST /api/auth/signup/admin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "name": "Admin User",
  "adminSecret": "your-admin-secret-key"
}
```

cURL

JavaScript

```
curl -X POST https://api.vaniykempire.com/api/auth/signup/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123!",
    "name": "Admin User",
    "adminSecret": "your-admin-secret-key"
  }'
```

```
const response = await fetch('https://api.vaniykempire.com/api/auth/signup/admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'AdminPass123!',
    name: 'Admin User',
    adminSecret: process.env.ADMIN_SECRET_KEY
  })
});
```

The `adminSecret` must match the `ADMIN_SECRET_KEY` environment variable configured on the server. Never expose this secret in client-side code.

### [​](https://kunmi.mintlify.app/authentication\#admin-login)  Admin Login

Admins can use a dedicated login endpoint that verifies admin role:

```
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

The response includes the user’s role:

```
{
  "message": "Admin login successful",
  "user": {
    "id": "65f7b3c8e1234567890abce1",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### [​](https://kunmi.mintlify.app/authentication\#admin-middleware)  Admin Middleware

Admin-only endpoints use the `requireAdmin` middleware (from `src/middleware/auth.js:33-49`):

```
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.mongoUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.mongoUser.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
```

Admin endpoints require both `authenticate` and `requireAdmin` middleware:

```
// Example: Create content (admin only)
router.post('/',
  authenticate,    // Validates JWT token
  requireAdmin,    // Checks user.role === 'admin'
  contentController.createContent
);
```

## [​](https://kunmi.mintlify.app/authentication\#user-profile)  User Profile

Retrieve the authenticated user’s profile:

```
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### [​](https://kunmi.mintlify.app/authentication\#response-3)  Response

```
{
  "user": {
    "_id": "65f7b3c8e1234567890abcde",
    "supabaseId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "emailVerified": true,
    "createdAt": "2024-03-15T14:00:00.000Z",
    "updatedAt": "2024-03-15T14:00:00.000Z"
  }
}
```

## [​](https://kunmi.mintlify.app/authentication\#password-reset)  Password Reset

The API supports password reset via email:

### [​](https://kunmi.mintlify.app/authentication\#request-password-reset)  Request Password Reset

```
POST /api/auth/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

cURL

JavaScript

```
curl -X POST https://api.vaniykempire.com/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

```
const response = await fetch(
  'https://api.vaniykempire.com/api/auth/password-reset/request',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com' })
  }
);
```

### [​](https://kunmi.mintlify.app/authentication\#response-4)  Response

```
{
  "message": "Password reset email sent"
}
```

The implementation (from `src/controllers/authController.js:83-98`):

```
const { email } = req.body;

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.FRONTEND_URL}/reset-password`
});

if (error) {
  return res.status(400).json({ error: error.message });
}

res.json({ message: 'Password reset email sent' });
```

Supabase sends a password reset email with a secure token. The user clicks the link, which redirects to your frontend with the token, and your frontend then calls the update password endpoint.

### [​](https://kunmi.mintlify.app/authentication\#update-password)  Update Password

After receiving the reset token, update the password:

```
POST /api/auth/password-reset/update
Content-Type: application/json

{
  "password": "NewSecurePassword123!"
}
```

This endpoint requires the user to be authenticated with the reset token from the email. The Supabase client library handles this automatically when the user follows the reset link.

## [​](https://kunmi.mintlify.app/authentication\#email-verification)  Email Verification

### [​](https://kunmi.mintlify.app/authentication\#resend-verification-email)  Resend Verification Email

```
POST /api/auth/email/resend
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### [​](https://kunmi.mintlify.app/authentication\#verify-email)  Verify Email

After the user clicks the verification link in their email:

```
POST /api/auth/email/verify
Content-Type: application/json

{
  "token_hash": "abc123...",
  "type": "email"
}
```

## [​](https://kunmi.mintlify.app/authentication\#security-best-practices)  Security Best Practices

## Store Tokens Securely

Never store tokens in localStorage for sensitive applications. Use secure, httpOnly cookies or sessionStorage instead.

## Use HTTPS

Always use HTTPS in production to prevent token interception. The API rejects HTTP requests.

## Implement Token Refresh

Automatically refresh tokens before they expire to provide seamless user experience.

## Handle 401 Errors

Implement proper error handling for authentication failures and redirect users to login.

## [​](https://kunmi.mintlify.app/authentication\#common-authentication-errors)  Common Authentication Errors

401 - No token provided

The request is missing the `Authorization` header. Include the header with format:

```
Authorization: Bearer <access_token>
```

401 - Invalid token

The token has expired or is malformed. Login again or refresh the token using Supabase client.

403 - Access denied. Admin privileges required

The endpoint requires admin role but the authenticated user is a regular user. Only admins can access content management endpoints.

404 - User not found

The Supabase user exists but there’s no corresponding MongoDB user record. This shouldn’t happen in normal operation - contact support if you encounter this error.

## [​](https://kunmi.mintlify.app/authentication\#complete-authentication-example)  Complete Authentication Example

Here’s a complete authentication implementation with automatic token refresh:

```
import { createClient } from '@supabase/supabase-js'

class VaniykAPIClient {
  constructor(apiBaseUrl, supabaseUrl, supabaseKey) {
    this.apiBaseUrl = apiBaseUrl;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Sign up new user
  async signup(email, password, name) {
    const response = await fetch(`${this.apiBaseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return await response.json();
  }

  // Login existing user
  async login(email, password) {
    const response = await fetch(`${this.apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await response.json();
  }

  // Make authenticated request with automatic token refresh
  async authenticatedRequest(endpoint, options = {}) {
    const { data: { session }, error } = await this.supabase.auth.getSession();

    if (error || !session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    // Auto-refresh on 401
    if (response.status === 401) {
      const { data: refreshData } = await this.supabase.auth.refreshSession();

      if (refreshData.session) {
        return fetch(`${this.apiBaseUrl}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${refreshData.session.access_token}`
          }
        });
      }
    }

    return response;
  }

  // Get current user profile
  async getProfile() {
    const response = await this.authenticatedRequest('/api/auth/profile');
    return await response.json();
  }

  // Logout
  async logout() {
    await this.supabase.auth.signOut();
  }
}

// Usage
const client = new VaniykAPIClient(
  'https://api.vaniykempire.com',
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Sign up
await client.signup('user@example.com', 'SecurePass123!', 'John Doe');

// Login
await client.login('user@example.com', 'SecurePass123!');

// Make authenticated requests
const profile = await client.getProfile();
console.log(profile);

// Logout
await client.logout();
```

## [​](https://kunmi.mintlify.app/authentication\#next-steps)  Next Steps

[**Quickstart** \\
\\
Follow the quickstart guide to make your first authenticated request](https://kunmi.mintlify.app/quickstart)

[**API Reference** \\
\\
Explore all available endpoints and see which require authentication](https://kunmi.mintlify.app/api/auth/signup)