const Content  = require('../models/Content');
const Purchase = require('../models/Purchase');
const Category = require('../models/Category');
const { cloudinary, uploadThumbnailFromDisk, generateUploadSignature } = require('../config/cloudinary');
const { generatePresignedUploadUrl, deleteFromR2, generateSignedVideoUrl } = require('../config/r2');

// ─── Helpers ───────────────────────────────────────────────────────────────

function getResourceType(contentType) {
  if (contentType === 'pdf') return 'raw';
  return 'video'; // covers 'video' and 'audio'
}

async function resolveThumbnail(files, fromDisk = false) {
  if (!files?.thumbnail?.[0]) return { thumbnailUrl: null, thumbnailPublicId: null };

  const thumb = files.thumbnail[0];

  if (fromDisk) {
    const result = await uploadThumbnailFromDisk(thumb.path);
    return { thumbnailUrl: result.secure_url, thumbnailPublicId: result.public_id };
  }

  return { thumbnailUrl: thumb.path, thumbnailPublicId: thumb.filename };
}

// Triggers the GitHub Actions transcode workflow via workflow_dispatch.
async function triggerTranscode(contentId, r2Key) {
  const url = `https://api.github.com/repos/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/actions/workflows/transcode.yml/dispatches`;

  const resp = await fetch(url, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept:         'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref:    'main',
      inputs: { contentId, r2Key },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GitHub Actions dispatch failed: ${resp.status} ${text}`);
  }
}

// ─── Admin: Get presigned R2 upload URL (browser uploads directly to R2) ──
// Returns a presigned PUT URL and the R2 key the browser should use.
// The key is deterministic so the controller can reference it after upload.
exports.getVideoUploadUrl = async (req, res) => {
  try {
    const { contentId, contentType = 'video/mp4' } = req.query;
    if (!contentId) return res.status(400).json({ error: 'contentId is required' });

    const ext = contentType === 'video/quicktime' ? '.mov'
              : contentType === 'video/webm'       ? '.webm'
              : '.mp4';
    const key = `videos/${contentId}/raw/original${ext}`;
    const url = await generatePresignedUploadUrl(key, contentType);

    res.json({ uploadUrl: url, r2Key: key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Upload signature (direct browser → Cloudinary, unused for video) ──────
exports.getUploadSignature = (req, res) => {
  try {
    const sig = generateUploadSignature();
    res.json(sig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Direct-upload helpers (browser → Cloudinary, then POST metadata) ──────
exports.createContentDirect = async (req, res) => {
  try {
    const { title, description, type, category, price, status, tags, fileUrl, filePublicId, fileSize, duration } = req.body;

    const { thumbnailUrl, thumbnailPublicId } = await resolveThumbnail(req.files, false);

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
    const isVideo = type === 'video';

    if (isVideo) {
      // Video was already uploaded to R2 directly from the browser.
      // The browser passes back the r2Key and fileSize it received.
      const { r2Key, fileSize } = req.body;
      if (!r2Key) return res.status(400).json({ error: 'r2Key is required for video uploads' });

      const { thumbnailUrl, thumbnailPublicId } = await resolveThumbnail(req.files, false);

      const content = await Content.create({
        title, description, type, category, price,
        fileUrl:      r2Key,
        filePublicId: r2Key,
        fileSize:     fileSize ? Number(fileSize) : null,
        thumbnailUrl, thumbnailPublicId,
        status:    'processing',
        tags:      tags ? JSON.parse(tags) : [],
        createdBy: req.mongoUser._id,
      });

      await triggerTranscode(content._id.toString(), r2Key);
      await content.populate('createdBy', 'name email');
      return res.status(201).json({ message: 'Video queued for processing', content });
    }

    // ── Non-video: PDF / audio ──
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Content file is required' });
    }

    const tempFile = req.files.file[0];
    const fileUrl      = tempFile.path;
    const filePublicId = tempFile.filename;
    const fileSize     = tempFile.bytes;
    const duration     = tempFile.duration ?? null;

    const { thumbnailUrl, thumbnailPublicId } = await resolveThumbnail(req.files, false);

    const content = await Content.create({
      title, description, type, category, price,
      fileUrl, filePublicId, fileSize, duration,
      thumbnailUrl, thumbnailPublicId,
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
    const isVideo  = updates.type === 'video' || req.route?.path?.includes('/video/');

    const content = await Content.findById(contentId);
    if (!content) return res.status(404).json({ error: 'Content not found' });

    // ── Replace main file if a new one was uploaded ──
    if (req.files?.file || (isVideo && updates.r2Key)) {

      if (isVideo) {
        // Browser already uploaded to R2 directly — r2Key comes in the request body
        const { r2Key, fileSize } = updates;
        if (!r2Key) return res.status(400).json({ error: 'r2Key is required for video replacement' });

        // Delete old R2 raw file if present
        if (content.filePublicId && content.filePublicId !== 'pending') {
          await deleteFromR2(content.filePublicId).catch((e) =>
            console.warn('R2 delete failed (old raw):', e.message)
          );
        }

        content.fileUrl      = r2Key;
        content.filePublicId = r2Key;
        content.fileSize     = fileSize ? Number(fileSize) : content.fileSize;
        content.hlsMasterUrl = null;
        content.status       = 'processing';

        // Resolve thumbnail if provided
        if (req.files?.thumbnail) {
          if (content.thumbnailPublicId) {
            await cloudinary.uploader.destroy(content.thumbnailPublicId, { resource_type: 'image' });
          }
          const { thumbnailUrl, thumbnailPublicId } = await resolveThumbnail(req.files, false);
          content.thumbnailUrl      = thumbnailUrl;
          content.thumbnailPublicId = thumbnailPublicId;
        }

        content.updatedAt = new Date();
        await content.save();
        await triggerTranscode(contentId, r2Key);
        await content.populate('createdBy', 'name email');
        return res.json({ message: 'Video replaced and queued for processing', content });
      }

      // Non-video file replacement
      if (content.filePublicId) {
        await cloudinary.uploader.destroy(content.filePublicId, {
          resource_type: getResourceType(content.type),
        });
      }
      const tempFile       = req.files.file[0];
      content.fileUrl      = tempFile.path;
      content.filePublicId = tempFile.filename;
      content.fileSize     = tempFile.bytes;
      content.duration     = tempFile.duration ?? content.duration;
    }

    // ── Replace thumbnail if a new one was uploaded ──
    if (req.files?.thumbnail) {
      if (content.thumbnailPublicId) {
        await cloudinary.uploader.destroy(content.thumbnailPublicId, { resource_type: 'image' });
      }
      const { thumbnailUrl, thumbnailPublicId } = await resolveThumbnail(req.files, isVideo);
      content.thumbnailUrl      = thumbnailUrl;
      content.thumbnailPublicId = thumbnailPublicId;
    }

    // ── Update scalar fields ──
    Object.keys(updates).forEach((key) => {
      if (['file', 'thumbnail'].includes(key)) return;
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

    if (content.type === 'video') {
      // Delete raw R2 file if still present
      if (content.filePublicId && content.filePublicId !== 'pending') {
        await deleteFromR2(content.filePublicId).catch((e) =>
          console.warn('R2 delete failed (raw):', e.message)
        );
      }
      // hlsMasterUrl holds the master playlist R2 key; HLS segments share the same prefix.
      // Individual segment deletion at scale requires listing — log for manual cleanup.
      if (content.hlsMasterUrl) {
        console.log('HLS segments to clean from R2 prefix:', content.hlsMasterUrl.replace('master.m3u8', ''));
      }
    } else {
      if (content.filePublicId) {
        await cloudinary.uploader.destroy(content.filePublicId, {
          resource_type: getResourceType(content.type),
        });
      }
    }

    if (content.thumbnailPublicId) {
      await cloudinary.uploader.destroy(content.thumbnailPublicId, { resource_type: 'image' });
    }

    await Content.findByIdAndDelete(contentId);
    res.json({ message: 'Content and files deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Webhook: GitHub Actions transcode complete ────────────────────────────
exports.transcodeComplete = async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'];
    if (!secret || secret !== process.env.TRANSCODE_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { contentId, hlsKey } = req.body;
    if (!contentId || !hlsKey) {
      return res.status(400).json({ error: 'contentId and hlsKey are required' });
    }

    const content = await Content.findById(contentId);
    if (!content) return res.status(404).json({ error: 'Content not found' });

    // Delete the raw MP4 from R2 now that HLS is ready
    if (content.filePublicId && content.filePublicId !== 'pending') {
      await deleteFromR2(content.filePublicId).catch((e) =>
        console.warn('R2 delete failed (raw after transcode):', e.message)
      );
    }

    content.hlsMasterUrl = hlsKey; // e.g. videos/{contentId}/hls/master.m3u8
    content.fileUrl      = hlsKey; // keep fileUrl in sync
    content.filePublicId = hlsKey;
    content.status       = 'published';
    content.updatedAt    = new Date();
    await content.save();

    res.json({ message: 'Transcode complete, content published', contentId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Public: List published content ───────────────────────────────────────
exports.listContent = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, minPrice, maxPrice, search } = req.query;

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

    const purchase = await Purchase.findOne({ user: userId, content: contentId, status: 'completed' });
    if (!purchase) {
      return res.status(403).json({ error: 'You need to purchase this content to access it' });
    }

    // Allow access even when processing so the frontend can show the right state
    const content = await Content.findOne({
      _id:    contentId,
      status: { $in: ['published', 'processing'] },
    }).populate('createdBy', 'name');

    if (!content) return res.status(404).json({ error: 'Content not found' });

    // For videos: replace fileUrl with a short-lived signed Worker URL
    if (content.type === 'video' && content.status === 'published' && content.hlsMasterUrl) {
      const signedUrl = generateSignedVideoUrl(contentId);
      const doc       = content.toObject();
      doc.fileUrl     = signedUrl;
      return res.json({ content: doc });
    }

    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── User: Get user's purchased content ───────────────────────────────────
exports.getUserPurchases = async (req, res) => {
  try {
    const userId = req.mongoUser._id;
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
    const content = await Content.findById(contentId).populate('createdBy', 'name email');
    if (!content) return res.status(404).json({ error: 'Content not found' });
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};