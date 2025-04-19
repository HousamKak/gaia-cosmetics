// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
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
      const token = localStorage.getItem('gaia-auth-token');
      
      if (token) {
        try {
          // Configure axios to use the token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // In a real app, you would validate the token with your backend
          // For now, we'll just simulate this by checking localStorage
          const userData = localStorage.getItem('gaia-user-data');
          
          if (userData) {
            setUser(JSON.parse(userData));
          } else {
            // If no user data, clear the invalid token
            localStorage.removeItem('gaia-auth-token');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (err) {
          console.error('Authentication error:', err);
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('gaia-auth-token');
          localStorage.removeItem('gaia-user-data');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // For now, we'll simulate a successful login
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check credentials (in a real app, this would be done by the server)
      if (email === 'demo@gaia.com' && password === 'password123') {
        // Simulate JWT token and user data
        const token = 'simulated-jwt-token';
        const userData = {
          id: 1,
          name: 'Demo User',
          email: 'demo@gaia.com',
          role: 'customer'
        };
        
        // Save to localStorage
        localStorage.setItem('gaia-auth-token', token);
        localStorage.setItem('gaia-user-data', JSON.stringify(userData));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setUser(userData);
        setLoading(false);
        return { success: true };
      } else {
        setError('Invalid email or password');
        setLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // For now, we'll simulate a successful registration
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate validation (in a real app, this would be done by the server)
      if (!name || !email || !password) {
        setError('All fields are required');
        setLoading(false);
        return { success: false, error: 'All fields are required' };
      }
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return { success: false, error: 'Password must be at least 8 characters' };
      }
      
      // Simulate JWT token and user data
      const token = 'simulated-jwt-token';
      const userData = {
        id: 2, // Different ID than login simulation
        name,
        email,
        role: 'customer'
      };
      
      // Save to localStorage
      localStorage.setItem('gaia-auth-token', token);
      localStorage.setItem('gaia-user-data', JSON.stringify(userData));
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      setLoading(false);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('gaia-auth-token');
    localStorage.removeItem('gaia-user-data');
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update state
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