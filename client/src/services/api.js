// frontend/src/services/api.js
import axios from 'axios';

// Create axios instance with default configs
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gaia-auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with an error status
      
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        // Clear token and redirect to login if not already there
        localStorage.removeItem('gaia-auth-token');
        localStorage.removeItem('gaia-user-data');
        
        if (window.location.pathname !== '/login') {
          // Store the current path to redirect back after login
          localStorage.setItem('auth-redirect', window.location.pathname);
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden errors
      if (error.response.status === 403) {
        console.error('Permission denied for this action');
      }
      
      // Handle 404 Not Found errors
      if (error.response.status === 404) {
        console.error('Resource not found');
      }
      
      // Handle 500 Server errors
      if (error.response.status >= 500) {
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error - no response received');
    } else {
      // Something else caused the error
      console.error('Error setting up the request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common HTTP methods
const apiService = {
  /**
   * Make a GET request
   * @param {string} url - The endpoint URL
   * @param {Object} params - Query parameters
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  get: (url, params = {}, config = {}) => {
    return api.get(url, { params, ...config });
  },
  
  /**
   * Make a POST request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },
  
  /**
   * Make a PUT request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },
  
  /**
   * Make a PATCH request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  patch: (url, data = {}, config = {}) => {
    return api.patch(url, data, config);
  },
  
  /**
   * Make a DELETE request
   * @param {string} url - The endpoint URL
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios promise
   */
  delete: (url, config = {}) => {
    return api.delete(url, config);
  },
  
  /**
   * Upload a file using FormData
   * @param {string} url - The endpoint URL
   * @param {FormData} formData - Form data with files
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - Axios promise
   */
  upload: (url, formData, onProgress) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },
};

export default apiService;