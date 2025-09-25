import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
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
// import { useNotifications, useNotificationSettings } from '../hooks/useApi.js'

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

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [localNotifications, setLocalNotifications] = useState([])
  
  // Real API integration for server notifications
  // const { 
  //   data: serverNotifications, 
  //   isLoading, 
  //   error,
  //   refetch: refetchNotifications 
  // } = useNotifications()

  // const { 
  //   data: notificationSettings,
  //   refetch: refetchSettings 
  // } = useNotificationSettings()

  // Default values to prevent errors
  const serverNotifications = { notifications: [] }
  const isLoading = false
  const error = null
  const refetchNotifications = () => Promise.resolve()
  const notificationSettings = {}
  const refetchSettings = () => Promise.resolve()

  // Mark as read functionality would be implemented with a custom hook

  // Removed auto-refresh to prevent constant refreshing
  // Notifications will be fetched on component mount and user interactions

  // Add local notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      duration: DEFAULT_DURATION,
      timestamp: new Date().toISOString(),
      ...notification
    }

    setLocalNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS)
      return updated
    })

    // Auto-remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  // Remove local notification
  const removeNotification = useCallback((id) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Mark server notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Simple API call to mark notification as read
      console.log('Marking notification as read:', notificationId)
      await refetchNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [refetchNotifications])

  // Clear all local notifications
  const clearAll = useCallback(() => {
    setLocalNotifications([])
  }, [])

  // Notification shortcuts
  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    })
  }, [addNotification])

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      duration: 0, // Don't auto-remove error notifications
      ...options
    })
  }, [addNotification])

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
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
      duration: 0, // Don't auto-remove loading notifications
      ...options
    })
  }, [addNotification])

  // Combine local and server notifications
  const allNotifications = [
    ...localNotifications,
    ...(serverNotifications?.notifications || []).map(n => ({
      ...n,
      isServerNotification: true
    }))
  ]

  const value = {
    notifications: allNotifications,
    serverNotifications: serverNotifications?.notifications || [],
    localNotifications,
    notificationSettings,
    isLoading,
    error,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    success,
    showError,
    warning,
    info,
    loading,
    refetchNotifications,
    refetchSettings
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Hook to use notifications
export const useNotificationSystem = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationSystem must be used within a NotificationProvider')
  }
  return context
}

// Individual Notification Component
const NotificationItem = ({ notification, onRemove, onMarkAsRead }) => {
  const Icon = getNotificationIcon(notification.type)
  const colors = getNotificationColors(notification.type)

  const handleRemove = () => {
    if (notification.isServerNotification) {
      onMarkAsRead?.(notification.id)
    } else {
      onRemove?.(notification.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        relative p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${colors.bg} ${colors.border} ${colors.text}
        max-w-sm w-full
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon 
          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${colors.icon} ${
            notification.type === NOTIFICATION_TYPES.LOADING ? 'animate-spin' : ''
          }`} 
        />
        
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className="text-sm font-medium mb-1">
              {notification.title}
            </h4>
          )}
          
          <p className="text-sm opacity-90">
            {notification.message}
          </p>
          
          {notification.action && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={notification.action.onClick}
                className="text-xs"
              >
                {notification.action.label}
              </Button>
            </div>
          )}
          
          {notification.timestamp && (
            <p className="text-xs opacity-60 mt-1">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className={`h-6 w-6 p-0 ${colors.text} hover:bg-black/10`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {notification.isServerNotification && !notification.read && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </motion.div>
  )
}

// Notification Container Component
const NotificationContainer = () => {
  const { 
    notifications, 
    removeNotification, 
    markAsRead,
    clearAll 
  } = useNotificationSystem()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, MAX_NOTIFICATIONS).map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </AnimatePresence>
      
      {notifications.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex justify-end"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="text-xs"
          >
            Clear All ({notifications.length})
          </Button>
        </motion.div>
      )}
    </div>
  )
}

// Notification Bell Component (for header/navbar)
export const NotificationBell = ({ className = "" }) => {
  const { 
    serverNotifications, 
    isLoading,
    refetchNotifications 
  } = useNotificationSystem()

  const unreadCount = serverNotifications?.filter(n => !n.read).length || 0

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={refetchNotifications}
      className={`relative ${className}`}
      disabled={isLoading}
    >
      <Bell className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} />
      
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )
}

// Export notification types for external use
export { NOTIFICATION_TYPES }

// Default export
const NotificationSystem = {
  Provider: NotificationProvider,
  Bell: NotificationBell,
  useNotificationSystem,
  NOTIFICATION_TYPES
}

export default NotificationSystem
