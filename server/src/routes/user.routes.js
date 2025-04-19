// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Protected routes - all require authentication
router.use(verifyToken);

// User profile
router.get('/profile', (req, res) => {
  // The user ID is already set in req by verifyToken middleware
  userController.getUserById(req, res);
});

router.put('/profile', userController.updateUserProfile);
router.post('/change-password', userController.changePassword);

// User addresses
router.get('/addresses', userController.getUserAddresses);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:id', userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);

// User payment methods
router.get('/payment-methods', userController.getUserPaymentMethods);
router.post('/payment-methods', userController.addPaymentMethod);
router.delete('/payment-methods/:id', userController.deletePaymentMethod);

// Admin only routes
router.get('/', isAdmin, userController.getAllUsers);
router.get('/:id', isAdmin, userController.getUserById);

module.exports = router;