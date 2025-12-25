const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/', auth, paymentController.createPayment);
router.get('/customer/:id', auth, paymentController.getPaymentsByCustomer);
router.get('/order/:orderId', auth, paymentController.getPaymentByOrder);
router.put('/:id/status', auth, paymentController.updatePaymentStatus);

module.exports = router;