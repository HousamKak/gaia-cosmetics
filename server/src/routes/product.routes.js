// backend/src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes - admin only
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

// Product images
router.post(
  '/:id/images',
  verifyToken,
  isAdmin,
  upload.single('image'),
  handleUploadError,
  productController.addProductImage
);

router.delete(
  '/:productId/images/:imageId',
  verifyToken,
  isAdmin,
  productController.deleteProductImage
);

router.put(
  '/:productId/images/:imageId/primary',
  verifyToken,
  isAdmin,
  productController.setPrimaryImage
);

module.exports = router;