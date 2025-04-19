// backend/src/controllers/order.controller.js
const db = require('../db/database');

// Create a new order
exports.createOrder = (req, res) => {
  const userId = req.userId; // From auth middleware
  const {
    items,
    subtotal,
    discount,
    shippingCost,
    total,
    shippingAddress,
    billingAddress,
    paymentMethod
  } = req.body;
  
  // Validate input
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item' });
  }
  
  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }
  
  // Begin transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    try {
      // Insert order
      db.run(
        `INSERT INTO orders 
         (user_id, status, subtotal, discount, shipping_cost, total, shipping_address, billing_address, payment_method) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, 'pending', subtotal, discount || 0, shippingCost || 0, total, 
         JSON.stringify(shippingAddress), 
         billingAddress ? JSON.stringify(billingAddress) : JSON.stringify(shippingAddress), 
         paymentMethod],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ message: err.message });
          }
          
          const orderId = this.lastID;
          let orderItemsInserted = 0;
          
          // Insert order items
          const orderItemStmt = db.prepare(
            'INSERT INTO order_items (order_id, product_id, quantity, price, color) VALUES (?, ?, ?, ?, ?)'
          );
          
          items.forEach(item => {
            orderItemStmt.run(
              [orderId, item.id, item.quantity, item.price, item.selectedColor || null],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ message: err.message });
                }
                
                orderItemsInserted++;
                
                // If all items are inserted, commit transaction and return response
                if (orderItemsInserted === items.length) {
                  db.run('COMMIT');
                  
                  // Generate order number (e.g., ORD-123456)
                  const orderNumber = `ORD-${String(orderId).padStart(6, '0')}`;
                  
                  res.status(201).json({
                    id: orderId,
                    orderNumber,
                    status: 'pending',
                    subtotal,
                    discount: discount || 0,
                    shippingCost: shippingCost || 0,
                    total,
                    createdAt: new Date().toISOString()
                  });
                }
              }
            );
          });
          
          orderItemStmt.finalize();
        }
      );
    } catch (err) {
      db.run('ROLLBACK');
      res.status(500).json({ message: err.message });
    }
  });
};

// Create a guest order (no authentication)
exports.createGuestOrder = (req, res) => {
  const {
    userInfo,
    items,
    subtotal,
    discount,
    shippingCost,
    total,
    shippingAddress,
    billingAddress,
    paymentMethod
  } = req.body;
  
  // Validate input
  if (!userInfo || !userInfo.email) {
    return res.status(400).json({ message: 'User email is required' });
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item' });
  }
  
  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }
  
  // Begin transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    try {
      // First check if this email belongs to a registered user
      db.get('SELECT id FROM users WHERE email = ?', [userInfo.email], (err, user) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ message: err.message });
        }
        
        const userId = user ? user.id : null;
        
        // Insert order as guest if no user found
        db.run(
          `INSERT INTO orders 
           (user_id, guest_email, guest_name, status, subtotal, discount, shipping_cost, total, 
           shipping_address, billing_address, payment_method) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, userInfo.email, userInfo.name || null, 'pending', subtotal, discount || 0, 
           shippingCost || 0, total, JSON.stringify(shippingAddress), 
           billingAddress ? JSON.stringify(billingAddress) : JSON.stringify(shippingAddress), 
           paymentMethod],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ message: err.message });
            }
            
            const orderId = this.lastID;
            let orderItemsInserted = 0;
            
            // Insert order items
            const orderItemStmt = db.prepare(
              'INSERT INTO order_items (order_id, product_id, quantity, price, color) VALUES (?, ?, ?, ?, ?)'
            );
            
            items.forEach(item => {
              orderItemStmt.run(
                [orderId, item.id, item.quantity, item.price, item.selectedColor || null],
                function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: err.message });
                  }
                  
                  orderItemsInserted++;
                  
                  // If all items are inserted, commit transaction and return response
                  if (orderItemsInserted === items.length) {
                    db.run('COMMIT');
                    
                    // Generate order number (e.g., ORD-123456)
                    const orderNumber = `ORD-${String(orderId).padStart(6, '0')}`;
                    
                    res.status(201).json({
                      id: orderId,
                      orderNumber,
                      status: 'pending',
                      subtotal,
                      discount: discount || 0,
                      shippingCost: shippingCost || 0,
                      total,
                      createdAt: new Date().toISOString()
                    });
                  }
                }
              );
            });
            
            orderItemStmt.finalize();
          }
        );
      });
    } catch (err) {
      db.run('ROLLBACK');
      res.status(500).json({ message: err.message });
    }
  });
};

// Get user orders
exports.getUserOrders = (req, res) => {
  const userId = req.userId; // From auth middleware
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  // Get total count
  db.get('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId], (err, countResult) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    // Get paginated orders
    db.all(
      `SELECT id, status, subtotal, discount, shipping_cost, total, created_at
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
      (err, orders) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        // For each order, get its items
        const ordersWithItems = [];
        let processedOrders = 0;
        
        if (orders.length === 0) {
          // No orders found, return empty array
          return res.json({
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(countResult.total / limit),
              totalItems: countResult.total,
              perPage: limit
            },
            orders: []
          });
        }
        
        orders.forEach(order => {
          // Generate order number
          const orderNumber = `ORD-${String(order.id).padStart(6, '0')}`;
          
          // Get order items
          db.all(
            `SELECT oi.*, p.name as product_name, pi.image_path as image
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
             WHERE oi.order_id = ?`,
            [order.id],
            (err, items) => {
              if (err) {
                return res.status(500).json({ message: err.message });
              }
              
              ordersWithItems.push({
                ...order,
                orderNumber,
                items
              });
              
              processedOrders++;
              
              // If all orders are processed, return response
              if (processedOrders === orders.length) {
                res.json({
                  pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(countResult.total / limit),
                    totalItems: countResult.total,
                    perPage: limit
                  },
                  orders: ordersWithItems
                });
              }
            }
          );
        });
      }
    );
  });
};

// Get order by ID
exports.getOrderById = (req, res) => {
  const userId = req.userId; // From auth middleware
  const { id } = req.params;
  
  // Get the order
  db.get(
    `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
    [id, userId],
    (err, order) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Generate order number
      const orderNumber = `ORD-${String(order.id).padStart(6, '0')}`;
      
      // Parse JSON fields
      order.shipping_address = JSON.parse(order.shipping_address);
      order.billing_address = JSON.parse(order.billing_address);
      
      // Get order items
      db.all(
        `SELECT oi.*, p.name as product_name, p.category, pi.image_path as image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
         WHERE oi.order_id = ?`,
        [id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          res.json({
            ...order,
            orderNumber,
            items
          });
        }
      );
    }
  );
};

// Cancel order
exports.cancelOrder = (req, res) => {
  const userId = req.userId; // From auth middleware
  const { id } = req.params;
  const { reason } = req.body;
  
  // Check if order exists and belongs to user
  db.get('SELECT status FROM orders WHERE id = ? AND user_id = ?', [id, userId], (err, order) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order can be cancelled (only pending or processing)
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled. Only pending or processing orders can be cancelled.' 
      });
    }
    
    // Update order status
    db.run(
      'UPDATE orders SET status = ?, cancellation_reason = ? WHERE id = ?',
      ['cancelled', reason || null, id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        res.json({ 
          message: 'Order cancelled successfully',
          orderId: id,
          status: 'cancelled'
        });
      }
    );
  });
};

// Admin: Get all orders
exports.getAllOrders = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status;
  
  // Construct base query
  let query = `
    SELECT o.id, o.user_id, o.guest_email, o.guest_name, o.status, o.subtotal, 
           o.discount, o.shipping_cost, o.total, o.created_at,
           u.name as user_name, u.email as user_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
  `;
  let countQuery = 'SELECT COUNT(*) as total FROM orders';
  
  // Add filters
  const queryParams = [];
  if (status) {
    query += ' WHERE o.status = ?';
    countQuery += ' WHERE status = ?';
    queryParams.push(status);
  }
  
  // Add sorting and pagination
  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);
  
  // Get total count
  db.get(countQuery, status ? [status] : [], (err, countResult) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    // Get paginated orders
    db.all(query, queryParams, (err, orders) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      // For each order, add formatted order number
      const formattedOrders = orders.map(order => ({
        ...order,
        orderNumber: `ORD-${String(order.id).padStart(6, '0')}`
      }));
      
      res.json({
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countResult.total / limit),
          totalItems: countResult.total,
          perPage: limit
        },
        orders: formattedOrders
      });
    });
  });
};

// Admin: Update order status
exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  
  // Update order status
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json({ 
        message: 'Order status updated successfully',
        orderId: id,
        status
      });
    }
  );
};

// Admin: Get order statistics
exports.getOrderStats = (req, res) => {
  // Get date range from query params, default to last 30 days
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  const startDate = req.query.startDate 
    ? new Date(req.query.startDate) 
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Format dates for SQLite
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // Get total orders and revenue
  db.get(
    `SELECT COUNT(*) as totalOrders, SUM(total) as totalRevenue
     FROM orders
     WHERE DATE(created_at) BETWEEN ? AND ?`,
    [startDateStr, endDateStr],
    (err, totals) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      // Get orders by status
      db.all(
        `SELECT status, COUNT(*) as count
         FROM orders
         WHERE DATE(created_at) BETWEEN ? AND ?
         GROUP BY status`,
        [startDateStr, endDateStr],
        (err, statusCounts) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          // Get top products
          db.all(
            `SELECT oi.product_id, p.name, COUNT(*) as orderCount, SUM(oi.quantity) as totalQuantity
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             WHERE DATE(o.created_at) BETWEEN ? AND ?
             GROUP BY oi.product_id
             ORDER BY totalQuantity DESC
             LIMIT 5`,
            [startDateStr, endDateStr],
            (err, topProducts) => {
              if (err) {
                return res.status(500).json({ message: err.message });
              }
              
              // Get daily order counts
              db.all(
                `SELECT DATE(created_at) as date, COUNT(*) as orderCount, SUM(total) as revenue
                 FROM orders
                 WHERE DATE(created_at) BETWEEN ? AND ?
                 GROUP BY DATE(created_at)
                 ORDER BY date`,
                [startDateStr, endDateStr],
                (err, dailyStats) => {
                  if (err) {
                    return res.status(500).json({ message: err.message });
                  }
                  
                  res.json({
                    period: {
                      startDate: startDateStr,
                      endDate: endDateStr
                    },
                    totals: {
                      orders: totals.totalOrders || 0,
                      revenue: totals.totalRevenue || 0
                    },
                    ordersByStatus: statusCounts,
                    topProducts,
                    dailyStats
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};

// Validate promo code
exports.validatePromoCode = (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ message: 'Promo code is required' });
  }
  
  // Check if promo code exists and is valid
  db.get(
    `SELECT * FROM promo_codes 
     WHERE code = ? 
     AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
     AND (max_uses IS NULL OR uses < max_uses)`,
    [code.toUpperCase()],
    (err, promoCode) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (!promoCode) {
        return res.status(404).json({ message: 'Invalid or expired promo code' });
      }
      
      res.json({
        valid: true,
        code: promoCode.code,
        discountType: promoCode.discount_type,
        discountValue: promoCode.discount_value,
        message: `${promoCode.discount_type === 'percentage' ? promoCode.discount_value + '%' : '₹' + promoCode.discount_value} discount applied`
      });
    }
  );
};

// Calculate shipping cost
exports.calculateShipping = (req, res) => {
  const { postalCode, country, items, subtotal } = req.body;
  
  // Validate input
  if (!postalCode || !country || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Postal code, country, and items are required' });
  }
  
  // Simple shipping calculation logic
  // In a real app, this would be more sophisticated, using shipping zones, weights, etc.
  let shippingCost = 50; // Base shipping cost
  
  // Free shipping for orders above a certain amount
  if (subtotal >= 999) {
    shippingCost = 0;
  }
  
  res.json({
    shippingCost,
    currency: 'INR',
    freeShippingThreshold: 999,
    estimatedDelivery: '3-5 business days'
  });
};

// Track order (for guests)
exports.trackOrder = (req, res) => {
  const { orderNumber, email } = req.query;
  
  if (!orderNumber || !email) {
    return res.status(400).json({ message: 'Order number and email are required' });
  }
  
  // Extract order ID from order number
  const orderId = parseInt(orderNumber.replace('ORD-', ''));
  
  if (isNaN(orderId)) {
    return res.status(400).json({ message: 'Invalid order number format' });
  }
  
  // Find the order
  db.get(
    `SELECT * FROM orders 
     WHERE id = ? AND (guest_email = ? OR 
     (user_id IS NOT NULL AND user_id IN (SELECT id FROM users WHERE email = ?)))`,
    [orderId, email, email],
    (err, order) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found or email does not match' });
      }
      
      // Parse JSON fields
      order.shipping_address = JSON.parse(order.shipping_address);
      
      // Generate tracking response
      res.json({
        orderNumber,
        status: order.status,
        createdAt: order.created_at,
        total: order.total,
        shippingAddress: {
          name: order.shipping_address.name,
          city: order.shipping_address.city,
          state: order.shipping_address.state,
          country: order.shipping_address.country
        }
      });
    }
  );
};