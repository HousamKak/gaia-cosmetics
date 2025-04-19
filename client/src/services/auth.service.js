// frontend/src/services/auth.service.js
import apiService from './api';

/**
 * Service for authentication-related API calls
 */
const authService = {
  /**
   * Validate user data
   * @param {Object} userData - User data to validate
   * @returns {Object|null} - Validated user data or null
   */
  validateUserData: (userData) => {
    if (!userData) return null;

    if (!userData.role) {
      console.warn('User data is missing role property. Setting default role.');
      return {
        ...userData,
        role: 'customer'
      };
    }

    return userData;
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - API response
   */
  register: async (userData) => {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('gaia-auth-token', response.data.token);
        
        // Remove password from user data
        const { password, ...userDataWithoutPassword } = response.data;
        localStorage.setItem('gaia-user-data', JSON.stringify(userDataWithoutPassword));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} - API response
   */
  login: async (credentials) => {
    try {
      const response = await apiService.post('/auth/login', credentials);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('gaia-auth-token', response.data.token);
        localStorage.setItem('gaia-user-data', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem('gaia-auth-token');
    localStorage.removeItem('gaia-user-data');
    // Redirect to home page
    window.location.href = '/';
  },
  
  /**
   * Get current user's information
   * @returns {Promise} - API response
   */
  getCurrentUser: async () => {
    try {
      const response = await apiService.get('/auth/me');

      if (response.data) {
        const validatedUser = authService.validateUserData(response.data);
        localStorage.setItem('gaia-user-data', JSON.stringify(validatedUser));
        return { ...response, data: validatedUser };
      }

      return response;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  },
  
  /**
   * Check if user is logged in
   * @returns {boolean} - Whether user is logged in
   */
  isLoggedIn: () => {
    return !!localStorage.getItem('gaia-auth-token');
  },
  
  /**
   * Get current user data from localStorage
   * @returns {Object|null} - User data or null if not logged in
   */
  getUserData: () => {
    const userData = localStorage.getItem('gaia-user-data');
    return userData ? authService.validateUserData(JSON.parse(userData)) : null;
  },
  
  /**
   * Check if current user is admin
   * @returns {boolean} - Whether user is admin
   */
  isAdmin: () => {
    const userData = authService.getUserData();
    return userData ? userData.role === 'admin' : false;
  },
  
  /**
   * Request password reset
   * @param {string} email - User's email
   * @returns {Promise} - API response
   */
  requestPasswordReset: (email) => {
    return apiService.post('/auth/forgot-password', { email });
  },
  
  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} - API response
   */
  resetPassword: (token, newPassword) => {
    return apiService.post('/auth/reset-password', { token, newPassword });
  },
  
  /**
   * Change password (authenticated user)
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - API response
   */
  changePassword: (currentPassword, newPassword) => {
    return apiService.post('/auth/change-password', { currentPassword, newPassword });
  },
  
  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} - API response
   */
  updateProfile: async (userData) => {
    try {
      const response = await apiService.put('/users/profile', userData);
      
      // Update stored user data
      const currentUserData = authService.getUserData();
      if (currentUserData) {
        const updatedUserData = { ...currentUserData, ...response.data };
        localStorage.setItem('gaia-user-data', JSON.stringify(updatedUserData));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;