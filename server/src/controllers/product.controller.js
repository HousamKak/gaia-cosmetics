// backend/src/controllers/product.controller.js
const db = require('../db/database');
const fs = require('fs');
const path = require('path');

// Get all products with pagination
exports.getAllProducts = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const search = req.query.search;
  
  let query = `
    SELECT p.*, 
      (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count,
      (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM products p
    WHERE 1=1
  `;
  let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
  let params = [];
  
  // Add filters
  if (category) {
    query += ' AND p.category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
  }
  
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    countQuery += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  // Add sorting and pagination
  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  // Get total count for pagination
  db.get(countQuery, params.slice(0, params.length - 2), (err, countResult) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    // Get products
    db.all(query, params, (err, products) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      // Prepare pagination info
      const totalCount = countResult.total;
      const totalPages = Math.ceil(totalCount / limit);
      
      // Fetch product colors for each product
      const productIds = products.map(p => p.id);
      
      if (productIds.length === 0) {
        return res.json({
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            perPage: limit
          },
          products: []
        });
      }
      
      // Get colors for all products
      const placeholders = productIds.map(() => '?').join(',');
      db.all(
        `SELECT * FROM product_colors WHERE product_id IN (${placeholders})`,
        productIds,
        (err, colors) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          // Group colors by product_id
          const productColors = colors.reduce((acc, color) => {
            if (!acc[color.product_id]) {
              acc[color.product_id] = [];
            }
            acc[color.product_id].push({
              id: color.id,
              name: color.name,
              value: color.value
            });
            return acc;
          }, {});
          
          // Add colors to products
          const productsWithColors = products.map(product => ({
            ...product,
            colors: productColors[product.id] || []
          }));
          
          res.json({
            pagination: {
              currentPage: page,
              totalPages,
              totalItems: totalCount,
              perPage: limit
            },
            products: productsWithColors
          });
        }
      );
    });
  });
};

// Get product by ID
exports.getProductById = (req, res) => {
  const { id } = req.params;
  
  // Get product info
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get product images
    db.all('SELECT * FROM product_images WHERE product_id = ?', [id], (err, images) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      // Get product colors
      db.all('SELECT * FROM product_colors WHERE product_id = ?', [id], (err, colors) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        // Combine all data
        res.json({
          ...product,
          images: images.map(img => ({
            id: img.id,
            imagePath: img.image_path,
            isPrimary: img.is_primary === 1
          })),
          colors: colors.map(color => ({
            id: color.id,
            name: color.name,
            value: color.value
          }))
        });
      });
    });
  });
};

// Create new product
exports.createProduct = (req, res) => {
  const {
    name,
    category,
    price,
    originalPrice,
    discountPercentage,
    description,
    ingredients,
    howToUse,
    inventoryStatus,
    inventoryMessage
  } = req.body;
  
  // Validate required fields
  if (!name || !category || !price) {
    return res.status(400).json({ message: 'Name, category, and price are required' });
  }
  
  // Insert the product
  db.run(
    `INSERT INTO products (
      name, category, price, original_price, discount_percentage,
      description, ingredients, how_to_use, inventory_status, inventory_message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, category, price, originalPrice || null, discountPercentage || null,
      description || null, ingredients || null, howToUse || null, 
      inventoryStatus || 'in-stock', inventoryMessage || null
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      const productId = this.lastID;
      
      // Process colors if provided
      const colors = req.body.colors ? JSON.parse(req.body.colors) : [];
      
      if (colors.length > 0) {
        const colorInsertStmt = db.prepare('INSERT INTO product_colors (product_id, name, value) VALUES (?, ?, ?)');
        
        colors.forEach(color => {
          colorInsertStmt.run(productId, color.name, color.value);
        });
        
        colorInsertStmt.finalize();
      }
      
      res.status(201).json({
        id: productId,
        message: 'Product created successfully'
      });
    }
  );
};

// Update product
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    price,
    originalPrice,
    discountPercentage,
    description,
    ingredients,
    howToUse,
    inventoryStatus,
    inventoryMessage
  } = req.body;
  
  // Validate required fields
  if (!name || !category || !price) {
    return res.status(400).json({ message: 'Name, category, and price are required' });
  }
  
  // Update product
  db.run(
    `UPDATE products SET
      name = ?, category = ?, price = ?, original_price = ?, discount_percentage = ?,
      description = ?, ingredients = ?, how_to_use = ?, inventory_status = ?, inventory_message = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      name, category, price, originalPrice || null, discountPercentage || null,
      description || null, ingredients || null, howToUse || null, 
      inventoryStatus || 'in-stock', inventoryMessage || null, id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Process colors if provided
      const colors = req.body.colors ? JSON.parse(req.body.colors) : null;
      
      if (colors) {
        // First delete existing colors
        db.run('DELETE FROM product_colors WHERE product_id = ?', [id], function(err) {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          // Insert new colors
          if (colors.length > 0) {
            const colorInsertStmt = db.prepare('INSERT INTO product_colors (product_id, name, value) VALUES (?, ?, ?)');
            
            colors.forEach(color => {
              colorInsertStmt.run(id, color.name, color.value);
            });
            
            colorInsertStmt.finalize();
          }
          
          res.json({
            id: parseInt(id),
            message: 'Product updated successfully'
          });
        });
      } else {
        res.json({
          id: parseInt(id),
          message: 'Product updated successfully'
        });
      }
    }
  );
};

// Delete product
exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  
  // First get product images to delete files
  db.all('SELECT image_path FROM product_images WHERE product_id = ?', [id], (err, images) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    // Delete the product
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Delete image files
      images.forEach(image => {
        const imagePath = path.join(__dirname, '../../uploads', image.image_path);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
      
      res.json({ message: 'Product deleted successfully' });
    });
  });
};

// Add product image
exports.addProductImage = (req, res) => {
  const { id } = req.params;
  const isPrimary = req.body.isPrimary === 'true';
  
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }
  
  // Check if product exists
  db.get('SELECT id FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If this is the primary image, update all other images to not be primary
    if (isPrimary) {
      db.run('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [id]);
    }
    
    // Insert the image
    const imagePath = '/uploads/products/' + req.file.filename;
    
    db.run(
      'INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, ?)',
      [id, imagePath, isPrimary ? 1 : 0],
      function(err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        res.status(201).json({
          id: this.lastID,
          productId: parseInt(id),
          imagePath,
          isPrimary
        });
      }
    );
  });
};

// Delete product image
exports.deleteProductImage = (req, res) => {
  const { productId, imageId } = req.params;
  
  // Get the image to delete the file
  db.get('SELECT * FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId], (err, image) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Delete from database
    db.run('DELETE FROM product_images WHERE id = ?', [imageId], function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      // Delete the file
      const imagePath = path.join(__dirname, '../../uploads', image.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      // If this was the primary image, set another image as primary
      if (image.is_primary === 1) {
        db.get(
          'SELECT id FROM product_images WHERE product_id = ? LIMIT 1',
          [productId],
          (err, newPrimary) => {
            if (!err && newPrimary) {
              db.run('UPDATE product_images SET is_primary = 1 WHERE id = ?', [newPrimary.id]);
            }
          }
        );
      }
      
      res.json({ message: 'Image deleted successfully' });
    });
  });
};

// Set product image as primary
exports.setPrimaryImage = (req, res) => {
  const { productId, imageId } = req.params;
  
  // Check if image exists
  db.get(
    'SELECT * FROM product_images WHERE id = ? AND product_id = ?',
    [imageId, productId],
    (err, image) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      // First set all images as not primary
      db.run('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [productId], (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        // Then set this image as primary
        db.run('UPDATE product_images SET is_primary = 1 WHERE id = ?', [imageId], function(err) {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          
          res.json({ message: 'Primary image set successfully' });
        });
      });
    }
  );
};