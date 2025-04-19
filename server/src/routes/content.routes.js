// backend/src/routes/content.routes.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { upload, optimizeImage, createWebpVersion, handleUploadError } = require('../middleware/upload.middleware');
const { validateContentData } = require('../middleware/validation.middleware');
const { apiLimiter } = require('../middleware/security.middleware');

// Public routes - get content (with rate limiting)
router.get('/', apiLimiter, contentController.getAllContent);
router.get('/section/:section', apiLimiter, contentController.getContentBySection);

// Protected routes - admin only
router.post('/',
  verifyToken,
  isAdmin,
  validateContentData,
  contentController.addContent
);

router.put('/:id',
  verifyToken,
  isAdmin,
  validateContentData,
  contentController.updateContent
);

router.delete('/:id',
  verifyToken,
  isAdmin,
  contentController.deleteContent
);

// Upload image content
router.put(
  '/:id/image',
  verifyToken,
  isAdmin,
  upload.single('image'),
  optimizeImage,
  createWebpVersion,
  handleUploadError,
  contentController.updateContentImage
);

module.exports = router;