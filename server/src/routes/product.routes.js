// backend/src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { upload, optimizeImage, createWebpVersion, handleUploadError } = require('../middleware/upload.middleware');
const { validateProductData } = require('../middleware/validation.middleware');
const { apiLimiter } = require('../middleware/security.middleware');

// Apply rate limiting to public routes
router.get('/', apiLimiter, productController.getAllProducts);
router.get('/:id', apiLimiter, productController.getProductById);

// Protected routes - admin only
router.post('/', 
  verifyToken, 
  isAdmin, 
  validateProductData, 
  productController.createProduct
);

router.put('/:id', 
  verifyToken, 
  isAdmin, 
  validateProductData, 
  productController.updateProduct
);

router.delete('/:id', 
  verifyToken, 
  isAdmin, 
  productController.deleteProduct
);

// Product images
router.post(
  '/:id/images',
  verifyToken,
  isAdmin,
  upload.single('image'),
  optimizeImage,
  createWebpVersion,
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