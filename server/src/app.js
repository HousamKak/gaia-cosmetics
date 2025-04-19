// backend/src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // Using YAMLJS to parse the YAML file
import Swiper, { Pagination } from 'swiper';
import 'swiper/modules/autoplay/autoplay';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load Swagger YAML file
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger/swagger.yaml'));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  // Swagger UI configuration options (optional)
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }', // Hide the top bar
  customSiteTitle: "GAIA Cosmetics API Documentation"
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  res.status(status).json({
    error: {
      status,
      message
    }
  });
});

module.exports = app;