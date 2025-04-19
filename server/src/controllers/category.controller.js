// backend/src/controllers/category.controller.js
const db = require('../db/database');
const fs = require('fs');
const path = require('path');

// Get all categories
exports.getAllCategories = (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    res.json(categories);
  });
};

// Get category by ID
exports.getCategoryById = (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  });
};

// Create new category
exports.createCategory = (req, res) => {
  const { name } = req.body;
  
  // Validate input
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  // Check if category with same name already exists
  db.get('SELECT id FROM categories WHERE name = ?', [name], (err, existingCategory) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    // If image was uploaded, set image path, otherwise set to null
    let imagePath = null;
    if (req.file) {
      imagePath = '/uploads/categories/' + req.file.filename;
    }
    
    // Insert the category
    db.run(
      'INSERT INTO categories (name, image_path) VALUES (?, ?)',
      [name, imagePath],
      function(err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        // Return the created category
        res.status(201).json({
          id: this.lastID,
          name,
          image_path: imagePath,
          product_count: 0
        });
      }
    );
  });
};

// Update category
exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  // Validate input
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  // Check if category with same name already exists (excluding current category)
  db.get('SELECT id FROM categories WHERE name = ? AND id != ?', [name, id], (err, existingCategory) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    // If image was uploaded, get current image to delete it
    if (req.file) {
      db.get('SELECT image_path FROM categories WHERE id = ?', [id], (err, category) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        // Delete old image if it exists
        if (category && category.image_path) {
          const oldImagePath = path.join(__dirname, '../../..', category.image_path);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        // Update with new image
        const newImagePath = '/uploads/categories/' + req.file.filename;
        updateCategoryWithImage(id, name, newImagePath, res);
      });
    } else {
      // Update without changing image
      updateCategoryWithoutImage(id, name, res);
    }
  });
};

// Helper function to update category with new image
function updateCategoryWithImage(id, name, imagePath, res) {
  db.run(
    'UPDATE categories SET name = ?, image_path = ? WHERE id = ?',
    [name, imagePath, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Return the updated category
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        res.json(category);
      });
    }
  );
}

// Helper function to update category without changing image
function updateCategoryWithoutImage(id, name, res) {
  db.run(
    'UPDATE categories SET name = ? WHERE id = ?',
    [name, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Return the updated category
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        res.json(category);
      });
    }
  );
}

// Delete category
exports.deleteCategory = (req, res) => {
  const { id } = req.params;
  
  // Check if category has associated products
  db.all('SELECT id FROM products WHERE category = (SELECT name FROM categories WHERE id = ?)', [id], (err, products) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (products.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with associated products',
        productCount: products.length
      });
    }
    
    // Get category image to delete
    db.get('SELECT image_path FROM categories WHERE id = ?', [id], (err, category) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Delete the category
      db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Category not found' });
        }
        
        // Delete the image file if it exists
        if (category.image_path) {
          const imagePath = path.join(__dirname, '../../..', category.image_path);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        
        res.json({ message: 'Category deleted successfully' });
      });
    });
  });
};

// Update product counts for categories
exports.updateProductCounts = () => {
  db.all('SELECT name FROM categories', (err, categories) => {
    if (err) {
      console.error('Error updating category product counts:', err);
      return;
    }
    
    categories.forEach(category => {
      db.get('SELECT COUNT(*) as count FROM products WHERE category = ?', [category.name], (err, result) => {
        if (err) {
          console.error(`Error counting products for category ${category.name}:`, err);
          return;
        }
        
        db.run('UPDATE categories SET product_count = ? WHERE name = ?', [result.count, category.name], function(err) {
          if (err) {
            console.error(`Error updating product count for category ${category.name}:`, err);
          }
        });
      });
    });
  });
};

// Get products by category
exports.getProductsByCategory = (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const sort = req.query.sort || 'newest';
  
  // Get the category name first
  db.get('SELECT name FROM categories WHERE id = ?', [id], (err, category) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Construct the query
    let query = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM product_colors WHERE product_id = p.id) as color_count,
        (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1) as image
      FROM products p
      WHERE p.category = ?
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE category = ?';
    const queryParams = [category.name];
    
    // Apply sorting
    if (sort === 'price-asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price-desc') {
      query += ' ORDER BY p.price DESC';
    } else if (sort === 'discount') {
      query += ' ORDER BY (p.original_price - p.price) DESC';
    } else {
      // Default to newest
      query += ' ORDER BY p.created_at DESC';
    }
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    // Get total count
    db.get(countQuery, [category.name], (err, countResult) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      // Get paginated products
      db.all(query, queryParams, (err, products) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        // Get colors for products
        const productIds = products.map(p => p.id);
        
        if (productIds.length === 0) {
          // No products found
          return res.json({
            category: category.name,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(countResult.total / limit),
              totalItems: countResult.total,
              perPage: limit
            },
            products: []
          });
        }
        
        // Create placeholders for IN clause
        const placeholders = productIds.map(() => '?').join(',');
        
        // Get colors for all products
        db.all(
          `SELECT * FROM product_colors WHERE product_id IN (${placeholders})`,
          productIds,
          (err, colors) => {
            if (err) {
              return res.status(500).json({ message: err.message });
            }
            
            // Group colors by product
            const productColors = {};
            colors.forEach(color => {
              if (!productColors[color.product_id]) {
                productColors[color.product_id] = [];
              }
              productColors[color.product_id].push({
                id: color.id,
                name: color.name,
                value: color.value
              });
            });
            
            // Add colors to products
            const productsWithColors = products.map(product => ({
              ...product,
              colors: productColors[product.id] || []
            }));
            
            // Return full response
            res.json({
              category: category.name,
              pagination: {
                currentPage: page,
                totalPages: Math.ceil(countResult.total / limit),
                totalItems: countResult.total,
                perPage: limit
              },
              products: productsWithColors
            });
          }
        );
      });
    });
  });
};