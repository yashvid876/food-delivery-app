const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 Testing Working Endpoints...\n');

const testEndpoint = (path, method = 'GET') => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 404) {
          console.log(`❌ ${method} ${path} - 404 Not Found`);
        } else if (res.statusCode === 401) {
          console.log(`⚠️  ${method} ${path} - 401 Unauthorized (needs login)`);
        } else {
          console.log(`✅ ${method} ${path} - ${res.statusCode} OK`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`🚫 ${method} ${path} - Connection Error`);
      resolve();
    });

    req.end();
  });
};

async function runTests() {
  // Test the exact endpoints frontend is calling
  await testEndpoint('/delivery-agents/profile');
  await testEndpoint('/delivery-agents/my-orders');
  await testEndpoint('/delivery-agents/available-orders');
  await testEndpoint('/orders/delivery/available');
  
  console.log('\n💡 If you see 401 errors, that means routes exist but need authentication');
  console.log('💡 If you see 404 errors, routes are still incorrect');
  console.log('💡 If you see Connection Error, server is not running');
}

runTests();