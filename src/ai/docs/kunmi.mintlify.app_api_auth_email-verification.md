> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/auth/email-verification#content-area)

## [​](https://kunmi.mintlify.app/api/auth/email-verification\#verify-email)  Verify Email

Verifies a user’s email address using a verification token. This endpoint is typically called after the user clicks the verification link in their email.

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#authentication)  Authentication

No authentication required (token is provided in request body).

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#request-body)  Request Body

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-token-hash)

token\_hash

string

required

The verification token hash from the email verification link

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-type)

type

string

default:"email"

The type of verification. Defaults to “email” if not provided.

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#response)  Response

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-message)

message

string

Success message confirming email verification

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-session)

session

object

Supabase authentication session created after verification

Showproperties

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-access-token)

access\_token

string

JWT access token for authenticated requests

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-refresh-token)

refresh\_token

string

Token for refreshing the access token

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-expires-in)

expires\_in

number

Token expiration time in seconds

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-user)

user

object

Verified user object

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-error)

error

string

Error message

**Status Codes:**

- `400` \- Bad request (e.g., invalid or expired token)
- `500` \- Internal server error

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#example-request)  Example Request

```
curl -X POST https://api.vaniyk.com/api/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token_hash": "pkce_a1b2c3d4e5f6g7h8i9j0",
    "type": "email"
  }'
```

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#example-response)  Example Response

```
{
  "message": "Email verified successfully",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjoP7GqRGKK9Sh91...",
    "expires_in": 3600,
    "user": {
      "id": "d2f3a8b9-1c4e-5f6g-7h8i-9j0k1l2m3n4o",
      "email": "user@example.com",
      "email_confirmed_at": "2026-03-03T10:30:00.000Z",
      "aud": "authenticated",
      "role": "authenticated"
    }
  }
}
```

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#usage-notes)  Usage Notes

- The verification link in the email redirects to your frontend with a token hash parameter
- Your frontend extracts the `token_hash` from the URL and calls this endpoint
- Upon successful verification, the user’s `emailVerified` field is set to `true` in MongoDB
- A session is automatically created, allowing the user to proceed without logging in again
- Verification tokens expire after a set time period

* * *

## [​](https://kunmi.mintlify.app/api/auth/email-verification\#resend-verification-email)  Resend Verification Email

Resends the email verification link to a user’s email address.

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#authentication-2)  Authentication

No authentication required.

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#request-body-2)  Request Body

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-email)

email

string

required

Email address to send the verification link to

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#response-2)  Response

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-message-1)

message

string

Success message confirming the email was sent

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#error-responses-2)  Error Responses

[​](https://kunmi.mintlify.app/api/auth/email-verification#param-error-1)

error

string

Error message

**Status Codes:**

- `400` \- Bad request (e.g., email already verified, invalid email, email not found)
- `500` \- Internal server error

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#example-request-2)  Example Request

```
curl -X POST https://api.vaniyk.com/api/auth/email/resend \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#example-response-2)  Example Response

```
{
  "message": "Verification email sent"
}
```

### [​](https://kunmi.mintlify.app/api/auth/email-verification\#usage-notes-2)  Usage Notes

- This endpoint can be used when users don’t receive the initial verification email
- The verification link redirects to the frontend URL configured in `FRONTEND_URL` environment variable
- Rate limiting may be applied to prevent abuse
- Users should check their spam folder if they don’t receive the email
- The new verification link invalidates any previously sent verification links