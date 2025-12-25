import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Alert } from 'react-bootstrap';
import { menuAPI, restaurantAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    items: '',
    price: '',
    types: '',
    cuisine: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, []);

  const fetchRestaurantAndMenu = async () => {
    try {
      console.log('🔄 Fetching restaurant and menu data...');
      setLoading(true);
      setError('');
      
      // First, get the restaurant details for the logged-in user
      const restaurantResponse = await restaurantAPI.get('/restaurants/owner/my-restaurant');
      console.log('✅ Restaurant data:', restaurantResponse.data);
      
      if (!restaurantResponse.data) {
        setError('No restaurant found for your account. Please contact support.');
        setLoading(false);
        return;
      }
      
      setRestaurant(restaurantResponse.data);
      
      // ✅ FIXED: Use the CORRECT menu API endpoint with /menu/ prefix
      const menuResponse = await menuAPI.get(`/menu/restaurant/${restaurantResponse.data.restaurant_id}`);
      const menuItems = menuResponse.data || [];
      
      console.log(`✅ Found ${menuItems.length} menu items for ${restaurantResponse.data.name}`);
      setMenuItems(menuItems);
      
      // Show welcome message for new restaurants
      if (menuItems.length === 0 && restaurantResponse.data.name.includes("'s Restaurant")) {
        setSuccess('Welcome to your new restaurant! Start by adding your menu items.');
      }
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError('Failed to load menu items: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        items: item.items,
        price: item.price,
        types: item.types,
        cuisine: item.cuisine
      });
    } else {
      setEditingItem(null);
      setFormData({
        items: '',
        price: '',
        types: '',
        cuisine: restaurant?.cuisine || '' // Pre-fill with restaurant cuisine
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (editingItem) {
        // ✅ FIXED: Use correct endpoint for updating menu item with /menu/ prefix
        await menuAPI.put(`/menu/${editingItem.menu_id}`, formData);
        setSuccess('Menu item updated successfully!');
      } else {
        // ✅ FIXED: Use correct endpoint for creating menu item with /menu/ prefix
        await menuAPI.post('/menu/', {
          ...formData,
          menu_id: Date.now(),
          restaurant_id: restaurant.restaurant_id
        });
        setSuccess('Menu item added successfully!');
      }
      
      fetchRestaurantAndMenu();
      handleCloseModal();
    } catch (error) {
      console.error('❌ Error saving menu item:', error);
      setError('Failed to save menu item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (menuId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        // ✅ FIXED: Use correct endpoint for deleting menu item with /menu/ prefix
        await menuAPI.delete(`/menu/${menuId}`);
        setSuccess('Menu item deleted successfully!');
        fetchRestaurantAndMenu();
      } catch (error) {
        console.error('❌ Error deleting menu item:', error);
        setError('Failed to delete menu item: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading menu..." />;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Menu Management</h1>
              <p className="text-muted">
                Manage menu for {restaurant?.name || 'your restaurant'}
                {restaurant && (
                  <span className="ms-2 badge bg-primary">{restaurant.cuisine}</span>
                )}
              </p>
            </div>
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="fas fa-plus me-2"></i>
              Add Menu Item
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      {!restaurant ? (
        <Alert variant="warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          No restaurant found for your account. Please contact support.
        </Alert>
      ) : (
        <Row>
          <Col>
            <Card>
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-utensils me-2"></i>
                  Menu Items for {restaurant.name}
                </h5>
                <span className="badge bg-secondary">{menuItems.length} items</span>
              </Card.Header>
              <Card.Body>
                {menuItems.length > 0 ? (
                  <Table responsive striped hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Item Name</th>
                        <th>Type</th>
                        <th>Cuisine</th>
                        <th>Price (₹)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map(item => (
                        <tr key={item.menu_id}>
                          <td>
                            <strong>{item.items}</strong>
                          </td>
                          <td>
                            <span className="badge bg-info text-dark">{item.types}</span>
                          </td>
                          <td>{item.cuisine}</td>
                          <td>
                            <strong className="text-success">₹{item.price}</strong>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleShowModal(item)}
                                title="Edit item"
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(item.menu_id)}
                                title="Delete item"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                    <h4>No menu items yet</h4>
                    <p className="text-muted mb-4">
                      Start by adding your first menu item to {restaurant.name}
                    </p>
                    <Button variant="primary" size="lg" onClick={() => handleShowModal()}>
                      <i className="fas fa-plus me-2"></i>
                      Add Your First Menu Item
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            {restaurant && (
              <small className="text-muted d-block mt-1">
                For {restaurant.name}
              </small>
            )}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Item Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.items}
                    onChange={(e) => setFormData({...formData, items: e.target.value})}
                    required
                    placeholder="e.g., Margherita Pizza, Butter Chicken"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type *</Form.Label>
                  <Form.Select
                    value={formData.types}
                    onChange={(e) => setFormData({...formData, types: e.target.value})}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snack">Snack</option>
                    <option value="Bread">Bread</option>
                    <option value="Soup">Soup</option>
                    <option value="Salad">Salad</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cuisine *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.cuisine}
                    onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
                    required
                    placeholder="e.g., Italian, North Indian, Chinese"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Update' : 'Add'} Item
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MenuManagement;