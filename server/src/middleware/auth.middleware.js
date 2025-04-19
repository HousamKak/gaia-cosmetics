// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const db = require('../db/database');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  db.get('SELECT role FROM users WHERE id = ?', [req.userId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (row.role !== 'admin') {
      return res.status(403).json({ message: 'Require Admin Role' });
    }
    
    next();
  });
};

module.exports = {
  verifyToken,
  isAdmin
};