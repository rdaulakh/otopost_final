import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X,
  Bell,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'

// Notification Context
const NotificationContext = createContext()

// Notification types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
}

// Default notification settings
const DEFAULT_DURATION = 5000
const MAX_NOTIFICATIONS = 5

// Notification icons
const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return CheckCircle
    case NOTIFICATION_TYPES.ERROR:
      return XCircle
    case NOTIFICATION_TYPES.WARNING:
      return AlertCircle
    case NOTIFICATION_TYPES.INFO:
      return Info
    case NOTIFICATION_TYPES.LOADING:
      return Loader2
    default:
      return Info
  }
}

// Notification colors
const getNotificationColors = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return {
        bg: 'bg-green-50 dark:bg-green-950',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-200',
        icon: 'text-green-600 dark:text-green-400'
      }
    case NOTIFICATION_TYPES.ERROR:
      return {
        bg: 'bg-red-50 dark:bg-red-950',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-600 dark:text-red-400'
      }
    case NOTIFICATION_TYPES.WARNING:
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: 'text-yellow-600 dark:text-yellow-400'
      }
    case NOTIFICATION_TYPES.INFO:
      return {
        bg: 'bg-blue-50 dark:bg-blue-950',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-600 dark:text-blue-400'
      }
    case NOTIFICATION_TYPES.LOADING:
      return {
        bg: 'bg-gray-50 dark:bg-gray-950',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-800 dark:text-gray-200',
        icon: 'text-gray-600 dark:text-gray-400'
      }
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-950',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-800 dark:text-gray-200',
        icon: 'text-gray-600 dark:text-gray-400'
      }
  }
}

// Individual Notification Component
const NotificationItem = ({ notification, onDismiss }) => {
  const Icon = getNotificationIcon(notification.type)
  const colors = getNotificationColors(notification.type)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative flex items-start p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${colors.bg} ${colors.border} ${colors.text}
        max-w-md w-full
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${colors.icon}`}>
        <Icon 
          className={`h-5 w-5 ${notification.type === NOTIFICATION_TYPES.LOADING ? 'animate-spin' : ''}`} 
        />
      </div>
      
      {/* Content */}
      <div className="ml-3 flex-1">
        {notification.title && (
          <h4 className="font-semibold text-sm mb-1">
            {notification.title}
          </h4>
        )}
        <p className="text-sm opacity-90">
          {notification.message}
        </p>
        
        {/* Action button */}
        {notification.action && (
          <Button
            onClick={notification.action.onClick}
            variant="outline"
            size="sm"
            className="mt-2 text-xs"
          >
            {notification.action.label}
          </Button>
        )}
        
        {/* Progress bar for loading */}
        {notification.type === NOTIFICATION_TYPES.LOADING && notification.progress !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{notification.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${notification.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Dismiss button */}
      {notification.dismissible !== false && (
        <Button
          onClick={() => onDismiss(notification.id)}
          variant="ghost"
          size="sm"
          className="flex-shrink-0 ml-2 h-6 w-6 p-0 hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      {/* Auto-dismiss timer */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20 rounded-b-lg overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: notification.duration / 1000, ease: 'linear' }}
            className="h-full bg-current opacity-50"
          />
        </div>
      )}
    </motion.div>
  )
}

// Notification Container
const NotificationContainer = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      duration: DEFAULT_DURATION,
      dismissible: true,
      ...notification
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS)
      return updated
    })

    // Auto-dismiss if duration is set
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  // Dismiss notification
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Update notification (useful for loading states)
  const updateNotification = useCallback((id, updates) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    )
  }, [])

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    })
  }, [addNotification])

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      duration: 8000, // Longer duration for errors
      ...options
    })
  }, [addNotification])

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      duration: 7000,
      ...options
    })
  }, [addNotification])

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    })
  }, [addNotification])

  const loading = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.LOADING,
      message,
      duration: 0, // Don't auto-dismiss loading notifications
      dismissible: false,
      ...options
    })
  }, [addNotification])

  const value = {
    notifications,
    addNotification,
    dismissNotification,
    clearNotifications,
    updateNotification,
    success,
    error,
    warning,
    info,
    loading
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
    </NotificationContext.Provider>
  )
}

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Export types for convenience
export { NOTIFICATION_TYPES }

export default NotificationProvider
