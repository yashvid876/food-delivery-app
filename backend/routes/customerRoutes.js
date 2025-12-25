const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { auth, authRole } = require('../middleware/auth');

router.get('/profile', auth, authRole('customer'), customerController.getProfile);
router.put('/profile/:id', auth, authRole('customer'), customerController.updateProfile);
router.get('/orders', auth, authRole('customer'), customerController.getOrders);

module.exports = router;