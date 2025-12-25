const db = require('../config/db');

const OrderItem = {
  create: (orderId, items, callback) => {
    if (!items || items.length === 0) {
      console.log('⚠️ No items to add to order');
      return callback(null, {});
    }

    console.log(`🛒 Creating ${items.length} order items for order ${orderId}`);

    // Check table structure first
    const checkTableQuery = "DESCRIBE order_items";
    
    db.query(checkTableQuery, (err, columns) => {
      if (err) {
        console.error('❌ Error checking order_items structure:', err);
        return callback(err);
      }

      const hasIdColumn = columns.some(col => col.Field === 'id');
      console.log('📊 order_items has id column:', hasIdColumn);

      // Prepare items for insertion based on table structure
      let insertQuery;
      let values;

      if (hasIdColumn) {
        // Table has id column (auto-increment)
        insertQuery = 'INSERT INTO order_items (order_id, menu_id, item_name, price, quantity) VALUES ?';
        values = items.map(item => [
          orderId,
          item.menu_id,
          item.items || item.item_name || 'Unknown Item',
          item.price,
          item.quantity || 1
        ]);
      } else {
        // Table doesn't have id column
        insertQuery = 'INSERT INTO order_items (order_id, menu_id, item_name, price, quantity) VALUES ?';
        values = items.map(item => [
          orderId,
          item.menu_id,
          item.items || item.item_name || 'Unknown Item',
          item.price,
          item.quantity || 1
        ]);
      }

      console.log('📝 Insert query:', insertQuery);
      console.log('📦 Values to insert:', values);

      db.query(insertQuery, [values], (err, results) => {
        if (err) {
          console.error('❌ Error inserting order items:', err);
          return callback(err);
        }

        console.log(`✅ Successfully inserted ${items.length} order items for order ${orderId}`);
        callback(null, results);
      });
    });
  },

  getByOrder: (orderId, callback) => {
    const query = 'SELECT * FROM order_items WHERE order_id = ?';
    db.query(query, [orderId], (err, results) => {
      if (err) {
        console.error('Error fetching order items:', err);
        return callback(err);
      }
      callback(null, results);
    });
  }
};

module.exports = OrderItem;