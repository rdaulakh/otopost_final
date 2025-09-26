import { io } from 'socket.io-client'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.listeners = new Map()
    this.connectionCallbacks = []
    this.disconnectionCallbacks = []
  }

  // Initialize connection
  connect(token) {
    if (this.socket?.connected) {
      return Promise.resolve()
    }

    const serverUrl = import.meta.env.VITE_WS_URL || 'wss://localhost:5000'
    
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      })

      // Connection successful
      this.socket.on('connect', () => {
        console.log('WebSocket connected:', this.socket.id)
        this.isConnected = true
        this.reconnectAttempts = 0
        
        // Notify connection callbacks
        if (this.connectionCallbacks && Array.isArray(this.connectionCallbacks)) {
          this.connectionCallbacks.forEach(callback => callback())
        }
        
        resolve()
      })

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.warn('WebSocket connection error:', error)
        this.isConnected = false
        
        // Don't reject immediately, try to reconnect
        setTimeout(() => {
          if (!this.isConnected) {
            console.log('WebSocket connection failed, will retry...')
            // Notify error callbacks but don't reject the promise
            if (this.errorCallbacks && Array.isArray(this.errorCallbacks)) {
              this.errorCallbacks.forEach(callback => callback(error))
            }
          }
        }, 1000)
      })

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        this.isConnected = false
        
        // Notify disconnection callbacks
        if (this.disconnectionCallbacks && Array.isArray(this.disconnectionCallbacks)) {
          this.disconnectionCallbacks.forEach(callback => callback(reason))
        }
        
        // Auto-reconnect logic
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          return
        }
        
        this.handleReconnect()
      })

      // Authentication error
      this.socket.on('auth_error', (error) => {
        console.error('WebSocket authentication error:', error)
        this.disconnect()
        reject(new Error('Authentication failed'))
      })

      // Set up default event listeners
      this.setupDefaultListeners()
    })
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.reconnectAttempts = 0
  }

  // Handle reconnection
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`)
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect()
      }
    }, delay)
  }

  // Check if WebSocket is available
  isWebSocketAvailable() {
    return this.isConnected && this.socket
  }

  // Fallback method for when WebSocket is not available
  fallbackNotificationCheck() {
    if (!this.isWebSocketAvailable()) {
      console.log('WebSocket not available, using fallback notification check')
      // This could trigger a regular API call to check for notifications
      return false
    }
    return true
  }

  // Set up default event listeners
  setupDefaultListeners() {
    if (!this.socket) return

    // User presence updates
    this.socket.on('user:online', (data) => {
      this.emit('userOnline', data)
    })

    this.socket.on('user:offline', (data) => {
      this.emit('userOffline', data)
    })

    // Real-time notifications
    this.socket.on('notification:new', (notification) => {
      this.emit('newNotification', notification)
    })

    // Analytics updates
    this.socket.on('analytics:update', (data) => {
      this.emit('analyticsUpdate', data)
    })

    // Content updates
    this.socket.on('content:updated', (data) => {
      this.emit('contentUpdated', data)
    })

    this.socket.on('content:published', (data) => {
      this.emit('contentPublished', data)
    })

    // AI agent updates
    this.socket.on('agent:status', (data) => {
      this.emit('agentStatus', data)
    })

    this.socket.on('agent:task_completed', (data) => {
      this.emit('agentTaskCompleted', data)
    })

    // System updates
    this.socket.on('system:maintenance', (data) => {
      this.emit('systemMaintenance', data)
    })
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  // Unsubscribe from events
  off(event, callback) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Emit events to listeners
  emit(event, data) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket event callback for ${event}:`, error)
        }
      })
    }
  }

  // Send message to server
  send(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn('WebSocket not connected, cannot send:', event, data)
    }
  }

  // Join room
  joinRoom(room) {
    this.send('room:join', { room })
  }

  // Leave room
  leaveRoom(room) {
    this.send('room:leave', { room })
  }

  // Subscribe to analytics updates
  subscribeToAnalytics(userId) {
    this.send('analytics:subscribe', { userId })
  }

  // Unsubscribe from analytics updates
  unsubscribeFromAnalytics(userId) {
    this.send('analytics:unsubscribe', { userId })
  }

  // Send typing indicator
  sendTyping(room, isTyping) {
    this.send('typing', { room, isTyping })
  }

  // Connection status callbacks
  onConnect(callback) {
    this.connectionCallbacks.push(callback)
  }

  onDisconnect(callback) {
    this.disconnectionCallbacks.push(callback)
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService()

export default websocketService

// React hook for WebSocket
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export const useWebSocket = () => {
  const { token } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  useEffect(() => {
    if (token) {
      setConnectionStatus('connecting')
      
      websocketService.connect(token)
        .then(() => {
          setIsConnected(true)
          setConnectionStatus('connected')
        })
        .catch((error) => {
          console.error('WebSocket connection failed:', error)
          setIsConnected(false)
          setConnectionStatus('error')
        })

      // Set up connection status listeners
      const handleConnect = () => {
        setIsConnected(true)
        setConnectionStatus('connected')
      }

      const handleDisconnect = () => {
        setIsConnected(false)
        setConnectionStatus('disconnected')
      }

      websocketService.onConnect(handleConnect)
      websocketService.onDisconnect(handleDisconnect)

      return () => {
        websocketService.disconnect()
      }
    } else {
      websocketService.disconnect()
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }
  }, [token])

  const subscribe = useCallback((event, callback) => {
    return websocketService.on(event, callback)
  }, [])

  const send = useCallback((event, data) => {
    websocketService.send(event, data)
  }, [])

  return {
    isConnected,
    connectionStatus,
    subscribe,
    send,
    joinRoom: websocketService.joinRoom.bind(websocketService),
    leaveRoom: websocketService.leaveRoom.bind(websocketService),
    subscribeToAnalytics: websocketService.subscribeToAnalytics.bind(websocketService),
    unsubscribeFromAnalytics: websocketService.unsubscribeFromAnalytics.bind(websocketService)
  }
}
