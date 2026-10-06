> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/categories/delete-category#content-area)

Delete Category

cURL

```
curl --request DELETE \
  --url https://api.example.com/api/categories/:categoryId \
  --header 'Authorization: <authorization>'
```

```
import requests

url = "https://api.example.com/api/categories/:categoryId"

headers = {"Authorization": "<authorization>"}

response = requests.delete(url, headers=headers)

print(response.text)
```

```
const options = {method: 'DELETE', headers: {Authorization: '<authorization>'}};

fetch('https://api.example.com/api/categories/:categoryId', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/categories/:categoryId",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "DELETE",\
  CURLOPT_HTTPHEADER => [\
    "Authorization: <authorization>"\
  ],\
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

	url := "https://api.example.com/api/categories/:categoryId"

	req, _ := http.NewRequest("DELETE", url, nil)

	req.Header.Add("Authorization", "<authorization>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.delete("https://api.example.com/api/categories/:categoryId")
  .header("Authorization", "<authorization>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/categories/:categoryId")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(url)
request["Authorization"] = '<authorization>'

response = http.request(request)
puts response.read_body
```

```
{
  "message": "Category deleted successfully"
}
```

DELETE

/

api

/

categories

/

:categoryId

Try it

Delete Category

cURL

```
curl --request DELETE \
  --url https://api.example.com/api/categories/:categoryId \
  --header 'Authorization: <authorization>'
```

```
import requests

url = "https://api.example.com/api/categories/:categoryId"

headers = {"Authorization": "<authorization>"}

response = requests.delete(url, headers=headers)

print(response.text)
```

```
const options = {method: 'DELETE', headers: {Authorization: '<authorization>'}};

fetch('https://api.example.com/api/categories/:categoryId', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/categories/:categoryId",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "DELETE",\
  CURLOPT_HTTPHEADER => [\
    "Authorization: <authorization>"\
  ],\
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

	url := "https://api.example.com/api/categories/:categoryId"

	req, _ := http.NewRequest("DELETE", url, nil)

	req.Header.Add("Authorization", "<authorization>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.delete("https://api.example.com/api/categories/:categoryId")
  .header("Authorization", "<authorization>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/categories/:categoryId")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(url)
request["Authorization"] = '<authorization>'

response = http.request(request)
puts response.read_body
```

```
{
  "message": "Category deleted successfully"
}
```

Permanently deletes a category from the system. This endpoint requires admin authentication.

This endpoint requires admin privileges. You must include a valid JWT token with admin role in the Authorization header.

This operation is irreversible. Make sure you want to permanently delete the category before proceeding.

## [​](https://kunmi.mintlify.app/api/categories/delete-category\#request)  Request

### [​](https://kunmi.mintlify.app/api/categories/delete-category\#path-parameters)  Path Parameters

[​](https://kunmi.mintlify.app/api/categories/delete-category#param-category-id)

categoryId

string

required

The unique MongoDB ObjectId of the category to delete

### [​](https://kunmi.mintlify.app/api/categories/delete-category\#headers)  Headers

[​](https://kunmi.mintlify.app/api/categories/delete-category#param-authorization)

Authorization

string

required

Bearer token with admin privilegesExample: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## [​](https://kunmi.mintlify.app/api/categories/delete-category\#response)  Response

[​](https://kunmi.mintlify.app/api/categories/delete-category#param-message)

message

string

Success message confirming the deletion

## [​](https://kunmi.mintlify.app/api/categories/delete-category\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/categories/delete-category#param-error)

error

string

Error message describing what went wrong

### [​](https://kunmi.mintlify.app/api/categories/delete-category\#404-category-not-found)  404 - Category Not Found

Returned when no category exists with the specified ID.

```
{
  "error": "Category not found"
}
```

### [​](https://kunmi.mintlify.app/api/categories/delete-category\#401-unauthorized)  401 - Unauthorized

Returned when the authentication token is missing or invalid.

```
{
  "error": "No token provided"
}
```

### [​](https://kunmi.mintlify.app/api/categories/delete-category\#403-forbidden)  403 - Forbidden

Returned when the authenticated user is not an admin.

```
{
  "error": "Admin access required"
}
```

### [​](https://kunmi.mintlify.app/api/categories/delete-category\#500-internal-server-error)  500 - Internal Server Error

```
{
  "error": "Database connection failed"
}
```

## [​](https://kunmi.mintlify.app/api/categories/delete-category\#example-request)  Example Request

cURL

JavaScript

Python

```
curl -X DELETE https://api.vaniyk-empire.com/api/categories/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

```
const categoryId = '507f1f77bcf86cd799439011';

const response = await fetch(`https://api.vaniyk-empire.com/api/categories/${categoryId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  }
});

const data = await response.json();
console.log(data.message);
```

```
import requests

category_id = '507f1f77bcf86cd799439011'

headers = {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
}

response = requests.delete(
    f'https://api.vaniyk-empire.com/api/categories/{category_id}',
    headers=headers
)

data = response.json()
print(data['message'])
```

## [​](https://kunmi.mintlify.app/api/categories/delete-category\#notes)  Notes

- The deletion is permanent and cannot be undone
- The `categoryId` parameter must be a valid MongoDB ObjectId
- Consider the impact on any content (articles, posts, etc.) that may be associated with this category before deletion