const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

console.log('🔧 Setting up database...');

const setupDatabase = async () => {
  try {
    // Create database
    await connection.promise().execute('CREATE DATABASE IF NOT EXISTS del');
    console.log('✅ Database created/exists');
    
    // Use database
    await connection.promise().execute('USE del');
    console.log('✅ Using database');

    // Drop tables if they exist
    const tables = ['Payment', 'Orders', 'Menu', 'DeliveryAgent', 'Restaurant', 'Customer', 'users'];
    for (let table of tables) {
      try {
        await connection.promise().execute(`DROP TABLE IF EXISTS ${table}`);
      } catch (err) {
        // Table might not exist, continue
      }
    }
    console.log('✅ Tables dropped');

    // Create users table
    await connection.promise().execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone_no VARCHAR(15) NOT NULL,
        Address VARCHAR(500) NOT NULL,
        role ENUM('customer', 'restaurant', 'delivery_agent') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Insert users with proper bcrypt passwords (password is 'password123')
    const users = [
      ['Yashi Shah', 'yashi@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KbTgY6YrU6Qd.7O4JQ.Oc1eEa6bJ6.', '9988998899', 'Borivali west', 'customer'],
      ['Spice Kitchen Owner', 'owner@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KbTgY6YrU6Qd.7O4JQ.Oc1eEa6bJ6.', '0228765432', 'Bandra,Mumbai', 'restaurant'],
      ['Mumbai Tiffins Owner', 'mumbaitiffins@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KbTgY6YrU6Qd.7O4JQ.Oc1eEa6bJ6.', '0228899001', 'Andheri, Mumbai', 'restaurant'],
      ['Pizza Hub Owner', 'pizzahub@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KbTgY6YrU6Qd.7O4JQ.Oc1eEa6bJ6.', '0223344550', 'Juhu,Mumbai', 'restaurant'],
      ['Rohit Kumar', 'rohit@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KbTgY6YrU6Qd.7O4JQ.Oc1eEa6bJ6.', '1234567890', 'Kandivali west', 'delivery_agent'],
      ['Aakash Singh', 'aakash@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KbTgY6YrU6Qd.7O4JQ.Oc1eEa6bJ6.', '8877665544', 'Colaba,Mumbai', 'delivery_agent'],
      ['Ramesh Sharma', 'ramesh@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KbTgY6YrU6Qd.7O4JQ.Oc1eEa6bJ6.', '6677889900', 'Malad west', 'delivery_agent']
    ];

    for (let user of users) {
      await connection.promise().execute(
        'INSERT INTO users (name, email, password, phone_no, Address, role) VALUES (?, ?, ?, ?, ?, ?)',
        user
      );
    }
    console.log('✅ Users inserted');

    // Create other tables and insert data...
    await connection.promise().execute(`
      CREATE TABLE Customer (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        phone_no VARCHAR(15),
        address VARCHAR(255),
        date_of_birth DATE,
        rating DECIMAL(2,1),
        preferences VARCHAR(255),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Insert customers
    const customers = [
      ['Yashvi Dalal', '9999000001', 'Bandra West, Mumbai', '2006-07-08', 4.8, 'North Indian', 1],
      ['Clark Fernandes', '9999000002', 'Colaba, Mumbai', '2005-11-06', 4.5, 'Seafood', null],
      ['Krisha G', '9999000003', 'Andheri East, Mumbai', '2006-10-14', 4.6, 'South Indian', null],
      ['Aditya Malekar', '9999000004', 'Powai, Mumbai', '2006-02-26', 4.7, 'Chinese', null],
      ['Divij Malpekar', '9999000005', 'Juhu, Mumbai', '2006-11-03', 4.4, 'Italian', null],
      ['Soniya Deshpande', '9999000006', 'Malad West, Mumbai', '2006-03-13', 4.3, 'Mexican', null],
      ['Sampada', '9999000007', 'Khar West, Mumbai', '2006-07-10', 4.9, 'Continental', null]
    ];

    for (let customer of customers) {
      await connection.promise().execute(
        'INSERT INTO Customer (name, phone_no, address, date_of_birth, rating, preferences, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        customer
      );
    }
    console.log('✅ Customers inserted');

    // Create Restaurant table
    await connection.promise().execute(`
      CREATE TABLE Restaurant (
        restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        location VARCHAR(255),
        cuisine VARCHAR(100),
        phone_no VARCHAR(15),
        rating DECIMAL(2,1),
        pricing VARCHAR(50),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Insert restaurants
    const restaurants = [
      ['Spice Kitchen', 'Bandra, Mumbai', 'North Indian', '0221234567', 4.3, 'Moderate', 2],
      ['Mumbai Tiffins', 'Andheri, Mumbai', 'South Indian', '0227654321', 4.6, 'Low', 3],
      ['Pizza Hub', 'Juhu, Mumbai', 'Italian', '0229998888', 4.1, 'High', 4],
      ['Seafood Paradise', 'Colaba, Mumbai', 'Seafood', '0221122334', 4.4, 'High', null],
      ['Chinese Wok', 'Powai, Mumbai', 'Chinese', '0224455667', 4.2, 'Moderate', null],
      ['Vrindavan', 'Kandivali(W), Mumbai', 'Indian', '0897776543', 4.3, 'Moderate', null],
      ['East Asia', 'Mahavir Nagar, Kandivali, Mumbai', 'Japanese', '9909090909', 4.4, 'High', null],
      ['Mexibay', 'Andheri', 'Mexican', '9999999999', 4.1, 'High', null]
    ];

    for (let restaurant of restaurants) {
      await connection.promise().execute(
        'INSERT INTO Restaurant (name, location, cuisine, phone_no, rating, pricing, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        restaurant
      );
    }
    console.log('✅ Restaurants inserted');

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    connection.end();
  }
};

setupDatabase();