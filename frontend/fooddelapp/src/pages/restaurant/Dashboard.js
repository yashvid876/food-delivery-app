import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { restaurantAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [revenueData, setRevenueData] = useState({
    today: 0,
    weekly: 0,
    monthly: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'restaurant') {
      fetchRestaurantData();
    }
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      console.log('🔄 Fetching restaurant data for user:', user.id);
      
      const [restaurantResponse, ordersResponse, revenueResponse] = await Promise.all([
        restaurantAPI.get('/restaurants/owner/my-restaurant'),
        restaurantAPI.get('/restaurants/owner/orders').catch(err => {
          console.warn('⚠️ Orders not available yet:', err.message);
          return { data: [] };
        }),
        restaurantAPI.get('/restaurants/owner/revenue').catch(err => {
          console.warn('⚠️ Revenue data not available:', err.message);
          return { data: {} };
        })
      ]);
      
      console.log('✅ Restaurant response:', restaurantResponse.data);
      console.log('✅ Orders response:', ordersResponse.data);
      console.log('✅ Revenue response:', revenueResponse.data);
      
      if (restaurantResponse.data) {
        setRestaurant(restaurantResponse.data);
        setOrders(ordersResponse.data || []);
        setRevenueData(revenueResponse.data || {
          today: 0,
          weekly: 0,
          monthly: 0,
          total: 0
        });
      } else {
        setError('No restaurant found for your account.');
      }
      
    } catch (error) {
      console.error('❌ Error fetching restaurant data:', error);
      
      if (error.response?.status === 404) {
        setError('Restaurant not found. Please make sure your account is linked to a restaurant.');
      } else {
        setError(error.response?.data?.message || 'Failed to load restaurant data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    setError('');
    fetchRestaurantData();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'preparing': return 'primary';
      case 'ready': return 'success';
      case 'picked_up': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'picked_up': return 'Picked Up';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading restaurant dashboard..." />;
  }

  if (error && !restaurant) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <h5>Restaurant Dashboard Error</h5>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2 mt-3">
            <Button variant="primary" onClick={refreshData}>
              Try Again
            </Button>
            <Button variant="outline-secondary" href="/">
              Go Home
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <h5>No Restaurant Found</h5>
          <p>Your account is not linked to any restaurant. Please contact support.</p>
        </Alert>
      </Container>
    );
  }

  const pendingOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing'].includes(order.status)
  );

  const recentOrders = orders.slice(0, 5);

  return (
    <Container className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="text-primary">Restaurant Dashboard</h1>
              <p className="text-muted mb-0">Welcome back, {user?.name}</p>
            </div>
            <div className="text-end">
              <h4 className="mb-1">{restaurant.name}</h4>
              <p className="text-muted mb-0">
                <i className="fas fa-map-marker-alt me-1"></i>
                {restaurant.location}
              </p>
              <p className="mb-0">
                <span className="text-warning">
                  <i className="fas fa-star"></i> {restaurant.rating}
                </span>
                <span className="text-muted mx-2">•</span>
                <Badge bg="outline-secondary" className="text-dark border">
                  {restaurant.cuisine}
                </Badge>
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="warning" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Revenue Stats Section */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Revenue Analytics
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={3} className="mb-3">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="text-muted mb-2">Today's Revenue</h6>
                    <h4 className="text-success mb-0">₹{revenueData.today?.toFixed(2) || '0.00'}</h4>
                    <small className="text-muted">From {orders.filter(o => o.status === 'delivered' && new Date(o.date).toDateString() === new Date().toDateString()).length} orders</small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="text-muted mb-2">This Week</h6>
                    <h4 className="text-info mb-0">₹{revenueData.weekly?.toFixed(2) || '0.00'}</h4>
                    <small className="text-muted">Weekly earnings</small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="text-muted mb-2">This Month</h6>
                    <h4 className="text-warning mb-0">₹{revenueData.monthly?.toFixed(2) || '0.00'}</h4>
                    <small className="text-muted">Monthly earnings</small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="text-muted mb-2">Total Revenue</h6>
                    <h4 className="text-primary mb-0">₹{revenueData.total?.toFixed(2) || '0.00'}</h4>
                    <small className="text-muted">All time</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Bar */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
            <div className="text-center">
              <h4 className="text-primary mb-1">{orders.length}</h4>
              <small className="text-muted">Total Orders</small>
            </div>
            <div className="text-center">
              <h4 className="text-warning mb-1">{pendingOrders.length}</h4>
              <small className="text-muted">Active Orders</small>
            </div>
            <div className="text-center">
              <h4 className="text-success mb-1">
                {orders.filter(o => o.status === 'delivered').length}
              </h4>
              <small className="text-muted">Completed</small>
            </div>
            <div className="text-center">
              <h4 className="text-info mb-1">
                {orders.filter(o => o.status === 'cancelled').length}
              </h4>
              <small className="text-muted">Cancelled</small>
            </div>
            <div className="text-center">
              <Button variant="outline-primary" onClick={refreshData}>
                <i className="fas fa-sync-alt"></i>
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Recent Orders Section */}
      <Row>
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white">
              <h5 className="mb-0">
                <i className="fas fa-list-alt me-2 text-primary"></i>
                Recent Orders
              </h5>
              <div>
                <Button variant="outline-primary" size="sm" onClick={refreshData} className="me-2">
                  <i className="fas fa-sync-alt me-1"></i>
                  Refresh
                </Button>
                <Button variant="primary" size="sm" href="/restaurant/orders">
                  <i className="fas fa-external-link-alt me-1"></i>
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {recentOrders.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentOrders.map((order, index) => (
                    <div key={order.order_id} className="list-group-item border-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <h6 className="mb-0 me-3">Order #{order.order_id}</h6>
                            <Badge bg={getStatusBadgeVariant(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <div className="row text-sm">
                            <div className="col-md-6">
                              <small className="text-muted">Customer:</small>
                              <div className="fw-medium">{order.customer_name || 'N/A'}</div>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">Amount:</small>
                              <div className="fw-bold text-success">₹{order.total_amount}</div>
                            </div>
                          </div>
                          <div className="row text-sm mt-1">
                            <div className="col-md-6">
                              <small className="text-muted">Time:</small>
                              <div>{order.time}</div>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">Payment:</small>
                              <div className="text-capitalize">{order.payment_method}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < recentOrders.length - 1 && <hr className="my-3" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                  <h5>No Orders Yet</h5>
                  <p className="text-muted">Your orders will appear here when customers place them.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Restaurant Info Sidebar */}
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2 text-primary"></i>
                Restaurant Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">RESTAURANT NAME</small>
                <strong>{restaurant.name}</strong>
              </div>
              
              <div className="mb-3">
                <small className="text-muted d-block">LOCATION</small>
                <div className="d-flex align-items-center">
                  <i className="fas fa-map-marker-alt text-muted me-2"></i>
                  <span>{restaurant.location}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <small className="text-muted d-block">CUISINE</small>
                <Badge bg="outline-primary" className="text-primary border">
                  {restaurant.cuisine}
                </Badge>
              </div>
              
              <div className="mb-3">
                <small className="text-muted d-block">CONTACT</small>
                <div className="d-flex align-items-center">
                  <i className="fas fa-phone text-muted me-2"></i>
                  <span>{restaurant.phone_no}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <small className="text-muted d-block">RATING</small>
                <div className="d-flex align-items-center">
                  <span className="text-warning me-2">
                    <i className="fas fa-star"></i> {restaurant.rating}
                  </span>
                  <span className="text-muted">• {restaurant.pricing} Pricing</span>
                </div>
              </div>

              <hr />
              
              <div className="d-grid gap-2">
                <Button variant="outline-primary" href="/restaurant/menu">
                  <i className="fas fa-utensils me-2"></i>
                  Manage Menu
                </Button>
                <Button variant="outline-success" href="/restaurant/orders">
                  <i className="fas fa-list-alt me-2"></i>
                  View All Orders
                </Button>
                <Button variant="outline-info" href="/restaurant/analytics">
                  <i className="fas fa-chart-bar me-2"></i>
                  Detailed Analytics
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RestaurantDashboard;