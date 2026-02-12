const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Combined storage for all content uploads
const contentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'content';
    let resourceType = 'auto';

    // Determine resource type and folder based on file type
    if (file.fieldname === 'thumbnail') {
      folder = 'content/thumbnails';
      resourceType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'content/videos';
      resourceType = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'content/audio';
      resourceType = 'video';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'content/pdfs';
      resourceType = 'image';
    }

    return {
      folder: folder,
      resource_type: resourceType,
    };
  }
});

const uploadContent = multer({ 
  storage: contentStorage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

module.exports = {
  cloudinary,
  uploadContent
};