// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import config and middlewares
const config = require('./src/config/env.config');
const { securityHeaders, errorHandler, notFound } = require('./src/middleware/security.middleware');
const { ensureUploadDirectories } = require('./src/middleware/upload.middleware');

// Initialize database and seed data
require('./src/db/seed');

// Ensure upload directories exist
ensureUploadDirectories();

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');
const userRoutes = require('./src/routes/user.routes');
const contentRoutes = require('./src/routes/content.routes');
const categoryRoutes = require('./src/routes/category.routes');
const orderRoutes = require('./src/routes/order.routes');

// Import Swagger dependencies
const swaggerUi = require('swagger-ui-express');
// Import YAML parser
const YAML = require('yamljs');

// Load Swagger YAML file
const swaggerDocument = YAML.load('./src/swagger/swagger.yaml');

// Create Express app
const app = express();

// Apply security headers
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

// Root route for API check
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to GAIA Cosmetics API',
    version: '1.0.0',
    status: 'running'
  });
});

// Handle production - serve frontend
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});