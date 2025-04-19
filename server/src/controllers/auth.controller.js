// backend/src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const config = require('../config/env.config');

// Register new user
exports.register = (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if email already exists
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (row) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      // Insert user into database
      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          // Generate JWT token using secret from config
          const token = jwt.sign(
            { id: this.lastID },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
          );
          
          // Return user info and token
          res.status(201).json({
            id: this.lastID,
            name,
            email,
            role: 'customer',
            token
          });
        }
      );
    });
  });
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Find user by email
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Compare passwords
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Generate JWT token using secret from config
      const token = jwt.sign(
        { id: user.id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // Return user info and token (excluding password)
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    });
  });
};

// Get current user info
exports.getCurrentUser = (req, res) => {
  db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  });
};

// Change password
exports.changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }
  
  // Validate new password length
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }
  
  // Get user with password
  db.get('SELECT * FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Compare current password
    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        // Update password in database
        db.run(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedPassword, req.userId],
          function(err) {
            if (err) {
              return res.status(500).json({ message: err.message });
            }
            
            res.json({ message: 'Password changed successfully' });
          }
        );
      });
    });
  });
};