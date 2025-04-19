// backend/src/config/env.config.js
const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Path to .env file
const envFilePath = path.join(__dirname, '../../.env');

// Generate and save a JWT secret if one doesn't exist
if (!process.env.JWT_SECRET) {
  console.log('JWT_SECRET not found in environment. Generating a new one...');
  
  // Generate a random secret
  const generatedSecret = crypto.randomBytes(64).toString('hex');
  
  // Check if .env file exists
  const envFileExists = fs.existsSync(envFilePath);
  
  if (envFileExists) {
    // Append to .env file
    fs.appendFileSync(envFilePath, `\nJWT_SECRET=${generatedSecret}\n`);
  } else {
    // Create .env file
    fs.writeFileSync(envFilePath, `JWT_SECRET=${generatedSecret}\n`);
  }
  
  // Set the environment variable for the current process
  process.env.JWT_SECRET = generatedSecret;
  
  console.log('JWT_SECRET generated and saved to .env file');
}

// Default configuration
const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // Database configuration
  db: {
    path: process.env.DB_PATH || path.join(__dirname, '../../data/gaia.db')
  },
  
  // Upload limits
  uploads: {
    maxSize: process.env.MAX_UPLOAD_SIZE || 5 * 1024 * 1024, // 5MB
    types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
};

module.exports = config;