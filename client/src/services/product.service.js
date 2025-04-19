// frontend/src/services/product.service.js
import apiService from './api';

/**
 * Service for product-related API calls with improved error handling
 */
const productService = {
  /**
   * Get all products with optional filtering
   * @param {Object} params - Filter parameters
   * @returns {Promise} - API response
   */
  getProducts: async (params = {}) => {
    try {
      const response = await apiService.get('/products', params);
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Create a fallback response with minimal data structure
      const fallbackResponse = {
        data: {
          products: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: 10
          }
        }
      };
      
      // If the error response contains partial data, preserve it
      if (error.response && error.response.data) {
        fallbackResponse.data = {
          ...fallbackResponse.data,
          ...error.response.data
        };
      }
      
      // Keep the error for later processing
      fallbackResponse.error = error;
      
      return fallbackResponse;
    }
  },
  
  /**
   * Get a single product by ID
   * @param {number|string} id - Product ID
   * @returns {Promise} - API response
   */
  getProductById: async (id) => {
    try {
      const response = await apiService.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      
      // Create a fallback empty product if API call fails
      const fallbackResponse = {
        data: null,
        error: error
      };
      
      return fallbackResponse;
    }
  },
  
  /**
   * Get products by category
   * @param {string} category - Category name
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} - API response
   */
  getProductsByCategory: async (category, params = {}) => {
    try {
      const response = await apiService.get('/products', { category, ...params });
      return response;
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error);
      
      // Create a fallback response
      const fallbackResponse = {
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
      
      return fallbackResponse;
    }
  },
  
  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional filter parameters
   * @returns {Promise} - API response
   */
  searchProducts: async (query, params = {}) => {
    try {
      const response = await apiService.get('/products', { search: query, ...params });
      return response;
    } catch (error) {
      console.error(`Error searching products with query "${query}":`, error);
      
      // Create a fallback response
      const fallbackResponse = {
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
      
      return fallbackResponse;
    }
  },
  
  /**
   * Create a new product (admin only)
   * @param {Object} productData - Product data
   * @returns {Promise} - API response
   */
  createProduct: async (productData) => {
    try {
      const response = await apiService.post('/products', productData);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error; // Re-throw errors for creation operations
    }
  },
  
  /**
   * Update an existing product (admin only)
   * @param {number|string} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} - API response
   */
  updateProduct: async (id, productData) => {
    try {
      const response = await apiService.put(`/products/${id}`, productData);
      return response;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error; // Re-throw errors for update operations
    }
  },
  
  /**
   * Delete a product (admin only)
   * @param {number|string} id - Product ID
   * @returns {Promise} - API response
   */
  deleteProduct: async (id) => {
    try {
      const response = await apiService.delete(`/products/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error; // Re-throw errors for delete operations
    }
  },
  
  /**
   * Upload a product image (admin only)
   * @param {number|string} id - Product ID
   * @param {FormData} formData - Form data with image
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - API response
   */
  uploadProductImage: async (id, formData, onProgress) => {
    try {
      const response = await apiService.upload(`/products/${id}/images`, formData, onProgress);
      return response;
    } catch (error) {
      console.error(`Error uploading image for product with ID ${id}:`, error);
      throw error; // Re-throw errors for upload operations
    }
  },
  
  /**
   * Delete a product image (admin only)
   * @param {number|string} productId - Product ID
   * @param {number|string} imageId - Image ID
   * @returns {Promise} - API response
   */
  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await apiService.delete(`/products/${productId}/images/${imageId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting image ${imageId} for product ${productId}:`, error);
      throw error; // Re-throw errors for delete operations
    }
  },
  
  /**
   * Set primary product image (admin only)
   * @param {number|string} productId - Product ID
   * @param {number|string} imageId - Image ID
   * @returns {Promise} - API response
   */
  setPrimaryImage: async (productId, imageId) => {
    try {
      const response = await apiService.put(`/products/${productId}/images/${imageId}/primary`);
      return response;
    } catch (error) {
      console.error(`Error setting primary image ${imageId} for product ${productId}:`, error);
      throw error; // Re-throw errors for update operations
    }
  },
  
  /**
   * Get product reviews
   * @param {number|string} productId - Product ID
   * @param {Object} params - Pagination and filter parameters
   * @returns {Promise} - API response
   */
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await apiService.get(`/products/${productId}/reviews`, params);
      return response;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      
      // Create a fallback response
      const fallbackResponse = {
        data: {
          reviews: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: 10
          }
        },
        error: error
      };
      
      return fallbackResponse;
    }
  },
  
  /**
   * Add a product review
   * @param {number|string} productId - Product ID
   * @param {Object} reviewData - Review data
   * @returns {Promise} - API response
   */
  addProductReview: async (productId, reviewData) => {
    try {
      const response = await apiService.post(`/products/${productId}/reviews`, reviewData);
      return response;
    } catch (error) {
      console.error(`Error adding review for product ${productId}:`, error);
      throw error; // Re-throw errors for creation operations
    }
  },
};

export default productService;