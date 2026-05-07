const Bundle   = require('../models/Bundle');
const Content  = require('../models/Content');
const Purchase = require('../models/Purchase');
const { cloudinary } = require('../config/cloudinary');

// ─── Helpers ───────────────────────────────────────────────────────────────

async function computeOriginalPrice(itemIds) {
  const items = await Content.find({ _id: { $in: itemIds } }).select('price');
  return items.reduce((sum, c) => sum + c.price, 0);
}

// ─── Public: List published bundles ───────────────────────────────────────
exports.listBundles = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : { status: 'published' };

    const bundles = await Bundle.find(query)
      .populate('items', 'title thumbnailUrl price type')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ bundles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Public: Get single bundle ─────────────────────────────────────────────
exports.getBundle = async (req, res) => {
  try {
    const { bundleId } = req.params;

    const bundle = await Bundle.findOne({ _id: bundleId, status: 'published' })
      .populate('items', 'title thumbnailUrl price type description')
      .populate('createdBy', 'name');

    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });
    res.json({ bundle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Get single bundle (any status) ────────────────────────────────
exports.getBundleAdmin = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const bundle = await Bundle.findById(bundleId)
      .populate('items', 'title thumbnailUrl price type description')
      .populate('createdBy', 'name email');
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });
    res.json({ bundle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Create bundle ──────────────────────────────────────────────────
exports.createBundle = async (req, res) => {
  try {
    const { title, description, price, status, tags } = req.body;
    const items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;

    if (!items || items.length < 2) {
      return res.status(400).json({ error: 'A bundle must contain at least 2 content items' });
    }

    const originalPrice = await computeOriginalPrice(items);

    let thumbnailUrl       = null;
    let thumbnailPublicId  = null;
    if (req.files?.thumbnail?.[0]) {
      thumbnailUrl      = req.files.thumbnail[0].path;
      thumbnailPublicId = req.files.thumbnail[0].filename;
    }

    const bundle = await Bundle.create({
      title, description, items, price: Number(price),
      originalPrice,
      thumbnailUrl, thumbnailPublicId,
      status:    status || 'draft',
      tags:      tags ? JSON.parse(tags) : [],
      createdBy: req.mongoUser._id,
    });

    await bundle.populate('items', 'title thumbnailUrl price type');
    await bundle.populate('createdBy', 'name email');
    res.status(201).json({ message: 'Bundle created', bundle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Replace bundle ─────────────────────────────────────────────────
exports.putBundle = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const { title, description, price, status, tags } = req.body;
    const items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;

    if (!items || items.length < 2) {
      return res.status(400).json({ error: 'A bundle must contain at least 2 content items' });
    }

    const bundle = await Bundle.findById(bundleId);
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });

    const originalPrice = await computeOriginalPrice(items);

    if (req.files?.thumbnail?.[0]) {
      if (bundle.thumbnailPublicId) {
        await cloudinary.uploader.destroy(bundle.thumbnailPublicId, { resource_type: 'image' });
      }
      bundle.thumbnailUrl      = req.files.thumbnail[0].path;
      bundle.thumbnailPublicId = req.files.thumbnail[0].filename;
    }

    bundle.title         = title;
    bundle.description   = description;
    bundle.items         = items;
    bundle.price         = Number(price);
    bundle.originalPrice = originalPrice;
    bundle.status        = status || bundle.status;
    bundle.tags          = tags ? JSON.parse(tags) : bundle.tags;
    bundle.updatedAt     = new Date();

    await bundle.save();
    await bundle.populate('items', 'title thumbnailUrl price type');
    await bundle.populate('createdBy', 'name email');

    res.json({ message: 'Bundle updated', bundle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Partial update bundle ─────────────────────────────────────────
exports.patchBundle = async (req, res) => {
    if (typeof req.body.items === 'string') {
        req.body.items = JSON.parse(req.body.items);
        }

  try {
    const { bundleId } = req.params;
    const updates = req.body;

    const bundle = await Bundle.findById(bundleId);
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });

    if (updates.items !== undefined) {
      if (updates.items.length < 2) {
        return res.status(400).json({ error: 'A bundle must contain at least 2 content items' });
      }
      bundle.originalPrice = await computeOriginalPrice(updates.items);
      bundle.items = updates.items;
    }

    if (req.files?.thumbnail?.[0]) {
      if (bundle.thumbnailPublicId) {
        await cloudinary.uploader.destroy(bundle.thumbnailPublicId, { resource_type: 'image' });
      }
      bundle.thumbnailUrl      = req.files.thumbnail[0].path;
      bundle.thumbnailPublicId = req.files.thumbnail[0].filename;
    }

    const scalarFields = ['title', 'description', 'price', 'status'];
    scalarFields.forEach((key) => {
      if (updates[key] !== undefined) bundle[key] = updates[key];
    });
    if (updates.tags !== undefined) {
      bundle.tags = typeof updates.tags === 'string' ? JSON.parse(updates.tags) : updates.tags;
    }

    bundle.updatedAt = new Date();
    await bundle.save();
    await bundle.populate('items', 'title thumbnailUrl price type');
    await bundle.populate('createdBy', 'name email');

    res.json({ message: 'Bundle updated', bundle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Delete bundle ──────────────────────────────────────────────────
exports.deleteBundle = async (req, res) => {
  try {
    const { bundleId } = req.params;

    const bundle = await Bundle.findById(bundleId);
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });

    if (bundle.thumbnailPublicId) {
      await cloudinary.uploader.destroy(bundle.thumbnailPublicId, { resource_type: 'image' });
    }

    await Bundle.findByIdAndDelete(bundleId);
    res.json({ message: 'Bundle deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── User: Purchase a bundle ───────────────────────────────────────────────
// Skips items the user already owns; charges pro-rated price for remainder.
exports.purchaseBundle = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const userId = req.mongoUser._id;

    const bundle = await Bundle.findOne({ _id: bundleId, status: 'published' })
      .populate('items', 'price title');
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });

    // Find which items the user already owns
    const existingPurchases = await Purchase.find({
      user:    userId,
      content: { $in: bundle.items.map((i) => i._id) },
      status:  'completed',
    }).select('content');

    const ownedIds = new Set(existingPurchases.map((p) => p.content.toString()));
    const itemsToBuy = bundle.items.filter((item) => !ownedIds.has(item._id.toString()));

    if (itemsToBuy.length === 0) {
      return res.status(400).json({ error: 'You already own all items in this bundle' });
    }

    // Pro-rated amount: bundle discount applied proportionally to unowned items
    const ownedOriginal  = bundle.items
      .filter((i) => ownedIds.has(i._id.toString()))
      .reduce((sum, i) => sum + i.price, 0);
    const totalOriginal  = bundle.originalPrice || bundle.items.reduce((s, i) => s + i.price, 0);
    const discountRatio  = totalOriginal > 0 ? bundle.price / totalOriginal : 1;
    const chargeAmount   = Math.max(0, (totalOriginal - ownedOriginal) * discountRatio);

    // Return payment intent data so the frontend can complete checkout.
    // The actual Purchase records are created by your existing payment
    // verify/capture webhooks — pass itemsToBuy IDs alongside the intent.
    res.json({
      chargeAmount:    Math.round(chargeAmount * 100) / 100,
      itemsToBuy:      itemsToBuy.map((i) => i._id),
      alreadyOwned:    [...ownedIds],
      bundleId:        bundle._id,
      bundleTitle:     bundle.title,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.claimFree = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const userId = req.mongoUser._id;

    const bundle = await Bundle.findOne({ _id: bundleId, status: 'published' })
      .populate('items', '_id price');
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });
    if (bundle.price !== 0) return res.status(400).json({ error: 'Bundle is not free' });

    // Create a completed purchase for each item not already owned
    const itemIds = bundle.items.map(i => i._id);

    const existingPurchases = await Purchase.find({
      user:    userId,
      content: { $in: itemIds },
      status:  'completed',
    }).select('content');

    const ownedIds = new Set(existingPurchases.map(p => p.content.toString()));
    const toCreate = bundle.items.filter(i => !ownedIds.has(i._id.toString()));

    const purchases = toCreate.length > 0
      ? await Purchase.insertMany(
          toCreate.map(i => ({
            user:          userId,
            content:       i._id,
            amount:        0,
            paymentMethod: 'free',
            status:        'completed',
          }))
        )
      : [];

    res.status(toCreate.length > 0 ? 201 : 200).json({
      message:   toCreate.length > 0 ? 'Bundle added to library' : 'Already in library',
      purchases,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};