import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Tabs, Tab, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI, menuAPI } from '../../services/api';
import MenuItem from '../../components/ui/MenuItem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useCart } from '../../context/CartContext';

const Menu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, restaurant: cartRestaurant } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, [id]);

  // In the fetchRestaurantAndMenu function, fix the API calls:
const fetchRestaurantAndMenu = async () => {
  try {
    console.log(`🔄 Fetching restaurant and menu for ID: ${id}`);
    setLoading(true);
    setError('');

    // Fetch restaurant details
    const restaurantResponse = await restaurantAPI.get(`/restaurants/${id}`);
    console.log('✅ Restaurant response:', restaurantResponse.data);
    
    // Fetch menu for this specific restaurant - FIXED ENDPOINT
    const menuResponse = await restaurantAPI.get(`/restaurants/${id}/menu`);
    console.log('✅ Menu response:', menuResponse.data);
    
    setRestaurant(restaurantResponse.data);
    
    // Ensure we only show menu items for this restaurant
    const restaurantMenu = Array.isArray(menuResponse.data) 
      ? menuResponse.data.filter(item => item.restaurant_id == id)
      : [];
    
    console.log(`✅ Filtered menu items: ${restaurantMenu.length}`);
    setMenuItems(restaurantMenu);
    
  } catch (error) {
    console.error('❌ Error fetching menu:', error);
    console.error('Error details:', error.response?.data);
    setError('Failed to load restaurant menu. Please try again.');
    setMenuItems([]);
  } finally {
    setLoading(false);
  }
};

  const groupMenuByType = () => {
    const grouped = {};
    if (Array.isArray(menuItems)) {
      menuItems.forEach(item => {
        if (!grouped[item.types]) {
          grouped[item.types] = [];
        }
        grouped[item.types].push(item);
      });
    }
    return grouped;
  };

  const hasItemsInCart = cartItems.length > 0;
  const isDifferentRestaurant = cartRestaurant && cartRestaurant.restaurant_id !== parseInt(id);

  if (loading) {
    return <LoadingSpinner text="Loading menu..." />;
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <strong>Error:</strong> {error}
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={fetchRestaurantAndMenu}>
              Try Again
            </Button>
            <Button variant="outline-primary" size="sm" onClick={() => navigate('/restaurants')} className="ms-2">
              Back to Restaurants
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const groupedMenu = groupMenuByType();
  const tabKeys = Object.keys(groupedMenu);

  return (
    <Container className="py-4">
      {restaurant && (
        <>
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h1>{restaurant.name}</h1>
                  <p className="text-muted mb-2">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {restaurant.location}
                  </p>
                  <p className="mb-2">
                    <span className="text-warning me-2">
                      <i className="fas fa-star"></i> {restaurant.rating}
                    </span>
                    <span className="text-muted">• {restaurant.cuisine} • {restaurant.pricing}</span>
                  </p>
                </div>
                {hasItemsInCart && (
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/cart')}
                    className="position-relative"
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    View Cart
                    {cartItems.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartItems.reduce((total, item) => total + item.quantity, 0)}
                      </span>
                    )}
                  </Button>
                )}
              </div>

              {isDifferentRestaurant && (
                <Alert variant="warning" className="mt-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  You have items from another restaurant in your cart. Adding items from this restaurant will clear your current cart.
                </Alert>
              )}
            </Col>
          </Row>

          {tabKeys.length > 0 ? (
            <Tabs defaultActiveKey={tabKeys[0]} className="mb-4">
              {tabKeys.map(type => (
                <Tab key={type} eventKey={type} title={`${type} (${groupedMenu[type].length})`}>
                  <Row>
                    {groupedMenu[type].map(item => (
                      <Col key={item.menu_id} md={6} lg={4} className="mb-4">
                        <MenuItem item={item} restaurant={restaurant} />
                      </Col>
                    ))}
                  </Row>
                </Tab>
              ))}
            </Tabs>
          ) : (
            <Alert variant="info" className="text-center">
              <i className="fas fa-utensils fa-2x mb-3"></i>
              <h4>No menu items available</h4>
              <p className="mb-0">This restaurant hasn't added any menu items yet.</p>
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default Menu;