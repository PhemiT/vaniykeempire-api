> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/auth/admin-login#content-area)

## [​](https://kunmi.mintlify.app/api/auth/admin-login\#admin-login)  Admin Login

Authenticates an administrator with email and password credentials. This endpoint verifies that the user has admin privileges before granting access.

### [​](https://kunmi.mintlify.app/api/auth/admin-login\#authentication)  Authentication

No authentication required.

### [​](https://kunmi.mintlify.app/api/auth/admin-login\#request-body)  Request Body

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-email)

email

string

required

Administrator’s email address

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-password)

password

string

required

Administrator’s password

### [​](https://kunmi.mintlify.app/api/auth/admin-login\#response)  Response

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-message)

message

string

Success message

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-user)

user

object

Authenticated admin user information

Showproperties

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-id)

id

string

MongoDB user ID

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-email-1)

email

string

Administrator’s email address

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-name)

name

string

Administrator’s full name

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-role)

role

string

User role (always “admin” for successful admin login)

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-session)

session

object

Supabase authentication session

Showproperties

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-access-token)

access\_token

string

JWT access token for authenticated requests

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-refresh-token)

refresh\_token

string

Token for refreshing the access token

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-expires-in)

expires\_in

number

Token expiration time in seconds

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-user-1)

user

object

Supabase user object

### [​](https://kunmi.mintlify.app/api/auth/admin-login\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/auth/admin-login#param-error)

error

string

Error message

**Status Codes:**

- `401` \- Unauthorized (invalid credentials)
- `403` \- Forbidden (user does not have admin privileges)
- `404` \- User not found in database
- `500` \- Internal server error

### [​](https://kunmi.mintlify.app/api/auth/admin-login\#example-request)  Example Request

```
curl -X POST https://api.vaniyk.com/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vaniyk.com",
    "password": "adminSecurePass456"
  }'
```

### [​](https://kunmi.mintlify.app/api/auth/admin-login\#example-success-response)  Example Success Response

```
{
  "message": "Admin login successful",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "admin@vaniyk.com",
    "name": "Jane Admin",
    "role": "admin"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjoP7GqRGKK9Sh91...",
    "expires_in": 3600,
    "user": {
      "id": "d2f3a8b9-1c4e-5f6g-7h8i-9j0k1l2m3n4o",
      "email": "admin@vaniyk.com",
      "aud": "authenticated",
      "role": "authenticated"
    }
  }
}
```

### [​](https://kunmi.mintlify.app/api/auth/admin-login\#example-error-response-non-admin-user)  Example Error Response (Non-Admin User)

```
{
  "error": "Access denied. Admin privileges required."
}
```

### [​](https://kunmi.mintlify.app/api/auth/admin-login\#usage-notes)  Usage Notes

- This endpoint should be used exclusively for admin authentication flows
- Authentication credentials are verified first, then admin role is checked
- If a regular user tries to login through this endpoint, they will receive a 403 error even with valid credentials
- Store the `access_token` securely and include it in the `Authorization` header for subsequent admin API requests
- The token allows access to admin-protected endpoints throughout the API