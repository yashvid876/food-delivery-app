const Menu = require('../models/Menu');

const menuController = {
  getMenuByRestaurant: (req, res) => {
    const { restaurantId } = req.params;
    console.log(`🔄 Fetching menu for restaurant ID: ${restaurantId}`);
    
    Menu.getByRestaurant(restaurantId, (err, results) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ 
          message: 'Database error',
          error: err.message 
        });
      }
      
      console.log(`✅ Found ${results.length} menu items for restaurant ${restaurantId}`);
      
      // Ensure we always return an array
      if (!Array.isArray(results)) {
        console.error('❌ Expected array but got:', typeof results);
        results = [];
      }
      
      res.json(results);
    });
  },

  createMenuItem: (req, res) => {
    const menuData = req.body;
    console.log('🔄 Creating menu item:', menuData);
    
    // Validate required fields
    if (!menuData.menu_id || !menuData.restaurant_id || !menuData.items || !menuData.price || !menuData.types || !menuData.cuisine) {
      console.error('❌ Missing required fields:', menuData);
      return res.status(400).json({ 
        message: 'All fields are required: menu_id, restaurant_id, items, price, types, cuisine' 
      });
    }
    
    Menu.create(menuData, (err, results) => {
      if (err) {
        console.error('❌ Error creating menu item:', err);
        return res.status(500).json({ 
          message: 'Error creating menu item', 
          error: err.message,
          sqlMessage: err.sqlMessage 
        });
      }
      
      console.log('✅ Menu item created successfully with ID:', results.insertId);
      res.status(201).json({ 
        message: 'Menu item created successfully', 
        id: results.insertId,
        menu_id: menuData.menu_id
      });
    });
  },

  updateMenuItem: (req, res) => {
    const { id } = req.params;
    const menuData = req.body;
    
    console.log(`🔄 Updating menu item ID: ${id}`, menuData);
    
    Menu.update(id, menuData, (err, results) => {
      if (err) {
        console.error('❌ Error updating menu item:', err);
        return res.status(500).json({ 
          message: 'Error updating menu item', 
          error: err.message 
        });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      console.log('✅ Menu item updated successfully');
      res.json({ message: 'Menu item updated successfully' });
    });
  },

  deleteMenuItem: (req, res) => {
    const { id } = req.params;
    console.log(`🔄 Deleting menu item ID: ${id}`);
    
    Menu.delete(id, (err, results) => {
      if (err) {
        console.error('❌ Error deleting menu item:', err);
        return res.status(500).json({ 
          message: 'Error deleting menu item', 
          error: err.message 
        });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      console.log('✅ Menu item deleted successfully');
      res.json({ message: 'Menu item deleted successfully' });
    });
  }
};

module.exports = menuController;