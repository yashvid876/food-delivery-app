import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { deliveryAPI, orderAPI } from '../../services/api';
import OrderCard from '../../components/ui/OrderCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ActiveOrders = () => {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && user.role === 'delivery_agent') {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const [availableResponse, myOrdersResponse] = await Promise.all([
        deliveryAPI.get('/delivery-agents/available-orders'),
        deliveryAPI.get('/delivery-agents/my-orders')
      ]);
      
      setAvailableOrders(availableResponse.data || []);
      setMyOrders(myOrdersResponse.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      console.log(`📦 Accepting order: ${orderId}`);
      await orderAPI.post(`/orders/delivery/${orderId}/accept`);
      console.log('✅ Order accepted successfully');
      
      // Immediately remove from available orders
      setAvailableOrders(prev => prev.filter(order => order.order_id !== orderId));
      setRefreshing(true);
      
      // Refresh to get updated data
      setTimeout(() => {
        fetchOrders();
      }, 500);
      
    } catch (error) {
      console.error('❌ Error accepting order:', error);
      setError('Failed to accept order: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateOrderStatus = async (orderId, action) => {
    try {
      console.log(`🔄 Updating order ${orderId} with action: ${action}`);
      
      if (action === 'accept') {
        await acceptOrder(orderId);
      } else if (action === 'delivered') {
        await orderAPI.put(`/orders/delivery/${orderId}/status`, { status: 'delivered' });
        console.log('✅ Order marked as delivered');
        
        // Immediately remove from my orders
        setMyOrders(prev => prev.filter(order => order.order_id !== orderId));
        setRefreshing(true);
        
        // Refresh data
        setTimeout(() => {
          fetchOrders();
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      setError('Failed to update order status: ' + (error.response?.data?.message || error.message));
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    setError('');
    fetchOrders();
  };

  if (loading) {
    return <LoadingSpinner text="Loading orders..." />;
  }

  if (user?.role !== 'delivery_agent') {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          You are logged in as a {user?.role}. Please log in as a delivery agent to access delivery features.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Delivery Orders</h1>
              <p className="text-muted">Accept and manage delivery assignments</p>
            </div>
            <Button 
              variant="outline-primary" 
              onClick={refreshData}
              disabled={refreshing}
            >
              <i className={`fas fa-sync-alt me-1 ${refreshing ? 'fa-spin' : ''}`}></i>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5>Error</h5>
              {error}
            </div>
            <Button variant="outline-danger" size="sm" onClick={() => setError('')}>
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </Alert>
      )}

      <Row>
        {/* Available Orders */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Available Orders ({availableOrders.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {availableOrders.length > 0 ? (
                availableOrders.map(order => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    onUpdateStatus={updateOrderStatus}
                    showDeliveryActions={true}
                  />
                ))
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-check-circle fa-3x text-muted mb-3"></i>
                  <h5>No available orders</h5>
                  <p className="text-muted">All orders have been assigned to delivery agents.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* My Active Orders */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                My Active Orders ({myOrders.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {myOrders.length > 0 ? (
                myOrders.map(order => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    onUpdateStatus={updateOrderStatus}
                    showDeliveryActions={true}
                  />
                ))
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <h5>No active orders</h5>
                  <p className="text-muted">You haven't accepted any delivery orders yet.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ActiveOrders;