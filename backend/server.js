const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Add this to server.js before your routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});
// Routes (add this section)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/menu', require('./routes/menuRoutes')); // ← MAKE SURE THIS LINE EXISTS
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/delivery-agents', require('./routes/deliveryAgentRoutes'));
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: '🍕 FoodDel API is running!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    message: 'FoodDel API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      menu: '/api/menu',
      orders: '/api/orders',
      customers: '/api/customers',
      delivery: '/api/delivery-agents'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ... your existing server.js code ...

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Frontend: http://localhost:3000`);
});

// Export app for testing
module.exports = app;