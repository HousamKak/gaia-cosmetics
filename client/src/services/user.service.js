// client/src/services/user.service.js
import apiService from './api';

/**
 * Service for user-related API calls
 */
const userService = {
  /**
   * Get all users (admin only)
   * @returns {Promise} - API response
   */
  getAllUsers: () => {
    return apiService.get('/users');
  },
  
  /**
   * Get user by ID (admin only)
   * @param {string|number} id - User ID
   * @returns {Promise} - API response
   */
  getUserById: (id) => {
    return apiService.get(`/users/${id}`);
  },
  
  /**
   * Get current user's profile
   * @returns {Promise} - API response
   */
  getUserProfile: () => {
    return apiService.get('/users/profile');
  },
  
  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} - API response
   */
  updateUserProfile: (userData) => {
    return apiService.put('/users/profile', userData);
  },
  
  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - API response
   */
  changePassword: (currentPassword, newPassword) => {
    return apiService.post('/users/change-password', { currentPassword, newPassword });
  },
  
  /**
   * Get user addresses
   * @returns {Promise} - API response
   */
  getUserAddresses: () => {
    return apiService.get('/users/addresses');
  },
  
  /**
   * Add new address
   * @param {Object} addressData - Address data
   * @returns {Promise} - API response
   */
  addAddress: (addressData) => {
    return apiService.post('/users/addresses', addressData);
  },
  
  /**
   * Update address
   * @param {string|number} id - Address ID
   * @param {Object} addressData - Updated address data
   * @returns {Promise} - API response
   */
  updateAddress: (id, addressData) => {
    return apiService.put(`/users/addresses/${id}`, addressData);
  },
  
  /**
   * Delete address
   * @param {string|number} id - Address ID
   * @returns {Promise} - API response
   */
  deleteAddress: (id) => {
    return apiService.delete(`/users/addresses/${id}`);
  },
  
  /**
   * Get user payment methods
   * @returns {Promise} - API response
   */
  getUserPaymentMethods: () => {
    return apiService.get('/users/payment-methods');
  },
  
  /**
   * Add new payment method
   * @param {Object} paymentData - Payment method data
   * @returns {Promise} - API response
   */
  addPaymentMethod: (paymentData) => {
    return apiService.post('/users/payment-methods', paymentData);
  },
  
  /**
   * Delete payment method
   * @param {string|number} id - Payment method ID
   * @returns {Promise} - API response
   */
  deletePaymentMethod: (id) => {
    return apiService.delete(`/users/payment-methods/${id}`);
  }
};

export default userService;