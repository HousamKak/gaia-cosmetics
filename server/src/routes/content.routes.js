// backend/src/routes/content.routes.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

// Public routes - get content
router.get('/', contentController.getAllContent);
router.get('/section/:section', contentController.getContentBySection);

// Protected routes - admin only
router.post('/', verifyToken, isAdmin, contentController.addContent);
router.put('/:id', verifyToken, isAdmin, contentController.updateContent);
router.delete('/:id', verifyToken, isAdmin, contentController.deleteContent);

// Upload image content
router.put(
  '/:id/image',
  verifyToken,
  isAdmin,
  upload.single('image'),
  handleUploadError,
  contentController.updateContentImage
);

module.exports = router;