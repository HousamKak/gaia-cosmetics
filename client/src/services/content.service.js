// frontend/src/services/content.service.js
import apiService from './api';

/**
 * Service for content management API calls
 */
const contentService = {
  /**
   * Get all website content
   * @returns {Promise} - API response
   */
  getAllContent: () => {
    return apiService.get('/content');
  },

  /**
   * Get content by section
   * @param {string} section - Section name
   * @returns {Promise} - API response
   */
  getContentBySection: (section) => {
    return apiService.get(`/content/section/${section}`);
  },

  /**
   * Add new content (admin only)
   * @param {Object} contentData - Content data
   * @returns {Promise} - API response
   */
  addContent: (contentData) => {
    return apiService.post('/content', contentData);
  },

  /**
   * Update existing content (admin only)
   * @param {number|string} id - Content ID
   * @param {Object} contentData - Updated content data
   * @returns {Promise} - API response
   */
  updateContent: (id, contentData) => {
    return apiService.put(`/content/${id}`, contentData);
  },

  /**
   * Delete content (admin only)
   * @param {number|string} id - Content ID
   * @returns {Promise} - API response
   */
  deleteContent: (id) => {
    return apiService.delete(`/content/${id}`);
  },

  /**
   * Upload content image (admin only)
   * @param {number|string} id - Content ID
   * @param {FormData} formData - Form data with image
   * @returns {Promise} - API response
   */
  uploadContentImage: (id, formData) => {
    return apiService.upload(`/content/${id}/image`, formData);
  }
};

export default contentService;