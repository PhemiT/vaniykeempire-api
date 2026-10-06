> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/auth/profile#content-area)

Get User Profile

cURL

```
curl --request GET \
  --url https://api.example.com/api/auth/profile
```

```
import requests

url = "https://api.example.com/api/auth/profile"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://api.example.com/api/auth/profile', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/auth/profile",\
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

	url := "https://api.example.com/api/auth/profile"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.example.com/api/auth/profile")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/auth/profile")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

200

```
{
  "user": {
    "_id": "<string>",
    "supabaseId": "<string>",
    "email": "<string>",
    "name": "<string>",
    "role": "<string>",
    "emailVerified": true,
    "createdAt": "<string>",
    "updatedAt": "<string>"
  },
  "error": "<string>"
}
```

GET

/

api

/

auth

/

profile

Try it

Get User Profile

cURL

```
curl --request GET \
  --url https://api.example.com/api/auth/profile
```

```
import requests

url = "https://api.example.com/api/auth/profile"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://api.example.com/api/auth/profile', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://api.example.com/api/auth/profile",\
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

	url := "https://api.example.com/api/auth/profile"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://api.example.com/api/auth/profile")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://api.example.com/api/auth/profile")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

200

```
{
  "user": {
    "_id": "<string>",
    "supabaseId": "<string>",
    "email": "<string>",
    "name": "<string>",
    "role": "<string>",
    "emailVerified": true,
    "createdAt": "<string>",
    "updatedAt": "<string>"
  },
  "error": "<string>"
}
```

## [​](https://kunmi.mintlify.app/api/auth/profile\#overview)  Overview

Retrieves the profile information for the currently authenticated user. This endpoint requires a valid JWT token and returns the user’s MongoDB profile data.

## [​](https://kunmi.mintlify.app/api/auth/profile\#authentication)  Authentication

This endpoint requires authentication. Include a valid access token in the Authorization header.

```
Authorization: Bearer <access_token>
```

## [​](https://kunmi.mintlify.app/api/auth/profile\#request)  Request

No request body or parameters required. The user is identified from the JWT token.

cURL

```
curl -X GET "https://api.vaniykempire.com/api/auth/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

JavaScript

```
const response = await fetch('https://api.vaniykempire.com/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();
console.log(data.user);
```

Python

```
import requests

response = requests.get(
    'https://api.vaniykempire.com/api/auth/profile',
    headers={
        'Authorization': f'Bearer {access_token}'
    }
)

data = response.json()
print(data['user'])
```

## [​](https://kunmi.mintlify.app/api/auth/profile\#response)  Response

[​](https://kunmi.mintlify.app/api/auth/profile#param-user)

user

object

The user’s profile information

Showuser properties

[​](https://kunmi.mintlify.app/api/auth/profile#param-id)

\_id

string

MongoDB user ID

[​](https://kunmi.mintlify.app/api/auth/profile#param-supabase-id)

supabaseId

string

Supabase user ID (links to authentication system)

[​](https://kunmi.mintlify.app/api/auth/profile#param-email)

email

string

User’s email address

[​](https://kunmi.mintlify.app/api/auth/profile#param-name)

name

string

User’s full name

[​](https://kunmi.mintlify.app/api/auth/profile#param-role)

role

string

User role - either `"user"` or `"admin"`

[​](https://kunmi.mintlify.app/api/auth/profile#param-email-verified)

emailVerified

boolean

Whether the user’s email has been verified

[​](https://kunmi.mintlify.app/api/auth/profile#param-created-at)

createdAt

string

ISO 8601 timestamp of account creation

[​](https://kunmi.mintlify.app/api/auth/profile#param-updated-at)

updatedAt

string

ISO 8601 timestamp of last profile update

### [​](https://kunmi.mintlify.app/api/auth/profile\#success-response)  Success Response

```
{
  "user": {
    "_id": "65f7b3c8e1234567890abcde",
    "supabaseId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "emailVerified": true,
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

## [​](https://kunmi.mintlify.app/api/auth/profile\#error-responses)  Error Responses

[​](https://kunmi.mintlify.app/api/auth/profile#param-error)

error

string

Error message describing what went wrong

### [​](https://kunmi.mintlify.app/api/auth/profile\#401-unauthorized)  401 Unauthorized

Returned when the access token is missing, invalid, or expired.

```
{
  "error": "Invalid token"
}
```

### [​](https://kunmi.mintlify.app/api/auth/profile\#404-not-found)  404 Not Found

Returned when the user record doesn’t exist in MongoDB (rare case).

```
{
  "error": "User not found"
}
```

### [​](https://kunmi.mintlify.app/api/auth/profile\#500-internal-server-error)  500 Internal Server Error

Returned when a server error occurs.

```
{
  "error": "Internal server error message"
}
```

## [​](https://kunmi.mintlify.app/api/auth/profile\#notes)  Notes

The profile endpoint uses the JWT token to identify the user, so you don’t need to pass a user ID. Each user can only access their own profile.

This endpoint returns data from MongoDB, not Supabase. It includes the `supabaseId` field which links the MongoDB record to the Supabase authentication record.

## [​](https://kunmi.mintlify.app/api/auth/profile\#related-endpoints)  Related Endpoints

- [Signup](https://kunmi.mintlify.app/api/auth/signup) \- Create a new user account
- [Login](https://kunmi.mintlify.app/api/auth/login) \- Authenticate and get an access token