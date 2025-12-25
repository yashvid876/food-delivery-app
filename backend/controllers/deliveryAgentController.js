const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');

const deliveryAgentController = {
  getProfile: (req, res) => {
    // Check if user is delivery agent
    if (req.user.role !== 'delivery_agent') {
      return res.status(403).json({ message: 'Access denied. Delivery agents only.' });
    }
    
    console.log('Fetching delivery agent profile for user:', req.user.id);
    
    DeliveryAgent.getByUserId(req.user.id, (err, results) => {
      if (err) {
        console.error('Error fetching delivery agent profile:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ 
          message: 'Delivery agent profile not found',
          user_id: req.user.id
        });
      }
      res.json(results[0]);
    });
  },

  getMyOrders: (req, res) => {
    // Check if user is delivery agent
    if (req.user.role !== 'delivery_agent') {
      return res.status(403).json({ message: 'Access denied. Delivery agents only.' });
    }
    
    console.log('Fetching orders for delivery agent user:', req.user.id);
    
    DeliveryAgent.getByUserId(req.user.id, (err, agentResults) => {
      if (err) {
        console.error('Error fetching delivery agent:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (agentResults.length === 0) {
        return res.status(404).json({ 
          message: 'Delivery agent not found',
          user_id: req.user.id
        });
      }

      const agentId = agentResults[0].agent_id;
      console.log('Found delivery agent ID:', agentId);
      
      Order.getByDeliveryAgent(agentId, (err, orders) => {
        if (err) {
          console.error('Error fetching delivery agent orders:', err);
          return res.status(500).json({ message: 'Database error', error: err });
        }
        
        console.log(`Found ${orders.length} orders for delivery agent ${agentId}`);
        res.json(orders);
      });
    });
  },

  getAvailableOrders: (req, res) => {
    // Check if user is delivery agent
    if (req.user.role !== 'delivery_agent') {
      return res.status(403).json({ message: 'Access denied. Delivery agents only.' });
    }
    
    console.log('Fetching available orders for delivery');
    
    Order.getAvailableForDelivery((err, results) => {
      if (err) {
        console.error('Error fetching available orders:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      console.log(`Returning ${results.length} available orders`);
      res.json(results);
    });
  }
};

module.exports = deliveryAgentController;