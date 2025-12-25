import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  const addToCart = (item, restaurantInfo) => {
    // If adding from different restaurant, clear cart
    if (restaurant && restaurant.restaurant_id !== restaurantInfo.restaurant_id) {
      if (window.confirm('You have items from another restaurant. Would you like to clear your cart and add items from this restaurant?')) {
        setCartItems([]);
      } else {
        return;
      }
    }

    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.menu_id === item.menu_id);
      
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.menu_id === item.menu_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });

    if (!restaurant) {
      setRestaurant(restaurantInfo);
    }
  };

  const removeFromCart = (menuId) => {
    setCartItems(prev => prev.filter(item => item.menu_id !== menuId));
    
    if (cartItems.length === 1) {
      setRestaurant(null);
    }
  };

  const updateQuantity = (menuId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.menu_id === menuId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    restaurant,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};