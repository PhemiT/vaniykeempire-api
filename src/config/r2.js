const { S3Client, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto           = require('crypto');

const r2Client = new S3Client({
  region:   'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Generates a presigned PUT URL so the browser can upload directly to R2.
async function generatePresignedUploadUrl(key, contentType = 'video/mp4', expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket:      process.env.R2_BUCKET_NAME,
    Key:         key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
}

async function deleteFromR2(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key:    key,
  });
  return r2Client.send(command);
}

// Generates a HMAC-signed Worker URL for the HLS master playlist.
// The Worker validates this token before serving any R2 content.
function generateSignedVideoUrl(contentId, expiresInMs = 4 * 60 * 60 * 1000) {
  const path      = `videos/${contentId}/hls/master.m3u8`;
  const expiresAt = Date.now() + expiresInMs;
  const token     = crypto
    .createHmac('sha256', process.env.WORKER_SECRET)
    .update(`${path}:${expiresAt}`)
    .digest('hex');
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL.replace(/\/$/, '');
  return `${workerUrl}/${path}?token=${token}&expires=${expiresAt}`;
}

// Generates a HMAC-signed Worker URL for the preview virtual playlist.
// The Worker intercepts this path and builds a mini 2-segment playlist on the fly.
// expiresInMs is short (30 min) since previews are unauthenticated.
function generateSignedPreviewUrl(contentId, expiresInMs = 30 * 60 * 1000) {
  const path      = `videos/${contentId}/preview/playlist.m3u8`;
  const expiresAt = Date.now() + expiresInMs;
  const token     = crypto
    .createHmac('sha256', process.env.WORKER_SECRET)
    .update(`${path}:${expiresAt}`)
    .digest('hex');
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL.replace(/\/$/, '');
  return `${workerUrl}/${path}?token=${token}&expires=${expiresAt}`;
}

// Generates a signed Worker URL for the admin-uploaded preview HLS.
// Uses a distinct path (preview-hls) to avoid collision with the
// virtual dynamic-preview route (preview/playlist.m3u8).
function generateSignedPreviewVideoUrl(contentId, expiresInMs = 4 * 60 * 60 * 1000) {
  const path      = `videos/${contentId}/preview-hls/playlist.m3u8`;
  const expiresAt = Date.now() + expiresInMs;
  const token     = crypto
    .createHmac('sha256', process.env.WORKER_SECRET)
    .update(`${path}:${expiresAt}`)
    .digest('hex');
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL.replace(/\/$/, '');
  return `${workerUrl}/${path}?token=${token}&expires=${expiresAt}`;
}

module.exports = {
  r2Client,
  generatePresignedUploadUrl,
  deleteFromR2,
  generateSignedVideoUrl,
  generateSignedPreviewUrl,         
  generateSignedPreviewVideoUrl,   
};

