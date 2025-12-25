const express = require('express');
const app = express();
const PORT = 5001; // Different port to avoid conflict

// Import routes
app.use('/api/delivery-agents', require('./routes/deliveryAgentRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// List all routes
app.get('/api/routes', (req, res) => {
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
            path: '/api' + middleware.regexp.source.replace('\\/?(?=\\/|$)', '').replace(/^\/\^/, '') + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json(routes);
});

app.listen(PORT, () => {
  console.log(`🔍 Route tester running on http://localhost:${PORT}`);
  console.log(`📋 Check routes at: http://localhost:${PORT}/api/routes`);
});