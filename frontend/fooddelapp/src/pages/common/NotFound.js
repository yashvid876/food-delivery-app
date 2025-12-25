import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col lg={6}>
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle fa-5x text-warning mb-4"></i>
            <h1 className="display-1 fw-bold">404</h1>
            <h2 className="h3 mb-3">Page Not Found</h2>
            <p className="text-muted mb-4">
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button as={Link} to="/" variant="primary">
              Go Home
            </Button>
            <Button as={Link} to="/restaurants" variant="outline-primary">
              Browse Restaurants
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;