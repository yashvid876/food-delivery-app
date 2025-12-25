const User = require('../models/User');
const jwt = require('jsonwebtoken');

// NEW: Function to create a fresh empty restaurant for new owners
function createNewRestaurantForOwner(userId, ownerName, userEmail, address, callback) {
  const db = require('../config/db');
  
  // Generate restaurant ID
  const restaurant_id = Date.now() % 1000000;
  
  // Create restaurant name from owner's name
  const restaurantName = `${ownerName}'s Restaurant`;
  
  // Extract location from address or use default
  const location = address.split(',')[0] || 'Mumbai';
  
  const query = `
    INSERT INTO Restaurant (restaurant_id, name, location, cuisine, phone_no, rating, pricing, user_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    restaurant_id,
    restaurantName,
    location,
    'Multi-Cuisine', // Default cuisine
    '0000000000', // Default phone
    '4.0', // Default rating
    'Moderate', // Default pricing
    userId
  ];
  
  console.log('🆕 Creating NEW restaurant for owner:', ownerName);
  
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('❌ Error creating new restaurant:', err);
      return callback(err);
    }
    
    console.log('✅ NEW restaurant created:', restaurantName, '(ID:', restaurant_id + ')');
    callback(null, {
      restaurant_id,
      name: restaurantName,
      location,
      cuisine: 'Multi-Cuisine'
    });
  });
}

// UPDATED: Helper function to create NEW restaurants for new owners
function setupRestaurantForOwner(userId, userName, userEmail, address, callback) {
  const db = require('../config/db');
  
  console.log(`🔄 Setting up restaurant for new owner: ${userName} (ID: ${userId})`);
  
  // 🎯 ALWAYS CREATE A NEW RESTAURANT FOR NEW OWNERS
  createNewRestaurantForOwner(userId, userName, userEmail, address, (createErr, newRestaurant) => {
    if (createErr) {
      console.error('❌ Error creating new restaurant:', createErr);
      
      // Fallback: Try to find an available restaurant
      console.log('🔄 Fallback: Looking for available restaurant...');
      const findQuery = 'SELECT * FROM Restaurant WHERE user_id IS NULL LIMIT 1';
      
      db.query(findQuery, (err, results) => {
        if (err) {
          console.error('❌ Error finding available restaurant:', err);
          return callback(err);
        }
        
        if (results.length === 0) {
          console.log('❌ No restaurants available at all');
          return callback(new Error('No restaurants available'));
        }
        
        const restaurant = results[0];
        console.log(`🔄 Linking to available restaurant: ${restaurant.name}`);
        
        const updateQuery = 'UPDATE Restaurant SET user_id = ? WHERE restaurant_id = ?';
        db.query(updateQuery, [userId, restaurant.restaurant_id], (updateErr) => {
          if (updateErr) {
            console.error('❌ Error updating restaurant:', updateErr);
            return callback(updateErr);
          }
          
          console.log(`✅ Successfully linked ${userName} to ${restaurant.name}`);
          callback(null, restaurant);
        });
      });
    } else {
      console.log(`✅ Successfully created NEW restaurant for ${userName}`);
      callback(null, newRestaurant);
    }
  });
}

const authController = {
  register: (req, res) => {
    const { name, email, password, phone_no, address, role } = req.body;

    console.log('Registration attempt:', { name, email, role });

    if (!name || !email || !password || !phone_no || !address || !role) {
      return res.status(400).json({ 
        message: 'All fields are required'
      });
    }

    User.findByEmail(email, (err, results) => {
      if (err) {
        console.error('Database error during registration:', err);
        return res.status(500).json({ 
          message: 'Database error',
          error: err.message 
        });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          message: 'User already exists with this email'
        });
      }

      User.create({ name, email, password, phone_no, address, role }, (err, results) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ 
            message: 'Error creating user',
            error: err.sqlMessage || err.message 
          });
        }

        const userId = results.insertId;
        
        // If user is a restaurant owner, create a NEW restaurant for them
        if (role === 'restaurant') {
          setupRestaurantForOwner(userId, name, email, address, (linkErr, newRestaurant) => {
            if (linkErr) {
              console.error('Error setting up restaurant:', linkErr);
              // Still return success but with a warning
            }
            
            const token = jwt.sign(
              { id: userId, email, role },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
            );

            res.status(201).json({
              message: 'Restaurant owner registered successfully!' + (linkErr ? ' Restaurant setup had issues.' : ' New restaurant created!'),
              token,
              user: { 
                id: userId, 
                name, 
                email, 
                role,
                phone_no,
                address
              },
              restaurant: newRestaurant || null
            });
          });
        } else {
          // For other roles, just return success
          const token = jwt.sign(
            { id: userId, email, role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );

          res.status(201).json({
            message: 'User registered successfully!',
            token,
            user: { 
              id: userId, 
              name, 
              email, 
              role,
              phone_no,
              address
            }
          });
        }
      });
    });
  },

  login: (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 LOGIN ATTEMPT:');
    console.log('Email:', email);
    console.log('Password:', password);

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    User.findByEmail(email, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ 
          message: 'Database error',
          error: err.message 
        });
      }

      console.log('📊 Database results:', results);
      
      if (results.length === 0) {
        console.log('❌ No user found with this email');
        return res.status(400).json({ 
          message: 'Invalid email or password' 
        });
      }

      const user = results[0];
      console.log('👤 User found:', {
        id: user.id,
        email: user.email, 
        storedPassword: user.password,
        providedPassword: password,
        passwordsMatch: user.password === password
      });

      if (user.password === password) {
        console.log('✅ PASSWORDS MATCH - Login successful!');
        
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Login successful!',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone_no: user.phone_no,
            address: user.address
          }
        });
      } else {
        console.log('❌ PASSWORDS DO NOT MATCH');
        console.log('Stored:', `"${user.password}"`);
        console.log('Provided:', `"${password}"`);
        return res.status(400).json({ 
          message: 'Invalid email or password' 
        });
      }
    });
  },

  getMe: (req, res) => {
    User.findById(req.user.id, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user: results[0] });
    });
  }
};

module.exports = authController;