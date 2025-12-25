const db = require('../config/db');

const Customer = {
  getByUserId: (userId, callback) => {
    const query = 'SELECT * FROM Customer WHERE user_id = ?';
    db.query(query, [userId], callback);
  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM Customer WHERE customer_id = ?';
    db.query(query, [id], callback);
  },

  updateProfile: (customerId, customerData, callback) => {
    const { name, phone_no, address, preferences } = customerData;
    const query = 'UPDATE Customer SET name = ?, phone_no = ?, address = ?, preferences = ? WHERE customer_id = ?';
    db.query(query, [name, phone_no, address, preferences, customerId], callback);
  },

  // Add this method for creating customer profiles
  create: (customerData, callback) => {
    const { customer_id, name, phone_no, address, user_id } = customerData;
    const query = 'INSERT INTO Customer (customer_id, name, phone_no, address, user_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [customer_id, name, phone_no, address, user_id], callback);
  }
};

module.exports = Customer;