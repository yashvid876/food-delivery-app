import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Alert } from 'react-bootstrap';
import { restaurantAPI } from '../../services/api';
import OrderCard from '../../components/ui/OrderCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // FIXED: Use correct endpoint path
      const response = await restaurantAPI.get('/restaurants/owner/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // FIXED: Use correct endpoint path
      await restaurantAPI.put(`/restaurants/owner/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  // ... rest of the component remains the same
  const pendingOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing'].includes(order.status)
  );
  
  const readyOrders = orders.filter(order => 
    ['ready'].includes(order.status)
  );

  const completedOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  if (loading) {
    return <LoadingSpinner text="Loading orders..." />;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Restaurant Orders</h1>
          <p className="text-muted">Manage and track customer orders</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs defaultActiveKey="pending" className="mb-4">
        <Tab eventKey="pending" title={`To Prepare (${pendingOrders.length})`}>
          {pendingOrders.map(order => (
            <OrderCard
              key={order.order_id}
              order={order}
              onUpdateStatus={updateOrderStatus}
              showActions={true}
            />
          ))}
          {pendingOrders.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-check-circle fa-3x text-muted mb-3"></i>
              <h4>No pending orders</h4>
              <p className="text-muted">All orders are up to date!</p>
            </div>
          )}
        </Tab>

        <Tab eventKey="ready" title={`Ready for Pickup (${readyOrders.length})`}>
          {readyOrders.map(order => (
            <OrderCard
              key={order.order_id}
              order={order}
              onUpdateStatus={updateOrderStatus}
              showActions={true}
            />
          ))}
          {readyOrders.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
              <h4>No orders ready</h4>
              <p className="text-muted">Orders will appear here when marked as ready.</p>
            </div>
          )}
        </Tab>

        <Tab eventKey="completed" title={`Completed (${completedOrders.length})`}>
          {completedOrders.map(order => (
            <OrderCard
              key={order.order_id}
              order={order}
              showActions={false}
            />
          ))}
          {completedOrders.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-history fa-3x text-muted mb-3"></i>
              <h4>No completed orders</h4>
              <p className="text-muted">Completed orders will appear here.</p>
            </div>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default RestaurantOrders;