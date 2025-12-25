import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: 'fas fa-utensils',
      title: 'Wide Variety',
      description: 'Choose from hundreds of restaurants and cuisines'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Fast Delivery',
      description: 'Get your food delivered quickly and fresh'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Secure Payment',
      description: 'Multiple secure payment options available'
    },
    {
      icon: 'fas fa-star',
      title: 'Best Quality',
      description: 'Only the highest quality food from trusted restaurants'
    }
  ];

  const stats = [
    { number: '500+', label: 'Restaurants' },
    { number: '10,000+', label: 'Happy Customers' },
    { number: '50,000+', label: 'Orders Delivered' },
    { number: '24/7', label: 'Customer Support' }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-4">
                Delicious food delivered to your doorstep
              </h1>
              <p className="lead mb-4">
                Order from your favorite restaurants and enjoy fresh, hot meals at home. 
                Fast delivery, great prices, and amazing food!
              </p>
              {!isAuthenticated ? (
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Button as={Link} to="/register" variant="light" size="lg">
                    Get Started
                  </Button>
                  <Button as={Link} to="/restaurants" variant="outline-light" size="lg">
                    Order Now
                  </Button>
                </div>
              ) : user?.role === 'customer' ? (
                <Button as={Link} to="/restaurants" variant="light" size="lg">
                  Order Food Now
                </Button>
              ) : user?.role === 'restaurant' ? (
                <Button as={Link} to="/restaurant/dashboard" variant="light" size="lg">
                  Restaurant Dashboard
                </Button>
              ) : (
                <Button as={Link} to="/delivery/dashboard" variant="light" size="lg">
                  Delivery Dashboard
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center">
            {stats.map((stat, index) => (
              <Col md={3} key={index} className="mb-4">
                <div className="stat-card">
                  <h3 className="text-primary fw-bold">{stat.number}</h3>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold">Why Choose FoodDel?</h2>
            <p className="text-muted">We provide the best food delivery experience</p>
          </Col>
        </Row>
        
        <Row>
          {features.map((feature, index) => (
            <Col md={6} lg={3} key={index} className="mb-4">
              <Card className="feature-card text-center border-0 h-100">
                <Card.Body>
                  <div className="text-primary mb-3">
                    <i className={`${feature.icon} fa-3x`}></i>
                  </div>
                  <Card.Title className="h5">{feature.title}</Card.Title>
                  <Card.Text className="text-muted">
                    {feature.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* How It Works Section */}
      <section className="bg-light py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold">How It Works</h2>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <i className="fas fa-utensils fa-2x"></i>
              </div>
              <h5>1. Choose Restaurant</h5>
              <p className="text-muted">Browse through our wide selection of restaurants</p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <i className="fas fa-shopping-cart fa-2x"></i>
              </div>
              <h5>2. Place Order</h5>
              <p className="text-muted">Add items to cart and checkout securely</p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <i className="fas fa-truck fa-2x"></i>
              </div>
              <h5>3. Enjoy Food</h5>
              <p className="text-muted">Track your order and enjoy delicious food</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto text-white">
              <h3 className="fw-bold mb-3">Ready to order?</h3>
              <p className="mb-4">
                Join thousands of satisfied customers enjoying great food delivered fast.
              </p>
              <Button as={Link} to={isAuthenticated ? "/restaurants" : "/register"} variant="light" size="lg">
                {isAuthenticated ? 'Browse Restaurants' : 'Get Started'}
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;