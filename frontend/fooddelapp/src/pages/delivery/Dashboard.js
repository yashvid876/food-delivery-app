import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { deliveryAPI, orderAPI } from '../../services/api';
import OrderCard from '../../components/ui/OrderCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DeliveryDashboard = () => {
  const { user, userData } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && user.role === 'delivery_agent') {
      fetchDeliveryData();
    }
  }, [user]);

  const fetchDeliveryData = async () => {
    try {
      console.log('🔄 Fetching delivery data...');
      
      const [myOrdersResponse, availableResponse] = await Promise.all([
        deliveryAPI.get('/delivery-agents/my-orders'),
        deliveryAPI.get('/delivery-agents/available-orders')
      ]);
      
      console.log('✅ My Orders:', myOrdersResponse.data);
      console.log('✅ Available Orders:', availableResponse.data);
      
      setActiveOrders(myOrdersResponse.data || []);
      setAvailableOrders(availableResponse.data || []);
      
    } catch (error) {
      console.error('❌ Error in fetchDeliveryData:', error);
      setError(error.response?.data?.message || 'Failed to load delivery data');
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
      
      // Immediately update local state to reflect the change
      setAvailableOrders(prev => prev.filter(order => order.order_id !== orderId));
      setRefreshing(true);
      
      // Refresh data to get updated order status
      setTimeout(() => {
        fetchDeliveryData();
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
        
        // Immediately update local state
        setActiveOrders(prev => prev.filter(order => order.order_id !== orderId));
        setRefreshing(true);
        
        // Refresh data
        setTimeout(() => {
          fetchDeliveryData();
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
    fetchDeliveryData();
  };

  if (loading) {
    return <LoadingSpinner text="Loading delivery dashboard..." />;
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
              <h1>Delivery Dashboard</h1>
              <p className="text-muted">Welcome back, {user?.name}</p>
            </div>
            {userData && (
              <div className="text-end">
                <h5>{userData.name}</h5>
                <p className="text-muted mb-0">
                  Rating: <span className="text-warning">⭐ {userData.rating || '4.5'}</span>
                </p>
              </div>
            )}
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

      {/* Refresh Button */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-primary" 
              onClick={refreshData}
              disabled={refreshing}
            >
              <i className={`fas fa-sync-alt me-1 ${refreshing ? 'fa-spin' : ''}`}></i>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Available Orders */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Available for Delivery ({availableOrders.length})
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
                  <h5>No orders available</h5>
                  <p className="text-muted">There are no orders ready for delivery at the moment.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* My Active Orders */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">My Active Orders ({activeOrders.length})</h5>
            </Card.Header>
            <Card.Body>
              {activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    onUpdateStatus={updateOrderStatus}
                    showDeliveryActions={true}
                  />
                ))
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                  <h5>No active deliveries</h5>
                  <p className="text-muted">You don't have any assigned deliveries.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DeliveryDashboard;