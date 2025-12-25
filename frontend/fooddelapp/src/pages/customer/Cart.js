import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';
import { PAYMENT_METHODS } from '../../utils/constants';

const Cart = () => {
  const { cartItems, restaurant, getCartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.Address || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuantityChange = (menuId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(menuId, newQuantity);
  };

 const handlePlaceOrder = async () => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }

  if (!deliveryAddress.trim()) {
    setError('Please enter a delivery address');
    return;
  }

  if (cartItems.length === 0) {
    setError('Your cart is empty');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const orderData = {
      restaurant_id: restaurant.restaurant_id || restaurant.id,
      items: cartItems.map(item => ({
        menu_id: item.menu_id,
        items: item.items,
        price: item.price,
        quantity: item.quantity
      })),
      total_amount: totalAmount,
      delivery_address: deliveryAddress,
      payment_method: paymentMethod
    };

    console.log('🛒 Placing order:', orderData);

    const response = await orderAPI.post('/orders', orderData);
    
    console.log('✅ Order response:', response.data);
    
    if (response.data.success || response.data.order_id) {
      clearCart();
      alert(`🎉 Order placed successfully! Order ID: ${response.data.order_id}`);
      navigate('/orders');
    } else {
      setError('Order placement failed. Please try again.');
    }
    
  } catch (error) {
    console.error('❌ Error placing order:', error);
    
    // More specific error messages
    if (error.response?.data?.message) {
      setError(error.response.data.message);
    } else if (error.response?.status === 404) {
      setError('Customer profile not found. Please update your profile.');
    } else {
      setError('Failed to place order. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
        <h3>Your cart is empty</h3>
        <p className="text-muted mb-4">Add some delicious food from our restaurants!</p>
        <Button as={Link} to="/restaurants" variant="primary">
          Browse Restaurants
        </Button>
      </Container>
    );
  }

  const deliveryFee = 40;
  const tax = getCartTotal() * 0.05;
  const totalAmount = getCartTotal() + deliveryFee + tax;

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                {restaurant?.name} - Order Summary
              </h4>
              <Button variant="outline-danger" size="sm" onClick={clearCart}>
                Clear Cart
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.menu_id}>
                      <td>
                        <strong>{item.items}</strong>
                        <br />
                        <small className="text-muted">{item.cuisine} • {item.types}</small>
                      </td>
                      <td>₹{item.price}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.menu_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="mx-3">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.menu_id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeFromCart(item.menu_id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="cart-summary">
            <Card.Header>
              <h5 className="mb-0">Checkout</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {!isAuthenticated && (
                <Alert variant="warning">
                  Please <Link to="/login">login</Link> to place your order.
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Delivery Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your delivery address"
                  disabled={!isAuthenticated}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={!isAuthenticated}
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery Fee:</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (5%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={handlePlaceOrder}
                disabled={loading || !isAuthenticated}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Placing Order...
                  </>
                ) : (
                  `Place Order - ₹${totalAmount.toFixed(2)}`
                )}
              </Button>

              {!isAuthenticated && (
                <div className="text-center mt-3">
                  <Link to="/login" className="btn btn-outline-primary w-100">
                    Login to Order
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;