// backend/src/routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

// Public routes - accessible to everyone
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/products', categoryController.getProductsByCategory);

// Protected routes - admin only
router.post(
  '/', 
  verifyToken, 
  isAdmin, 
  upload.single('image'), 
  handleUploadError, 
  categoryController.createCategory
);

router.put(
  '/:id', 
  verifyToken, 
  isAdmin, 
  upload.single('image'), 
  handleUploadError, 
  categoryController.updateCategory
);

router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;