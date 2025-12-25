const express = require('express');
const router = express.Router();
const deliveryAgentController = require('../controllers/deliveryAgentController');
const { auth, authRole } = require('../middleware/auth');

// Test route
router.get('/test', auth, authRole('delivery_agent'), (req, res) => {
  res.json({ 
    message: '✅ Delivery agent routes are working!',
    user: req.user
  });
});

// Get delivery agent profile
router.get('/profile', auth, authRole('delivery_agent'), deliveryAgentController.getProfile);

// Get delivery agent's orders - FIXED: Changed from /orders to /my-orders
router.get('/my-orders', auth, authRole('delivery_agent'), deliveryAgentController.getMyOrders);

// Get available orders - FIXED: Changed from /orders/available to /available-orders
router.get('/available-orders', auth, authRole('delivery_agent'), deliveryAgentController.getAvailableOrders);

module.exports = router;