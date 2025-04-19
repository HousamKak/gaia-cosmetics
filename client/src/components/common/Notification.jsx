// frontend/src/components/common/Notification.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

/**
 * Type definitions for notifications
 * @typedef {'success'|'error'|'warning'|'info'} NotificationType
 * 
 * @typedef {Object} NotificationProps
 * @property {string} id - Unique notification ID
 * @property {string} message - Notification message
 * @property {NotificationType} type - Notification type
 * @property {number} duration - Duration in milliseconds before auto-dismiss
 * @property {Function} onClose - Function to call when notification is closed
 */

/**
 * Single notification component
 * @param {NotificationProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const Notification = ({ id, message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);
  
  // Set up auto-dismiss
  useEffect(() => {
    if (duration !== 0) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      
      setTimeoutId(timeout);
      
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [duration]);
  
  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (onClose) {
      onClose(id);
    }
  };
  
  // Handle animation end
  const handleAnimationEnd = () => {
    if (!isVisible && onClose) {
      onClose(id);
    }
  };
  
  // Get icon and color based on notification type
  const getTypeProps = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-400',
          borderColor: 'border-green-400',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: XCircleIcon,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-400',
          borderColor: 'border-red-400',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-400',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-800'
        };
      default: // info
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-400',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-800'
        };
    }
  };
  
  const { icon: Icon, bgColor, iconColor, borderColor, textColor } = getTypeProps();
  
  return (
    <div
      className={`max-w-sm w-full ${bgColor} border-l-4 ${borderColor} rounded-md shadow-lg pointer-events-auto transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      role="alert"
      aria-live="assertive"
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex ${textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Container for notifications
 * @param {Object} props - Component props
 * @param {NotificationProps[]} props.notifications - Array of notification objects
 * @param {Function} props.onRemove - Function to call when a notification is removed
 * @param {string} props.position - Position of notifications container
 * @returns {JSX.Element|null} Rendered component or null
 */
export const NotificationsContainer = ({ 
  notifications = [], 
  onRemove,
  position = 'top-right' 
}) => {
  if (notifications.length === 0) return null;
  
  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-center':
        return 'top-0 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-center':
        return 'bottom-0 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-0 right-0';
      default: // top-right
        return 'top-0 right-0';
    }
  };
  
  // Create portal to render notifications at the root level
  return createPortal(
    <div
      className={`fixed z-50 p-4 space-y-4 max-h-screen overflow-y-auto ${getPositionClasses()}`}
      aria-live="assertive"
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={onRemove}
        />
      ))}
    </div>,
    document.body
  );
};

export default Notification;