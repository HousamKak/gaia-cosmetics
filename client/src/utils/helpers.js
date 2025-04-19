// frontend/src/utils/helpers.js

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - Unique ID
 */
export const generateId = (prefix = '') => {
    return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  /**
   * Debounce a function call
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  export const debounce = (func, wait) => {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Throttle a function call
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit in milliseconds
   * @returns {Function} - Throttled function
   */
  export const throttle = (func, limit) => {
    let inThrottle;
    
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };
  
  /**
   * Get query parameters from URL
   * @param {string} url - URL to parse
   * @returns {Object} - Object with query parameters
   */
  export const getQueryParams = (url) => {
    const params = {};
    const searchParams = new URLSearchParams((url || window.location.search).split('?')[1]);
    
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  };
  
  /**
   * Build URL with query parameters
   * @param {string} baseUrl - Base URL
   * @param {Object} params - Query parameters
   * @returns {string} - URL with query parameters
   */
  export const buildUrl = (baseUrl, params = {}) => {
    const url = new URL(baseUrl, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
    
    return url.toString();
  };
  
  /**
   * Convert HEX color to RGB
   * @param {string} hex - HEX color code
   * @returns {Object|null} - RGB values or null if invalid
   */
  export const hexToRgb = (hex) => {
    if (!hex) return null;
    
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  };
  
  /**
   * Add opacity to a color
   * @param {string} color - HEX color code
   * @param {number} opacity - Opacity value (0-1)
   * @returns {string} - RGBA color string
   */
  export const addOpacityToColor = (color, opacity) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  };
  
  /**
   * Scroll to an element with ID
   * @param {string} elementId - Element ID
   * @param {number} offset - Offset from the element in pixels
   * @param {number} duration - Animation duration in milliseconds
   */
  export const scrollToElement = (elementId, offset = 0, duration = 500) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: duration ? 'smooth' : 'auto'
    });
  };
  
  /**
   * Get device information
   * @returns {Object} - Device information
   */
  export const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    
    return {
      isMobile: /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      isTablet: /Tablet|iPad/i.test(ua),
      isDesktop: !/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(ua),
      isSafari: /^((?!chrome|android).)*safari/i.test(ua),
      isFirefox: /Firefox/i.test(ua),
      isChrome: /Chrome/i.test(ua) && !/Edge/i.test(ua),
      isEdge: /Edge/i.test(ua),
      isIOS: /iPad|iPhone|iPod/i.test(ua) && !(window).MSStream,
      isAndroid: /Android/i.test(ua),
    };
  };
  
  /**
   * Convert image file to base64
   * @param {File} file - Image file
   * @returns {Promise<string>} - Base64 string
   */
  export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  /**
   * Calculate discount percentage
   * @param {number} originalPrice - Original price
   * @param {number} discountedPrice - Discounted price
   * @returns {number} - Discount percentage
   */
  export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
    if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) {
      return 0;
    }
    
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };