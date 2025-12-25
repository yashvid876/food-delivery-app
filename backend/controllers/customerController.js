const Customer = require('../models/Customer');
const Order = require('../models/Order');

const customerController = {
  getProfile: (req, res) => {
    Customer.getByUserId(req.user.id, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(results[0]);
    });
  },

  updateProfile: (req, res) => {
    const customerId = req.params.id;
    const customerData = req.body;

    Customer.updateProfile(customerId, customerData, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating profile', error: err });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json({ message: 'Profile updated successfully' });
    });
  },

  getOrders: (req, res) => {
    Customer.getByUserId(req.user.id, (err, customerResults) => {
      if (err || customerResults.length === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const customerId = customerResults[0].customer_id;
      Order.getByCustomer(customerId, (err, orders) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(orders);
      });
    });
  }
};

module.exports = customerController;