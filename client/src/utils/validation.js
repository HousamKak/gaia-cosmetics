// frontend/src/utils/validation.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    
    // RFC 5322 compliant email regex
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate Indian phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Whether phone number is valid
   */
  export const isValidIndianPhone = (phone) => {
    if (!phone) return false;
    
    // Indian mobile numbers are 10 digits, optionally prefixed with +91 or 0
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };
  
  /**
   * Validate Indian postal code
   * @param {string} postalCode - Postal code to validate
   * @returns {boolean} - Whether postal code is valid
   */
  export const isValidIndianPostalCode = (postalCode) => {
    if (!postalCode) return false;
    
    // Indian postal codes are 6 digits
    const postalCodeRegex = /^[1-9][0-9]{5}$/;
    return postalCodeRegex.test(postalCode);
  };
  
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result with isValid and message
   */
  export const validatePassword = (password) => {
    if (!password) {
      return {
        isValid: false,
        message: 'Password is required'
      };
    }
    
    if (password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters'
      };
    }
    
    // Check for stronger password (optional requirement)
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strength < 3) {
      return {
        isValid: true,
        message: 'Consider using uppercase letters, numbers, and special characters for a stronger password',
        isStrong: false
      };
    }
    
    return {
      isValid: true,
      message: 'Strong password',
      isStrong: true
    };
  };
  
  /**
   * Validate form fields based on rules
   * @param {Object} fields - Form field values
   * @param {Object} rules - Validation rules
   * @returns {Object} - Object with errors for each invalid field
   */
  export const validateForm = (fields, rules) => {
    const errors = {};
    
    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const value = fields[fieldName];
      
      // Required check
      if (fieldRules.required && (!value || value.trim() === '')) {
        errors[fieldName] = fieldRules.requiredMessage || `${fieldName} is required`;
        return;
      }
      
      // Skip other validations if field is empty and not required
      if (!value && !fieldRules.required) return;
      
      // Minimum length check
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[fieldName] = fieldRules.minLengthMessage || `${fieldName} must be at least ${fieldRules.minLength} characters`;
        return;
      }
      
      // Maximum length check
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[fieldName] = fieldRules.maxLengthMessage || `${fieldName} must not exceed ${fieldRules.maxLength} characters`;
        return;
      }
      
      // Pattern check
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[fieldName] = fieldRules.patternMessage || `${fieldName} format is invalid`;
        return;
      }
      
      // Custom validation function
      if (fieldRules.validate) {
        const customError = fieldRules.validate(value, fields);
        if (customError) {
          errors[fieldName] = customError;
          return;
        }
      }
      
      // Email validation
      if (fieldRules.email && !isValidEmail(value)) {
        errors[fieldName] = fieldRules.emailMessage || 'Please enter a valid email address';
        return;
      }
      
      // Match field validation (e.g., confirm password)
      if (fieldRules.match && value !== fields[fieldRules.match]) {
        errors[fieldName] = fieldRules.matchMessage || `${fieldName} does not match ${fieldRules.match}`;
        return;
      }
    });
    
    return errors;
  };
  
  /**
   * Validate credit card number using Luhn algorithm
   * @param {string} cardNumber - Credit card number to validate
   * @returns {boolean} - Whether card number is valid
   */
  export const isValidCreditCard = (cardNumber) => {
    if (!cardNumber) return false;
    
    // Remove spaces and dashes
    const sanitized = cardNumber.replace(/[\s-]/g, '');
    
    // Check if contains only digits
    if (!/^\d+$/.test(sanitized)) return false;
    
    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    
    // Loop from right to left
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  };
  
  /**
   * Get credit card type based on number
   * @param {string} cardNumber - Credit card number
   * @returns {string|null} - Card type or null if unknown
   */
  export const getCreditCardType = (cardNumber) => {
    if (!cardNumber) return null;
    
    // Remove spaces and dashes
    const sanitized = cardNumber.replace(/[\s-]/g, '');
    
    // Card type patterns
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      dinersclub: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35)/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(sanitized)) {
        return type;
      }
    }
    
    return null;
  };