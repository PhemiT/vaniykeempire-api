> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/categories/get-category#content-area)

Get Category

cURL

```
curl --request GET \
  --url https://api.example.com/api/categories/:slug
```

```
import requests

url = "https://api.example.com/api/categories/:slug"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://api.example.com/api/categories/:slug', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/categories/:slug",\
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

	url := "https://api.example.com/api/categories/:slug"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.example.com/api/categories/:slug")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/categories/:slug")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

```
{
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Technology",
    "slug": "technology",
    "description": "Articles about technology and innovation",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

GET

/

api

/

categories

/

:slug

Try it

Get Category

cURL

```
curl --request GET \
  --url https://api.example.com/api/categories/:slug
```

```
import requests

url = "https://api.example.com/api/categories/:slug"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://api.example.com/api/categories/:slug', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/categories/:slug",\
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

	url := "https://api.example.com/api/categories/:slug"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.example.com/api/categories/:slug")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/categories/:slug")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

```
{
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Technology",
    "slug": "technology",
    "description": "Articles about technology and innovation",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

Retrieves a single category identified by its URL-friendly slug. This endpoint is publicly accessible and does not require authentication.

## [​](https://kunmi.mintlify.app/api/categories/get-category\#request)  Request

### [​](https://kunmi.mintlify.app/api/categories/get-category\#path-parameters)  Path Parameters

[​](https://kunmi.mintlify.app/api/categories/get-category#param-slug)

slug

string

required

The URL-friendly identifier of the category (e.g., “technology”, “travel”)

### [​](https://kunmi.mintlify.app/api/categories/get-category\#headers)  Headers

No authentication required.

## [​](https://kunmi.mintlify.app/api/categories/get-category\#response)  Response

[​](https://kunmi.mintlify.app/api/categories/get-category#param-category)

category

object

The requested category object

Show Properties

[​](https://kunmi.mintlify.app/api/categories/get-category#param-id)

\_id

string

Unique identifier for the category

[​](https://kunmi.mintlify.app/api/categories/get-category#param-name)

name

string

Display name of the category

[​](https://kunmi.mintlify.app/api/categories/get-category#param-slug-1)

slug

string

URL-friendly identifier for the category

[​](https://kunmi.mintlify.app/api/categories/get-category#param-description)

description

string

Optional description of the category

[​](https://kunmi.mintlify.app/api/categories/get-category#param-created-at)

createdAt

string

ISO 8601 timestamp of when the category was created

## [​](https://kunmi.mintlify.app/api/categories/get-category\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/categories/get-category#param-error)

error

string

Error message describing what went wrong

### [​](https://kunmi.mintlify.app/api/categories/get-category\#404-category-not-found)  404 - Category Not Found

Returned when no category exists with the specified slug.

```
{
  "error": "Category not found"
}
```

### [​](https://kunmi.mintlify.app/api/categories/get-category\#500-internal-server-error)  500 - Internal Server Error

```
{
  "error": "Database connection failed"
}
```

## [​](https://kunmi.mintlify.app/api/categories/get-category\#example-request)  Example Request

cURL

JavaScript

Python

```
curl https://api.vaniyk-empire.com/api/categories/technology
```

```
const response = await fetch('https://api.vaniyk-empire.com/api/categories/technology');
const data = await response.json();
console.log(data.category);
```

```
import requests

response = requests.get('https://api.vaniyk-empire.com/api/categories/technology')
data = response.json()
print(data['category'])
```