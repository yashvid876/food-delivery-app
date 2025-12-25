const db = require('../config/db');

const User = {
  create: (userData, callback) => {
    const { name, email, password, phone_no, address, role } = userData;
    
    const query = 'INSERT INTO users (name, email, password, phone_no, address, role) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [name, email, password, phone_no, address, role], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        return callback(err);
      }
      
      console.log('User created successfully with ID:', results.insertId);
      callback(null, results);
    });
  },

  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  findById: (id, callback) => {
    const query = 'SELECT id, name, email, phone_no, address, role, created_at FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        return callback(err);
      }
      callback(null, results);
    });
  }
};

module.exports = User;