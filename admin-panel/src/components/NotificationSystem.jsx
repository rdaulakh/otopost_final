import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const success = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options,
    });
  };

  const error = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 0, // Error notifications don't auto-dismiss
      ...options,
    });
  };

  const info = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options,
    });
  };

  const warning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options,
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
