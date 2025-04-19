// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (via token in localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('gaia-auth-token');
        
        if (token) {
          // Configure axios to use the token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get current user data
          const userData = authService.getUserData();
          
          // If user data exists, set it
          if (userData) {
            setUser(userData);
          } else {
            // Attempt to get updated user info from API
            try {
              const response = await authService.getCurrentUser();
              if (response.data) {
                setUser(response.data);
              }
            } catch (err) {
              // If API call fails, clear token
              localStorage.removeItem('gaia-auth-token');
              localStorage.removeItem('gaia-user-data');
              delete axios.defaults.headers.common['Authorization'];
            }
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Authentication failed. Please log in again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (userData) => {
    setUser(userData);
    return { success: true };
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await authService.register({ name, email, password });
      setUser(response);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;