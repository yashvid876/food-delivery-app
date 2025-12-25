const request = require('supertest');
const app = require('./server'); // Make sure to export app from server.js

// First, let's test the routes without authentication
async function testRoutes() {
  console.log('🧪 Testing Delivery Routes...\n');
  
  try {
    // Test health endpoint
    const healthResponse = await request(app).get('/api/health');
    console.log('✅ Health check:', healthResponse.status, healthResponse.body.message);
    
    // Test API info
    const apiResponse = await request(app).get('/api');
    console.log('✅ API info:', apiResponse.status);
    
    // Test debug routes
    const routesResponse = await request(app).get('/api/debug/routes');
    console.log('✅ Available routes:', routesResponse.body.length);
    
    // List all delivery-related routes
    const deliveryRoutes = routesResponse.body.filter(route => 
      route.path.includes('delivery') || route.path.includes('orders')
    );
    
    console.log('\n📋 Delivery & Order Routes:');
    deliveryRoutes.forEach(route => {
      console.log(`📍 ${route.methods.join(', ').toUpperCase()} ${route.path}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Update server.js to export app
// Add this at the end of server.js: module.exports = app;
testRoutes();