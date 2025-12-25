import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Welcome back, {user?.name}!</h1>
          <p className="text-muted">Here's what's happening with your orders.</p>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-4">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <i className="fas fa-utensils fa-2x text-primary mb-3"></i>
              <h3>Recent Orders</h3>
              <p className="text-muted">View your order history</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <i className="fas fa-heart fa-2x text-danger mb-3"></i>
              <h3>Favorite Restaurants</h3>
              <p className="text-muted">Your go-to places</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <i className="fas fa-truck fa-2x text-success mb-3"></i>
              <h3>Delivery Tracking</h3>
              <p className="text-muted">Track your current orders</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;