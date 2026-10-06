> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/content/admin-list#content-area)

List All Content (Admin)

cURL

```
curl --request GET \
  --url https://api.example.com/api/content/admin/all
```

```
import requests

url = "https://api.example.com/api/content/admin/all"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://api.example.com/api/content/admin/all', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/content/admin/all",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "GET",\
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

```
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.example.com/api/content/admin/all"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.example.com/api/content/admin/all")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/content/admin/all")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

200

```
{
  "content": [\
    {\
      "_id": "<string>",\
      "title": "<string>",\
      "description": "<string>",\
      "type": "<string>",\
      "category": "<string>",\
      "price": 123,\
      "fileUrl": "<string>",\
      "filePublicId": "<string>",\
      "thumbnailUrl": "<string>",\
      "thumbnailPublicId": "<string>",\
      "duration": 123,\
      "fileSize": 123,\
      "status": "<string>",\
      "tags": [\
        {}\
      ],\
      "createdBy": {\
        "_id": "<string>",\
        "name": "<string>",\
        "email": "<string>"\
      },\
      "createdAt": "<string>",\
      "updatedAt": "<string>"\
    }\
  ],
  "totalPages": 123,
  "currentPage": 123,
  "totalContent": 123
}
```

GET

/

api

/

content

/

admin

/

all

Try it

List All Content (Admin)

cURL

```
curl --request GET \
  --url https://api.example.com/api/content/admin/all
```

```
import requests

url = "https://api.example.com/api/content/admin/all"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://api.example.com/api/content/admin/all', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/content/admin/all",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "GET",\
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

```
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.example.com/api/content/admin/all"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.example.com/api/content/admin/all")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/content/admin/all")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

200

```
{
  "content": [\
    {\
      "_id": "<string>",\
      "title": "<string>",\
      "description": "<string>",\
      "type": "<string>",\
      "category": "<string>",\
      "price": 123,\
      "fileUrl": "<string>",\
      "filePublicId": "<string>",\
      "thumbnailUrl": "<string>",\
      "thumbnailPublicId": "<string>",\
      "duration": 123,\
      "fileSize": 123,\
      "status": "<string>",\
      "tags": [\
        {}\
      ],\
      "createdBy": {\
        "_id": "<string>",\
        "name": "<string>",\
        "email": "<string>"\
      },\
      "createdAt": "<string>",\
      "updatedAt": "<string>"\
    }\
  ],
  "totalPages": 123,
  "currentPage": 123,
  "totalContent": 123
}
```

## [​](https://kunmi.mintlify.app/api/content/admin-list\#overview)  Overview

Admin endpoint to retrieve all content in the system, including draft and published content. This endpoint supports pagination and filtering by status, category, and type.

## [​](https://kunmi.mintlify.app/api/content/admin-list\#authentication)  Authentication

This endpoint requires admin authentication. Include a valid admin access token in the Authorization header.

```
Authorization: Bearer <admin_access_token>
```

## [​](https://kunmi.mintlify.app/api/content/admin-list\#query-parameters)  Query Parameters

[​](https://kunmi.mintlify.app/api/content/admin-list#param-page)

page

number

default:"1"

Page number for pagination

[​](https://kunmi.mintlify.app/api/content/admin-list#param-limit)

limit

number

default:"10"

Number of items per page

[​](https://kunmi.mintlify.app/api/content/admin-list#param-status)

status

string

Filter by content status: `"draft"` or `"published"`

[​](https://kunmi.mintlify.app/api/content/admin-list#param-category)

category

string

Filter by category ID

[​](https://kunmi.mintlify.app/api/content/admin-list#param-type)

type

string

Filter by content type: `"pdf"`, `"video"`, or `"audio"`

## [​](https://kunmi.mintlify.app/api/content/admin-list\#request)  Request

cURL

```
curl -X GET "https://api.vaniykempire.com/api/content/admin/all?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Filter by Status

```
curl -X GET "https://api.vaniykempire.com/api/content/admin/all?status=draft&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

JavaScript

```
const response = await fetch(
  'https://api.vaniykempire.com/api/content/admin/all?page=1&limit=10',
  {
    headers: {
      'Authorization': `Bearer ${adminAccessToken}`
    }
  }
);

const data = await response.json();
console.log(`Total content: ${data.totalContent}`);
console.log(`Content items:`, data.content);
```

Python

```
import requests

response = requests.get(
    'https://api.vaniykempire.com/api/content/admin/all',
    headers={'Authorization': f'Bearer {admin_access_token}'},
    params={
        'page': 1,
        'limit': 10,
        'status': 'draft'
    }
)

data = response.json()
print(f"Total content: {data['totalContent']}")
```

## [​](https://kunmi.mintlify.app/api/content/admin-list\#response)  Response

[​](https://kunmi.mintlify.app/api/content/admin-list#param-content)

content

array

Array of content objects, sorted by creation date (newest first)

Showcontent item properties

[​](https://kunmi.mintlify.app/api/content/admin-list#param-id)

\_id

string

Content ID

[​](https://kunmi.mintlify.app/api/content/admin-list#param-title)

title

string

Content title

[​](https://kunmi.mintlify.app/api/content/admin-list#param-description)

description

string

Content description

[​](https://kunmi.mintlify.app/api/content/admin-list#param-type-1)

type

string

Content type: `"pdf"`, `"video"`, or `"audio"`

[​](https://kunmi.mintlify.app/api/content/admin-list#param-category-1)

category

string

Category ID

[​](https://kunmi.mintlify.app/api/content/admin-list#param-price)

price

number

Content price in USD

[​](https://kunmi.mintlify.app/api/content/admin-list#param-file-url)

fileUrl

string

Cloudinary file URL (included for admin)

[​](https://kunmi.mintlify.app/api/content/admin-list#param-file-public-id)

filePublicId

string

Cloudinary public ID for file management

[​](https://kunmi.mintlify.app/api/content/admin-list#param-thumbnail-url)

thumbnailUrl

string

Thumbnail image URL (optional)

[​](https://kunmi.mintlify.app/api/content/admin-list#param-thumbnail-public-id)

thumbnailPublicId

string

Cloudinary public ID for thumbnail

[​](https://kunmi.mintlify.app/api/content/admin-list#param-duration)

duration

number

Duration in seconds (for video/audio)

[​](https://kunmi.mintlify.app/api/content/admin-list#param-file-size)

fileSize

number

File size in bytes

[​](https://kunmi.mintlify.app/api/content/admin-list#param-status-1)

status

string

Content status: `"draft"` or `"published"`

[​](https://kunmi.mintlify.app/api/content/admin-list#param-tags)

tags

array

Array of tag strings

[​](https://kunmi.mintlify.app/api/content/admin-list#param-created-by)

createdBy

object

Admin user who created the content

ShowcreatedBy properties

[​](https://kunmi.mintlify.app/api/content/admin-list#param-id-1)

\_id

string

Creator’s user ID

[​](https://kunmi.mintlify.app/api/content/admin-list#param-name)

name

string

Creator’s name

[​](https://kunmi.mintlify.app/api/content/admin-list#param-email)

email

string

Creator’s email

[​](https://kunmi.mintlify.app/api/content/admin-list#param-created-at)

createdAt

string

ISO 8601 timestamp

[​](https://kunmi.mintlify.app/api/content/admin-list#param-updated-at)

updatedAt

string

ISO 8601 timestamp

[​](https://kunmi.mintlify.app/api/content/admin-list#param-total-pages)

totalPages

number

Total number of pages available

[​](https://kunmi.mintlify.app/api/content/admin-list#param-current-page)

currentPage

number

Current page number

[​](https://kunmi.mintlify.app/api/content/admin-list#param-total-content)

totalContent

number

Total number of content items matching the filters

### [​](https://kunmi.mintlify.app/api/content/admin-list\#success-response)  Success Response

```
{
  "content": [\
    {\
      "_id": "65f7b3c8e1234567890abcde",\
      "title": "Advanced JavaScript Course",\
      "description": "Learn modern JavaScript",\
      "type": "video",\
      "category": "programming",\
      "price": 49.99,\
      "fileUrl": "https://res.cloudinary.com/demo/video/upload/v1234567890/content/video.mp4",\
      "filePublicId": "content/video",\
      "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/thumbnails/thumb.jpg",\
      "thumbnailPublicId": "thumbnails/thumb",\
      "duration": 3600,\
      "fileSize": 524288000,\
      "status": "published",\
      "tags": ["javascript", "programming", "web-development"],\
      "createdBy": {\
        "_id": "65f7b3c8e1234567890abc00",\
        "name": "Admin User",\
        "email": "admin@example.com"\
      },\
      "createdAt": "2024-03-15T10:30:00.000Z",\
      "updatedAt": "2024-03-15T10:30:00.000Z"\
    }\
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalContent": 47
}
```

## [​](https://kunmi.mintlify.app/api/content/admin-list\#error-responses)  Error Responses

### [​](https://kunmi.mintlify.app/api/content/admin-list\#401-unauthorized)  401 Unauthorized

Invalid or missing access token.

```
{
  "error": "Invalid token"
}
```

### [​](https://kunmi.mintlify.app/api/content/admin-list\#403-forbidden)  403 Forbidden

User is not an admin.

```
{
  "error": "Admin access required"
}
```

### [​](https://kunmi.mintlify.app/api/content/admin-list\#500-internal-server-error)  500 Internal Server Error

```
{
  "error": "Internal server error message"
}
```

## [​](https://kunmi.mintlify.app/api/content/admin-list\#notes)  Notes

This endpoint returns the `fileUrl` and `filePublicId` fields which are hidden from public endpoints. Only use this endpoint for admin dashboards.

Unlike the public `/api/content` endpoint, this returns both draft and published content. Use the `status` query parameter to filter.

Use pagination to efficiently load large content libraries in admin dashboards.

## [​](https://kunmi.mintlify.app/api/content/admin-list\#related-endpoints)  Related Endpoints

- [List Content (Public)](https://kunmi.mintlify.app/api/content/list-content) \- Public content listing
- [Create Content](https://kunmi.mintlify.app/api/content/create-content) \- Upload new content
- [Update Content](https://kunmi.mintlify.app/api/content/update-content) \- Modify existing content
- [Delete Content](https://kunmi.mintlify.app/api/content/delete-content) \- Remove content