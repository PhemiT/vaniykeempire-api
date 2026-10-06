> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/content/user-purchases#content-area)

```
{
  "purchases": [\
    {\
      "_id": "507f1f77bcf86cd799439014",\
      "user": "507f1f77bcf86cd799439015",\
      "content": {\
        "_id": "507f1f77bcf86cd799439011",\
        "title": "Advanced JavaScript Patterns",\
        "description": "Learn advanced design patterns in JavaScript",\
        "type": "pdf",\
        "category": "507f1f77bcf86cd799439012",\
        "price": 29.99,\
        "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/thumbnail.jpg"\
      },\
      "status": "completed",\
      "purchasedAt": "2024-03-02T10:30:00.000Z"\
    },\
    {\
      "_id": "507f1f77bcf86cd799439016",\
      "user": "507f1f77bcf86cd799439015",\
      "content": {\
        "_id": "507f1f77bcf86cd799439017",\
        "title": "Node.js Microservices",\
        "description": "Building scalable microservices with Node.js",\
        "type": "video",\
        "category": "507f1f77bcf86cd799439018",\
        "price": 49.99,\
        "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/thumbnail2.jpg"\
      },\
      "status": "completed",\
      "purchasedAt": "2024-03-01T14:20:00.000Z"\
    }\
  ],
  "totalPages": 2,
  "currentPage": 1,
  "totalPurchases": 15
}
```

Retrieves a paginated list of all content purchased by the authenticated user. This endpoint requires authentication.

This endpoint requires user authentication. Include a valid JWT token in the Authorization header: `Bearer <token>`

## [​](https://kunmi.mintlify.app/api/content/user-purchases\#request-headers)  Request Headers

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-authorization)

Authorization

string

required

Bearer token for user authentication

## [​](https://kunmi.mintlify.app/api/content/user-purchases\#query-parameters)  Query Parameters

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-page)

page

number

default:"1"

Page number for pagination

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-limit)

limit

number

default:"10"

Number of items per page

## [​](https://kunmi.mintlify.app/api/content/user-purchases\#response)  Response

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-purchases)

purchases

array

Array of purchase objects

Show Purchase Object

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-id)

\_id

string

Unique identifier for the purchase

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-user)

user

string

User ID who made the purchase

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-content)

content

object

Populated content object (limited fields)

Show Content Object

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-id-1)

\_id

string

Content ID

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-title)

title

string

Content title

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-description)

description

string

Content description

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-type)

type

string

Content type: `pdf`, `video`, or `audio`

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-category)

category

string

Category ID

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-price)

price

number

Content price

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-thumbnail-url)

thumbnailUrl

string

URL to the content thumbnail image

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-status)

status

string

Purchase status (only `completed` purchases are returned)

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-purchased-at)

purchasedAt

string

ISO 8601 date string

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-total-pages)

totalPages

number

Total number of pages

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-current-page)

currentPage

number

Current page number

[​](https://kunmi.mintlify.app/api/content/user-purchases#param-total-purchases)

totalPurchases

number

Total count of completed purchases

## [​](https://kunmi.mintlify.app/api/content/user-purchases\#error-responses)  Error Responses

### [​](https://kunmi.mintlify.app/api/content/user-purchases\#401-unauthorized)  401 Unauthorized

Returned when authentication token is missing or invalid.

### [​](https://kunmi.mintlify.app/api/content/user-purchases\#500-internal-server-error)  500 Internal Server Error

```
{
  "error": "Error message"
}
```

This endpoint only returns purchases with `status: 'completed'`. Pending or failed purchases are not included. The purchases are sorted by `purchasedAt` in descending order (most recent first).

To access the full content including the file URL, use the [Access Content](https://kunmi.mintlify.app/api/content/access-content) endpoint with the content ID from the purchase.