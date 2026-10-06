> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/guides/user-registration#content-area)

This guide covers the complete user lifecycle: registration, email verification, profile management, and admin account setup.

## [​](https://kunmi.mintlify.app/guides/user-registration\#user-registration-flow)  User Registration Flow

1

Register a new user

Create a new user account with email and password. The API creates both a Supabase auth user and a MongoDB user record.

```
curl -X POST https://api.vaniykempire.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

**Response:**

```
{
  "message": "User created successfully",
  "user": {
    "id": "64abc123def456789",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjrUNHQrI7BPtJZTlQ...",
    "expires_in": 3600
  }
}
```

Store the `access_token` securely. Include it in the `Authorization: Bearer <token>` header for authenticated requests.

2

Verify email address

After signup, Supabase sends a verification email. When the user clicks the link, they’re redirected to your frontend with a `token_hash`. Send this to the verification endpoint.

```
curl -X POST https://api.vaniykempire.com/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token_hash": "pkce_a1b2c3d4e5f6g7h8i9j0",
    "type": "email"
  }'
```

**Response:**

```
{
  "message": "Email verified successfully",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjrUNHQrI7BPtJZTlQ...",
    "expires_in": 3600
  }
}
```

The MongoDB user record is updated with `emailVerified: true`.

3

Resend verification email (if needed)

If the user didn’t receive the email or it expired:

```
curl -X POST https://api.vaniykempire.com/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response:**

```
{
  "message": "Verification email sent"
}
```

## [​](https://kunmi.mintlify.app/guides/user-registration\#user-authentication)  User Authentication

### [​](https://kunmi.mintlify.app/guides/user-registration\#login)  Login

Authenticate existing users and receive session tokens:

```
curl -X POST https://api.vaniykempire.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**

```
{
  "message": "Login successful",
  "user": {
    "id": "64abc123def456789",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjrUNHQrI7BPtJZTlQ...",
    "expires_in": 3600
  }
}
```

## [​](https://kunmi.mintlify.app/guides/user-registration\#profile-management)  Profile Management

### [​](https://kunmi.mintlify.app/guides/user-registration\#get-user-profile)  Get User Profile

Retrieve the authenticated user’s profile:

```
curl -X GET https://api.vaniykempire.com/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```
{
  "user": {
    "_id": "64abc123def456789",
    "supabaseId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "emailVerified": true,
    "createdAt": "2026-03-01T10:30:00.000Z",
    "updatedAt": "2026-03-01T10:35:00.000Z"
  }
}
```

The profile endpoint requires a valid `Authorization: Bearer <token>` header. Requests without authentication return a 401 error.

## [​](https://kunmi.mintlify.app/guides/user-registration\#password-management)  Password Management

1

Request password reset

Send a password reset email:

```
curl -X POST https://api.vaniykempire.com/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response:**

```
{
  "message": "Password reset email sent"
}
```

The user receives an email with a reset link pointing to `${FRONTEND_URL}/reset-password`.

2

Update password

After the user clicks the reset link and is authenticated with the reset token, update their password:

```
curl -X POST https://api.vaniykempire.com/auth/update-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <reset_token_from_email>" \
  -d '{
    "password": "NewSecurePass456!"
  }'
```

**Response:**

```
{
  "message": "Password updated successfully"
}
```

## [​](https://kunmi.mintlify.app/guides/user-registration\#admin-registration)  Admin Registration

Admins have elevated privileges for content management. Creating an admin account requires a secret key.

1

Register as admin

Use the admin signup endpoint with the `ADMIN_SECRET_KEY`:

```
curl -X POST https://api.vaniykempire.com/auth/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vaniykempire.com",
    "password": "AdminSecure123!",
    "name": "Admin User",
    "adminSecret": "your-admin-secret-key"
  }'
```

**Response:**

```
{
  "message": "Admin user created successfully",
  "user": {
    "id": "64abc789def123456",
    "email": "admin@vaniykempire.com",
    "name": "Admin User",
    "role": "admin"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjrUNHQrI7BPtJZTlQ...",
    "expires_in": 3600
  }
}
```

Keep `ADMIN_SECRET_KEY` secure. Never expose it in client-side code or public repositories.

2

Admin login

Admins use a dedicated login endpoint that verifies their role:

```
curl -X POST https://api.vaniykempire.com/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vaniykempire.com",
    "password": "AdminSecure123!"
  }'
```

**Response:**

```
{
  "message": "Admin login successful",
  "user": {
    "id": "64abc789def123456",
    "email": "admin@vaniykempire.com",
    "name": "Admin User",
    "role": "admin"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjrUNHQrI7BPtJZTlQ...",
    "expires_in": 3600
  }
}
```

Regular users attempting to use the admin login endpoint receive a 403 error.

## [​](https://kunmi.mintlify.app/guides/user-registration\#error-handling)  Error Handling

Common error responses:

| Status Code | Error | Description |
| --- | --- | --- |
| 400 | Invalid request | Missing required fields or validation errors |
| 401 | Unauthorized | Invalid credentials or expired token |
| 403 | Forbidden | Admin secret incorrect or insufficient permissions |
| 404 | User not found | User doesn’t exist in MongoDB |
| 500 | Server error | Internal server error |

**Example error response:**

```
{
  "error": "Invalid admin secret"
}
```

## [​](https://kunmi.mintlify.app/guides/user-registration\#implementation-notes)  Implementation Notes

**Dual Database Architecture**: The API uses both Supabase (authentication) and MongoDB (user data):

- **Supabase**: Handles authentication, session management, and email verification
- **MongoDB**: Stores user profiles, roles, and application-specific data

The `supabaseId` field links the two records.

### [​](https://kunmi.mintlify.app/guides/user-registration\#source-code-references)  Source Code References

- User signup: `src/controllers/authController.js:4`
- Email verification: `src/controllers/authController.js:142`
- Admin registration: `src/controllers/authController.js:174`
- Profile retrieval: `src/controllers/authController.js:69`

## [​](https://kunmi.mintlify.app/guides/user-registration\#next-steps)  Next Steps

[**Purchase Content** \\
\\
Learn how to browse and purchase content](https://kunmi.mintlify.app/guides/purchasing-content)

[**Upload Content** \\
\\
Admin guide for uploading and managing content](https://kunmi.mintlify.app/guides/uploading-content)