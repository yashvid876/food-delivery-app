CREATE DATABASE IF NOT EXISTS del;
USE del;

-- Drop existing tables in correct order to avoid foreign key constraints
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Menu;
DROP TABLE IF EXISTS DeliveryAgent;
DROP TABLE IF EXISTS Restaurant;
DROP TABLE IF EXISTS Customer;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone_no VARCHAR(10) NOT NULL,
  Address VARCHAR(500) NOT NULL,
  role ENUM('customer', 'restaurant', 'delivery_agent') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users - ONLY KEEP ESSENTIAL ONES
INSERT INTO users (name, email, password, phone_no, Address, role) VALUES 
('Yashi Shah', 'yashi@gmail.com', 'password123', '9988998899', 'Borivali west', 'customer'),
('Spice Kitchen Owner', 'owner@gmail.com', 'password123', '0228765432', 'Bandra,Mumbai', 'restaurant'),
('Mumbai Tiffins Owner', 'mumbaitiffins@gmail.com', 'password123', '0228899001', 'Andheri, Mumbai', 'restaurant'),
('Pizza Hub Owner', 'pizzahub@gmail.com', 'password123', '0223344550', 'Juhu,Mumbai', 'restaurant'),
('Rohit Kumar', 'rohit@gmail.com', 'password123', '1234567890', 'Kandivali west', 'delivery_agent');

-- Create Customer table
CREATE TABLE Customer (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  phone_no VARCHAR(15),
  address VARCHAR(255),
  date_of_birth DATE,
  rating DECIMAL(2,1) DEFAULT 4.0,
  preferences VARCHAR(255),
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Restaurant table with Mumbai locations - ONLY 3 RESTAURANTS
CREATE TABLE Restaurant (
  restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  location VARCHAR(255),
  cuisine VARCHAR(100),
  phone_no VARCHAR(15),
  rating DECIMAL(2,1) DEFAULT 4.0,
  pricing VARCHAR(50) DEFAULT 'Moderate',
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create DeliveryAgent table
CREATE TABLE DeliveryAgent (
  agent_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  phone_no VARCHAR(15),
  rating DECIMAL(2,1) DEFAULT 4.0,
  experience INT DEFAULT 0,
  user_id INT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Menu table
CREATE TABLE Menu (
  menu_id BIGINT PRIMARY KEY,
  restaurant_id INT,
  items VARCHAR(255),
  price DECIMAL(8,2),
  types VARCHAR(50),
  cuisine VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id) ON DELETE CASCADE
);

-- Create Orders table with BIGINT order_id
CREATE TABLE Orders (
  order_id BIGINT PRIMARY KEY,
  customer_id INT,
  restaurant_id INT,
  delivery_agent_id INT NULL,
  date DATE,
  time TIME,
  delivery_time TIME,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(8,2),
  delivery_address VARCHAR(255),
  payment_method VARCHAR(50),
  customer_rating INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_agent_id) REFERENCES DeliveryAgent(agent_id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE order_items (
  order_id BIGINT,
  menu_id INT,
  item_name VARCHAR(255),
  price DECIMAL(8,2),
  quantity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);

-- Create Payment table
CREATE TABLE Payment (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  mode VARCHAR(50),
  status VARCHAR(50),
  discount DECIMAL(5,2),
  tip DECIMAL(5,2),
  customer_id INT,
  restaurant_id INT,
  order_id BIGINT,
  amount DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);

-- =============================================
-- CREATE ORDER_STATUS_LOG TABLE FOR TRACKING
-- =============================================

CREATE TABLE order_status_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);

-- =============================================
-- TRIGGERS FOR AUTOMATIC PROFILE CREATION (FIXED)
-- =============================================

DELIMITER //

-- Trigger to automatically create Customer profile when a customer user is inserted
CREATE TRIGGER after_user_insert_customer
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'customer' THEN
        INSERT INTO Customer (name, phone_no, address, user_id)
        VALUES (NEW.name, NEW.phone_no, NEW.Address, NEW.id);
    END IF;
END//

-- Trigger to automatically create Restaurant profile when a restaurant user is inserted (FIXED)
CREATE TRIGGER after_user_insert_restaurant
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE user_location VARCHAR(255);
    
    IF NEW.role = 'restaurant' THEN
        -- Extract location from address (first part before comma)
        SET user_location = SUBSTRING_INDEX(NEW.Address, ',', 1);
        IF user_location = '' THEN
            SET user_location = 'Mumbai';
        END IF;
        
        INSERT INTO Restaurant (name, location, cuisine, phone_no, user_id)
        VALUES (CONCAT(NEW.name, "'s Restaurant"), user_location, 'Multi-Cuisine', NEW.phone_no, NEW.id);
    END IF;
END//

-- Trigger to automatically create DeliveryAgent profile when a delivery_agent user is inserted
CREATE TRIGGER after_user_insert_delivery_agent
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'delivery_agent' THEN
        INSERT INTO DeliveryAgent (name, phone_no, user_id)
        VALUES (NEW.name, NEW.phone_no, NEW.id);
    END IF;
END//

-- Trigger to update user details when customer profile is updated
CREATE TRIGGER after_customer_update
AFTER UPDATE ON Customer
FOR EACH ROW
BEGIN
    UPDATE users 
    SET name = NEW.name, 
        phone_no = NEW.phone_no, 
        Address = NEW.address 
    WHERE id = NEW.user_id;
END//

-- Trigger to update user details when restaurant profile is updated
CREATE TRIGGER after_restaurant_update
AFTER UPDATE ON Restaurant
FOR EACH ROW
BEGIN
    UPDATE users 
    SET name = SUBSTRING_INDEX(NEW.name, "'s Restaurant", 1),
        phone_no = NEW.phone_no
    WHERE id = NEW.user_id;
END//

-- Trigger to update user details when delivery agent profile is updated
CREATE TRIGGER after_delivery_agent_update
AFTER UPDATE ON DeliveryAgent
FOR EACH ROW
BEGIN
    UPDATE users 
    SET name = NEW.name, 
        phone_no = NEW.phone_no 
    WHERE id = NEW.user_id;
END//

-- Trigger to update order status timestamp when status changes
CREATE TRIGGER after_order_status_update
AFTER UPDATE ON Orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO order_status_log (order_id, old_status, new_status, changed_at)
        VALUES (NEW.order_id, OLD.status, NEW.status, NOW());
    END IF;
END//

DELIMITER ;

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for complete order details with joins
CREATE VIEW order_details_view AS
SELECT 
    o.order_id,
    o.date,
    o.time,
    o.status,
    o.total_amount,
    o.delivery_address,
    o.payment_method,
    c.name AS customer_name,
    c.phone_no AS customer_phone,
    r.name AS restaurant_name,
    r.location AS restaurant_location,
    da.name AS delivery_agent_name,
    da.phone_no AS delivery_agent_phone,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count
FROM Orders o
LEFT JOIN Customer c ON o.customer_id = c.customer_id
LEFT JOIN Restaurant r ON o.restaurant_id = r.restaurant_id
LEFT JOIN DeliveryAgent da ON o.delivery_agent_id = da.agent_id;

-- View for restaurant performance analytics
CREATE VIEW restaurant_analytics_view AS
SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    r.cuisine,
    r.rating,
    COUNT(o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_revenue,
    AVG(o.total_amount) AS avg_order_value,
    COUNT(DISTINCT o.customer_id) AS unique_customers,
    (SELECT COUNT(*) FROM Menu m WHERE m.restaurant_id = r.restaurant_id) AS menu_items_count
FROM Restaurant r
LEFT JOIN Orders o ON r.restaurant_id = o.restaurant_id
GROUP BY r.restaurant_id, r.name, r.cuisine, r.rating;

-- View for delivery agent performance
CREATE VIEW delivery_agent_performance_view AS
SELECT 
    da.agent_id,
    da.name AS agent_name,
    da.rating,
    da.experience,
    da.is_available,
    COUNT(o.order_id) AS total_deliveries,
    SUM(o.total_amount) AS total_delivery_value,
    AVG(TIMESTAMPDIFF(MINUTE, CONCAT(o.date, ' ', o.time), CONCAT(o.date, ' ', o.delivery_time))) AS avg_delivery_time_minutes
FROM DeliveryAgent da
LEFT JOIN Orders o ON da.agent_id = o.delivery_agent_id AND o.status = 'delivered'
GROUP BY da.agent_id, da.name, da.rating, da.experience, da.is_available;

-- View for customer order history
CREATE VIEW customer_order_history_view AS
SELECT 
    c.customer_id,
    c.name AS customer_name,
    c.rating AS customer_rating,
    o.order_id,
    o.date,
    o.time,
    o.status,
    o.total_amount,
    r.name AS restaurant_name,
    r.cuisine AS restaurant_cuisine,
    GROUP_CONCAT(oi.item_name SEPARATOR ', ') AS ordered_items
FROM Customer c
JOIN Orders o ON c.customer_id = o.customer_id
JOIN Restaurant r ON o.restaurant_id = r.restaurant_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY c.customer_id, c.name, c.rating, o.order_id, o.date, o.time, o.status, o.total_amount, r.name, r.cuisine;

-- View for menu with restaurant details
CREATE VIEW menu_with_restaurant_view AS
SELECT 
    m.menu_id,
    m.items,
    m.price,
    m.types,
    m.cuisine,
    m.is_available,
    r.restaurant_id,
    r.name AS restaurant_name,
    r.location AS restaurant_location,
    r.rating AS restaurant_rating,
    r.pricing AS restaurant_pricing
FROM Menu m
JOIN Restaurant r ON m.restaurant_id = r.restaurant_id;

-- =============================================
-- INSERT SAMPLE DATA (After triggers are created)
-- =============================================

-- Insert sample customers (triggers will handle profile creation)
INSERT INTO Customer (customer_id, name, phone_no, address, date_of_birth, rating, preferences, user_id) VALUES
(1, 'Yashvi Dalal', '9999000001', 'Bandra West, Mumbai', '2006-07-08', 4.8, 'North Indian', 1),
(2, 'Clark Fernandes', '9999000002', 'Colaba, Mumbai', '2005-11-06', 4.5, 'Seafood', NULL),
(3, 'Krisha G', '9999000003', 'Andheri East, Mumbai', '2006-10-14', 4.6, 'South Indian', NULL);

-- Insert sample restaurants
INSERT INTO Restaurant (restaurant_id, name, location, cuisine, phone_no, rating, pricing, user_id) VALUES
(1, 'Spice Kitchen', 'Bandra, Mumbai', 'North Indian', '0221234567', 4.3, 'Moderate', 2),
(2, 'Mumbai Tiffins', 'Andheri, Mumbai', 'South Indian', '0227654321', 4.6, 'Low', 3),
(3, 'Pizza Hub', 'Juhu, Mumbai', 'Italian', '0229998888', 4.1, 'High', 4);

-- Insert delivery agents
INSERT INTO DeliveryAgent (agent_id, name, phone_no, rating, experience, user_id) VALUES
(1, 'Rohit Kumar', '9990001111', 4.5, 3, 5),
(2, 'Aakash Singh', '8881112222', 4.2, 2, NULL),
(3, 'Ramesh Sharma', '7772223333', 4.8, 5, NULL);

-- Insert menu items ONLY for the 3 restaurants
INSERT INTO Menu VALUES
-- Spice Kitchen (North Indian)
(55, 1, 'Paneer Butter Masala', 250, 'Main Course', 'North Indian', TRUE, NOW()),
(56, 1, 'Butter Naan', 40, 'Bread', 'North Indian', TRUE, NOW()),
(57, 1, 'Chicken Tikka Masala', 280, 'Main Course', 'North Indian', TRUE, NOW()),
(58, 1, 'Dal Makhani', 180, 'Main Course', 'North Indian', TRUE, NOW()),

-- Mumbai Tiffins (South Indian)
(59, 2, 'Masala Dosa', 120, 'Main Course', 'South Indian', TRUE, NOW()),
(60, 2, 'Idli Sambar', 80, 'Breakfast', 'South Indian', TRUE, NOW()),
(61, 2, 'Vada Pav', 40, 'Snack', 'South Indian', TRUE, NOW()),
(62, 2, 'Medu Vada', 70, 'Snack', 'South Indian', TRUE, NOW()),

-- Pizza Hub (Italian)
(63, 3, 'Margherita Pizza', 350, 'Main Course', 'Italian', TRUE, NOW()),
(64, 3, 'Pepperoni Pizza', 450, 'Main Course', 'Italian', TRUE, NOW()),
(65, 3, 'Garlic Bread', 120, 'Appetizer', 'Italian', TRUE, NOW()),
(66, 3, 'Pasta Alfredo', 280, 'Main Course', 'Italian', TRUE, NOW());

-- Insert sample orders ONLY for the 3 restaurants
INSERT INTO Orders VALUES
(1001, 1, 1, 1, '2025-01-19', '12:30:00', '13:00:00', 'delivered', 290.00, 'Bandra West, Mumbai', 'cash', 5, NOW()),
(1002, 2, 2, 2, '2025-01-19', '19:00:00', '19:45:00', 'delivered', 120.00, 'Colaba, Mumbai', 'upi', 4, NOW()),
(1003, 3, 3, NULL, '2025-01-19', '14:15:00', '14:50:00', 'ready', 470.00, 'Andheri East, Mumbai', 'credit_card', NULL, NOW()),
(1006, 1, 1, NULL, '2025-01-19', '13:00:00', '13:35:00', 'confirmed', 530.00, 'Malad West, Mumbai', 'upi', NULL, NOW()),
(1007, 2, 2, NULL, '2025-01-19', '21:00:00', '21:50:00', 'pending', 160.00, 'Khar West, Mumbai', 'cash', NULL, NOW());

-- Insert order items
INSERT INTO order_items VALUES
(1001, 55, 'Paneer Butter Masala', 250, 1, NOW()),
(1001, 56, 'Butter Naan', 40, 1, NOW()),
(1002, 59, 'Masala Dosa', 120, 1, NOW()),
(1003, 63, 'Margherita Pizza', 350, 1, NOW()),
(1003, 65, 'Garlic Bread', 120, 1, NOW());

-- Insert payments ONLY for the 3 restaurants
INSERT INTO Payment (payment_id, mode, status, discount, tip, customer_id, restaurant_id, order_id, amount) VALUES
(101, 'UPI', 'Completed', 10.00, 5.00, 1, 1, 1001, 290.00),        
(102, 'Credit Card', 'Completed', 0.00, 0.00, 2, 2, 1002, 120.00),  
(103, 'Cash', 'Completed', 5.00, 2.00, 3, 3, 1003, 470.00),        
(106, 'UPI', 'Pending', 8.00, 4.00, 1, 1, 1006, 530.00),         
(107, 'Credit Card', 'Pending', 12.00, 6.00, 2, 2, 1007, 160.00);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify the data
SELECT 'USERS' as '';
SELECT * FROM users;

SELECT 'CUSTOMERS' as '';
SELECT * FROM Customer;

SELECT 'RESTAURANTS' as '';
SELECT * FROM Restaurant;

SELECT 'MENU ITEMS' as '';
SELECT m.menu_id, m.items, r.name as restaurant_name, m.price, m.types
FROM Menu m 
JOIN Restaurant r ON m.restaurant_id = r.restaurant_id
ORDER BY r.name, m.menu_id;

SELECT 'DELIVERY AGENTS' as '';
SELECT * FROM DeliveryAgent;

SELECT 'ORDERS' as '';
SELECT o.order_id, r.name as restaurant_name, c.name as customer_name, o.status, o.total_amount
FROM Orders o
JOIN Restaurant r ON o.restaurant_id = r.restaurant_id
JOIN Customer c ON o.customer_id = c.customer_id;

SELECT 'PAYMENTS' as '';
SELECT * FROM Payment;

-- Show restaurant-user associations
SELECT 
    u.id as user_id,
    u.name as owner_name,
    u.email,
    u.role,
    r.restaurant_id,
    r.name as restaurant_name
FROM users u
JOIN Restaurant r ON u.id = r.user_id
WHERE u.role = 'restaurant';

-- Test the views
SELECT 'ORDER DETAILS VIEW' as '';
SELECT * FROM order_details_view LIMIT 5;

SELECT 'RESTAURANT ANALYTICS VIEW' as '';
SELECT * FROM restaurant_analytics_view;

SELECT 'DELIVERY AGENT PERFORMANCE VIEW' as '';
SELECT * FROM delivery_agent_performance_view;

SELECT 'CUSTOMER ORDER HISTORY VIEW' as '';
SELECT * FROM customer_order_history_view LIMIT 5;

SELECT 'MENU WITH RESTAURANT VIEW' as '';
SELECT * FROM menu_with_restaurant_view LIMIT 5;

-- =============================================
-- TEST AUTOMATIC PROFILE CREATION
-- =============================================

-- Test: Insert a new customer user
INSERT INTO users (name, email, password, phone_no, Address, role) 
VALUES ('Test Customer', 'testcustomer@example.com', 'password123', '9876543210', 'Test Address, Mumbai', 'customer');

-- Test: Insert a new restaurant user
INSERT INTO users (name, email, password, phone_no, Address, role) 
VALUES ('Test Restaurant Owner', 'testrestaurant@example.com', 'password123', '9876543211', 'Restaurant Address, Mumbai', 'restaurant');

-- Test: Insert a new delivery agent user
INSERT INTO users (name, email, password, phone_no, Address, role) 
VALUES ('Test Delivery Agent', 'testdelivery@example.com', 'password123', '9876543212', 'Delivery Address, Mumbai', 'delivery_agent');

-- Verify automatic profile creation
SELECT 'AUTOMATIC PROFILE CREATION TEST' as '';
SELECT 
    u.id, u.name, u.email, u.role,
    CASE 
        WHEN u.role = 'customer' THEN (SELECT name FROM Customer WHERE user_id = u.id)
        WHEN u.role = 'restaurant' THEN (SELECT name FROM Restaurant WHERE user_id = u.id)
        WHEN u.role = 'delivery_agent' THEN (SELECT name FROM DeliveryAgent WHERE user_id = u.id)
    END as profile_name
FROM users u
WHERE u.email LIKE 'test%@example.com';