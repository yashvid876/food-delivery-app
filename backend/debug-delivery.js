const db = require('./config/db');

console.log('🐛 Debugging Delivery System...\n');

// 1. Check delivery agents
db.query(`
  SELECT 
    u.id as user_id,
    u.name as user_name,
    u.role,
    da.agent_id,
    da.name as agent_name
  FROM users u
  LEFT JOIN DeliveryAgent da ON u.id = da.user_id
  WHERE u.role = 'delivery_agent'
`, (err, agents) => {
  if (err) {
    console.error('Error checking agents:', err);
    return;
  }
  
  console.log('1. Delivery Agents:');
  agents.forEach(agent => {
    console.log(`   👤 ${agent.user_name} (User ID: ${agent.user_id}) -> 🚴 ${agent.agent_name || 'NO AGENT PROFILE'} (Agent ID: ${agent.agent_id})`);
  });

  // 2. Check orders with status 'ready'
  db.query(`
    SELECT 
      order_id,
      customer_id,
      restaurant_id,
      status,
      delivery_agent_id,
      total_amount
    FROM Orders 
    WHERE status = 'ready'
  `, (err, readyOrders) => {
    console.log('\n2. Orders Ready for Delivery:');
    if (readyOrders.length === 0) {
      console.log('   ❌ No orders with status "ready" found');
    } else {
      readyOrders.forEach(order => {
        console.log(`   📦 Order #${order.order_id} | Restaurant: ${order.restaurant_id} | Amount: ₹${order.total_amount} | Agent: ${order.delivery_agent_id || 'Not assigned'}`);
      });
    }

    // 3. Check all order statuses
    db.query(`
      SELECT status, COUNT(*) as count 
      FROM Orders 
      GROUP BY status
    `, (err, statusCounts) => {
      console.log('\n3. Order Status Summary:');
      statusCounts.forEach(row => {
        console.log(`   📊 ${row.status}: ${row.count} orders`);
      });

      process.exit();
    });
  });
});