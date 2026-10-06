> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/categories/create-category#content-area)

```
{
  "name": "Technology",
  "description": "Articles about technology and innovation"
}
```

```
{
  "message": "Category created successfully",
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Technology",
    "slug": "technology",
    "description": "Articles about technology and innovation",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

POST

/

api

/

categories

Try it

```
{
  "name": "Technology",
  "description": "Articles about technology and innovation"
}
```

```
{
  "message": "Category created successfully",
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Technology",
    "slug": "technology",
    "description": "Articles about technology and innovation",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

Creates a new category in the system. This endpoint requires admin authentication.

This endpoint requires admin privileges. You must include a valid JWT token with admin role in the Authorization header.

## [​](https://kunmi.mintlify.app/api/categories/create-category\#request)  Request

### [​](https://kunmi.mintlify.app/api/categories/create-category\#headers)  Headers

[​](https://kunmi.mintlify.app/api/categories/create-category#param-authorization)

Authorization

string

required

Bearer token with admin privilegesExample: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

[​](https://kunmi.mintlify.app/api/categories/create-category#param-content-type)

Content-Type

string

required

Must be set to `application/json`

### [​](https://kunmi.mintlify.app/api/categories/create-category\#body-parameters)  Body Parameters

[​](https://kunmi.mintlify.app/api/categories/create-category#param-name)

name

string

required

The display name of the category. Must be unique. The slug will be automatically generated from this name.

[​](https://kunmi.mintlify.app/api/categories/create-category#param-description)

description

string

Optional description of the category

## [​](https://kunmi.mintlify.app/api/categories/create-category\#response)  Response

[​](https://kunmi.mintlify.app/api/categories/create-category#param-message)

message

string

Success message

[​](https://kunmi.mintlify.app/api/categories/create-category#param-category)

category

object

The newly created category object

Show Properties

[​](https://kunmi.mintlify.app/api/categories/create-category#param-id)

\_id

string

Unique identifier for the category

[​](https://kunmi.mintlify.app/api/categories/create-category#param-name-1)

name

string

Display name of the category

[​](https://kunmi.mintlify.app/api/categories/create-category#param-slug)

slug

string

Auto-generated URL-friendly identifier

[​](https://kunmi.mintlify.app/api/categories/create-category#param-description-1)

description

string

Description of the category

[​](https://kunmi.mintlify.app/api/categories/create-category#param-created-at)

createdAt

string

ISO 8601 timestamp of when the category was created

## [​](https://kunmi.mintlify.app/api/categories/create-category\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/categories/create-category#param-error)

error

string

Error message describing what went wrong

### [​](https://kunmi.mintlify.app/api/categories/create-category\#400-category-already-exists)  400 - Category Already Exists

Returned when a category with the same name already exists.

```
{
  "error": "Category already exists"
}
```

### [​](https://kunmi.mintlify.app/api/categories/create-category\#401-unauthorized)  401 - Unauthorized

Returned when the authentication token is missing or invalid.

```
{
  "error": "No token provided"
}
```

### [​](https://kunmi.mintlify.app/api/categories/create-category\#403-forbidden)  403 - Forbidden

Returned when the authenticated user is not an admin.

```
{
  "error": "Admin access required"
}
```

### [​](https://kunmi.mintlify.app/api/categories/create-category\#500-internal-server-error)  500 - Internal Server Error

```
{
  "error": "Database connection failed"
}
```

## [​](https://kunmi.mintlify.app/api/categories/create-category\#example-request)  Example Request

cURL

JavaScript

Python

```
curl -X POST https://api.vaniyk-empire.com/api/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Technology",
    "description": "Articles about technology and innovation"
  }'
```

```
const response = await fetch('https://api.vaniyk-empire.com/api/categories', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Technology',
    description: 'Articles about technology and innovation'
  })
});

const data = await response.json();
console.log(data.category);
```

```
import requests

headers = {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
}

payload = {
    'name': 'Technology',
    'description': 'Articles about technology and innovation'
}

response = requests.post(
    'https://api.vaniyk-empire.com/api/categories',
    headers=headers,
    json=payload
)

data = response.json()
print(data['category'])
```

## [​](https://kunmi.mintlify.app/api/categories/create-category\#notes)  Notes

- The `slug` field is automatically generated from the `name` field by converting to lowercase and replacing spaces/special characters with hyphens
- Category names must be unique across the system
- The auto-generated slug must also be unique