const db = require('./config/db');

console.log('🔍 Checking restaurants in database...');

// Check if restaurants table exists and has data
db.query('SELECT * FROM Restaurant', (err, results) => {
  if (err) {
    console.error('❌ Error querying restaurants:', err.message);
    return;
  }
  
  console.log(`✅ Found ${results.length} restaurants in database:`);
  results.forEach((restaurant, index) => {
    console.log(`${index + 1}. ${restaurant.name} - ${restaurant.cuisine} - ${restaurant.location}`);
  });
  
  if (results.length === 0) {
    console.log('💡 No restaurants found. You need to add restaurants to the database.');
  }
  
  process.exit();
});