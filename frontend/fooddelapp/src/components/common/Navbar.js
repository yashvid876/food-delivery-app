import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CustomNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavbarTitle = () => {
    if (location.pathname.includes('restaurant/dashboard')) return 'Restaurant Dashboard';
    if (location.pathname.includes('delivery/dashboard')) return 'Delivery Dashboard';
    return 'FoodDel';
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          <i className="fas fa-utensils me-2"></i>
          {getNavbarTitle()}
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active fw-bold' : ''}>
              Home
            </Nav.Link>
            
            {isAuthenticated && user?.role === 'customer' && (
              <>
                <Nav.Link as={Link} to="/restaurants" className={location.pathname === '/restaurants' ? 'active fw-bold' : ''}>
                  Restaurants
                </Nav.Link>
                <Nav.Link as={Link} to="/orders" className={location.pathname === '/orders' ? 'active fw-bold' : ''}>
                  My Orders
                </Nav.Link>
                <Nav.Link as={Link} to="/cart" className="position-relative">
                  <i className="fas fa-shopping-cart"></i>
                  {getCartItemsCount() > 0 && (
                    <Badge bg="danger" className="cart-badge">
                      {getCartItemsCount()}
                    </Badge>
                  )}
                </Nav.Link>
              </>
            )}
            
            {isAuthenticated && user?.role === 'restaurant' && (
              <>
                <Nav.Link as={Link} to="/restaurant/dashboard" className={location.pathname === '/restaurant/dashboard' ? 'active fw-bold' : ''}>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/restaurant/menu" className={location.pathname === '/restaurant/menu' ? 'active fw-bold' : ''}>
                  Menu
                </Nav.Link>
                <Nav.Link as={Link} to="/restaurant/orders" className={location.pathname === '/restaurant/orders' ? 'active fw-bold' : ''}>
                  Orders
                </Nav.Link>
              </>
            )}
            
            {isAuthenticated && user?.role === 'delivery_agent' && (
              <>
                <Nav.Link as={Link} to="/delivery/dashboard" className={location.pathname === '/delivery/dashboard' ? 'active fw-bold' : ''}>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/delivery/orders" className={location.pathname === '/delivery/orders' ? 'active fw-bold' : ''}>
                  Available Orders
                </Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/profile">
                  <i className="fas fa-user me-1"></i>
                  {user?.name}
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;