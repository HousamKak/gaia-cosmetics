// frontend/src/services/category.service.js
import apiService from './api';

/**
 * Service for category API calls with improved error handling
 */
const categoryService = {
  /**
   * Get all categories
   * @returns {Promise} - API response
   */
  getAllCategories: async () => {
    try {
      const response = await apiService.get('/categories');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Return a fallback response
      return {
        data: [],
        error: error
      };
    }
  },
  
  /**
   * Get category by ID
   * @param {number|string} id - Category ID
   * @returns {Promise} - API response
   */
  getCategoryById: async (id) => {
    try {
      const response = await apiService.get(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      
      return {
        data: null,
        error: error
      };
    }
  },
  
  /**
   * Get products in a category
   * @param {number|string} id - Category ID
   * @param {Object} params - Query parameters for pagination and filtering
   * @returns {Promise} - API response
   */
  getCategoryProducts: async (id, params = {}) => {
    try {
      const response = await apiService.get(`/categories/${id}/products`, params);
      return response;
    } catch (error) {
      console.error(`Error fetching products for category ${id}:`, error);
      
      // Return a fallback response
      return {
        data: {
          products: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: 10
          }
        },
        error: error
      };
    }
  },
  
  /**
   * Get filters available for a category
   * @param {number|string} id - Category ID
   * @returns {Promise} - API response
   */
  getCategoryFilters: async (id) => {
    try {
      const response = await apiService.get(`/categories/${id}/filters`);
      return response;
    } catch (error) {
      console.error(`Error fetching filters for category ${id}:`, error);
      
      // Return a fallback response with default filters
      return {
        data: {
          filters: [
            {
              id: 'finish',
              name: 'Finish',
              type: 'checkbox',
              options: [
                { value: 'matte', label: 'Matte' },
                { value: 'glossy', label: 'Glossy' },
                { value: 'satin', label: 'Satin' },
                { value: 'metallic', label: 'Metallic' }
              ]
            },
            {
              id: 'brand',
              name: 'Brand',
              type: 'checkbox',
              options: [
                { value: 'gaia', label: 'GAIA' },
                { value: 'natura', label: 'Natura' },
                { value: 'bloom', label: 'Bloom' }
              ]
            }
          ],
          colors: [
            { name: 'Pink', value: '#FFB6C1' },
            { name: 'Silver', value: '#D3D3D3' },
            { name: 'Beige', value: '#DEB887' },
            { name: 'Coral', value: '#FF7F7F' },
            { name: 'Gold', value: '#FFD700' },
            { name: 'Brown', value: '#8B4513' }
          ]
        },
        error: error
      };
    }
  },
  
  /**
   * Create a new category (admin only)
   * @param {Object|FormData} categoryData - Category data
   * @returns {Promise} - API response
   */
  createCategory: async (categoryData) => {
    try {
      const response = await apiService.post('/categories', categoryData);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error; // Re-throw for creation operations
    }
  },
  
  /**
   * Update a category (admin only)
   * @param {number|string} id - Category ID
   * @param {Object|FormData} categoryData - Updated category data
   * @returns {Promise} - API response
   */
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiService.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      throw error; // Re-throw for update operations
    }
  },
  
  /**
   * Delete a category (admin only)
   * @param {number|string} id - Category ID
   * @returns {Promise} - API response
   */
  deleteCategory: async (id) => {
    try {
      const response = await apiService.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      throw error; // Re-throw for delete operations
    }
  },
  
  /**
   * Upload category image (admin only)
   * @param {number|string} id - Category ID
   * @param {FormData} formData - Form data with image
   * @returns {Promise} - API response
   */
  uploadCategoryImage: async (id, formData) => {
    try {
      const response = await apiService.upload(`/categories/${id}/image`, formData);
      return response;
    } catch (error) {
      console.error(`Error uploading image for category with ID ${id}:`, error);
      throw error; // Re-throw for upload operations
    }
  }
};

export default categoryService;