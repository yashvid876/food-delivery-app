import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Alert, Button } from 'react-bootstrap';
import { restaurantAPI } from '../../services/api';
import RestaurantCard from '../../components/ui/RestaurantCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [searchTerm, cuisineFilter, restaurants]);

  const fetchRestaurants = async () => {
    try {
      console.log('🔄 Fetching restaurants from API...');
      setLoading(true);
      setError('');
      
      const response = await restaurantAPI.get('/restaurants');
      console.log('=== FULL RESPONSE DEBUG ===');
      console.log('Response:', response);
      console.log('Response data:', response.data);
      console.log('Type of response.data:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Deep inspect the response.data object
      if (response.data && typeof response.data === 'object') {
        console.log('Object keys:', Object.keys(response.data));
        console.log('Object values:', Object.values(response.data));
        
        // Check if it has length property (might be array-like)
        console.log('Has length?', 'length' in response.data);
        console.log('Length value:', response.data.length);
        
        // Check common array properties
        console.log('Is array-like?', Array.isArray(response.data) || ('length' in response.data && typeof response.data.length === 'number'));
        
        // Try to find any array in the object
        for (let key in response.data) {
          const value = response.data[key];
          console.log(`Key: ${key}, Type: ${typeof value}, IsArray: ${Array.isArray(value)}`);
          if (Array.isArray(value)) {
            console.log(`✅ FOUND ARRAY at key: ${key}`);
            console.log(`Array length: ${value.length}`);
            console.log('Array content:', value);
          }
        }
      }
      console.log('=== END DEBUG ===');

      let restaurantsData = [];

      // CASE 1: Direct array
      if (Array.isArray(response.data)) {
        console.log('✅ CASE 1: Direct array received');
        restaurantsData = response.data;
      }
      // CASE 2: Object with array inside
      else if (response.data && typeof response.data === 'object') {
        console.log('🔍 CASE 2: Object received, searching for array...');
        
        // Common patterns where arrays might be stored
        const possibleArrayKeys = [
          'data', 'restaurants', 'items', 'results', 'list', 
          'array', 'values', 'content', 'restaurantList'
        ];
        
        for (let key of possibleArrayKeys) {
          if (response.data[key] && Array.isArray(response.data[key])) {
            console.log(`✅ Found array at key: ${key}`);
            restaurantsData = response.data[key];
            break;
          }
        }
        
        // If no specific key found, check all object values
        if (restaurantsData.length === 0) {
          for (let key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`✅ Found array at dynamic key: ${key}`);
              restaurantsData = response.data[key];
              break;
            }
          }
        }
        
        // Last resort: if object has numeric keys, treat as array
        if (restaurantsData.length === 0 && 'length' in response.data) {
          console.log('🔄 Object has length property, converting to array...');
          restaurantsData = Array.from(response.data);
        }
      }

      console.log(`✅ Final restaurants data:`, restaurantsData);
      console.log(`✅ Array length: ${restaurantsData.length}`);

      if (!Array.isArray(restaurantsData) || restaurantsData.length === 0) {
        console.error('❌ No valid restaurant data found after all attempts');
        console.error('Response data was:', response.data);
        setError('No restaurants available. Please check the server connection.');
        setRestaurants([]);
        return;
      }

      setRestaurants(restaurantsData);
      setFilteredRestaurants(restaurantsData);
      
    } catch (error) {
      console.error('❌ Error fetching restaurants:', error);
      setError(`Failed to load restaurants: ${error.message}`);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    if (!Array.isArray(restaurants)) {
      setFilteredRestaurants([]);
      return;
    }

    let filtered = restaurants;

    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cuisineFilter) {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisine === cuisineFilter
      );
    }

    setFilteredRestaurants(filtered);
  };

  // Get unique cuisines safely
  const cuisines = Array.isArray(restaurants) 
    ? [...new Set(restaurants.map(r => r.cuisine).filter(Boolean))]
    : [];

  if (loading) {
    return <LoadingSpinner text="Loading restaurants..." />;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Restaurants</h1>
          <p className="text-muted">Discover amazing food from local restaurants</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger">
          <strong>Error:</strong> {error}
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={fetchRestaurants}>
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      {/* Filters */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search restaurants, cuisines, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
          >
            <option value="">All Cuisines</option>
            {cuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Results Count */}
      <Row className="mb-3">
        <Col>
          <p className="text-muted">
            {Array.isArray(filteredRestaurants) ? filteredRestaurants.length : 0} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
          </p>
        </Col>
      </Row>

      {/* Restaurants Grid */}
      <Row>
        {Array.isArray(filteredRestaurants) && filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => (
            <Col key={restaurant.restaurant_id} md={6} lg={4} className="mb-4">
              <RestaurantCard restaurant={restaurant} />
            </Col>
          ))
        ) : (
          <Col className="text-center py-5">
            <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
            <h4>No restaurants found</h4>
            <p className="text-muted">
              {Array.isArray(restaurants) && restaurants.length === 0 
                ? 'No restaurants available at the moment.' 
                : 'Try adjusting your search filters'}
            </p>
            <Button variant="primary" onClick={fetchRestaurants}>
              Reload Restaurants
            </Button>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Restaurants;