> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/content/get-content#content-area)

```
{
  "content": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced JavaScript Patterns",
    "description": "Learn advanced design patterns in JavaScript including Module, Observer, and Factory patterns with real-world examples.",
    "type": "pdf",
    "category": "507f1f77bcf86cd799439012",
    "price": 29.99,
    "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/thumbnail.jpg",
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

Retrieves detailed information about a specific published content item. This is a public endpoint that does not require authentication.

## [​](https://kunmi.mintlify.app/api/content/get-content\#path-parameters)  Path Parameters

[​](https://kunmi.mintlify.app/api/content/get-content#param-content-id)

contentId

string

required

The unique identifier of the content

## [​](https://kunmi.mintlify.app/api/content/get-content\#response)  Response

[​](https://kunmi.mintlify.app/api/content/get-content#param-content)

content

object

Content object with detailed information

Show Content Object

[​](https://kunmi.mintlify.app/api/content/get-content#param-id)

\_id

string

Unique identifier for the content

[​](https://kunmi.mintlify.app/api/content/get-content#param-title)

title

string

required

Content title

[​](https://kunmi.mintlify.app/api/content/get-content#param-description)

description

string

required

Content description

[​](https://kunmi.mintlify.app/api/content/get-content#param-type)

type

string

required

Content type: `pdf`, `video`, or `audio`

[​](https://kunmi.mintlify.app/api/content/get-content#param-category)

category

string

required

Category ID

[​](https://kunmi.mintlify.app/api/content/get-content#param-price)

price

number

required

Content price (minimum: 0)

[​](https://kunmi.mintlify.app/api/content/get-content#param-thumbnail-url)

thumbnailUrl

string

URL to the content thumbnail image

[​](https://kunmi.mintlify.app/api/content/get-content#param-duration)

duration

number

Duration in seconds (for video/audio content only)

[​](https://kunmi.mintlify.app/api/content/get-content#param-file-size)

fileSize

number

File size in bytes

[​](https://kunmi.mintlify.app/api/content/get-content#param-status)

status

string

Content status: `draft` or `published`

[​](https://kunmi.mintlify.app/api/content/get-content#param-tags)

tags

array

Array of tag strings

[​](https://kunmi.mintlify.app/api/content/get-content#param-created-by)

createdBy

object

Creator information

Show Creator Object

[​](https://kunmi.mintlify.app/api/content/get-content#param-id-1)

\_id

string

User ID

[​](https://kunmi.mintlify.app/api/content/get-content#param-name)

name

string

Creator name

[​](https://kunmi.mintlify.app/api/content/get-content#param-created-at)

createdAt

string

ISO 8601 date string

[​](https://kunmi.mintlify.app/api/content/get-content#param-updated-at)

updatedAt

string

ISO 8601 date string

The `fileUrl` and `filePublicId` fields are not included in the response. To access the file URL, users must purchase the content and use the [Access Content](https://kunmi.mintlify.app/api/content/access-content) endpoint.

## [​](https://kunmi.mintlify.app/api/content/get-content\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/content/get-content#param-error)

error

string

Error message

### [​](https://kunmi.mintlify.app/api/content/get-content\#404-not-found)  404 Not Found

Returned when the content does not exist or is not published.

```
{
  "error": "Content not found"
}
```