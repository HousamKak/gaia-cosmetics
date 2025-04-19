// backend/src/middleware/security.middleware.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Security headers middleware using Helmet
const securityHeaders = [
  helmet(),
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' })
];

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' }
});

// Specific rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 auth requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later' }
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Handle specific error types
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Default error message
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  });
};

// Not found middleware
const notFound = (req, res) => {
  res.status(404).json({ message: 'Resource not found' });
};

module.exports = {
  securityHeaders,
  apiLimiter,
  authLimiter,
  errorHandler,
  notFound
};