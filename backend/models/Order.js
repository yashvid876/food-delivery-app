const db = require('../config/db');

const Order = {
  create: (orderData, callback) => {
    const { order_id, customer_id, restaurant_id, total_amount, delivery_address, payment_method } = orderData;
    const query = `INSERT INTO Orders (order_id, customer_id, restaurant_id, date, time, total_amount, delivery_address, payment_method, status) 
                   VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, ?, ?, 'pending')`;
    db.query(query, [order_id, customer_id, restaurant_id, total_amount, delivery_address, payment_method], callback);
  },

  getById: (id, callback) => {
    const query = `
      SELECT o.*, c.name as customer_name, r.name as restaurant_name, r.location as restaurant_location,
             da.name as delivery_agent_name, da.phone_no as delivery_agent_phone
      FROM Orders o 
      LEFT JOIN Customer c ON o.customer_id = c.customer_id 
      LEFT JOIN Restaurant r ON o.restaurant_id = r.restaurant_id 
      LEFT JOIN DeliveryAgent da ON o.delivery_agent_id = da.agent_id 
      WHERE o.order_id = ?
    `;
    db.query(query, [id], callback);
  },

  getByCustomer: (customerId, callback) => {
    const query = `
      SELECT o.*, r.name as restaurant_name, r.location as restaurant_location 
      FROM Orders o 
      JOIN Restaurant r ON o.restaurant_id = r.restaurant_id 
      WHERE o.customer_id = ? 
      ORDER BY o.date DESC, o.time DESC
    `;
    db.query(query, [customerId], callback);
  },

  getByRestaurant: (restaurantId, callback) => {
    const query = `
      SELECT o.*, c.name as customer_name, c.phone_no as customer_phone
      FROM Orders o 
      JOIN Customer c ON o.customer_id = c.customer_id 
      WHERE o.restaurant_id = ? 
      ORDER BY o.date DESC, o.time DESC
    `;
    db.query(query, [restaurantId], callback);
  },

  getAvailableForDelivery: (callback) => {
    const query = `
      SELECT o.*, r.name as restaurant_name, r.location as restaurant_location, 
             c.name as customer_name, c.phone_no as customer_phone
      FROM Orders o 
      JOIN Restaurant r ON o.restaurant_id = r.restaurant_id 
      JOIN Customer c ON o.customer_id = c.customer_id 
      WHERE o.status = 'ready' AND o.delivery_agent_id IS NULL
      ORDER BY o.date DESC, o.time DESC
    `;
    console.log('Fetching available orders for delivery...');
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error in getAvailableForDelivery:', err);
        return callback(err);
      }
      console.log(`Found ${results.length} available orders for delivery`);
      callback(null, results);
    });
  },

  getByDeliveryAgent: (agentId, callback) => {
    const query = `
      SELECT o.*, r.name as restaurant_name, r.location as restaurant_location, 
             c.name as customer_name, c.phone_no as customer_phone
      FROM Orders o 
      JOIN Restaurant r ON o.restaurant_id = r.restaurant_id 
      JOIN Customer c ON o.customer_id = c.customer_id 
      WHERE o.delivery_agent_id = ?
      ORDER BY o.date DESC, o.time DESC
    `;
    db.query(query, [agentId], callback);
  },

  updateStatus: (orderId, status, callback) => {
    const query = 'UPDATE Orders SET status = ? WHERE order_id = ?';
    console.log(`Updating order ${orderId} status to: ${status}`);
    db.query(query, [status, orderId], (err, results) => {
      if (err) {
        console.error('Error updating order status:', err);
        return callback(err);
      }
      console.log(`Order ${orderId} status updated to ${status}. Affected rows: ${results.affectedRows}`);
      callback(null, results);
    });
  },

  assignDeliveryAgent: (orderId, agentId, callback) => {
    const query = 'UPDATE Orders SET delivery_agent_id = ?, status = "picked_up" WHERE order_id = ?';
    console.log(`Assigning order ${orderId} to delivery agent ${agentId}`);
    db.query(query, [agentId, orderId], (err, results) => {
      if (err) {
        console.error('Error assigning delivery agent:', err);
        return callback(err);
      }
      console.log(`Order ${orderId} assigned to agent ${agentId}. Affected rows: ${results.affectedRows}`);
      callback(null, results);
    });
  },

  completeDelivery: (orderId, callback) => {
    const query = 'UPDATE Orders SET status = "delivered", delivery_time = CURTIME() WHERE order_id = ?';
    db.query(query, [orderId], callback);
  }
};

module.exports = Order;