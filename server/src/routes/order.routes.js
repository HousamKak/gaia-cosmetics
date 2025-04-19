// backend/src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public routes (no authentication required)
router.post('/guest', orderController.createGuestOrder);
router.get('/track', orderController.trackOrder);
router.post('/promo-code/validate', orderController.validatePromoCode);
router.post('/shipping/calculate', orderController.calculateShipping);

// Protected routes (authentication required)
router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getUserOrders);
router.get('/latest', verifyToken, (req, res) => {
  // Set id param to get the latest order
  req.params.id = null;
  orderController.getUserOrders(req, res);
});
router.get('/:id', verifyToken, orderController.getOrderById);
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);

// Admin routes
router.get('/admin/orders', verifyToken, isAdmin, orderController.getAllOrders);
router.get('/admin/orders/stats', verifyToken, isAdmin, orderController.getOrderStats);
router.put('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

module.exports = router;