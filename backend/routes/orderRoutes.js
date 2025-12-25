const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// Customer routes
router.post('/', auth, orderController.createOrder);
router.get('/:id', auth, orderController.getOrderDetails);

// Delivery agent routes (no authRole needed here since it's checked in controller)
router.get('/delivery/available', auth, orderController.getAvailableOrders);
router.post('/delivery/:orderId/accept', auth, orderController.acceptOrder);
router.put('/delivery/:orderId/status', auth, orderController.updateDeliveryStatus);

module.exports = router;