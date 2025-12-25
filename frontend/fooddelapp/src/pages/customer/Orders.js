import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { customerAPI } from '../../services/api'; // Use customerAPI instead of orderAPI
import OrderCard from '../../components/ui/OrderCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      // FIXED: Use the correct endpoint for customer orders
      const response = await customerAPI.get('/customers/orders');
      console.log('✅ Orders response:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
  );
  
  const completedOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  if (loading) {
    return <LoadingSpinner text="Loading your orders..." />;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>My Orders</h1>
          <p className="text-muted">Track and manage your food orders</p>
        </Col>
      </Row>

      <Tabs defaultActiveKey="active" className="mb-4">
        <Tab eventKey="active" title={`Active Orders (${pendingOrders.length})`}>
          {pendingOrders.length > 0 ? (
            pendingOrders.map(order => (
              <OrderCard key={order.order_id} order={order} />
            ))
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-clock fa-3x text-muted mb-3"></i>
              <h4>No active orders</h4>
              <p className="text-muted">You don't have any active orders at the moment.</p>
            </div>
          )}
        </Tab>

        <Tab eventKey="history" title={`Order History (${completedOrders.length})`}>
          {completedOrders.length > 0 ? (
            completedOrders.map(order => (
              <OrderCard key={order.order_id} order={order} />
            ))
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-history fa-3x text-muted mb-3"></i>
              <h4>No order history</h4>
              <p className="text-muted">Your completed orders will appear here.</p>
            </div>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Orders;