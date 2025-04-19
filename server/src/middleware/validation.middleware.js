// backend/src/middleware/validation.middleware.js
/**
 * Validation middleware for request data
 * Provides reusable validation functions for routes
 */

// User validation
const validateUserRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  next();
};

// Product validation
const validateProductData = (req, res, next) => {
  const { name, category, price } = req.body;
  
  // Validate required fields
  if (!name || !category || !price) {
    return res.status(400).json({ message: 'Name, category, and price are required' });
  }
  
  // Validate price is a positive number
  if (isNaN(price) || parseFloat(price) <= 0) {
    return res.status(400).json({ message: 'Price must be a positive number' });
  }
  
  // If original price is provided, validate it's a positive number
  if (req.body.originalPrice && (isNaN(req.body.originalPrice) || parseFloat(req.body.originalPrice) <= 0)) {
    return res.status(400).json({ message: 'Original price must be a positive number' });
  }
  
  // If discount percentage is provided, validate it's between 0 and 100
  if (req.body.discountPercentage) {
    const discount = parseInt(req.body.discountPercentage);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      return res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
    }
  }
  
  next();
};

// Content validation
const validateContentData = (req, res, next) => {
  const { section, key, value, type } = req.body;
  
  // For content creation
  if (req.method === 'POST') {
    // Validate required fields
    if (!section || !key || value === undefined) {
      return res.status(400).json({ message: 'Section, key, and value are required' });
    }
  }
  
  // For content update (PUT)
  if (req.method === 'PUT' && req.path.includes('/image') === false) {
    // Validate value is provided
    if (value === undefined) {
      return res.status(400).json({ message: 'Content value is required' });
    }
  }
  
  // If type is provided, validate it's a valid type
  if (type && !['text', 'image', 'html', 'video'].includes(type)) {
    return res.status(400).json({ message: 'Invalid content type. Must be one of: text, image, html, video' });
  }
  
  next();
};

// Category validation
const validateCategoryData = (req, res, next) => {
  const { name } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  next();
};

// Order validation
const validateOrderData = (req, res, next) => {
  const { items, subtotal, total, shippingAddress } = req.body;
  
  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item' });
  }
  
  // Validate items have required properties
  const invalidItems = items.filter(item => 
    !item.id || !item.quantity || item.quantity <= 0 || !item.price || item.price <= 0
  );
  
  if (invalidItems.length > 0) {
    return res.status(400).json({ message: 'All items must have valid id, quantity, and price' });
  }
  
  // Validate subtotal and total
  if (!subtotal || !total || isNaN(subtotal) || isNaN(total) || parseFloat(subtotal) <= 0 || parseFloat(total) <= 0) {
    return res.status(400).json({ message: 'Valid subtotal and total are required' });
  }
  
  // Validate shipping address
  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }
  
  // For guest orders, validate user info
  if (req.path.includes('/guest') && (!req.body.userInfo || !req.body.userInfo.email)) {
    return res.status(400).json({ message: 'User email is required for guest orders' });
  }
  
  next();
};

// Address validation
const validateAddressData = (req, res, next) => {
  const { name, address, city, state, postalCode, country } = req.body;
  
  // Validate required fields
  if (!name || !address || !city || !state || !postalCode || !country) {
    return res.status(400).json({ message: 'All address fields are required' });
  }
  
  next();
};

// Payment method validation
const validatePaymentMethodData = (req, res, next) => {
  const { cardType, lastFour, expiryMonth, expiryYear } = req.body;
  
  // Validate required fields
  if (!cardType || !lastFour || !expiryMonth || !expiryYear) {
    return res.status(400).json({ message: 'All payment method fields are required' });
  }
  
  // Validate lastFour is 4 digits
  if (!/^\d{4}$/.test(lastFour)) {
    return res.status(400).json({ message: 'Last four digits must be a 4-digit number' });
  }
  
  // Validate expiry month (01-12)
  if (!/^(0[1-9]|1[0-2])$/.test(expiryMonth)) {
    return res.status(400).json({ message: 'Expiry month must be in MM format (01-12)' });
  }
  
  // Validate expiry year (current year or later, 4 digits)
  const currentYear = new Date().getFullYear();
  const yearRegex = /^\d{4}$/;
  if (!yearRegex.test(expiryYear) || parseInt(expiryYear) < currentYear) {
    return res.status(400).json({ message: 'Expiry year must be a 4-digit year and not in the past' });
  }
  
  next();
};

// Promo code validation
const validatePromoCode = (req, res, next) => {
  const { code } = req.body;
  
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return res.status(400).json({ message: 'Valid promo code is required' });
  }
  
  next();
};

module.exports = {
  validateUserRegistration,
  validateProductData,
  validateContentData,
  validateCategoryData,
  validateOrderData,
  validateAddressData,
  validatePaymentMethodData,
  validatePromoCode
};