> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/content/update-content#content-area)

```
{
  "message": "Content updated successfully",
  "content": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced JavaScript Patterns - Updated",
    "description": "Learn advanced design patterns in JavaScript with new examples",
    "type": "pdf",
    "category": "507f1f77bcf86cd799439012",
    "price": 34.99,
    "fileUrl": "https://res.cloudinary.com/example/raw/upload/v1234567890/content.pdf",
    "filePublicId": "vaniyk/content/abc123",
    "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/thumbnail.jpg",
    "thumbnailPublicId": "vaniyk/thumbnails/xyz789",
    "fileSize": 5242880,
    "status": "published",
    "tags": ["javascript", "patterns", "advanced", "updated"],
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-03-01T12:00:00.000Z",
    "updatedAt": "2024-03-03T15:30:00.000Z"
  }
}
```

Updates existing content. This endpoint requires admin authentication and accepts multipart/form-data for optional file updates.

This endpoint requires admin authentication. Include a valid JWT token in the Authorization header: `Bearer <token>`

## [​](https://kunmi.mintlify.app/api/content/update-content\#path-parameters)  Path Parameters

[​](https://kunmi.mintlify.app/api/content/update-content#param-content-id)

contentId

string

required

The unique identifier of the content to update

## [​](https://kunmi.mintlify.app/api/content/update-content\#request-headers)  Request Headers

[​](https://kunmi.mintlify.app/api/content/update-content#param-authorization)

Authorization

string

required

Bearer token for admin authentication

[​](https://kunmi.mintlify.app/api/content/update-content#param-content-type)

Content-Type

string

required

Must be `multipart/form-data`

## [​](https://kunmi.mintlify.app/api/content/update-content\#request-body-multipart/form-data)  Request Body (multipart/form-data)

[​](https://kunmi.mintlify.app/api/content/update-content#param-title)

title

string

Content title

[​](https://kunmi.mintlify.app/api/content/update-content#param-description)

description

string

Content description

[​](https://kunmi.mintlify.app/api/content/update-content#param-type)

type

string

Content type. Must be one of: `pdf`, `video`, `audio`

[​](https://kunmi.mintlify.app/api/content/update-content#param-category)

category

string

Category ID

[​](https://kunmi.mintlify.app/api/content/update-content#param-price)

price

number

Content price (minimum: 0)

[​](https://kunmi.mintlify.app/api/content/update-content#param-file)

file

file

Optional new content file to replace the existing one

[​](https://kunmi.mintlify.app/api/content/update-content#param-thumbnail)

thumbnail

file

Optional new thumbnail image to replace the existing one

[​](https://kunmi.mintlify.app/api/content/update-content#param-status)

status

string

Content status. Must be one of: `draft`, `published`

[​](https://kunmi.mintlify.app/api/content/update-content#param-tags)

tags

string

JSON stringified array of tags. Example: `["javascript", "advanced"]`

## [​](https://kunmi.mintlify.app/api/content/update-content\#response)  Response

[​](https://kunmi.mintlify.app/api/content/update-content#param-message)

message

string

Success message

[​](https://kunmi.mintlify.app/api/content/update-content#param-content)

content

object

Updated content object

Show Content Object

[​](https://kunmi.mintlify.app/api/content/update-content#param-id)

\_id

string

Unique identifier for the content

[​](https://kunmi.mintlify.app/api/content/update-content#param-title-1)

title

string

Content title

[​](https://kunmi.mintlify.app/api/content/update-content#param-description-1)

description

string

Content description

[​](https://kunmi.mintlify.app/api/content/update-content#param-type-1)

type

string

Content type: `pdf`, `video`, or `audio`

[​](https://kunmi.mintlify.app/api/content/update-content#param-category-1)

category

string

Category ID

[​](https://kunmi.mintlify.app/api/content/update-content#param-price-1)

price

number

Content price

[​](https://kunmi.mintlify.app/api/content/update-content#param-file-url)

fileUrl

string

Cloudinary URL to the file

[​](https://kunmi.mintlify.app/api/content/update-content#param-file-public-id)

filePublicId

string

Cloudinary public ID for the file

[​](https://kunmi.mintlify.app/api/content/update-content#param-thumbnail-url)

thumbnailUrl

string

Cloudinary URL to the thumbnail image

[​](https://kunmi.mintlify.app/api/content/update-content#param-thumbnail-public-id)

thumbnailPublicId

string

Cloudinary public ID for the thumbnail

[​](https://kunmi.mintlify.app/api/content/update-content#param-duration)

duration

number

Duration in seconds (for video/audio content)

[​](https://kunmi.mintlify.app/api/content/update-content#param-file-size)

fileSize

number

File size in bytes

[​](https://kunmi.mintlify.app/api/content/update-content#param-status-1)

status

string

Content status

[​](https://kunmi.mintlify.app/api/content/update-content#param-tags-1)

tags

array

Array of tag strings

[​](https://kunmi.mintlify.app/api/content/update-content#param-created-by)

createdBy

object

Creator information with name and email

[​](https://kunmi.mintlify.app/api/content/update-content#param-created-at)

createdAt

string

ISO 8601 date string

[​](https://kunmi.mintlify.app/api/content/update-content#param-updated-at)

updatedAt

string

ISO 8601 date string

## [​](https://kunmi.mintlify.app/api/content/update-content\#error-responses)  Error Responses

### [​](https://kunmi.mintlify.app/api/content/update-content\#404-not-found)  404 Not Found

```
{
  "error": "Content not found"
}
```

### [​](https://kunmi.mintlify.app/api/content/update-content\#401-unauthorized)  401 Unauthorized

Returned when authentication token is missing or invalid.

### [​](https://kunmi.mintlify.app/api/content/update-content\#403-forbidden)  403 Forbidden

Returned when the authenticated user is not an admin.

### [​](https://kunmi.mintlify.app/api/content/update-content\#500-internal-server-error)  500 Internal Server Error

```
{
  "error": "Error message"
}
```

When uploading a new file or thumbnail, the old file is automatically deleted from Cloudinary. The resource type for deletion is determined by the content type (`pdf` uses ‘image’, while `video` and `audio` use ‘video’ resource type).

You can update text fields without uploading new files. Only include file fields when you want to replace existing files.