// frontend/src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // Use useLocalStorage hook instead of manual localStorage manipulation
  const [cartItems, setCartItems] = useLocalStorage('gaia-cart', []);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(0);

  // Calculate totals whenever cart changes
  useEffect(() => {
    // Calculate subtotal
    const newSubtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubtotal(newSubtotal);

    // Calculate discount
    const newDiscount = cartItems.reduce(
      (sum, item) => 
        sum + 
        ((item.originalPrice - item.price) * item.quantity),
      0
    );
    setDiscount(newDiscount);

    // Set shipping cost (free for orders above 999)
    const newShippingCost = newSubtotal > 999 ? 0 : 50;
    setShippingCost(newShippingCost);

    // Calculate total
    setTotal(newSubtotal + newShippingCost);
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.selectedColor === product.selectedColor
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += product.quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, product];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (itemId, color, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems(prevItems => 
      prevItems.map(item => 
        (item.id === itemId && item.selectedColor === color)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (itemId, color) => {
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item.id === itemId && item.selectedColor === color)
      )
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Apply promo code
  const applyPromoCode = (code) => {
    // In a real app, this would validate the code against an API
    // For now, just a simple example
    if (code === 'GAIA20') {
      const promoDiscount = Math.round(subtotal * 0.2);
      setDiscount(prevDiscount => prevDiscount + promoDiscount);
      setTotal(prevTotal => prevTotal - promoDiscount);
      return { valid: true, message: '20% discount applied' };
    }
    return { valid: false, message: 'Invalid promo code' };
  };

  const value = {
    cartItems,
    subtotal,
    discount,
    shippingCost,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;