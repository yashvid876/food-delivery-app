const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

// Helper function to create customer profile if not exists
function createCustomerProfile(user, callback) {
  const db = require('../config/db');
  
  // Generate a customer_id
  const customer_id = Date.now() % 1000000;
  
  const query = `
    INSERT INTO Customer (customer_id, name, phone_no, address, user_id) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const values = [
    customer_id,
    user.name,
    user.phone_no || '0000000000',
    user.address || 'Address not provided',
    user.id
  ];
  
  console.log('🔄 Creating customer profile for user:', user.id);
  
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('❌ Error creating customer profile:', err);
      return callback(err);
    }
    
    console.log('✅ Customer profile created successfully with ID:', customer_id);
    callback(null, { customer_id, name: user.name });
  });
}

const orderController = {
  createOrder: async (req, res) => {
    try {
      const { restaurant_id, items, total_amount, delivery_address, payment_method } = req.body;
      
      // Get customer ID from Customer table using user ID
      const Customer = require('../models/Customer');
      
      console.log('🔍 Looking for customer profile for user:', req.user.id);
      
      Customer.getByUserId(req.user.id, (err, customerResults) => {
        if (err) {
          console.error('❌ Database error finding customer:', err);
          return res.status(500).json({ 
            message: 'Database error while finding customer profile',
            error: err.message 
          });
        }

        if (customerResults.length === 0) {
          console.log('❌ No customer profile found for user:', req.user.id);
          
          // 🔧 AUTO-CREATE CUSTOMER PROFILE
          console.log('🔄 Attempting to create customer profile automatically...');
          createCustomerProfile(req.user, (createErr, newCustomer) => {
            if (createErr) {
              console.error('❌ Error creating customer profile:', createErr);
              return res.status(400).json({ 
                message: 'Customer profile not found. Please update your profile first.',
                error: 'Please complete your customer profile in the profile section'
              });
            }
            
            console.log('✅ Created customer profile with ID:', newCustomer.customer_id);
            // Proceed with order using the new customer ID
            proceedWithOrderCreation(newCustomer.customer_id);
          });
          
        } else {
          const customer_id = customerResults[0].customer_id;
          console.log('✅ Found customer profile with ID:', customer_id);
          proceedWithOrderCreation(customer_id);
        }
      });

      // Helper function to create the order after we have customer_id
      function proceedWithOrderCreation(customer_id) {
        const order_id = Date.now();

        console.log('🛒 Creating order with:', {
          order_id,
          customer_id,
          restaurant_id,
          items_count: items.length,
          total_amount,
          delivery_address
        });

        Order.create({
          order_id,
          customer_id,
          restaurant_id,
          total_amount,
          delivery_address,
          payment_method
        }, (err, results) => {
          if (err) {
            console.error('❌ Error creating order:', err);
            return res.status(500).json({ 
              message: 'Error creating order', 
              error: err.message 
            });
          }

          // Create order items
          console.log('📦 Creating order items...');
          OrderItem.create(order_id, items, (err) => {
            if (err) {
              console.error('❌ Error creating order items:', err);
              // Still return success but with warning
              return res.status(201).json({ 
                success: true,
                message: 'Order created successfully, but there was an issue saving order details', 
                order_id: order_id,
                status: 'pending',
                warning: 'Some order details may not be saved correctly'
              });
            }

            console.log('✅ Order created successfully with all items');
            res.status(201).json({ 
              success: true,
              message: 'Order created successfully!', 
              order_id: order_id,
              status: 'pending'
            });
          });
        });
      }

    } catch (error) {
      console.error('❌ Unexpected error in createOrder:', error);
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message 
      });
    }
  },

  getOrderDetails: (req, res) => {
    const { id } = req.params;
    console.log(`🔄 Fetching order details for order ID: ${id}`);
    
    Order.getById(id, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const order = results[0];
      
      OrderItem.getByOrder(id, (err, items) => {
        if (err) {
          console.error('❌ Error fetching order items:', err);
        }
        
        order.items = items || [];
        console.log(`✅ Found order with ${order.items.length} items`);
        res.json(order);
      });
    });
  },

  getAvailableOrders: (req, res) => {
    console.log('🔄 Fetching available orders for delivery agents');
    
    Order.getAvailableForDelivery((err, results) => {
      if (err) {
        console.error('❌ Error fetching available orders:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      console.log(`✅ Found ${results.length} available orders`);
      res.json(results);
    });
  },

  acceptOrder: (req, res) => {
    const { orderId } = req.params;
    console.log(`🔄 Delivery agent ${req.user.id} accepting order ${orderId}`);
    
    const DeliveryAgent = require('../models/DeliveryAgent');
    DeliveryAgent.getByUserId(req.user.id, (err, agentResults) => {
      if (err) {
        console.error('❌ Error fetching delivery agent:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      if (agentResults.length === 0) {
        return res.status(404).json({ 
          message: 'Delivery agent profile not found',
          user_id: req.user.id
        });
      }
      const agentId = agentResults[0].agent_id;
      console.log(`📦 Assigning order ${orderId} to agent ${agentId}`);
      Order.assignDeliveryAgent(orderId, agentId, (err, results) => {
        if (err) {
          console.error('❌ Error accepting order:', err);
          return res.status(500).json({ message: 'Error accepting order', error: err });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Order not found or already assigned' });
        }
        console.log(`✅ Order ${orderId} accepted by agent ${agentId}`);
        res.json({ message: 'Order accepted successfully' });
      });
    });
  },

  updateDeliveryStatus: (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating delivery status for order ${orderId} to: ${status}`);

    if (status === 'delivered') {
      Order.completeDelivery(orderId, (err, results) => {
        if (err) {
          console.error('❌ Error completing delivery:', err);
          return res.status(500).json({ message: 'Error completing delivery', error: err });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Order not found' });
        }
        console.log(`✅ Order ${orderId} marked as delivered`);
        res.json({ message: 'Delivery completed successfully' });
      });
    } else {
      Order.updateStatus(orderId, status, (err, results) => {
        if (err) {
          console.error('❌ Error updating order status:', err);
          return res.status(500).json({ message: 'Error updating order status', error: err });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Order not found' });
        }
        console.log(`✅ Order ${orderId} status updated to ${status}`);
        res.json({ message: 'Order status updated successfully' });
      });
    }
  }
};

module.exports = orderController;