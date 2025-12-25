const db = require('../config/db');

const Payment = {
  create: (paymentData, callback) => {
    const { payment_id, mode, status, discount, tip, customer_id, restaurant_id, order_id, amount } = paymentData;
    const query = 'INSERT INTO Payment (payment_id, mode, status, discount, tip, customer_id, restaurant_id, order_id, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [payment_id, mode, status, discount, tip, customer_id, restaurant_id, order_id, amount], callback);
  },

  getByCustomer: (customerId, callback) => {
    const query = 'SELECT * FROM Payment WHERE customer_id = ? ORDER BY payment_id DESC';
    db.query(query, [customerId], callback);
  },

  getByOrder: (orderId, callback) => {
    const query = 'SELECT * FROM Payment WHERE order_id = ?';
    db.query(query, [orderId], callback);
  },

  updateStatus: (id, status, callback) => {
    const query = 'UPDATE Payment SET status = ? WHERE payment_id = ?';
    db.query(query, [status, id], callback);
  }
};

module.exports = Payment;