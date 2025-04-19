// backend/src/controllers/user.controller.js
const bcrypt = require('bcrypt');
const db = require('../db/database');

// Get all users (admin only)
exports.getAllUsers = (req, res) => {
  db.all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(users);
  });
};

// Get user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  });
};

// Update user profile
exports.updateUserProfile = (req, res) => {
  const userId = req.userId; // From auth middleware
  const { name, phone } = req.body;
  
  // Validate input
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  db.run(
    'UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, phone || null, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return updated user data
      db.get(
        'SELECT id, name, email, phone, role FROM users WHERE id = ?',
        [userId],
        (err, user) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          res.json(user);
        }
      );
    }
  );
};

// Change password
exports.changePassword = (req, res) => {
  const userId = req.userId; // From auth middleware
  const { currentPassword, newPassword } = req.body;
  
  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }
  
  // Validate password strength
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  // Get user with password
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        // Update password
        db.run(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedPassword, userId],
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

// Add address
exports.addAddress = (req, res) => {
  const userId = req.userId; // From auth middleware
  const {
    name,
    address,
    city,
    state,
    postalCode,
    country,
    phone,
    isDefault
  } = req.body;
  
  // Validate input
  if (!name || !address || !city || !state || !postalCode || !country) {
    return res.status(400).json({ message: 'All address fields are required' });
  }
  
  // Update any existing default address if this one should be default
  if (isDefault) {
    db.run(
      'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
      [userId]
    );
  }
  
  // Insert new address
  db.run(
    `INSERT INTO user_addresses 
     (user_id, name, address, city, state, postal_code, country, phone, is_default) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, address, city, state, postalCode, country, phone || null, isDefault ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      const addressId = this.lastID;
      
      // Return the created address
      db.get(
        'SELECT * FROM user_addresses WHERE id = ?',
        [addressId],
        (err, address) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          res.status(201).json(address);
        }
      );
    }
  );
};

// Get user addresses
exports.getUserAddresses = (req, res) => {
  const userId = req.userId; // From auth middleware
  
  db.all('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC', [userId], (err, addresses) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    res.json(addresses);
  });
};

// Update address
exports.updateAddress = (req, res) => {
  const userId = req.userId; // From auth middleware
  const { id } = req.params;
  const {
    name,
    address,
    city,
    state,
    postalCode,
    country,
    phone,
    isDefault
  } = req.body;
  
  // Validate input
  if (!name || !address || !city || !state || !postalCode || !country) {
    return res.status(400).json({ message: 'All address fields are required' });
  }
  
  // Update any existing default address if this one should be default
  if (isDefault) {
    db.run(
      'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
      [userId]
    );
  }
  
  // Update address
  db.run(
    `UPDATE user_addresses SET
     name = ?, address = ?, city = ?, state = ?, postal_code = ?,
     country = ?, phone = ?, is_default = ?
     WHERE id = ? AND user_id = ?`,
    [name, address, city, state, postalCode, country, phone || null, isDefault ? 1 : 0, id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Address not found or not owned by user' });
      }
      
      // Return the updated address
      db.get(
        'SELECT * FROM user_addresses WHERE id = ?',
        [id],
        (err, address) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          res.json(address);
        }
      );
    }
  );
};

// Delete address
exports.deleteAddress = (req, res) => {
  const userId = req.userId; // From auth middleware
  const { id } = req.params;
  
  // Check if this is the default address
  db.get('SELECT is_default FROM user_addresses WHERE id = ? AND user_id = ?', [id, userId], (err, address) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found or not owned by user' });
    }
    
    // Delete the address
    db.run('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      // If it was the default address, set another address as default
      if (address.is_default === 1) {
        db.get(
          'SELECT id FROM user_addresses WHERE user_id = ? LIMIT 1',
          [userId],
          (err, newDefaultAddress) => {
            if (!err && newDefaultAddress) {
              db.run('UPDATE user_addresses SET is_default = 1 WHERE id = ?', [newDefaultAddress.id]);
            }
          }
        );
      }
      
      res.json({ message: 'Address deleted successfully' });
    });
  });
};

// Add payment method
exports.addPaymentMethod = (req, res) => {
  const userId = req.userId; // From auth middleware
  const {
    cardType,
    lastFour,
    expiryMonth,
    expiryYear,
    isDefault
  } = req.body;
  
  // Validate input
  if (!cardType || !lastFour || !expiryMonth || !expiryYear) {
    return res.status(400).json({ message: 'All payment method fields are required' });
  }
  
  // Update any existing default payment method if this one should be default
  if (isDefault) {
    db.run(
      'UPDATE user_payment_methods SET is_default = 0 WHERE user_id = ?',
      [userId]
    );
  }
  
  // Insert new payment method
  db.run(
    `INSERT INTO user_payment_methods 
     (user_id, card_type, last_four, expiry_month, expiry_year, is_default) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, cardType, lastFour, expiryMonth, expiryYear, isDefault ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      const paymentMethodId = this.lastID;
      
      // Return the created payment method
      db.get(
        'SELECT * FROM user_payment_methods WHERE id = ?',
        [paymentMethodId],
        (err, paymentMethod) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          res.status(201).json(paymentMethod);
        }
      );
    }
  );
};

// Get user payment methods
exports.getUserPaymentMethods = (req, res) => {
  const userId = req.userId; // From auth middleware
  
  db.all('SELECT * FROM user_payment_methods WHERE user_id = ? ORDER BY is_default DESC', [userId], (err, paymentMethods) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    res.json(paymentMethods);
  });
};

// Delete payment method
exports.deletePaymentMethod = (req, res) => {
  const userId = req.userId; // From auth middleware
  const { id } = req.params;
  
  // Check if this is the default payment method
  db.get('SELECT is_default FROM user_payment_methods WHERE id = ? AND user_id = ?', [id, userId], (err, paymentMethod) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found or not owned by user' });
    }
    
    // Delete the payment method
    db.run('DELETE FROM user_payment_methods WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      // If it was the default payment method, set another one as default
      if (paymentMethod.is_default === 1) {
        db.get(
          'SELECT id FROM user_payment_methods WHERE user_id = ? LIMIT 1',
          [userId],
          (err, newDefaultPaymentMethod) => {
            if (!err && newDefaultPaymentMethod) {
              db.run('UPDATE user_payment_methods SET is_default = 1 WHERE id = ?', [newDefaultPaymentMethod.id]);
            }
          }
        );
      }
      
      res.json({ message: 'Payment method deleted successfully' });
    });
  });
};