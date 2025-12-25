const db = require('../config/db');

const Restaurant = {
  getAll: (callback) => {
    const query = 'SELECT * FROM Restaurant WHERE restaurant_id IS NOT NULL';
    console.log('📊 Executing query:', query);
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('❌ Query error:', err);
        return callback(err);
      }
      console.log(`📊 Query returned ${results.length} rows`);
      callback(null, results);
    });
  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM Restaurant WHERE restaurant_id = ?';
    db.query(query, [id], callback);
  },

  getByUserId: (userId, callback) => {
  const query = 'SELECT * FROM Restaurant WHERE user_id = ?';
  console.log(`🔄 [MODEL DEBUG] Executing: ${query} with userId: ${userId}`);
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('❌ [MODEL DEBUG] Query error:', err);
      return callback(err);
    }
    
    console.log(`📊 [MODEL DEBUG] Query returned ${results.length} rows`);
    if (results.length > 0) {
      console.log('✅ [MODEL DEBUG] Found restaurant:', results[0].name);
    } else {
      console.log('❌ [MODEL DEBUG] No restaurant found for user:', userId);
      
      // Debug: Check what user_id values exist in Restaurant table
      db.query('SELECT DISTINCT user_id FROM Restaurant WHERE user_id IS NOT NULL', (debugErr, userResults) => {
        if (!debugErr) {
          console.log('📋 [MODEL DEBUG] Existing user_id values in Restaurant table:', userResults.map(r => r.user_id));
        }
      });
    }
    
    callback(null, results);
  });
},

  getByCuisine: (cuisine, callback) => {
    const query = 'SELECT * FROM Restaurant WHERE cuisine LIKE ?';
    db.query(query, [`%${cuisine}%`], callback);
  },

  update: (id, restaurantData, callback) => {
    const { name, location, cuisine, phone_no, rating, pricing } = restaurantData;
    const query = 'UPDATE Restaurant SET name = ?, location = ?, cuisine = ?, phone_no = ?, rating = ?, pricing = ? WHERE restaurant_id = ?';
    db.query(query, [name, location, cuisine, phone_no, rating, pricing, id], callback);
  },

  // New method to create restaurant for new owners
  create: (restaurantData, callback) => {
    const { name, location, cuisine, phone_no, user_id } = restaurantData;
    const query = 'INSERT INTO Restaurant (name, location, cuisine, phone_no, user_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, location, cuisine, phone_no, user_id], callback);
  }
};

module.exports = Restaurant;