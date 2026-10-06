> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/content/list-content#content-area)

```
{
  "content": [\
    {\
      "_id": "507f1f77bcf86cd799439011",\
      "title": "Advanced JavaScript Patterns",\
      "description": "Learn advanced design patterns in JavaScript",\
      "type": "pdf",\
      "category": "507f1f77bcf86cd799439012",\
      "price": 29.99,\
      "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/thumbnail.jpg",\
      "fileSize": 5242880,\
      "status": "published",\
      "tags": ["javascript", "patterns", "advanced"],\
      "createdBy": {\
        "_id": "507f1f77bcf86cd799439013",\
        "name": "John Doe"\
      },\
      "createdAt": "2024-03-01T12:00:00.000Z",\
      "updatedAt": "2024-03-01T12:00:00.000Z"\
    }\
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalContent": 47
}
```

Retrieves a paginated list of all published content with optional filters. This is a public endpoint that does not require authentication.

## [​](https://kunmi.mintlify.app/api/content/list-content\#query-parameters)  Query Parameters

[​](https://kunmi.mintlify.app/api/content/list-content#param-page)

page

number

default:"1"

Page number for pagination

[​](https://kunmi.mintlify.app/api/content/list-content#param-limit)

limit

number

default:"10"

Number of items per page

[​](https://kunmi.mintlify.app/api/content/list-content#param-category)

category

string

Filter by category ID

[​](https://kunmi.mintlify.app/api/content/list-content#param-type)

type

string

Filter by content type. Must be one of: `pdf`, `video`, `audio`

[​](https://kunmi.mintlify.app/api/content/list-content#param-min-price)

minPrice

number

Filter by minimum price

[​](https://kunmi.mintlify.app/api/content/list-content#param-max-price)

maxPrice

number

Filter by maximum price

[​](https://kunmi.mintlify.app/api/content/list-content#param-search)

search

string

Full-text search across title, description, and tags

## [​](https://kunmi.mintlify.app/api/content/list-content\#response)  Response

[​](https://kunmi.mintlify.app/api/content/list-content#param-content)

content

array

Array of content objects

Show Content Object

[​](https://kunmi.mintlify.app/api/content/list-content#param-id)

\_id

string

Unique identifier for the content

[​](https://kunmi.mintlify.app/api/content/list-content#param-title)

title

string

required

Content title

[​](https://kunmi.mintlify.app/api/content/list-content#param-description)

description

string

required

Content description

[​](https://kunmi.mintlify.app/api/content/list-content#param-type-1)

type

string

required

Content type: `pdf`, `video`, or `audio`

[​](https://kunmi.mintlify.app/api/content/list-content#param-category-1)

category

string

required

Category ID

[​](https://kunmi.mintlify.app/api/content/list-content#param-price)

price

number

required

Content price (minimum: 0)

[​](https://kunmi.mintlify.app/api/content/list-content#param-thumbnail-url)

thumbnailUrl

string

URL to the content thumbnail image

[​](https://kunmi.mintlify.app/api/content/list-content#param-duration)

duration

number

Duration in seconds (for video/audio content only)

[​](https://kunmi.mintlify.app/api/content/list-content#param-file-size)

fileSize

number

File size in bytes

[​](https://kunmi.mintlify.app/api/content/list-content#param-status)

status

string

Content status: `draft` or `published`

[​](https://kunmi.mintlify.app/api/content/list-content#param-tags)

tags

array

Array of tag strings

[​](https://kunmi.mintlify.app/api/content/list-content#param-created-by)

createdBy

object

Creator information

Show Creator Object

[​](https://kunmi.mintlify.app/api/content/list-content#param-id-1)

\_id

string

User ID

[​](https://kunmi.mintlify.app/api/content/list-content#param-name)

name

string

Creator name

[​](https://kunmi.mintlify.app/api/content/list-content#param-created-at)

createdAt

string

ISO 8601 date string

[​](https://kunmi.mintlify.app/api/content/list-content#param-updated-at)

updatedAt

string

ISO 8601 date string

[​](https://kunmi.mintlify.app/api/content/list-content#param-total-pages)

totalPages

number

Total number of pages

[​](https://kunmi.mintlify.app/api/content/list-content#param-current-page)

currentPage

number

Current page number

[​](https://kunmi.mintlify.app/api/content/list-content#param-total-content)

totalContent

number

Total count of content items

The `fileUrl` and `filePublicId` fields are not included in the public listing response. Users must purchase content to access the file URL via the [Access Content](https://kunmi.mintlify.app/api/content/access-content) endpoint.