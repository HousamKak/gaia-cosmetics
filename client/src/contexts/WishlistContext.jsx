// frontend/src/contexts/WishlistContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load wishlist from localStorage or API based on authentication status
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      
      try {
        if (user) {
          // For logged-in users, fetch from API
          // This would be replaced with a real API call in production
          // const response = await axios.get('/api/wishlist');
          // setWishlistItems(response.data);
          
          // For now, we'll use localStorage even for logged-in users
          const storedWishlist = localStorage.getItem('gaia-wishlist');
          if (storedWishlist) {
            try {
              setWishlistItems(JSON.parse(storedWishlist));
            } catch (error) {
              console.error('Failed to parse wishlist from localStorage', error);
              setWishlistItems([]);
            }
          }
        } else {
          // For guests, use localStorage
          const storedWishlist = localStorage.getItem('gaia-wishlist');
          if (storedWishlist) {
            try {
              setWishlistItems(JSON.parse(storedWishlist));
            } catch (error) {
              console.error('Failed to parse wishlist from localStorage', error);
              setWishlistItems([]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, [user]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('gaia-wishlist', JSON.stringify(wishlistItems));
      
      // If user is logged in, sync with backend
      if (user) {
        // In a real app, you would call an API to sync the wishlist
        // axios.post('/api/wishlist/sync', { items: wishlistItems });
      }
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