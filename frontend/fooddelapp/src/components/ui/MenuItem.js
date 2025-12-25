import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';

const MenuItem = ({ item, restaurant }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item, restaurant);
  };

  return (
    <Card className="menu-item-card h-100">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="h6 flex-grow-1">{item.items}</Card.Title>
          <Badge bg="secondary" className="ms-2">
            {item.types}
          </Badge>
        </div>
        
        <Card.Text className="text-muted small mb-2">
          {item.cuisine}
        </Card.Text>
        
        <Card.Text className="fw-bold text-primary mb-3">
          ₹{item.price}
        </Card.Text>
        
        <div className="mt-auto">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleAddToCart}
            className="w-100"
          >
            <i className="fas fa-plus me-1"></i>
            Add to Cart
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MenuItem;