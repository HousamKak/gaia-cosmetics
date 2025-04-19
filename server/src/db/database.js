// backend/src/db/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDirectory = path.join(__dirname, '../../../database');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// Database path
const dbPath = path.join(dbDirectory, 'gaia.db');

// Create and initialize the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
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
        inventory_status TEXT,
        inventory_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Product Images table
    db.run(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_path TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // Product Colors table
    db.run(`
      CREATE TABLE IF NOT EXISTS product_colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // Categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image_path TEXT,
        product_count INTEGER DEFAULT 0
      )
    `);

    // Cart Items table
    db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        color TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        shipping_cost REAL DEFAULT 0,
        total REAL NOT NULL,
        shipping_address TEXT,
        billing_address TEXT,
        payment_method TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Order Items table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        color TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // Wishlist table
    db.run(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )
    `);

    // Reviews table
    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Content Management table
    db.run(`
      CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        type TEXT DEFAULT 'text',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(section, key)
      )
    `);

    // Insert sample admin user if not exists
    db.get("SELECT id FROM users WHERE email = 'admin@gaia.com'", (err, row) => {
      if (err) {
        console.error('Error checking admin user:', err.message);
      } else if (!row) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        bcrypt.hash('admin123', saltRounds, (err, hash) => {
          if (err) {
            console.error('Error hashing password:', err.message);
          } else {
            db.run(
              "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
              ["Admin User", "admin@gaia.com", hash, "admin"],
              function(err) {
                if (err) {
                  console.error('Error creating admin user:', err.message);
                } else {
                  console.log('Admin user created successfully');
                }
              }
            );
          }
        });
      }
    });

    // Insert sample content
    insertSampleContent();
  });
}

// Function to insert sample content
function insertSampleContent() {
  const sampleContent = [
    // Hero section
    { section: 'hero', key: 'title', value: 'Ready again look flawless all day', type: 'text' },
    { section: 'hero', key: 'discount', value: '25-50% OFF', type: 'text' },
    { section: 'hero', key: 'image', value: '/images/hero-banner.jpg', type: 'image' },
    
    // Shop by Category
    { section: 'category', key: 'title', value: 'Shop By Categories', type: 'text' },
    
    // Limited Editions
    { section: 'limited_editions', key: 'title', value: 'Limited Editions', type: 'text' },
    { section: 'limited_editions', key: 'view_all_text', value: 'View all', type: 'text' },
    
    // Footer
    { section: 'footer', key: 'company_description', value: 'Beauty that empowers you to express yourself with natural ingredients and sustainable practices.', type: 'text' }
  ];
  
  // First, check if content already exists
  db.get("SELECT COUNT(*) as count FROM content", (err, row) => {
    if (err) {
      console.error('Error checking content:', err.message);
    } else if (row.count === 0) {
      // Insert sample content if none exists
      const insertStmt = db.prepare("INSERT INTO content (section, key, value, type) VALUES (?, ?, ?, ?)");
      
      sampleContent.forEach(item => {
        insertStmt.run(item.section, item.key, item.value, item.type, (err) => {
          if (err) {
            console.error('Error inserting content:', err.message);
          }
        });
      });
      
      insertStmt.finalize();
      console.log('Sample content inserted successfully');
    }
  });
}

module.exports = db;