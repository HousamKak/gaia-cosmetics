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
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - API response
   */
  uploadContentImage: (id, formData, onProgress) => {
    return apiService.upload(`/content/${id}/image`, formData, onProgress);
  },
  
  /**
   * Get home page content
   * @returns {Promise} - API response with homepage sections
   */
  getHomePageContent: () => {
    return apiService.get('/content/section/hero')
      .then(heroResponse => {
        // Get other homepage sections
        return Promise.all([
          Promise.resolve(heroResponse.data),
          apiService.get('/content/section/category').then(res => res.data),
          apiService.get('/content/section/limited_editions').then(res => res.data)
        ]);
      })
      .then(([hero, categories, limitedEditions]) => {
        return {
          hero,
          categories,
          limitedEditions
        };
      });
  },
  
  /**
   * Get current site settings
   * @returns {Promise} - API response
   */
  getSiteSettings: () => {
    return apiService.get('/content/section/settings');
  },
  
  /**
   * Update site settings (admin only)
   * @param {Object} settingsData - Updated settings
   * @returns {Promise} - API response
   */
  updateSiteSettings: (settingsData) => {
    // This would typically update multiple content entries
    // Here we're simplifying by assuming settings are in a single section
    return apiService.put('/content/settings', settingsData);
  },
  
  /**
   * Get banner content
   * @param {string} location - Banner location (e.g., 'home_top', 'category_page')
   * @returns {Promise} - API response
   */
  getBannerContent: (location) => {
    return apiService.get(`/content/section/banners`, { location });
  }
};

export default contentService;