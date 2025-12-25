const express = require('express');
const app = express();

console.log('🧪 Testing Fixed Route Registration...\n');

// Load the fixed routes
const deliveryAgentRoutes = require('./routes/deliveryAgentRoutes');

console.log('📋 Fixed Delivery Agent Routes:');
deliveryAgentRoutes.stack.forEach(layer => {
  if (layer.route) {
    console.log(`📍 ${Object.keys(layer.route.methods).join(', ').toUpperCase()} /api/delivery-agents${layer.route.path}`);
  }
});

console.log('\n🎯 Frontend should now call:');
console.log('📍 GET /api/delivery-agents/profile');
console.log('📍 GET /api/delivery-agents/my-orders'); 
console.log('📍 GET /api/delivery-agents/available-orders');
console.log('📍 GET /api/orders/delivery/available');

console.log('\n✅ Route mapping complete!');