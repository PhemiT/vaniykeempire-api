> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/api/content/delete-content#content-area)

```
{
  "message": "Content and files deleted successfully"
}
```

Deletes content and all associated files from Cloudinary. This endpoint requires admin authentication.

This endpoint requires admin authentication. Include a valid JWT token in the Authorization header: `Bearer <token>`

## [​](https://kunmi.mintlify.app/api/content/delete-content\#path-parameters)  Path Parameters

[​](https://kunmi.mintlify.app/api/content/delete-content#param-content-id)

contentId

string

required

The unique identifier of the content to delete

## [​](https://kunmi.mintlify.app/api/content/delete-content\#request-headers)  Request Headers

[​](https://kunmi.mintlify.app/api/content/delete-content#param-authorization)

Authorization

string

required

Bearer token for admin authentication

## [​](https://kunmi.mintlify.app/api/content/delete-content\#response)  Response

[​](https://kunmi.mintlify.app/api/content/delete-content#param-message)

message

string

Success message

## [​](https://kunmi.mintlify.app/api/content/delete-content\#error-responses)  Error Responses

### [​](https://kunmi.mintlify.app/api/content/delete-content\#404-not-found)  404 Not Found

```
{
  "error": "Content not found"
}
```

### [​](https://kunmi.mintlify.app/api/content/delete-content\#401-unauthorized)  401 Unauthorized

Returned when authentication token is missing or invalid.

### [​](https://kunmi.mintlify.app/api/content/delete-content\#403-forbidden)  403 Forbidden

Returned when the authenticated user is not an admin.

### [​](https://kunmi.mintlify.app/api/content/delete-content\#500-internal-server-error)  500 Internal Server Error

```
{
  "error": "Error message"
}
```

This operation is irreversible. The content record will be deleted from the database, and all associated files (content file and thumbnail) will be permanently deleted from Cloudinary.

The endpoint automatically handles different resource types based on content type:

- PDF files are deleted as ‘image’ resource type
- Video and audio files are deleted as ‘video’ resource type
- Thumbnails are always deleted as ‘image’ resource type