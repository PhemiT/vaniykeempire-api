> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/guides/uploading-content#content-area)

This guide covers the complete content management workflow for administrators: uploading files to Cloudinary, creating content entries, updating content, and managing the content lifecycle.

All endpoints in this guide require admin authentication. Include `Authorization: Bearer <admin_token>` in all requests.

## [​](https://kunmi.mintlify.app/guides/uploading-content\#content-upload-flow)  Content Upload Flow

1

Prepare content files

Gather the content file and an optional thumbnail:**Supported content types:**

- **Videos**: `.mp4`, `.mov`, `.avi` (uploaded to `content/videos`)
- **Audio**: `.mp3`, `.wav`, `.aac` (uploaded to `content/audio`)
- **PDFs**: `.pdf` (uploaded to `content/pdfs`)

**Thumbnail requirements:**

- Format: `.jpg`, `.png`, `.webp`
- Uploaded to: `content/thumbnails`
- Recommended size: 1280x720px

**File size limits:**

- Maximum: 500MB per file
- Configured in: `src/config/cloudinary.js:42-44`

2

Create content with files

Upload files and create content in a single request using `multipart/form-data`:

```
curl -X POST https://api.vaniykempire.com/admin/content \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "title=Advanced JavaScript Patterns" \
  -F "description=Deep dive into modern JavaScript design patterns and best practices for scalable applications" \
  -F "type=video" \
  -F "category=64abc123def456789" \
  -F "price=29.99" \
  -F "status=published" \
  -F "tags=[\"javascript\",\"patterns\",\"advanced\"]" \
  -F "file=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg"
```

**Required fields:**

- `title`: Content title
- `description`: Detailed description
- `type`: Content type (`video`, `audio`, `pdf`)
- `category`: Category ID (must exist in MongoDB)
- `price`: Price in USD (numeric)
- `file`: Content file (required)

**Optional fields:**

- `thumbnail`: Thumbnail image file
- `status`: `draft` or `published` (default: `draft`)
- `tags`: JSON array of tags

**Response:**

```
{
  "message": "Content created successfully",
  "content": {
    "_id": "64def789abc123456",
    "title": "Advanced JavaScript Patterns",
    "description": "Deep dive into modern JavaScript design patterns...",
    "type": "video",
    "category": "64abc123def456789",
    "price": 29.99,
    "fileUrl": "https://res.cloudinary.com/vaniyk/video/upload/v1709467200/content/videos/abc123.mp4",
    "filePublicId": "content/videos/abc123",
    "thumbnailUrl": "https://res.cloudinary.com/vaniyk/image/upload/v1709467200/content/thumbnails/xyz789.jpg",
    "thumbnailPublicId": "content/thumbnails/xyz789",
    "duration": 3600,
    "fileSize": 524288000,
    "status": "published",
    "tags": ["javascript", "patterns", "advanced"],
    "createdBy": {
      "_id": "64abc789def123456",
      "name": "Admin User",
      "email": "admin@vaniykempire.com"
    },
    "createdAt": "2026-03-03T14:30:00.000Z",
    "updatedAt": "2026-03-03T14:30:00.000Z"
  }
}
```

**What happens:**

1. Files are uploaded to Cloudinary with automatic folder organization
2. Cloudinary returns URLs and public IDs
3. Content metadata is saved to MongoDB
4. File metadata (size, duration) is extracted automatically

## [​](https://kunmi.mintlify.app/guides/uploading-content\#cloudinary-configuration)  Cloudinary Configuration

The API automatically organizes uploads into folders based on content type:**Folder structure:**

```
content/
├── videos/          # Video files (.mp4, .mov, .avi)
├── audio/           # Audio files (.mp3, .wav, .aac)
├── pdfs/            # PDF documents
└── thumbnails/      # Thumbnail images
```

**Resource types:**

- **Videos/Audio**: `resource_type: 'video'`
- **PDFs**: `resource_type: 'image'`
- **Thumbnails**: `resource_type: 'image'`

Cloudinary configuration is handled automatically. See `src/config/cloudinary.js:12-38` for implementation details.

## [​](https://kunmi.mintlify.app/guides/uploading-content\#update-existing-content)  Update Existing Content

1

Update metadata only

Update text fields without changing files:

```
curl -X PUT https://api.vaniykempire.com/admin/content/64def789abc123456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced JavaScript Design Patterns",
    "description": "Updated description with more details",
    "price": 34.99,
    "status": "published",
    "tags": ["javascript", "patterns", "advanced", "es6"]
  }'
```

**Response:**

```
{
  "message": "Content updated successfully",
  "content": {
    "_id": "64def789abc123456",
    "title": "Advanced JavaScript Design Patterns",
    "description": "Updated description with more details",
    "price": 34.99,
    "status": "published",
    "tags": ["javascript", "patterns", "advanced", "es6"],
    "updatedAt": "2026-03-03T15:45:00.000Z"
  }
}
```

2

Replace content file

Update the content file (old file is automatically deleted from Cloudinary):

```
curl -X PUT https://api.vaniykempire.com/admin/content/64def789abc123456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "title=Advanced JavaScript Design Patterns" \
  -F "file=@/path/to/updated-video.mp4"
```

**What happens:**

1. Old file is deleted from Cloudinary using `filePublicId`
2. New file is uploaded to Cloudinary
3. MongoDB record is updated with new URLs and metadata

The `resource_type` for deletion is determined automatically based on content type.

3

Replace thumbnail

Update just the thumbnail:

```
curl -X PUT https://api.vaniykempire.com/admin/content/64def789abc123456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "thumbnail=@/path/to/new-thumbnail.jpg"
```

Old thumbnail is deleted from Cloudinary before uploading the new one.

## [​](https://kunmi.mintlify.app/guides/uploading-content\#content-lifecycle-management)  Content Lifecycle Management

### [​](https://kunmi.mintlify.app/guides/uploading-content\#draft-to-published)  Draft to Published

Content can be created as drafts and published later:

```
# Create as draft
curl -X POST https://api.vaniykempire.com/admin/content \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "status=draft" \
  -F "title=New Course" \
  -F "file=@course.mp4" \
  # ... other fields

# Publish later
curl -X PUT https://api.vaniykempire.com/admin/content/64def789abc123456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

**Status options:**

- `draft`: Not visible to public, admin-only
- `published`: Visible in public listings, available for purchase

### [​](https://kunmi.mintlify.app/guides/uploading-content\#view-all-content-admin)  View All Content (Admin)

Admins can view all content including drafts:

```
curl -X GET "https://api.vaniykempire.com/admin/content?page=1&limit=20&status=draft&category=64abc123def456789&type=video" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Query parameters:**

- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (`draft`, `published`)
- `category`: Filter by category ID
- `type`: Filter by type (`video`, `audio`, `pdf`)

**Response:**

```
{
  "content": [\
    {\
      "_id": "64def789abc123456",\
      "title": "Advanced JavaScript Patterns",\
      "description": "Deep dive into modern JavaScript design patterns...",\
      "type": "video",\
      "category": "64abc123def456789",\
      "price": 29.99,\
      "fileUrl": "https://res.cloudinary.com/vaniyk/video/upload/v1/content/videos/abc123.mp4",\
      "thumbnailUrl": "https://res.cloudinary.com/vaniyk/image/upload/v1/content/thumbnails/xyz789.jpg",\
      "status": "published",\
      "createdBy": {\
        "_id": "64abc789def123456",\
        "name": "Admin User",\
        "email": "admin@vaniykempire.com"\
      },\
      "createdAt": "2026-03-01T10:00:00.000Z",\
      "updatedAt": "2026-03-01T10:00:00.000Z"\
    }\
  ],
  "totalPages": 3,
  "currentPage": 1,
  "totalContent": 52
}
```

## [​](https://kunmi.mintlify.app/guides/uploading-content\#delete-content)  Delete Content

Permanently delete content and associated files:

```
curl -X DELETE https://api.vaniykempire.com/admin/content/64def789abc123456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkjXVCJ9..."
```

**Response:**

```
{
  "message": "Content and files deleted successfully"
}
```

**What happens:**

1. Content file is deleted from Cloudinary (using `filePublicId`)
2. Thumbnail is deleted from Cloudinary (if exists)
3. MongoDB document is removed

Deletion is permanent and cannot be undone. Associated purchase records remain for accounting purposes.

## [​](https://kunmi.mintlify.app/guides/uploading-content\#error-handling)  Error Handling

| Status Code | Error | Description |
| --- | --- | --- |
| 400 | Bad request | Missing required fields or invalid file format |
| 401 | Unauthorized | Missing or invalid admin token |
| 403 | Forbidden | User is not an admin |
| 404 | Not found | Content doesn’t exist |
| 413 | Payload too large | File exceeds 500MB limit |
| 500 | Server error | Cloudinary or database error |

**Example error response:**

```
{
  "error": "Content file is required"
}
```

## [​](https://kunmi.mintlify.app/guides/uploading-content\#best-practices)  Best Practices

**File Optimization**:

- Compress videos before upload (target: H.264 codec, 1080p max)
- Optimize thumbnails (target: 1280x720px, JPEG quality 85%)
- Use descriptive filenames (they appear in Cloudinary)

**Content Organization**:

- Create content as `draft` first, review, then publish
- Use consistent tagging for better searchability
- Include comprehensive descriptions for SEO
- Set thumbnails to improve visual appeal in listings

**Important Notes**:

- File uploads use `multipart/form-data`, not JSON
- Tags must be a JSON string: `tags="[\"tag1\",\"tag2\"]"`
- Category IDs must exist in the database before creating content
- Cloudinary URLs are permanent once generated

## [​](https://kunmi.mintlify.app/guides/uploading-content\#testing-file-uploads)  Testing File Uploads

**Using Postman:**

1. Set method to `POST` or `PUT`
2. Set Authorization header with Bearer token
3. Select Body → form-data
4. Add text fields (title, description, etc.)
5. Add file fields (file, thumbnail) and select files
6. Send request

**Using cURL:**

```
# Store token in variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Create content
curl -X POST https://api.vaniykempire.com/admin/content \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Video" \
  -F "description=Test description" \
  -F "type=video" \
  -F "category=64abc123def456789" \
  -F "price=9.99" \
  -F "file=@./test-video.mp4" \
  -F "thumbnail=@./test-thumbnail.jpg"
```

## [​](https://kunmi.mintlify.app/guides/uploading-content\#environment-setup)  Environment Setup

Required environment variables:

```
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin Authentication
ADMIN_SECRET_KEY=your-admin-secret
```

Cloudinary credentials are available in your Cloudinary dashboard under Account Details.

### [​](https://kunmi.mintlify.app/guides/uploading-content\#source-code-references)  Source Code References

- Create content: `src/controllers/contentController.js:7`
- Update content: `src/controllers/contentController.js:56`
- Delete content: `src/controllers/contentController.js:122`
- Cloudinary config: `src/config/cloudinary.js:1`
- Upload middleware: `src/config/cloudinary.js:40`

## [​](https://kunmi.mintlify.app/guides/uploading-content\#next-steps)  Next Steps

[**Content API Reference** \\
\\
Detailed API documentation for content endpoints](https://kunmi.mintlify.app/api-reference/content/create-content)

[**Payment Management** \\
\\
View and manage purchases as admin](https://kunmi.mintlify.app/api-reference/payments/get-all-payments)