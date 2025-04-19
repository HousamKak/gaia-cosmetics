// server/src/db/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to database
const db = new sqlite3.Database(path.join(dbDir, 'gaia.db'));

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Export the database instance
module.exports = db;