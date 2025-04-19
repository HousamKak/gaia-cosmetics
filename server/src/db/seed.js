// server/src/db/seed.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create uploads directories
const uploadDirs = [
  path.join(__dirname, '../..', 'uploads'),
  path.join(__dirname, '../..', 'uploads/products'),
  path.join(__dirname, '../..', 'uploads/categories'),
  path.join(__dirname, '../..', 'uploads/content')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Connect to database
const db = new sqlite3.Database(path.join(dbDir, 'gaia.db'));

// Begin transaction
db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      image_path TEXT,
      product_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      discount_percentage INTEGER,
      description TEXT,
      ingredients TEXT,
      how_to_use TEXT,
      inventory_status TEXT DEFAULT 'in-stock',
      inventory_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS product_colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(section, key)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      guest_email TEXT,
      guest_name TEXT,
      status TEXT DEFAULT 'pending',
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      shipping_cost REAL DEFAULT 0,
      total REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      billing_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      cancellation_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      color TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL,
      phone TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      card_type TEXT NOT NULL,
      last_four TEXT NOT NULL,
      expiry_month TEXT NOT NULL,
      expiry_year TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_purchase REAL,
      max_discount REAL,
      uses INTEGER DEFAULT 0,
      max_uses INTEGER,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Admin User
  const seedAdminUser = () => {
    const name = 'Admin User';
    const email = 'admin@gaia.com';
    const password = 'admin123';

    // Check if admin already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        console.error('Error checking admin user:', err);
        return;
      }

      if (user) {
        console.log('Admin user already exists');
        return;
      }

      // Hash password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }

        // Insert admin user
        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [name, email, hashedPassword, 'admin'],
          function(err) {
            if (err) {
              console.error('Error inserting admin user:', err);
              return;
            }
            console.log('Admin user created successfully');
          }
        );
      });
    });
  };

  // Seed Demo User
  const seedDemoUser = () => {
    const name = 'Demo User';
    const email = 'demo@gaia.com';
    const password = 'password123';

    // Check if demo user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        console.error('Error checking demo user:', err);
        return;
      }

      if (user) {
        console.log('Demo user already exists');
        return;
      }

      // Hash password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }

        // Insert demo user
        db.run(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, hashedPassword],
          function(err) {
            if (err) {
              console.error('Error inserting demo user:', err);
              return;
            }
            console.log('Demo user created successfully');
          }
        );
      });
    });
  };

  // Seed Categories
  const seedCategories = () => {
    const categories = [
      { name: 'Makeup', image_path: '/uploads/categories/makeup.jpg' },
      { name: 'Skincare', image_path: '/uploads/categories/skincare.jpg' },
      { name: 'Fragrance', image_path: '/uploads/categories/fragrance.jpg' },
      { name: 'Eyes', image_path: '/uploads/categories/eyes.jpg' },
      { name: 'Lips', image_path: '/uploads/categories/lips.jpg' },
      { name: 'Face', image_path: '/uploads/categories/face.jpg' }
    ];

    // Check if categories already exist
    db.get('SELECT COUNT(*) as count FROM categories', (err, result) => {
      if (err) {
        console.error('Error checking categories:', err);
        return;
      }

      if (result.count > 0) {
        console.log('Categories already exist');
        return;
      }

      // Insert categories
      const stmt = db.prepare('INSERT INTO categories (name, image_path) VALUES (?, ?)');
      categories.forEach(category => {
        stmt.run([category.name, category.image_path], err => {
          if (err) console.error('Error inserting category:', err);
        });
      });
      stmt.finalize();
      console.log('Categories seeded successfully');
    });
  };

  // Seed Products
  const seedProducts = () => {
    // Check if products already exist
    db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
      if (err) {
        console.error('Error checking products:', err);
        return;
      }

      if (result.count > 0) {
        console.log('Products already exist');
        return;
      }

      // Sample products
      const products = [
        {
          name: 'Plush Warm Beige Lipstick',
          category: 'Lips',
          price: 499,
          original_price: 999,
          discount_percentage: 50,
          description: 'A luxurious matte lipstick that delivers intense color payoff with a velvety finish. The ultra-creamy formula keeps lips hydrated all day while providing long-lasting wear.',
          ingredients: 'Ricinus Communis (Castor) Seed Oil, Caprylic/Capric Triglyceride, Silica, Cetyl Alcohol, Euphorbia Cerifera (Candelilla) Wax, Aluminum Starch Octenylsuccinate, Cetearyl Alcohol, Aluminum Hydroxide, Copernicia Cerifera (Carnauba) Wax, Tocopheryl Acetate, Tocopherol.',
          how_to_use: 'Start by outlining the lips with the pointed tip for precision, then fill in with the flat side of the bullet. For a more defined look, use with a lip liner. Apply a second coat for more intensity.',
          inventory_status: 'in-stock',
          images: [
            { path: '/uploads/products/product-lipstick-beige.jpg', is_primary: 1 },
            { path: '/uploads/products/product-lipstick-beige-2.jpg', is_primary: 0 },
            { path: '/uploads/products/product-lipstick-beige-3.jpg', is_primary: 0 }
          ],
          colors: [
            { name: 'Pink', value: '#FFB6C1' },
            { name: 'Silver', value: '#D3D3D3' },
            { name: 'Beige', value: '#DEB887' },
            { name: 'Coral', value: '#FF7F7F' }
          ]
        },
        {
          name: 'Silk Foundation Medium',
          category: 'Face',
          price: 799,
          original_price: 1299,
          discount_percentage: 38,
          description: 'A lightweight, buildable foundation that blends seamlessly for a natural, skin-like finish. Formulated with hydrating ingredients to keep skin moisturized throughout the day.',
          ingredients: 'Aqua, Cyclopentasiloxane, Glycerin, Dimethicone, Peg-10 Dimethicone, Butylene Glycol, Alcohol Denat., Phenyl Trimethicone, Peg/Ppg-18/18 Dimethicone, Silica, Cetyl Peg/Ppg-10/1 Dimethicone.',
          how_to_use: 'Apply with fingers, a brush, or a makeup sponge. Start from the center of the face and blend outward. Build coverage as desired.',
          inventory_status: 'in-stock',
          images: [
            { path: '/uploads/products/product-foundation.jpg', is_primary: 1 }
          ],
          colors: [
            { name: 'Beige', value: '#E3BC9A' },
            { name: 'Tan', value: '#D2B48C' },
            { name: 'Rose', value: '#BC8F8F' }
          ]
        },
        {
          name: 'Rose Gold Highlighter',
          category: 'Face',
          price: 599,
          original_price: 899,
          discount_percentage: 33,
          description: 'A finely-milled, luminous highlighter that gives skin a natural, radiant glow. The silky formula blends effortlessly and can be built up for a more intense highlight.',
          inventory_status: 'in-stock',
          images: [
            { path: '/uploads/products/product-highlighter.jpg', is_primary: 1 }
          ],
          colors: [
            { name: 'Gold', value: '#FFD700' },
            { name: 'Champagne', value: '#F0E68C' },
            { name: 'Rose', value: '#FFC0CB' }
          ]
        },
        {
          name: 'Velvet Matte Eyeliner',
          category: 'Eyes',
          price: 349,
          original_price: 499,
          discount_percentage: 30,
          description: 'A smudge-proof, long-wearing eyeliner that glides on smoothly for precise application. The waterproof formula stays put for up to 12 hours.',
          inventory_status: 'low-stock',
          inventory_message: 'Only Few Left!',
          images: [
            { path: '/uploads/products/product-eyeliner.jpg', is_primary: 1 }
          ],
          colors: [
            { name: 'Black', value: '#000000' },
            { name: 'Brown', value: '#8B4513' }
          ]
        },
        {
          name: 'Dewy Setting Spray',
          category: 'Face',
          price: 449,
          original_price: 699,
          discount_percentage: 36,
          description: 'A lightweight setting spray that locks in makeup while providing a dewy finish. Enriched with hydrating ingredients to refresh and revitalize the skin.',
          inventory_status: 'in-stock',
          images: [
            { path: '/uploads/products/product-setting-spray.jpg', is_primary: 1 }
          ],
          colors: []
        },
        {
          name: 'Glossy Lip Oil',
          category: 'Lips',
          price: 399,
          original_price: 599,
          discount_percentage: 33,
          description: 'A nourishing lip oil that provides a glossy finish while hydrating and conditioning the lips. Infused with vitamin E and jojoba oil for added moisture.',
          inventory_status: 'in-stock',
          images: [
            { path: '/uploads/products/product-lip-oil.jpg', is_primary: 1 }
          ],
          colors: [
            { name: 'Pink', value: '#FFB6C1' },
            { name: 'Coral', value: '#FF7F7F' }
          ]
        },
        {
          name: 'Hydrating Face Mist',
          category: 'Skincare',
          price: 349,
          original_price: 499,
          discount_percentage: 30,
          description: 'A refreshing face mist that hydrates and revitalizes the skin throughout the day. Infused with rose water and hyaluronic acid for added moisture.',
          inventory_status: 'in-stock',
          images: [
            { path: '/uploads/products/product-face-mist.jpg', is_primary: 1 }
          ],
          colors: []
        },
        {
          name: 'Citrus Blossom Perfume',
          category: 'Fragrance',
          price: 1299,
          original_price: 1999,
          discount_percentage: 35,
          description: 'A vibrant, energizing fragrance with notes of citrus, jasmine, and warm amber. Long-lasting and perfect for everyday wear.',
          inventory_status: 'in-stock',
          images: [
            { path: '/uploads/products/product-citrus-perfume.jpg', is_primary: 1 }
          ],
          colors: []
        }
      ];

      // Insert products
      products.forEach(product => {
        db.run(
          `INSERT INTO products 
           (name, category, price, original_price, discount_percentage, description, ingredients, how_to_use, inventory_status, inventory_message) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name, 
            product.category, 
            product.price, 
            product.original_price, 
            product.discount_percentage, 
            product.description, 
            product.ingredients || null, 
            product.how_to_use || null, 
            product.inventory_status, 
            product.inventory_message || null
          ],
          function(err) {
            if (err) {
              console.error('Error inserting product:', err);
              return;
            }
            
            const productId = this.lastID;
            
            // Insert product images
            if (product.images && product.images.length > 0) {
              const imageStmt = db.prepare('INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, ?)');
              product.images.forEach(image => {
                imageStmt.run([productId, image.path, image.is_primary], err => {
                  if (err) console.error('Error inserting product image:', err);
                });
              });
              imageStmt.finalize();
            }
            
            // Insert product colors
            if (product.colors && product.colors.length > 0) {
              const colorStmt = db.prepare('INSERT INTO product_colors (product_id, name, value) VALUES (?, ?, ?)');
              product.colors.forEach(color => {
                colorStmt.run([productId, color.name, color.value], err => {
                  if (err) console.error('Error inserting product color:', err);
                });
              });
              colorStmt.finalize();
            }
          }
        );
      });
      
      console.log('Products seeded successfully');
    });
  };

  // Seed Content
  const seedContent = () => {
    // Check if content already exists
    db.get('SELECT COUNT(*) as count FROM content', (err, result) => {
      if (err) {
        console.error('Error checking content:', err);
        return;
      }

      if (result.count > 0) {
        console.log('Content already exists');
        return;
      }

      // Sample content
      const content = [
        // Hero section
        { section: 'hero', key: 'title', value: 'Ready to look flawless all day', type: 'text' },
        { section: 'hero', key: 'discount', value: '25-50% OFF', type: 'text' },
        { section: 'hero', key: 'image', value: '/uploads/content/hero-banner.jpg', type: 'image' },
        
        // Limited editions
        { section: 'limited_editions', key: 'summer_title', value: 'Summer Collection', type: 'text' },
        { section: 'limited_editions', key: 'summer_image', value: '/uploads/content/limited-summer.jpg', type: 'image' },
        { section: 'limited_editions', key: 'summer_discount', value: '30% OFF', type: 'text' },
        
        { section: 'limited_editions', key: 'bridal_title', value: 'Bridal Collection', type: 'text' },
        { section: 'limited_editions', key: 'bridal_image', value: '/uploads/content/limited-bridal.jpg', type: 'image' },
        { section: 'limited_editions', key: 'bridal_discount', value: '20% OFF', type: 'text' },
        
        // Category banners
        { section: 'category', key: 'makeup_banner', value: '/uploads/content/category-makeup-banner.jpg', type: 'image' },
        { section: 'category', key: 'skincare_banner', value: '/uploads/content/category-skincare-banner.jpg', type: 'image' },
        { section: 'category', key: 'fragrance_banner', value: '/uploads/content/category-fragrance-banner.jpg', type: 'image' },
        
        // About content
        { section: 'about', key: 'title', value: 'About GAIA Cosmetics', type: 'text' },
        { section: 'about', key: 'description', value: 'GAIA Cosmetics is committed to creating high-quality, sustainable beauty products that empower you to express yourself. Our formulations are clean, cruelty-free, and packaged in eco-friendly materials.', type: 'text' },
        { section: 'about', key: 'mission', value: 'Our mission is to provide innovative, inclusive beauty products that celebrate diversity and promote self-expression while being kind to our planet.', type: 'text' },
        
        // Footer content
        { section: 'footer', key: 'copyright', value: '© 2023 GAIA Cosmetics. All rights reserved.', type: 'text' },
        { section: 'footer', key: 'address', value: '123 Beauty Lane, Makeup City, MC 10001', type: 'text' },
        { section: 'footer', key: 'phone', value: '+91 1234567890', type: 'text' },
        { section: 'footer', key: 'email', value: 'contact@gaiacosmetics.com', type: 'text' }
      ];

      // Insert content
      const stmt = db.prepare('INSERT INTO content (section, key, value, type) VALUES (?, ?, ?, ?)');
      content.forEach(item => {
        stmt.run([item.section, item.key, item.value, item.type], err => {
          if (err) console.error('Error inserting content:', err);
        });
      });
      stmt.finalize();
      
      console.log('Content seeded successfully');
    });
  };

  // Seed Promo Codes
  const seedPromoCodes = () => {
    // Check if promo codes already exist
    db.get('SELECT COUNT(*) as count FROM promo_codes', (err, result) => {
      if (err) {
        console.error('Error checking promo codes:', err);
        return;
      }

      if (result.count > 0) {
        console.log('Promo codes already exist');
        return;
      }

      // Sample promo codes
      const promoCodes = [
        { 
          code: 'WELCOME10', 
          discount_type: 'percentage', 
          discount_value: 10, 
          min_purchase: 500, 
          max_uses: null, 
          expires_at: null 
        },
        { 
          code: 'GAIA20', 
          discount_type: 'percentage', 
          discount_value: 20, 
          min_purchase: 1000, 
          max_uses: 100, 
          expires_at: '2024-12-31' 
        },
        { 
          code: 'FLAT100', 
          discount_type: 'fixed', 
          discount_value: 100, 
          min_purchase: 500, 
          max_uses: 50, 
          expires_at: '2024-12-31' 
        }
      ];

      // Insert promo codes
      const stmt = db.prepare(
        'INSERT INTO promo_codes (code, discount_type, discount_value, min_purchase, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
      );
      promoCodes.forEach(code => {
        stmt.run([code.code, code.discount_type, code.discount_value, code.min_purchase, code.max_uses, code.expires_at], err => {
          if (err) console.error('Error inserting promo code:', err);
        });
      });
      stmt.finalize();
      
      console.log('Promo codes seeded successfully');
    });
  };

  // Run all seed functions
  seedAdminUser();
  seedDemoUser();
  seedCategories();
  seedProducts();
  seedContent();
  seedPromoCodes();

  console.log('Database seeding completed!');
});

// Close database connection
// db.close();

module.exports = db;