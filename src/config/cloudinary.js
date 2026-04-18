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

// ─── Standard Cloudinary storage (PDFs, audio, images) ────────────────────
// Streams directly to Cloudinary. Fine for files well under 1GB.
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
    // Fallback — non-video files only
    return { folder: 'content', resource_type: 'auto' };
  },
});

// ─── Disk storage (video files) ────────────────────────────────────────────
// Cloudinary's upload_large() requires a file path, not a stream.
// We write to /tmp first, upload in chunks, then delete the temp file.
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

// ─── Chunked video uploader ────────────────────────────────────────────────
// Splits large files into 100MB chunks — bypasses Cloudinary's 1GB HTTP limit.
const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB

async function uploadVideoChunked(filePath, folder = 'content/videos') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        folder,
        resource_type: 'video',
        chunk_size: CHUNK_SIZE,
      },
      (error, result) => {
        // Always clean up the temp file, regardless of outcome
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.warn('Failed to delete temp file:', filePath, unlinkErr.message);
        });
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

// ─── Thumbnail chunked uploader ────────────────────────────────────────────
// Used when thumbnail arrives via the disk (uploadVideo) multer instance.
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
  limits:  { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB multer cap (Cloudinary hard-limits at 1GB for streaming)
});

// For video files — saves to disk so upload_large() can read the path
const uploadVideo = multer({
  storage: diskStorage,
  limits:  { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file' && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are accepted on this route'));
    }
    cb(null, true);
  },
});

module.exports = {
  cloudinary,
  uploadContent,
  uploadVideo,
  uploadVideoChunked,
  uploadThumbnailFromDisk,
};