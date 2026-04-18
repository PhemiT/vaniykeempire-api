const Content  = require('../models/Content');
const Purchase = require('../models/Purchase');
const Category = require('../models/Category');
const { cloudinary, uploadVideoChunked, uploadThumbnailFromDisk, generateUploadSignature } = require('../config/cloudinary');

// ─── Helpers ───────────────────────────────────────────────────────────────

// Determines whether a content type uses Cloudinary's 'video' resource_type.
// (Cloudinary stores audio under 'video' resource_type as well.)
function getResourceType(contentType) {
  if (contentType === 'pdf') return 'raw';
  return 'video'; // covers 'video' and 'audio'
}

// When the request came through uploadVideo (disk multer), thumbnail is also
// on disk and needs to be uploaded manually to Cloudinary.
async function resolveThumbnail(files, fromDisk = false) {
  if (!files?.thumbnail?.[0]) return { thumbnailUrl: null, thumbnailPublicId: null };

  const thumb = files.thumbnail[0];

  if (fromDisk) {
    const result = await uploadThumbnailFromDisk(thumb.path);
    return { thumbnailUrl: result.secure_url, thumbnailPublicId: result.public_id };
  }

  // Standard CloudinaryStorage — path and filename are already set by multer
  return { thumbnailUrl: thumb.path, thumbnailPublicId: thumb.filename };
}

exports.getUploadSignature = (req, res) => {
  try {
    const sig = generateUploadSignature();
    res.json(sig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createContentDirect = async (req, res) => {
  try {
    const { title, description, type, category, price, status, tags, fileUrl, filePublicId, fileSize, duration } = req.body;

    const fromDisk = false;
    const { thumbnailUrl, thumbnailPublicId } = await resolveThumbnail(req.files, fromDisk);

    const content = await Content.create({
      title, description, type, category, price,
      fileUrl, filePublicId, fileSize: fileSize ? Number(fileSize) : null,
      duration: duration ? Number(duration) : null,
      thumbnailUrl, thumbnailPublicId,
      status: status || 'draft',
      tags:   tags ? JSON.parse(tags) : [],
      createdBy: req.mongoUser._id,
    });

    await content.populate('createdBy', 'name email');
    res.status(201).json({ message: 'Content created successfully', content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContentDirect = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { fileUrl, filePublicId, fileSize, duration, ...updates } = req.body;

    const content = await Content.findById(contentId);
    if (!content) return res.status(404).json({ error: 'Content not found' });

    if (fileUrl) {
      // Delete old file from Cloudinary
      if (content.filePublicId) {
        await cloudinary.uploader.destroy(content.filePublicId, { resource_type: 'video' });
      }
      content.fileUrl      = fileUrl;
      content.filePublicId = filePublicId;
      content.fileSize     = fileSize ? Number(fileSize) : content.fileSize;
      content.duration     = duration ? Number(duration) : content.duration;
    }

    if (req.files?.thumbnail) {
      if (content.thumbnailPublicId) {
        await cloudinary.uploader.destroy(content.thumbnailPublicId, { resource_type: 'image' });
      }
      const { thumbnailUrl, thumbnailPublicId } = await resolveThumbnail(req.files, false);
      content.thumbnailUrl      = thumbnailUrl;
      content.thumbnailPublicId = thumbnailPublicId;
    }

    Object.keys(updates).forEach((key) => {
      if (key === 'tags' && typeof updates[key] === 'string') {
        content[key] = JSON.parse(updates[key]);
      } else {
        content[key] = updates[key];
      }
    });

    content.updatedAt = new Date();
    await content.save();
    await content.populate('createdBy', 'name email');
    res.json({ message: 'Content updated successfully', content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Create content ─────────────────────────────────────────────────
exports.createContent = async (req, res) => {
  try {
    const { title, description, type, category, price, status, tags } = req.body;

    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Content file is required' });
    }

    const tempFile = req.files.file[0];
    const fromDisk = type === 'video'; // video route uses disk storage

    let fileUrl, filePublicId, fileSize, duration;

    if (fromDisk) {
      // tempFile.path is the local disk path — use chunked upload
      const result = await uploadVideoChunked(tempFile.path);
      fileUrl      = result.secure_url;
      filePublicId = result.public_id;
      fileSize     = result.bytes;
      duration     = result.duration ?? null;
    } else {
      // Standard CloudinaryStorage already uploaded the file
      fileUrl      = tempFile.path;
      filePublicId = tempFile.filename;
      fileSize     = tempFile.bytes;
      duration     = tempFile.duration ?? null;
    }

    const { thumbnailUrl, thumbnailPublicId } = await resolveThumbnail(req.files, fromDisk);

    const content = await Content.create({
      title,
      description,
      type,
      category,
      price,
      fileUrl,
      filePublicId,
      fileSize,
      duration,
      thumbnailUrl,
      thumbnailPublicId,
      status:    status || 'draft',
      tags:      tags ? JSON.parse(tags) : [],
      createdBy: req.mongoUser._id,
    });

    await content.populate('createdBy', 'name email');

    res.status(201).json({ message: 'Content created successfully', content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Update content ─────────────────────────────────────────────────
exports.updateContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const updates  = req.body;
    const fromDisk = updates.type === 'video' || req.route?.path?.includes('/video/');

    const content = await Content.findById(contentId);
    if (!content) return res.status(404).json({ error: 'Content not found' });

    // ── Replace main file if a new one was uploaded ──
    if (req.files?.file) {
      // Delete old file from Cloudinary
      if (content.filePublicId) {
        await cloudinary.uploader.destroy(content.filePublicId, {
          resource_type: getResourceType(content.type),
        });
      }

      const tempFile = req.files.file[0];

      if (fromDisk) {
        const result       = await uploadVideoChunked(tempFile.path);
        content.fileUrl    = result.secure_url;
        content.filePublicId = result.public_id;
        content.fileSize   = result.bytes;
        content.duration   = result.duration ?? content.duration;
      } else {
        content.fileUrl      = tempFile.path;
        content.filePublicId = tempFile.filename;
        content.fileSize     = tempFile.bytes;
        content.duration     = tempFile.duration ?? content.duration;
      }
    }

    // ── Replace thumbnail if a new one was uploaded ──
    if (req.files?.thumbnail) {
      if (content.thumbnailPublicId) {
        await cloudinary.uploader.destroy(content.thumbnailPublicId, {
          resource_type: 'image',
        });
      }

      const { thumbnailUrl, thumbnailPublicId } = await resolveThumbnail(req.files, fromDisk);
      content.thumbnailUrl      = thumbnailUrl;
      content.thumbnailPublicId = thumbnailPublicId;
    }

    // ── Update scalar fields ──
    Object.keys(updates).forEach((key) => {
      if (['file', 'thumbnail'].includes(key)) return; // skip file fields
      if (key === 'tags' && typeof updates[key] === 'string') {
        content[key] = JSON.parse(updates[key]);
      } else {
        content[key] = updates[key];
      }
    });

    content.updatedAt = new Date();
    await content.save();
    await content.populate('createdBy', 'name email');

    res.json({ message: 'Content updated successfully', content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Delete content ─────────────────────────────────────────────────
exports.deleteContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId);
    if (!content) return res.status(404).json({ error: 'Content not found' });

    if (content.filePublicId) {
      await cloudinary.uploader.destroy(content.filePublicId, {
        resource_type: getResourceType(content.type),
      });
    }

    if (content.thumbnailPublicId) {
      await cloudinary.uploader.destroy(content.thumbnailPublicId, {
        resource_type: 'image',
      });
    }

    await Content.findByIdAndDelete(contentId);

    res.json({ message: 'Content and files deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Public: List published content ───────────────────────────────────────
exports.listContent = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      type,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const query = { status: 'published' };

    if (category) query.category = category;
    if (type)     query.type     = type;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const content = await Content.find(query)
      .select('-fileUrl -filePublicId')
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Content.countDocuments(query);

    res.json({
      content,
      totalPages:   Math.ceil(count / limit),
      currentPage:  Number(page),
      totalContent: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Public: Get single content (no file URL) ─────────────────────────────
exports.getContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findOne({ _id: contentId, status: 'published' })
      .select('-fileUrl -filePublicId')
      .populate('createdBy', 'name');

    if (!content) return res.status(404).json({ error: 'Content not found' });

    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── User: Access purchased content (returns file URL) ────────────────────
exports.accessContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.mongoUser._id;

    const purchase = await Purchase.findOne({
      user:    userId,
      content: contentId,
      status:  'completed',
    });

    if (!purchase) {
      return res.status(403).json({
        error: 'You need to purchase this content to access it',
      });
    }

    const content = await Content.findOne({ _id: contentId, status: 'published' })
      .populate('createdBy', 'name');

    if (!content) return res.status(404).json({ error: 'Content not found' });

    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── User: Get user's purchased content ───────────────────────────────────
exports.getUserPurchases = async (req, res) => {
  try {
    const userId       = req.mongoUser._id;
    const { page = 1, limit = 10 } = req.query;

    const purchases = await Purchase.find({ user: userId, status: 'completed' })
      .populate({
        path:   'content',
        select: 'title description type category price thumbnailUrl tags createdBy fileSize duration fileUrl status',
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ purchasedAt: -1 });

    const count = await Purchase.countDocuments({ user: userId, status: 'completed' });

    res.json({
      purchases,
      totalPages:     Math.ceil(count / limit),
      currentPage:    Number(page),
      totalPurchases: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Get all content (including drafts) ────────────────────────────
exports.getAllContent = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, type } = req.query;

    const query = {};
    if (status)   query.status   = status;
    if (category) query.category = category;
    if (type)     query.type     = type;

    const content = await Content.find(query)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Content.countDocuments(query);

    res.json({
      content,
      totalPages:   Math.ceil(count / limit),
      currentPage:  Number(page),
      totalContent: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContentAdmin = async (req, res) => {
  try {
    const { contentId } = req.params;
    const content = await Content.findById(contentId)
      .populate('createdBy', 'name email');
    if (!content) return res.status(404).json({ error: 'Content not found' });
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};