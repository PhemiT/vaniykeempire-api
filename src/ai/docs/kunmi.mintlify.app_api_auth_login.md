> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/auth/login#content-area)

## [​](https://kunmi.mintlify.app/api/auth/login\#regular-user-login)  Regular User Login

Authenticates a user with email and password credentials.

### [​](https://kunmi.mintlify.app/api/auth/login\#authentication)  Authentication

No authentication required.

### [​](https://kunmi.mintlify.app/api/auth/login\#request-body)  Request Body

[​](https://kunmi.mintlify.app/api/auth/login#param-email)

email

string

required

User’s email address

[​](https://kunmi.mintlify.app/api/auth/login#param-password)

password

string

required

User’s password

### [​](https://kunmi.mintlify.app/api/auth/login\#response)  Response

[​](https://kunmi.mintlify.app/api/auth/login#param-message)

message

string

Success message

[​](https://kunmi.mintlify.app/api/auth/login#param-user)

user

object

Authenticated user information

Showproperties

[​](https://kunmi.mintlify.app/api/auth/login#param-id)

id

string

MongoDB user ID

[​](https://kunmi.mintlify.app/api/auth/login#param-email-1)

email

string

User’s email address

[​](https://kunmi.mintlify.app/api/auth/login#param-name)

name

string

User’s full name

[​](https://kunmi.mintlify.app/api/auth/login#param-session)

session

object

Supabase authentication session

Showproperties

[​](https://kunmi.mintlify.app/api/auth/login#param-access-token)

access\_token

string

JWT access token for authenticated requests

[​](https://kunmi.mintlify.app/api/auth/login#param-refresh-token)

refresh\_token

string

Token for refreshing the access token

[​](https://kunmi.mintlify.app/api/auth/login#param-expires-in)

expires\_in

number

Token expiration time in seconds

[​](https://kunmi.mintlify.app/api/auth/login#param-user-1)

user

object

Supabase user object

### [​](https://kunmi.mintlify.app/api/auth/login\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/auth/login#param-error)

error

string

Error message

**Status Codes:**

- `401` \- Unauthorized (invalid credentials)
- `500` \- Internal server error

### [​](https://kunmi.mintlify.app/api/auth/login\#example-request)  Example Request

```
curl -X POST https://api.vaniyk.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### [​](https://kunmi.mintlify.app/api/auth/login\#example-response)  Example Response

```
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjoP7GqRGKK9Sh91...",
    "expires_in": 3600,
    "user": {
      "id": "d2f3a8b9-1c4e-5f6g-7h8i-9j0k1l2m3n4o",
      "email": "user@example.com",
      "aud": "authenticated",
      "role": "authenticated"
    }
  }
}
```

### [​](https://kunmi.mintlify.app/api/auth/login\#usage-notes)  Usage Notes

- Store the `access_token` securely in your client application
- Include the access token in the `Authorization` header for subsequent API requests: `Authorization: Bearer <access_token>`
- Use the `refresh_token` to obtain a new access token when it expires
- The session includes both MongoDB user data and Supabase authentication data