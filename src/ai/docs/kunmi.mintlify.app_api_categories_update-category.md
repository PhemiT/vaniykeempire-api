> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/categories/update-category#content-area)

```
{
  "name": "Tech & Innovation",
  "description": "Updated description for technology articles"
}
```

```
{
  "message": "Category updated successfully",
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Tech & Innovation",
    "slug": "tech-innovation",
    "description": "Updated description for technology articles",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

PUT

/

api

/

categories

/

:categoryId

Try it

```
{
  "name": "Tech & Innovation",
  "description": "Updated description for technology articles"
}
```

```
{
  "message": "Category updated successfully",
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Tech & Innovation",
    "slug": "tech-innovation",
    "description": "Updated description for technology articles",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

Updates an existing category’s details. This endpoint requires admin authentication.

This endpoint requires admin privileges. You must include a valid JWT token with admin role in the Authorization header.

## [​](https://kunmi.mintlify.app/api/categories/update-category\#request)  Request

### [​](https://kunmi.mintlify.app/api/categories/update-category\#path-parameters)  Path Parameters

[​](https://kunmi.mintlify.app/api/categories/update-category#param-category-id)

categoryId

string

required

The unique MongoDB ObjectId of the category to update

### [​](https://kunmi.mintlify.app/api/categories/update-category\#headers)  Headers

[​](https://kunmi.mintlify.app/api/categories/update-category#param-authorization)

Authorization

string

required

Bearer token with admin privilegesExample: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

[​](https://kunmi.mintlify.app/api/categories/update-category#param-content-type)

Content-Type

string

required

Must be set to `application/json`

### [​](https://kunmi.mintlify.app/api/categories/update-category\#body-parameters)  Body Parameters

[​](https://kunmi.mintlify.app/api/categories/update-category#param-name)

name

string

The new display name of the category. If provided, the slug will be automatically regenerated.

[​](https://kunmi.mintlify.app/api/categories/update-category#param-description)

description

string

The new description of the category. Can be set to an empty string to clear the description.

## [​](https://kunmi.mintlify.app/api/categories/update-category\#response)  Response

[​](https://kunmi.mintlify.app/api/categories/update-category#param-message)

message

string

Success message

[​](https://kunmi.mintlify.app/api/categories/update-category#param-category)

category

object

The updated category object

Show Properties

[​](https://kunmi.mintlify.app/api/categories/update-category#param-id)

\_id

string

Unique identifier for the category

[​](https://kunmi.mintlify.app/api/categories/update-category#param-name-1)

name

string

Display name of the category

[​](https://kunmi.mintlify.app/api/categories/update-category#param-slug)

slug

string

URL-friendly identifier (regenerated if name was changed)

[​](https://kunmi.mintlify.app/api/categories/update-category#param-description-1)

description

string

Description of the category

[​](https://kunmi.mintlify.app/api/categories/update-category#param-created-at)

createdAt

string

ISO 8601 timestamp of when the category was created

## [​](https://kunmi.mintlify.app/api/categories/update-category\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/categories/update-category#param-error)

error

string

Error message describing what went wrong

### [​](https://kunmi.mintlify.app/api/categories/update-category\#404-category-not-found)  404 - Category Not Found

Returned when no category exists with the specified ID.

```
{
  "error": "Category not found"
}
```

### [​](https://kunmi.mintlify.app/api/categories/update-category\#401-unauthorized)  401 - Unauthorized

Returned when the authentication token is missing or invalid.

```
{
  "error": "No token provided"
}
```

### [​](https://kunmi.mintlify.app/api/categories/update-category\#403-forbidden)  403 - Forbidden

Returned when the authenticated user is not an admin.

```
{
  "error": "Admin access required"
}
```

### [​](https://kunmi.mintlify.app/api/categories/update-category\#500-internal-server-error)  500 - Internal Server Error

```
{
  "error": "Database connection failed"
}
```

## [​](https://kunmi.mintlify.app/api/categories/update-category\#example-request)  Example Request

cURL

JavaScript

Python

```
curl -X PUT https://api.vaniyk-empire.com/api/categories/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech & Innovation",
    "description": "Updated description for technology articles"
  }'
```

```
const categoryId = '507f1f77bcf86cd799439011';

const response = await fetch(`https://api.vaniyk-empire.com/api/categories/${categoryId}`, {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Tech & Innovation',
    description: 'Updated description for technology articles'
  })
});

const data = await response.json();
console.log(data.category);
```

```
import requests

category_id = '507f1f77bcf86cd799439011'

headers = {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
}

payload = {
    'name': 'Tech & Innovation',
    'description': 'Updated description for technology articles'
}

response = requests.put(
    f'https://api.vaniyk-empire.com/api/categories/{category_id}',
    headers=headers,
    json=payload
)

data = response.json()
print(data['category'])
```

## [​](https://kunmi.mintlify.app/api/categories/update-category\#notes)  Notes

- All body parameters are optional - you can update just the name, just the description, or both
- If you update the `name`, the `slug` will be automatically regenerated
- To clear the description, pass an empty string
- The `categoryId` parameter must be a valid MongoDB ObjectId