const db = require('../config/db');

const Menu = {
  getByRestaurant: (restaurantId, callback) => {
    const query = 'SELECT * FROM Menu WHERE restaurant_id = ? ORDER BY menu_id';
    console.log(`📊 Executing menu query for restaurant ${restaurantId}`);
    
    db.query(query, [restaurantId], (err, results) => {
      if (err) {
        console.error('❌ Menu query error:', err);
        return callback(err);
      }
      console.log(`📊 Menu query returned ${results.length} items`);
      callback(null, results);
    });
  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM Menu WHERE menu_id = ?';
    db.query(query, [id], callback);
  },

  create: (menuData, callback) => {
    const { menu_id, restaurant_id, items, price, types, cuisine } = menuData;
    const query = 'INSERT INTO Menu (menu_id, restaurant_id, items, price, types, cuisine) VALUES (?, ?, ?, ?, ?, ?)';
    
    console.log('📝 Creating menu item with data:', {
      menu_id,
      restaurant_id,
      items,
      price,
      types,
      cuisine
    });
    
    db.query(query, [menu_id, restaurant_id, items, price, types, cuisine], (err, results) => {
      if (err) {
        console.error('❌ Error in Menu.create:', err);
        console.error('❌ SQL Error details:', err.sqlMessage);
        return callback(err);
      }
      console.log('✅ Menu item created in database');
      callback(null, results);
    });
  },

  update: (id, menuData, callback) => {
    const { items, price, types, cuisine } = menuData;
    const query = 'UPDATE Menu SET items = ?, price = ?, types = ?, cuisine = ? WHERE menu_id = ?';
    db.query(query, [items, price, types, cuisine, id], callback);
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM Menu WHERE menu_id = ?';
    db.query(query, [id], callback);
  }
};

module.exports = Menu;