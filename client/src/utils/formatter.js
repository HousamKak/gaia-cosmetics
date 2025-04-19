// frontend/src/utils/formatter.js

/**
 * Format price with currency symbol
 * @param {number} price - Price to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, currency = 'INR') => {
    if (price === null || price === undefined) return '';
    
    const currencySymbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    
    const symbol = currencySymbols[currency] || currency;
    
    return `${symbol}${price.toLocaleString('en-IN')}`;
  };
  
  /**
   * Format discount percentage
   * @param {number} original - Original price
   * @param {number} current - Current price
   * @returns {string} - Formatted discount percentage
   */
  export const formatDiscount = (original, current) => {
    if (!original || !current || original <= current) return '';
    
    const discount = Math.round(((original - current) / original) * 100);
    return `${discount}% OFF`;
  };
  
  /**
   * Format date to readable string
   * @param {string|Date} date - Date to format
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new Date(date).toLocaleDateString('en-IN', mergedOptions);
  };
  
  /**
   * Format order status for display
   * @param {string} status - Order status code
   * @returns {Object} - Formatted status and color
   */
  export const formatOrderStatus = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'yellow' },
      processing: { label: 'Processing', color: 'blue' },
      shipped: { label: 'Shipped', color: 'purple' },
      delivered: { label: 'Delivered', color: 'green' },
      cancelled: { label: 'Cancelled', color: 'red' },
      returned: { label: 'Returned', color: 'orange' },
      refunded: { label: 'Refunded', color: 'gray' },
    };
    
    return statusMap[status] || { label: status, color: 'neutral' };
  };
  
  /**
   * Format phone number for display
   * @param {string} phone - Phone number
   * @returns {string} - Formatted phone number
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // For Indian phone numbers (10 digits)
    if (/^\d{10}$/.test(phone)) {
      return `${phone.substring(0, 5)} ${phone.substring(5)}`;
    }
    
    return phone;
  };
  
  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @param {number} decimals - Decimal places
   * @returns {string} - Formatted file size
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} - Truncated text
   */
  export const truncateText = (text, length = 100) => {
    if (!text) return '';
    
    if (text.length <= length) return text;
    
    return text.substring(0, length) + '...';
  };
  
  /**
   * Format address for display
   * @param {Object} address - Address object
   * @returns {string} - Formatted address string
   */
  export const formatAddress = (address) => {
    if (!address) return '';
    
    const {
      address: streetAddress,
      city,
      state,
      postalCode,
      country,
    } = address;
    
    const parts = [
      streetAddress,
      city,
      state,
      postalCode,
      country,
    ].filter(Boolean);
    
    return parts.join(', ');
  };