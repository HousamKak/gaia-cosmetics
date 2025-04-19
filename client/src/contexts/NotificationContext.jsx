// frontend/src/contexts/NotificationContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { NotificationsContainer } from '../components/common/Notification';

// Create context
const NotificationContext = createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {}
});

// Generate unique ID for notifications
const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Provider component for notifications
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.position - Position of notifications
 * @returns {JSX.Element} Rendered component
 */
export const NotificationProvider = ({ children, position = 'top-right' }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a notification
  const addNotification = useCallback(({ type = 'info', message, duration = 5000 }) => {
    const id = generateId();
    
    setNotifications(prev => [
      ...prev,
      {
        id,
        type,
        message,
        duration
      }
    ]);
    
    return id;
  }, []);

  // Remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Shorthand methods for different notification types
  const showSuccess = useCallback((message, duration = 5000) => {
    return addNotification({ type: 'success', message, duration });
  }, [addNotification]);

  const showError = useCallback((message, duration = 5000) => {
    return addNotification({ type: 'error', message, duration });
  }, [addNotification]);

  const showWarning = useCallback((message, duration = 5000) => {
    return addNotification({ type: 'warning', message, duration });
  }, [addNotification]);

  const showInfo = useCallback((message, duration = 5000) => {
    return addNotification({ type: 'info', message, duration });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationsContainer 
        notifications={notifications} 
        onRemove={removeNotification}
        position={position}
      />
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;