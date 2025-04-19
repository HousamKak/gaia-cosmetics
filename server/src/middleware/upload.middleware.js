// backend/src/middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create subdirectories for different upload types
const productImagesDir = path.join(uploadDir, 'products');
const categoryImagesDir = path.join(uploadDir, 'categories');
const contentImagesDir = path.join(uploadDir, 'content');

[productImagesDir, categoryImagesDir, contentImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determine destination based on file type/route
    let uploadPath = uploadDir;
    
    if (req.baseUrl.includes('/products')) {
      uploadPath = productImagesDir;
    } else if (req.baseUrl.includes('/categories')) {
      uploadPath = categoryImagesDir;
    } else if (req.baseUrl.includes('/content')) {
      uploadPath = contentImagesDir;
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow image uploads
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png and .webp files are allowed!'), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Image optimization middleware
const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const optimizedImageBuffer = await sharp(filePath)
      .resize({
        width: 1200,
        height: 1200,
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Save the optimized image back to the same path
    await fs.promises.writeFile(filePath, optimizedImageBuffer);
    
    next();
  } catch (error) {
    next(new Error(`Image optimization failed: ${error.message}`));
  }
};

// Create webp version middleware (for better performance)
const createWebpVersion = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const fileExt = path.extname(filePath);
    const webpPath = filePath.replace(fileExt, '.webp');

    // Generate webp version
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Add webp path to request for potential use in controllers
    req.file.webpPath = webpPath;
    req.file.webpUrl = req.file.path.replace(fileExt, '.webp').replace(/^.*\/uploads/, '/uploads');
    
    next();
  } catch (error) {
    // Don't fail if webp conversion fails, just log and continue
    console.error(`WebP conversion failed: ${error.message}`);
    next();
  }
};

// Error handling middleware for multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Helper to ensure upload directories exist
const ensureUploadDirectories = () => {
  // This function can be called on server startup
  console.log('Ensuring upload directories exist...');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  [productImagesDir, categoryImagesDir, contentImagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('Upload directories verified.');
};

module.exports = {
  upload,
  optimizeImage,
  createWebpVersion,
  handleUploadError,
  ensureUploadDirectories
};