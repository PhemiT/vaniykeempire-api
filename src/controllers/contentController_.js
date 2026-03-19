const Content = require('../models/Content');
const Purchase = require('../models/Purchase');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

// Admin: Create content (handles file upload + content creation in one go)
exports.createContent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      category, 
      price, 
      status,
      tags 
    } = req.body;

    // Check if files were uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Content file is required' });
    }

    const file = req.files.file[0];
    const thumbnail = req.files.thumbnail ? req.files.thumbnail[0] : null;

    const content = await Content.create({
      title,
      description,
      type,
      category,
      price,
      fileUrl: file.path,
      filePublicId: file.filename,
      thumbnailUrl: thumbnail?.path || null,
      thumbnailPublicId: thumbnail?.filename || null,
      duration: file.duration || null,
      fileSize: file.bytes,
      status: status || 'draft',
      tags: tags ? JSON.parse(tags) : [],
      createdBy: req.mongoUser._id
    });

    await content.populate('createdBy', 'name email');

    res.status(201).json({ 
      message: 'Content created successfully',
      content 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update content
exports.updateContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const updates = req.body;

    const content = await Content.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Handle file updates if new files are uploaded
    if (req.files) {
      if (req.files.file) {
        // Delete old file from Cloudinary
        if (content.filePublicId) {
          const resourceType = content.type === 'pdf' ? 'image' : 'video';
          await cloudinary.uploader.destroy(content.filePublicId, {
            resource_type: resourceType
          });
        }

        // Update with new file
        const file = req.files.file[0];
        content.fileUrl = file.path;
        content.filePublicId = file.filename;
        content.duration = file.duration || content.duration;
        content.fileSize = file.bytes;
      }

      if (req.files.thumbnail) {
        // Delete old thumbnail from Cloudinary
        if (content.thumbnailPublicId) {
          await cloudinary.uploader.destroy(content.thumbnailPublicId);
        }

        // Update with new thumbnail
        const thumbnail = req.files.thumbnail[0];
        content.thumbnailUrl = thumbnail.path;
        content.thumbnailPublicId = thumbnail.filename;
      }
    }

    // Update text fields
    Object.keys(updates).forEach(key => {
      if (key === 'tags' && typeof updates[key] === 'string') {
        content[key] = JSON.parse(updates[key]);
      } else if (key !== 'file' && key !== 'thumbnail') {
        content[key] = updates[key];
      }
    });

    content.updatedAt = new Date();
    await content.save();
    await content.populate('createdBy', 'name email');

    res.json({ 
      message: 'Content updated successfully',
      content 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Delete content
exports.deleteContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Delete files from Cloudinary
    if (content.filePublicId) {
      const resourceType = content.type === 'pdf' ? 'image' : 'video';
      await cloudinary.uploader.destroy(content.filePublicId, {
        resource_type: resourceType
      });
    }

    if (content.thumbnailPublicId) {
      await cloudinary.uploader.destroy(content.thumbnailPublicId);
    }

    await Content.findByIdAndDelete(contentId);

    res.json({ message: 'Content and files deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public: List all published content (with pagination and filters)
exports.listContent = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      type,
      minPrice,
      maxPrice,
      search 
    } = req.query;

    const query = { status: 'published' };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const content = await Content.find(query)
      .select('-fileUrl -filePublicId') // Don't expose file URL in public listing
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Content.countDocuments(query);

    res.json({
      content,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalContent: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public: Get single content details (without file URL)
exports.getContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findOne({ 
      _id: contentId, 
      status: 'published' 
    })
    .select('-fileUrl -filePublicId')
    .populate('createdBy', 'name');
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User: Access purchased content (returns file URL)
exports.accessContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.mongoUser._id;

    // Check if user purchased this content
    const purchase = await Purchase.findOne({
      user: userId,
      content: contentId,
      status: 'completed'
    });

    if (!purchase) {
      return res.status(403).json({ 
        error: 'You need to purchase this content to access it' 
      });
    }

    const content = await Content.findOne({ 
      _id: contentId, 
      status: 'published' 
    })
    .populate('createdBy', 'name');
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User: Get user's purchased content
exports.getUserPurchases = async (req, res) => {
  try {
    const userId = req.mongoUser._id;
    const { page = 1, limit = 10 } = req.query;

    const purchases = await Purchase.find({
      user:   userId,
      status: 'completed',
    })
      .populate({
        path:   'content',
        select: 'title description type category price thumbnailUrl tags createdBy fileSize duration fileUrl status',
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ purchasedAt: -1 });

    const count = await Purchase.countDocuments({
      user:   userId,
      status: 'completed',
    });

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

// Admin: Get all content (including drafts)
exports.getAllContent = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      category,
      type 
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (type) query.type = type;

    const content = await Content.find(query)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Content.countDocuments(query);

    res.json({
      content,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalContent: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};