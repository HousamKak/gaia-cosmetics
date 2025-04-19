// frontend/src/contexts/WishlistContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useLocalStorage from '../hooks/useLocalStorage';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  // Use useLocalStorage hook instead of manual localStorage manipulation
  const [wishlistItems, setWishlistItems] = useLocalStorage('gaia-wishlist', []);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load wishlist from API if user is logged in
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      
      try {
        if (user) {
          // For logged-in users, we should fetch from API
          // But we'll still use the local storage for now
          // This would be replaced with a real API call in production
          // const response = await axios.get('/api/wishlist');
          // setWishlistItems(response.data);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, [user]);

  // Sync wishlist with backend if user is logged in
  useEffect(() => {
    if (!loading && user) {
      // In a real app, you would call an API to sync the wishlist
      // axios.post('/api/wishlist/sync', { items: wishlistItems });
    }
  }, [wishlistItems, loading, user]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    setWishlistItems(prevItems => {
      // Check if item already exists
      if (prevItems.some(item => item.id === product.id)) {
        return prevItems;
      }
      
      return [...prevItems, product];
    });
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlistItems(prevItems => 
      prevItems.filter(item => item.id !== productId)
    );
  };

  // Check if an item is in the wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Clear the entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;