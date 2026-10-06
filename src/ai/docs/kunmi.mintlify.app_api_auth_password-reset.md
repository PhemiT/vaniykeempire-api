> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/auth/password-reset#content-area)

## [​](https://kunmi.mintlify.app/api/auth/password-reset\#request-password-reset)  Request Password Reset

Initiates a password reset flow by sending a password reset email to the user.

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#authentication)  Authentication

No authentication required.

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#request-body)  Request Body

[​](https://kunmi.mintlify.app/api/auth/password-reset#param-email)

email

string

required

Email address of the account to reset

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#response)  Response

[​](https://kunmi.mintlify.app/api/auth/password-reset#param-message)

message

string

Success message confirming the email was sent

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/auth/password-reset#param-error)

error

string

Error message

**Status Codes:**

- `400` \- Bad request (e.g., invalid email format, email not found)
- `500` \- Internal server error

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#example-request)  Example Request

```
curl -X POST https://api.vaniyk.com/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#example-response)  Example Response

```
{
  "message": "Password reset email sent"
}
```

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#usage-notes)  Usage Notes

- The user will receive an email with a password reset link
- The reset link redirects to the frontend URL configured in `FRONTEND_URL` environment variable
- The frontend should extract the reset token from the URL and use it when calling the update password endpoint
- Reset tokens are time-limited for security purposes

* * *

## [​](https://kunmi.mintlify.app/api/auth/password-reset\#update-password)  Update Password

Completes the password reset flow by updating the user’s password. This endpoint requires the user to be authenticated with a valid reset token.

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#authentication-2)  Authentication

**Required**: User must be authenticated with the reset token from the password reset email.

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#request-body-2)  Request Body

[​](https://kunmi.mintlify.app/api/auth/password-reset#param-password)

password

string

required

New password for the account

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#response-2)  Response

[​](https://kunmi.mintlify.app/api/auth/password-reset#param-message-1)

message

string

Success message confirming the password was updated

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#error-responses-2)  Error Responses

[​](https://kunmi.mintlify.app/api/auth/password-reset#param-error-1)

error

string

Error message

**Status Codes:**

- `400` \- Bad request (e.g., invalid or expired reset token, weak password)
- `500` \- Internal server error

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#example-request-2)  Example Request

```
curl -X POST https://api.vaniyk.com/api/auth/password-reset/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <reset_token>" \
  -d '{
    "password": "newSecurePassword789"
  }'
```

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#example-response-2)  Example Response

```
{
  "message": "Password updated successfully"
}
```

### [​](https://kunmi.mintlify.app/api/auth/password-reset\#usage-notes-2)  Usage Notes

- The reset token must be included in the Authorization header
- The reset token is obtained from the password reset email link
- After successful password update, the user should log in with their new password
- The reset token becomes invalid after use
- Implement proper password strength requirements on the client side before submitting