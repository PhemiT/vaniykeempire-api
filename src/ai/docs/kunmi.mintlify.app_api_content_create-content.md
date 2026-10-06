> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/content/create-content#content-area)

```
{
  "message": "Content created successfully",
  "content": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced JavaScript Patterns",
    "description": "Learn advanced design patterns in JavaScript",
    "type": "pdf",
    "category": "507f1f77bcf86cd799439012",
    "price": 29.99,
    "fileUrl": "https://res.cloudinary.com/example/raw/upload/v1234567890/content.pdf",
    "filePublicId": "vaniyk/content/abc123",
    "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/thumbnail.jpg",
    "thumbnailPublicId": "vaniyk/thumbnails/xyz789",
    "fileSize": 5242880,
    "status": "draft",
    "tags": ["javascript", "patterns", "advanced"],
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-03-01T12:00:00.000Z",
    "updatedAt": "2024-03-01T12:00:00.000Z"
  }
}
```

Creates new content with file upload. This endpoint requires admin authentication and accepts multipart/form-data for file uploads.

This endpoint requires admin authentication. Include a valid JWT token in the Authorization header: `Bearer <token>`

## [​](https://kunmi.mintlify.app/api/content/create-content\#request-headers)  Request Headers

[​](https://kunmi.mintlify.app/api/content/create-content#param-authorization)

Authorization

string

required

Bearer token for admin authentication

[​](https://kunmi.mintlify.app/api/content/create-content#param-content-type)

Content-Type

string

required

Must be `multipart/form-data`

## [​](https://kunmi.mintlify.app/api/content/create-content\#request-body-multipart/form-data)  Request Body (multipart/form-data)

[​](https://kunmi.mintlify.app/api/content/create-content#param-title)

title

string

required

Content title

[​](https://kunmi.mintlify.app/api/content/create-content#param-description)

description

string

required

Content description

[​](https://kunmi.mintlify.app/api/content/create-content#param-type)

type

string

required

Content type. Must be one of: `pdf`, `video`, `audio`

[​](https://kunmi.mintlify.app/api/content/create-content#param-category)

category

string

required

Category ID

[​](https://kunmi.mintlify.app/api/content/create-content#param-price)

price

number

required

Content price (minimum: 0)

[​](https://kunmi.mintlify.app/api/content/create-content#param-file)

file

file

required

The content file to upload (PDF, video, or audio file)

[​](https://kunmi.mintlify.app/api/content/create-content#param-thumbnail)

thumbnail

file

Optional thumbnail image for the content

[​](https://kunmi.mintlify.app/api/content/create-content#param-status)

status

string

default:"draft"

Content status. Must be one of: `draft`, `published`

[​](https://kunmi.mintlify.app/api/content/create-content#param-tags)

tags

string

JSON stringified array of tags. Example: `["javascript", "advanced"]`

## [​](https://kunmi.mintlify.app/api/content/create-content\#response)  Response

[​](https://kunmi.mintlify.app/api/content/create-content#param-message)

message

string

Success message

[​](https://kunmi.mintlify.app/api/content/create-content#param-content)

content

object

Created content object

Show Content Object

[​](https://kunmi.mintlify.app/api/content/create-content#param-id)

\_id

string

Unique identifier for the content

[​](https://kunmi.mintlify.app/api/content/create-content#param-title-1)

title

string

Content title

[​](https://kunmi.mintlify.app/api/content/create-content#param-description-1)

description

string

Content description

[​](https://kunmi.mintlify.app/api/content/create-content#param-type-1)

type

string

Content type: `pdf`, `video`, or `audio`

[​](https://kunmi.mintlify.app/api/content/create-content#param-category-1)

category

string

Category ID

[​](https://kunmi.mintlify.app/api/content/create-content#param-price-1)

price

number

Content price

[​](https://kunmi.mintlify.app/api/content/create-content#param-file-url)

fileUrl

string

Cloudinary URL to the uploaded file

[​](https://kunmi.mintlify.app/api/content/create-content#param-file-public-id)

filePublicId

string

Cloudinary public ID for the file

[​](https://kunmi.mintlify.app/api/content/create-content#param-thumbnail-url)

thumbnailUrl

string

Cloudinary URL to the thumbnail image

[​](https://kunmi.mintlify.app/api/content/create-content#param-thumbnail-public-id)

thumbnailPublicId

string

Cloudinary public ID for the thumbnail

[​](https://kunmi.mintlify.app/api/content/create-content#param-duration)

duration

number

Duration in seconds (for video/audio content)

[​](https://kunmi.mintlify.app/api/content/create-content#param-file-size)

fileSize

number

File size in bytes

[​](https://kunmi.mintlify.app/api/content/create-content#param-status-1)

status

string

Content status

[​](https://kunmi.mintlify.app/api/content/create-content#param-tags-1)

tags

array

Array of tag strings

[​](https://kunmi.mintlify.app/api/content/create-content#param-created-by)

createdBy

object

Creator information with name and email

[​](https://kunmi.mintlify.app/api/content/create-content#param-created-at)

createdAt

string

ISO 8601 date string

[​](https://kunmi.mintlify.app/api/content/create-content#param-updated-at)

updatedAt

string

ISO 8601 date string

## [​](https://kunmi.mintlify.app/api/content/create-content\#error-responses)  Error Responses

### [​](https://kunmi.mintlify.app/api/content/create-content\#400-bad-request)  400 Bad Request

```
{
  "error": "Content file is required"
}
```

### [​](https://kunmi.mintlify.app/api/content/create-content\#401-unauthorized)  401 Unauthorized

Returned when authentication token is missing or invalid.

### [​](https://kunmi.mintlify.app/api/content/create-content\#403-forbidden)  403 Forbidden

Returned when the authenticated user is not an admin.

### [​](https://kunmi.mintlify.app/api/content/create-content\#500-internal-server-error)  500 Internal Server Error

```
{
  "error": "Error message"
}
```

Files are uploaded to Cloudinary. The `fileUrl` and `filePublicId` are automatically generated and stored. The `duration` field is automatically populated for video/audio files, and `fileSize` is captured in bytes.