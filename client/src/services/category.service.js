// frontend/src/services/category.service.js
import apiService from './api';

/**
 * Service for category API calls
 */
const categoryService = {
  /**
   * Get all categories
   * @returns {Promise} - API response
   */
  getAllCategories: () => {
    return apiService.get('/categories');
  },
  
  /**
   * Get category by ID
   * @param {number|string} id - Category ID
   * @returns {Promise} - API response
   */
  getCategoryById: (id) => {
    return apiService.get(`/categories/${id}`);
  },
  
  /**
   * Get products in a category
   * @param {number|string} id - Category ID
   * @param {Object} params - Query parameters for pagination and filtering
   * @returns {Promise} - API response
   */
  getCategoryProducts: (id, params = {}) => {
    return apiService.get(`/categories/${id}/products`, params);
  }
};

export default categoryService;