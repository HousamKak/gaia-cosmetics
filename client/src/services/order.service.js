// frontend/src/services/order.service.js
import apiService from './api';

/**
 * Service for order-related API calls
 */
const orderService = {
  /**
   * Get all orders for current user
   * @param {Object} params - Query parameters for pagination and filtering
   * @returns {Promise} - API response
   */
  getUserOrders: (params = {}) => {
    return apiService.get('/orders', params);
  },
  
  /**
   * Get order by ID
   * @param {number|string} id - Order ID
   * @returns {Promise} - API response
   */
  getOrderById: (id) => {
    return apiService.get(`/orders/${id}`);
  },
  
  /**
   * Create a new order
   * @param {Object} orderData - Order data including items, shipping, payment
   * @returns {Promise} - API response
   */
  createOrder: (orderData) => {
    return apiService.post('/orders', orderData);
  },
  
  /**
   * Update order status (admin only)
   * @param {number|string} id - Order ID
   * @param {string} status - New order status
   * @returns {Promise} - API response
   */
  updateOrderStatus: (id, status) => {
    return apiService.put(`/orders/${id}/status`, { status });
  },
  
  /**
   * Cancel an order
   * @param {number|string} id - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} - API response
   */
  cancelOrder: (id, reason) => {
    return apiService.put(`/orders/${id}/cancel`, { reason });
  },
  
  /**
   * Get all orders (admin only)
   * @param {Object} params - Query parameters for pagination and filtering
   * @returns {Promise} - API response
   */
  getAllOrders: (params = {}) => {
    return apiService.get('/admin/orders', params);
  },
  
  /**
   * Get order statistics (admin only)
   * @param {Object} params - Query parameters for date range
   * @returns {Promise} - API response
   */
  getOrderStats: (params = {}) => {
    return apiService.get('/admin/orders/stats', params);
  },
  
  /**
   * Check if promo code is valid
   * @param {string} code - Promo code
   * @returns {Promise} - API response
   */
  validatePromoCode: (code) => {
    return apiService.post('/orders/promo-code/validate', { code });
  },
  
  /**
   * Calculate shipping cost
   * @param {Object} shippingData - Shipping details
   * @returns {Promise} - API response
   */
  calculateShipping: (shippingData) => {
    return apiService.post('/orders/shipping/calculate', shippingData);
  },
  
  /**
   * Process guest checkout
   * @param {Object} orderData - Order data including user info, items, shipping, payment
   * @returns {Promise} - API response
   */
  guestCheckout: (orderData) => {
    return apiService.post('/orders/guest', orderData);
  },
  
  /**
   * Track order by ID and email (for guest users)
   * @param {string} orderNumber - Order number/ID
   * @param {string} email - Email used for the order
   * @returns {Promise} - API response
   */
  trackGuestOrder: (orderNumber, email) => {
    return apiService.get('/orders/track', { orderNumber, email });
  },
  
  /**
   * Get latest order for current user
   * @returns {Promise} - API response
   */
  getLatestOrder: () => {
    return apiService.get('/orders/latest');
  }
};

export default orderService;