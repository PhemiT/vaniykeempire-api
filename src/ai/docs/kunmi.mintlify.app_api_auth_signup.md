> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/auth/signup#content-area)

## [​](https://kunmi.mintlify.app/api/auth/signup\#regular-user-signup)  Regular User Signup

Creates a new user account with email and password authentication.

### [​](https://kunmi.mintlify.app/api/auth/signup\#request-body)  Request Body

[​](https://kunmi.mintlify.app/api/auth/signup#param-email)

email

string

required

User’s email address

[​](https://kunmi.mintlify.app/api/auth/signup#param-password)

password

string

required

User’s password

[​](https://kunmi.mintlify.app/api/auth/signup#param-name)

name

string

required

User’s full name

### [​](https://kunmi.mintlify.app/api/auth/signup\#response)  Response

[​](https://kunmi.mintlify.app/api/auth/signup#param-message)

message

string

Success message

[​](https://kunmi.mintlify.app/api/auth/signup#param-user)

user

object

Created user information

Showproperties

[​](https://kunmi.mintlify.app/api/auth/signup#param-id)

id

string

MongoDB user ID

[​](https://kunmi.mintlify.app/api/auth/signup#param-email-1)

email

string

User’s email address

[​](https://kunmi.mintlify.app/api/auth/signup#param-name-1)

name

string

User’s full name

[​](https://kunmi.mintlify.app/api/auth/signup#param-session)

session

object

Supabase authentication session

Showproperties

[​](https://kunmi.mintlify.app/api/auth/signup#param-access-token)

access\_token

string

JWT access token for authenticated requests

[​](https://kunmi.mintlify.app/api/auth/signup#param-refresh-token)

refresh\_token

string

Token for refreshing the access token

[​](https://kunmi.mintlify.app/api/auth/signup#param-expires-in)

expires\_in

number

Token expiration time in seconds

### [​](https://kunmi.mintlify.app/api/auth/signup\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/auth/signup#param-error)

error

string

Error message

**Status Codes:**

- `400` \- Bad request (e.g., email already exists, invalid email format)
- `500` \- Internal server error

### [​](https://kunmi.mintlify.app/api/auth/signup\#example-request)  Example Request

```
curl -X POST https://api.vaniyk.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

### [​](https://kunmi.mintlify.app/api/auth/signup\#example-response)  Example Response

```
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjoP7GqRGKK9Sh91...",
    "expires_in": 3600
  }
}
```

* * *

## [​](https://kunmi.mintlify.app/api/auth/signup\#admin-user-signup)  Admin User Signup

Creates a new administrator account with elevated privileges. Requires a valid admin secret key.

### [​](https://kunmi.mintlify.app/api/auth/signup\#request-body-2)  Request Body

[​](https://kunmi.mintlify.app/api/auth/signup#param-email-2)

email

string

required

Administrator’s email address

[​](https://kunmi.mintlify.app/api/auth/signup#param-password-1)

password

string

required

Administrator’s password

[​](https://kunmi.mintlify.app/api/auth/signup#param-name-2)

name

string

required

Administrator’s full name

[​](https://kunmi.mintlify.app/api/auth/signup#param-admin-secret)

adminSecret

string

required

Secret key for admin account creation. Must match the server’s `ADMIN_SECRET_KEY` environment variable.

### [​](https://kunmi.mintlify.app/api/auth/signup\#response-2)  Response

[​](https://kunmi.mintlify.app/api/auth/signup#param-message-1)

message

string

Success message

[​](https://kunmi.mintlify.app/api/auth/signup#param-user-1)

user

object

Created admin user information

Showproperties

[​](https://kunmi.mintlify.app/api/auth/signup#param-id-1)

id

string

MongoDB user ID

[​](https://kunmi.mintlify.app/api/auth/signup#param-email-3)

email

string

Administrator’s email address

[​](https://kunmi.mintlify.app/api/auth/signup#param-name-3)

name

string

Administrator’s full name

[​](https://kunmi.mintlify.app/api/auth/signup#param-role)

role

string

User role (always “admin” for this endpoint)

[​](https://kunmi.mintlify.app/api/auth/signup#param-session-1)

session

object

Supabase authentication session

Showproperties

[​](https://kunmi.mintlify.app/api/auth/signup#param-access-token-1)

access\_token

string

JWT access token for authenticated requests

[​](https://kunmi.mintlify.app/api/auth/signup#param-refresh-token-1)

refresh\_token

string

Token for refreshing the access token

[​](https://kunmi.mintlify.app/api/auth/signup#param-expires-in-1)

expires\_in

number

Token expiration time in seconds

### [​](https://kunmi.mintlify.app/api/auth/signup\#error-responses-2)  Error Responses

[​](https://kunmi.mintlify.app/api/auth/signup#param-error-1)

error

string

Error message

**Status Codes:**

- `400` \- Bad request (e.g., email already exists, invalid email format)
- `403` \- Forbidden (invalid admin secret)
- `500` \- Internal server error

### [​](https://kunmi.mintlify.app/api/auth/signup\#example-request-2)  Example Request

```
curl -X POST https://api.vaniyk.com/api/auth/signup/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vaniyk.com",
    "password": "adminSecurePass456",
    "name": "Jane Admin",
    "adminSecret": "your-admin-secret-key"
  }'
```

### [​](https://kunmi.mintlify.app/api/auth/signup\#example-response-2)  Example Response

```
{
  "message": "Admin user created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "admin@vaniyk.com",
    "name": "Jane Admin",
    "role": "admin"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MRjoP7GqRGKK9Sh91...",
    "expires_in": 3600
  }
}
```