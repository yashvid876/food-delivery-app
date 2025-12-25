const express = require('express');
const app = express();

// Test the routes directly
console.log('🧪 Testing Route Registration...\n');

// Manually register routes to see what's happening
const deliveryAgentRoutes = require('./routes/deliveryAgentRoutes');
const orderRoutes = require('./routes/orderRoutes');

console.log('📋 Delivery Agent Routes:');
deliveryAgentRoutes.stack.forEach(layer => {
  if (layer.route) {
    console.log(`📍 ${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
  }
});

console.log('\n📋 Order Routes:');
orderRoutes.stack.forEach(layer => {
  if (layer.route) {
    console.log(`📍 ${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
  }
});

console.log('\n✅ Route testing complete!');