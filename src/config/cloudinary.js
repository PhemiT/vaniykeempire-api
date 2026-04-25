const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Standard Cloudinary storage (PDFs, audio, thumbnails) ────────────────
// Streams directly to Cloudinary.
const contentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'thumbnail') {
      return { folder: 'content/thumbnails', resource_type: 'image' };
    }
    if (file.mimetype.startsWith('audio/')) {
      return { folder: 'content/audio', resource_type: 'video' };
    }
    if (file.mimetype === 'application/pdf') {
      return { folder: 'content/pdfs', resource_type: 'raw' };
    }
    return { folder: 'content', resource_type: 'auto' };
  },
});

// ─── Disk storage ──────────────────────────────────────────────────────────
// Used for video uploads — the controller reads the file from disk,
// streams it to R2, then deletes the temp file.
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = '/tmp/uploads';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// ─── Thumbnail uploader from disk ─────────────────────────────────────────
// Used when a thumbnail arrives alongside a video upload (disk storage path).
async function uploadThumbnailFromDisk(filePath, folder = 'content/thumbnails') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder, resource_type: 'image' },
      (error, result) => {
        fs.unlink(filePath, () => {});
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

// ─── Multer instances ──────────────────────────────────────────────────────

// For PDFs, audio, thumbnails — streams to Cloudinary
const uploadContent = multer({
  storage: contentStorage,
  limits:  { fileSize: 2 * 1024 * 1024 * 1024 },
});

// For video files — saves to disk so the controller can stream to R2
const uploadVideo = multer({
  storage: diskStorage,
  limits:  { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file' && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are accepted on this route'));
    }
    cb(null, true);
  },
});

function generateUploadSignature(folder = 'content/videos') {
  const timestamp = Math.round(Date.now() / 1000);
  const params    = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  return {
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
  };
}

module.exports = {
  cloudinary,
  uploadContent,
  uploadVideo,
  uploadThumbnailFromDisk,
  generateUploadSignature,
};