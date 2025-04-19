// frontend/src/services/product.service.js
import apiService from './api';

/**
 * Service for product-related API calls
 */
const productService = {
  /**
   * Get all products with optional filtering
   * @param {Object} params - Filter parameters
   * @returns {Promise} - API response
   */
  getProducts: (params = {}) => {
    return apiService.get('/products', params);
  },
  
  /**
   * Get a single product by ID
   * @param {number|string} id - Product ID
   * @returns {Promise} - API response
   */
  getProductById: (id) => {
    return apiService.get(`/products/${id}`);
  },
  
  /**
   * Get products by category
   * @param {string} category - Category name
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} - API response
   */
  getProductsByCategory: (category, params = {}) => {
    return apiService.get('/products', { category, ...params });
  },
  
  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} - API response
   */
  searchProducts: (query, params = {}) => {
    return apiService.get('/products', { search: query, ...params });
  },
  
  /**
   * Create a new product (admin only)
   * @param {Object} productData - Product data
   * @returns {Promise} - API response
   */
  createProduct: (productData) => {
    return apiService.post('/products', productData);
  },
  
  /**
   * Update an existing product (admin only)
   * @param {number|string} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} - API response
   */
  updateProduct: (id, productData) => {
    return apiService.put(`/products/${id}`, productData);
  },
  
  /**
   * Delete a product (admin only)
   * @param {number|string} id - Product ID
   * @returns {Promise} - API response
   */
  deleteProduct: (id) => {
    return apiService.delete(`/products/${id}`);
  },
  
  /**
   * Upload a product image (admin only)
   * @param {number|string} id - Product ID
   * @param {FormData} formData - Form data with image
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - API response
   */
  uploadProductImage: (id, formData, onProgress) => {
    return apiService.upload(`/products/${id}/images`, formData, onProgress);
  },
  
  /**
   * Delete a product image (admin only)
   * @param {number|string} productId - Product ID
   * @param {number|string} imageId - Image ID
   * @returns {Promise} - API response
   */
  deleteProductImage: (productId, imageId) => {
    return apiService.delete(`/products/${productId}/images/${imageId}`);
  },
  
  /**
   * Set primary product image (admin only)
   * @param {number|string} productId - Product ID
   * @param {number|string} imageId - Image ID
   * @returns {Promise} - API response
   */
  setPrimaryImage: (productId, imageId) => {
    return apiService.put(`/products/${productId}/images/${imageId}/primary`);
  },
  
  /**
   * Get product reviews
   * @param {number|string} productId - Product ID
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise} - API response
   */
  getProductReviews: (productId, params = {}) => {
    return apiService.get(`/products/${productId}/reviews`, params);
  },
  
  /**
   * Add a product review
   * @param {number|string} productId - Product ID
   * @param {Object} reviewData - Review data
   * @returns {Promise} - API response
   */
  addProductReview: (productId, reviewData) => {
    return apiService.post(`/products/${productId}/reviews`, reviewData);
  },
};

export default productService;