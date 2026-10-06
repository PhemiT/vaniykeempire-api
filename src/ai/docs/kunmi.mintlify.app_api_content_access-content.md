> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/content/access-content#content-area)

```
{
  "content": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced JavaScript Patterns",
    "description": "Learn advanced design patterns in JavaScript including Module, Observer, and Factory patterns with real-world examples.",
    "type": "pdf",
    "category": "507f1f77bcf86cd799439012",
    "price": 29.99,
    "fileUrl": "https://res.cloudinary.com/example/raw/upload/v1234567890/content.pdf",
    "filePublicId": "vaniyk/content/abc123",
    "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/thumbnail.jpg",
    "thumbnailPublicId": "vaniyk/thumbnails/xyz789",
    "fileSize": 5242880,
    "status": "published",
    "tags": ["javascript", "patterns", "advanced", "design-patterns"],
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe"
    },
    "createdAt": "2024-03-01T12:00:00.000Z",
    "updatedAt": "2024-03-01T12:00:00.000Z"
  }
}
```

Retrieves full content details including the file URL for purchased content. This endpoint requires authentication and verifies that the user has purchased the content.

This endpoint requires user authentication. Include a valid JWT token in the Authorization header: `Bearer <token>`

## [​](https://kunmi.mintlify.app/api/content/access-content\#path-parameters)  Path Parameters

[​](https://kunmi.mintlify.app/api/content/access-content#param-content-id)

contentId

string

required

The unique identifier of the content to access

## [​](https://kunmi.mintlify.app/api/content/access-content\#request-headers)  Request Headers

[​](https://kunmi.mintlify.app/api/content/access-content#param-authorization)

Authorization

string

required

Bearer token for user authentication

## [​](https://kunmi.mintlify.app/api/content/access-content\#response)  Response

[​](https://kunmi.mintlify.app/api/content/access-content#param-content)

content

object

Content object with file URL included

Show Content Object

[​](https://kunmi.mintlify.app/api/content/access-content#param-id)

\_id

string

Unique identifier for the content

[​](https://kunmi.mintlify.app/api/content/access-content#param-title)

title

string

Content title

[​](https://kunmi.mintlify.app/api/content/access-content#param-description)

description

string

Content description

[​](https://kunmi.mintlify.app/api/content/access-content#param-type)

type

string

Content type: `pdf`, `video`, or `audio`

[​](https://kunmi.mintlify.app/api/content/access-content#param-category)

category

string

Category ID

[​](https://kunmi.mintlify.app/api/content/access-content#param-price)

price

number

Content price

[​](https://kunmi.mintlify.app/api/content/access-content#param-file-url)

fileUrl

string

Cloudinary URL to access the content file (only available after purchase)

[​](https://kunmi.mintlify.app/api/content/access-content#param-file-public-id)

filePublicId

string

Cloudinary public ID for the file

[​](https://kunmi.mintlify.app/api/content/access-content#param-thumbnail-url)

thumbnailUrl

string

URL to the content thumbnail image

[​](https://kunmi.mintlify.app/api/content/access-content#param-thumbnail-public-id)

thumbnailPublicId

string

Cloudinary public ID for the thumbnail

[​](https://kunmi.mintlify.app/api/content/access-content#param-duration)

duration

number

Duration in seconds (for video/audio content)

[​](https://kunmi.mintlify.app/api/content/access-content#param-file-size)

fileSize

number

File size in bytes

[​](https://kunmi.mintlify.app/api/content/access-content#param-status)

status

string

Content status: `draft` or `published`

[​](https://kunmi.mintlify.app/api/content/access-content#param-tags)

tags

array

Array of tag strings

[​](https://kunmi.mintlify.app/api/content/access-content#param-created-by)

createdBy

object

Creator information

Show Creator Object

[​](https://kunmi.mintlify.app/api/content/access-content#param-id-1)

\_id

string

User ID

[​](https://kunmi.mintlify.app/api/content/access-content#param-name)

name

string

Creator name

[​](https://kunmi.mintlify.app/api/content/access-content#param-created-at)

createdAt

string

ISO 8601 date string

[​](https://kunmi.mintlify.app/api/content/access-content#param-updated-at)

updatedAt

string

ISO 8601 date string

## [​](https://kunmi.mintlify.app/api/content/access-content\#error-responses)  Error Responses

### [​](https://kunmi.mintlify.app/api/content/access-content\#403-forbidden)  403 Forbidden

```
{
  "error": "You need to purchase this content to access it"
}
```

### [​](https://kunmi.mintlify.app/api/content/access-content\#404-not-found)  404 Not Found

```
{
  "error": "Content not found"
}
```

### [​](https://kunmi.mintlify.app/api/content/access-content\#401-unauthorized)  401 Unauthorized

Returned when authentication token is missing or invalid.

### [​](https://kunmi.mintlify.app/api/content/access-content\#500-internal-server-error)  500 Internal Server Error

```
{
  "error": "Error message"
}
```

This endpoint verifies that a completed purchase exists for the authenticated user and the requested content before returning the file URL. Only purchases with `status: 'completed'` are considered valid.