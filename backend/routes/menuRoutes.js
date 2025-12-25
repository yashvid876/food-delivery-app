const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { auth, authRole } = require('../middleware/auth');

// Public menu routes - FIXED: Match frontend call pattern
router.get('/restaurant/:restaurantId', menuController.getMenuByRestaurant);

// Protected menu management routes
router.post('/', auth, authRole('restaurant'), menuController.createMenuItem);
router.put('/:id', auth, authRole('restaurant'), menuController.updateMenuItem);
router.delete('/:id', auth, authRole('restaurant'), menuController.deleteMenuItem);

// Debug route
router.get('/debug', (req, res) => {
  res.json({
    message: 'Menu routes are working!',
    endpoints: [
      'GET /api/menu/restaurant/:restaurantId',
      'POST /api/menu/ (protected)',
      'PUT /api/menu/:id (protected)',
      'DELETE /api/menu/:id (protected)'
    ]
  });
});

module.exports = router;