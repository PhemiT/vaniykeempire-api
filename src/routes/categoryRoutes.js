const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.listCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin routes
router.post('/', authenticate, requireAdmin, categoryController.createCategory);
router.put('/:categoryId', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/:categoryId', authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;