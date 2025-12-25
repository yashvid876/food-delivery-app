const Restaurant = require('../models/Restaurant');

const restaurantController = {
  getAllRestaurants: (req, res) => {
    console.log('🔄 Fetching all restaurants...');
    
    Restaurant.getAll((err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ 
          message: 'Database error',
          error: err.message 
        });
      }
      
      console.log(`✅ Found ${results.length} restaurants`);
      
      if (!Array.isArray(results)) {
        console.error('❌ Expected array but got:', typeof results, results);
        results = [];
      }
      
      // Filter: Only return Mumbai Tiffins, Pizza Hub, and Spice Kitchen
      const allowedRestaurants = ['Mumbai Tiffins', 'Pizza Hub', 'Spice Kitchen'];
      const filteredResults = results.filter(restaurant => 
        allowedRestaurants.includes(restaurant.name)
      );
      
      console.log(`🎯 After filtering: ${filteredResults.length} restaurants`);
      console.log('📋 Available restaurants:', filteredResults.map(r => r.name));
      
      res.json(filteredResults);
    });
  },

  getRestaurantById: (req, res) => {
    const { id } = req.params;
    console.log(`🔄 Fetching restaurant by ID: ${id}`);
    
    Restaurant.getById(id, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      res.json(results[0]);
    });
  },

  getMyRestaurant: (req, res) => {
    console.log(`🔄 Fetching restaurant for user: ${req.user.id}`);
    console.log(`🔄 User role: ${req.user.role}`);
    
    Restaurant.getByUserId(req.user.id, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      console.log(`📊 Found ${results.length} restaurants for user ${req.user.id}`);
      
      if (results.length === 0) {
        console.log('❌ No restaurant found for user:', req.user.id);
        return res.status(404).json({ 
          message: 'Restaurant not found for this user',
          user_id: req.user.id
        });
      }
      
      console.log('✅ Restaurant found:', results[0].name);
      res.json(results[0]);
    });
  },

  getRestaurantMenu: (req, res) => {
    const { id } = req.params;
    console.log(`🔄 Fetching menu for restaurant ID: ${id}`);
    
    const Menu = require('../models/Menu');
    Menu.getByRestaurant(id, (err, results) => {
      if (err) {
        console.error('❌ Database error fetching menu:', err);
        return res.status(500).json({ 
          message: 'Database error fetching menu',
          error: err.message 
        });
      }
      
      console.log(`✅ Found ${results.length} menu items for restaurant ${id}`);
      
      if (!Array.isArray(results)) {
        console.error('❌ Expected array but got:', typeof results);
        results = [];
      }
      
      res.json(results);
    });
  },

  getRestaurantOrders: (req, res) => {
    console.log(`🔄 Fetching orders for restaurant user: ${req.user.id}`);
    
    Restaurant.getByUserId(req.user.id, (err, restaurantResults) => {
      if (err) {
        console.error('Error fetching restaurant:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      if (restaurantResults.length === 0) {
        console.log('❌ Restaurant not found for user:', req.user.id);
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      const restaurantId = restaurantResults[0].restaurant_id;
      console.log(`🔄 Found restaurant ID: ${restaurantId} for user ${req.user.id}`);
      
      const Order = require('../models/Order');
      Order.getByRestaurant(restaurantId, (err, orders) => {
        if (err) {
          console.error('Error fetching orders:', err);
          return res.status(500).json({ message: 'Database error fetching orders', error: err });
        }
        
        console.log(`✅ Found ${orders.length} orders for restaurant ${restaurantId}`);
        res.json(orders);
      });
    });
  },

  // NEW: Get restaurant revenue analytics
  getRestaurantRevenue: (req, res) => {
    console.log(`🔄 Fetching revenue data for restaurant user: ${req.user.id}`);
    
    Restaurant.getByUserId(req.user.id, (err, restaurantResults) => {
      if (err) {
        console.error('Error fetching restaurant:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      if (restaurantResults.length === 0) {
        console.log('❌ Restaurant not found for user:', req.user.id);
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      const restaurantId = restaurantResults[0].restaurant_id;
      console.log(`🔄 Calculating revenue for restaurant ID: ${restaurantId}`);
      
      const db = require('../config/db');
      
      // Calculate different revenue metrics
      const revenueQueries = {
        today: `
          SELECT COALESCE(SUM(total_amount), 0) as revenue
          FROM Orders 
          WHERE restaurant_id = ? 
          AND status = 'delivered'
          AND date = CURDATE()
        `,
        weekly: `
          SELECT COALESCE(SUM(total_amount), 0) as revenue
          FROM Orders 
          WHERE restaurant_id = ? 
          AND status = 'delivered'
          AND YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)
        `,
        monthly: `
          SELECT COALESCE(SUM(total_amount), 0) as revenue
          FROM Orders 
          WHERE restaurant_id = ? 
          AND status = 'delivered'
          AND YEAR(date) = YEAR(CURDATE()) 
          AND MONTH(date) = MONTH(CURDATE())
        `,
        total: `
          SELECT COALESCE(SUM(total_amount), 0) as revenue
          FROM Orders 
          WHERE restaurant_id = ? 
          AND status = 'delivered'
        `
      };

      const revenueData = {};
      let completedQueries = 0;
      const totalQueries = Object.keys(revenueQueries).length;

      Object.keys(revenueQueries).forEach(period => {
        db.query(revenueQueries[period], [restaurantId], (err, results) => {
          if (err) {
            console.error(`❌ Error fetching ${period} revenue:`, err);
            revenueData[period] = 0;
          } else {
            revenueData[period] = parseFloat(results[0]?.revenue) || 0;
          }
          
          completedQueries++;
          
          // When all queries are complete, send response
          if (completedQueries === totalQueries) {
            console.log('✅ Revenue data calculated:', revenueData);
            res.json(revenueData);
          }
        });
      });
    });
  },

  updateOrderStatus: (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating order ${orderId} status to: ${status} by user ${req.user.id}`);

    const Order = require('../models/Order');
    Order.updateStatus(orderId, status, (err, results) => {
      if (err) {
        console.error('Error updating order status:', err);
        return res.status(500).json({ message: 'Error updating order status', error: err });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json({ message: 'Order status updated successfully' });
    });
  }
};

module.exports = restaurantController;