> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/categories/list-categories#content-area)

List Categories

cURL

```
curl --request GET \
  --url https://api.example.com/api/categories
```

```
import requests

url = "https://api.example.com/api/categories"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://api.example.com/api/categories', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/categories",\
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

	url := "https://api.example.com/api/categories"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.example.com/api/categories")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/categories")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

```
{
  "categories": [\
    {\
      "_id": "507f1f77bcf86cd799439011",\
      "name": "Technology",\
      "slug": "technology",\
      "description": "Articles about technology and innovation",\
      "createdAt": "2024-01-15T10:30:00.000Z"\
    },\
    {\
      "_id": "507f1f77bcf86cd799439012",\
      "name": "Travel",\
      "slug": "travel",\
      "description": "Travel guides and tips",\
      "createdAt": "2024-01-16T14:20:00.000Z"\
    }\
  ]
}
```

GET

/

api

/

categories

Try it

List Categories

cURL

```
curl --request GET \
  --url https://api.example.com/api/categories
```

```
import requests

url = "https://api.example.com/api/categories"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://api.example.com/api/categories', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/categories",\
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

	url := "https://api.example.com/api/categories"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.example.com/api/categories")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/categories")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

```
{
  "categories": [\
    {\
      "_id": "507f1f77bcf86cd799439011",\
      "name": "Technology",\
      "slug": "technology",\
      "description": "Articles about technology and innovation",\
      "createdAt": "2024-01-15T10:30:00.000Z"\
    },\
    {\
      "_id": "507f1f77bcf86cd799439012",\
      "name": "Travel",\
      "slug": "travel",\
      "description": "Travel guides and tips",\
      "createdAt": "2024-01-16T14:20:00.000Z"\
    }\
  ]
}
```

Retrieves all categories sorted alphabetically by name. This endpoint is publicly accessible and does not require authentication.

## [​](https://kunmi.mintlify.app/api/categories/list-categories\#request)  Request

No request body or parameters required.

### [​](https://kunmi.mintlify.app/api/categories/list-categories\#headers)  Headers

No authentication required.

## [​](https://kunmi.mintlify.app/api/categories/list-categories\#response)  Response

[​](https://kunmi.mintlify.app/api/categories/list-categories#param-categories)

categories

array

Array of category objects

Show Category Object

[​](https://kunmi.mintlify.app/api/categories/list-categories#param-id)

\_id

string

Unique identifier for the category

[​](https://kunmi.mintlify.app/api/categories/list-categories#param-name)

name

string

Display name of the category

[​](https://kunmi.mintlify.app/api/categories/list-categories#param-slug)

slug

string

URL-friendly identifier for the category

[​](https://kunmi.mintlify.app/api/categories/list-categories#param-description)

description

string

Optional description of the category

[​](https://kunmi.mintlify.app/api/categories/list-categories#param-created-at)

createdAt

string

ISO 8601 timestamp of when the category was created

## [​](https://kunmi.mintlify.app/api/categories/list-categories\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/categories/list-categories#param-error)

error

string

Error message describing what went wrong

### [​](https://kunmi.mintlify.app/api/categories/list-categories\#500-internal-server-error)  500 - Internal Server Error

```
{
  "error": "Database connection failed"
}
```

## [​](https://kunmi.mintlify.app/api/categories/list-categories\#example-request)  Example Request

cURL

JavaScript

Python

```
curl https://api.vaniyk-empire.com/api/categories
```

```
const response = await fetch('https://api.vaniyk-empire.com/api/categories');
const data = await response.json();
console.log(data.categories);
```

```
import requests

response = requests.get('https://api.vaniyk-empire.com/api/categories')
data = response.json()
print(data['categories'])
```