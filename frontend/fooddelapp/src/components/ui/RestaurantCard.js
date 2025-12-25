import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  // Safe fallbacks for restaurant data
  if (!restaurant) {
    return (
      <Card className="restaurant-card h-100">
        <Card.Body>
          <Card.Text className="text-muted">Restaurant information not available</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  const {
    name = 'Unknown Restaurant',
    pricing = 'Moderate',
    location = 'Location not specified',
    cuisine = 'Unknown Cuisine',
    rating = 0,
    restaurant_id,
    id
  } = restaurant;

  const restaurantId = restaurant_id || id;

  const getPricingColor = (pricing) => {
    switch (pricing?.toLowerCase()) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Card className="restaurant-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="h5">{name}</Card.Title>
          <Badge bg={getPricingColor(pricing)}>
            {pricing}
          </Badge>
        </div>
        
        <Card.Text className="text-muted small mb-2">
          <i className="fas fa-map-marker-alt me-1"></i>
          {location}
        </Card.Text>
        
        <Card.Text className="mb-2">
          <Badge bg="light" text="dark" className="me-1">
            {cuisine}
          </Badge>
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="text-warning">
              <i className="fas fa-star"></i> {rating || 'N/A'}
            </span>
          </div>
          {restaurantId && (
            <Link 
              to={`/restaurant/${restaurantId}/menu`}
              className="btn btn-primary btn-sm"
            >
              View Menu
            </Link>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default RestaurantCard;