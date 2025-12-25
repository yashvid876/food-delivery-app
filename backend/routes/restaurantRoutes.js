const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const menuController = require('../controllers/menuController');
const { auth, authRole } = require('../middleware/auth');

// Debug route to test if restaurant routes are working
router.get('/debug', (req, res) => {
  res.json({ 
    message: 'Restaurant routes are working!',
    availableEndpoints: [
      'GET /api/restaurants',
      'GET /api/restaurants/:id',
      'GET /api/restaurants/:id/menu',
      'GET /api/restaurants/owner/my-restaurant',
      'GET /api/restaurants/owner/orders',
      'GET /api/restaurants/owner/revenue',
      'PUT /api/restaurants/owner/orders/:orderId/status'
    ]
  });
});

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/menu', restaurantController.getRestaurantMenu);

// Restaurant owner routes (protected)
router.get('/owner/my-restaurant', auth, authRole('restaurant'), restaurantController.getMyRestaurant);
router.get('/owner/orders', auth, authRole('restaurant'), restaurantController.getRestaurantOrders);
router.get('/owner/revenue', auth, authRole('restaurant'), restaurantController.getRestaurantRevenue);
router.put('/owner/orders/:orderId/status', auth, authRole('restaurant'), restaurantController.updateOrderStatus);

// Menu routes (protected)
router.post('/menu/items', auth, authRole('restaurant'), menuController.createMenuItem);
router.put('/menu/items/:id', auth, authRole('restaurant'), menuController.updateMenuItem);
router.delete('/menu/items/:id', auth, authRole('restaurant'), menuController.deleteMenuItem);

module.exports = router;