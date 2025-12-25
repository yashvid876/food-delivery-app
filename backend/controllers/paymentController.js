const Payment = require('../models/Payment');

const paymentController = {
  createPayment: (req, res) => {
    const paymentData = req.body;
    Payment.create(paymentData, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating payment', error: err });
      }
      res.status(201).json({ message: 'Payment created successfully', id: results.insertId });
    });
  },

  getPaymentsByCustomer: (req, res) => {
    const { id } = req.params;
    Payment.getByCustomer(id, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  },

  getPaymentByOrder: (req, res) => {
    const { orderId } = req.params;
    Payment.getByOrder(orderId, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.json(results[0]);
    });
  },

  updatePaymentStatus: (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    Payment.updateStatus(id, status, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating payment status', error: err });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.json({ message: 'Payment status updated successfully' });
    });
  }
};

module.exports = paymentController;