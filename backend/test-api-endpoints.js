const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 Testing API Endpoints...\n');

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
        console.log(`✅ ${method} ${path} - Status: ${res.statusCode}`);
        if (res.statusCode !== 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`   Message: ${jsonData.message}`);
          } catch (e) {
            console.log(`   Response: ${data}`);
          }
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${method} ${path} - Error: ${err.message}`);
      resolve();
    });

    req.end();
  });
};

async function runTests() {
  // Test public endpoints
  await testEndpoint('/health');
  await testEndpoint('/');
  
  // Test delivery endpoints (will likely fail without auth)
  await testEndpoint('/delivery-agents/test');
  await testEndpoint('/delivery-agents/profile');
  await testEndpoint('/delivery-agents/orders');
  await testEndpoint('/delivery-agents/orders/available');
  await testEndpoint('/orders/delivery/available');
  
  console.log('\n🎉 Testing complete!');
}

runTests();