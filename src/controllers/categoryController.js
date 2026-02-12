const Category = require('../models/Category');

// Helper function to create slug
const createSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Admin: Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const slug = createSlug(name);

    const category = await Category.create({
      name,
      slug,
      description
    });

    res.status(201).json({ 
      message: 'Category created successfully',
      category 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (name) {
      category.name = name;
      category.slug = createSlug(name);
    }
    if (description !== undefined) category.description = description;

    await category.save();

    res.json({ 
      message: 'Category updated successfully',
      category 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByIdAndDelete(categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public: List all categories
exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public: Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};