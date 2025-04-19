// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateUserRegistration } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/security.middleware');

// Apply rate limiter to auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;