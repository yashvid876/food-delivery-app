import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { restaurantAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RestaurantAnalytics = () => {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'restaurant') {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      const [revenueResponse, ordersResponse] = await Promise.all([
        restaurantAPI.get('/restaurants/owner/revenue'),
        restaurantAPI.get('/restaurants/owner/orders')
      ]);
      
      setRevenueData(revenueResponse.data || {});
      setOrders(ordersResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getCompletedOrders = () => orders.filter(order => order.status === 'delivered');
  const getPendingOrders = () => orders.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status));
  const getCancelledOrders = () => orders.filter(order => order.status === 'cancelled');

  const getAverageOrderValue = () => {
    const completedOrders = getCompletedOrders();
    if (completedOrders.length === 0) return 0;
    const total = completedOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    return total / completedOrders.length;
  };

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Restaurant Analytics</h1>
              <p className="text-muted">Detailed performance metrics and insights</p>
            </div>
            <Button variant="outline-primary" onClick={fetchAnalyticsData}>
              <i className="fas fa-sync-alt me-2"></i>
              Refresh Data
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Revenue Summary */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Revenue Summary
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={3}>
                  <h4 className="text-success">₹{revenueData.today?.toFixed(2) || '0.00'}</h4>
                  <p className="text-muted mb-0">Today</p>
                </Col>
                <Col md={3}>
                  <h4 className="text-info">₹{revenueData.weekly?.toFixed(2) || '0.00'}</h4>
                  <p className="text-muted mb-0">This Week</p>
                </Col>
                <Col md={3}>
                  <h4 className="text-warning">₹{revenueData.monthly?.toFixed(2) || '0.00'}</h4>
                  <p className="text-muted mb-0">This Month</p>
                </Col>
                <Col md={3}>
                  <h4 className="text-primary">₹{revenueData.total?.toFixed(2) || '0.00'}</h4>
                  <p className="text-muted mb-0">All Time</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Order Statistics */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Order Statistics</h5>
            </Card.Header>
            <Card.Body>
              <Table striped>
                <tbody>
                  <tr>
                    <td>Total Orders</td>
                    <td className="text-end"><strong>{orders.length}</strong></td>
                  </tr>
                  <tr>
                    <td>Completed Orders</td>
                    <td className="text-end text-success"><strong>{getCompletedOrders().length}</strong></td>
                  </tr>
                  <tr>
                    <td>Pending Orders</td>
                    <td className="text-end text-warning"><strong>{getPendingOrders().length}</strong></td>
                  </tr>
                  <tr>
                    <td>Cancelled Orders</td>
                    <td className="text-end text-danger"><strong>{getCancelledOrders().length}</strong></td>
                  </tr>
                  <tr>
                    <td>Average Order Value</td>
                    <td className="text-end text-primary"><strong>₹{getAverageOrderValue().toFixed(2)}</strong></td>
                  </tr>
                  <tr>
                    <td>Completion Rate</td>
                    <td className="text-end text-info">
                      <strong>
                        {orders.length > 0 
                          ? ((getCompletedOrders().length / orders.length) * 100).toFixed(1) 
                          : '0'
                        }%
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Completed Orders */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Recent Completed Orders</h5>
            </Card.Header>
            <Card.Body>
              {getCompletedOrders().length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {getCompletedOrders().slice(0, 10).map(order => (
                    <div key={order.order_id} className="border-bottom pb-2 mb-2">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Order #{order.order_id}</strong>
                          <br />
                          <small className="text-muted">{order.customer_name}</small>
                        </div>
                        <div className="text-end">
                          <strong className="text-success">₹{order.total_amount}</strong>
                          <br />
                          <small className="text-muted">{order.date}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-receipt fa-2x mb-3"></i>
                  <p>No completed orders yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RestaurantAnalytics;