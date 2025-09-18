const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const User = require('../models/User');

class SocketService {
  constructor() {
    this.io = null;
    this.redis = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.userSockets = new Map(); // socketId -> user info mapping
    this.rooms = new Map(); // room management
    
    this.initializeRedis();
  }

  initializeRedis() {
    try {
      this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      console.log('Redis connected for Socket.IO');
    } catch (error) {
      console.error('Redis connection error:', error);
    }
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.setupEventHandlers();
    console.log('Socket.IO server initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
      
      // User presence events
      socket.on('user:online', () => this.handleUserOnline(socket));
      socket.on('user:offline', () => this.handleUserOffline(socket));
      socket.on('user:typing', (data) => this.handleUserTyping(socket, data));
      socket.on('user:stop-typing', (data) => this.handleUserStopTyping(socket, data));
      
      // Room management
      socket.on('room:join', (roomId) => this.handleJoinRoom(socket, roomId));
      socket.on('room:leave', (roomId) => this.handleLeaveRoom(socket, roomId));
      
      // Content collaboration
      socket.on('content:editing', (data) => this.handleContentEditing(socket, data));
      socket.on('content:save', (data) => this.handleContentSave(socket, data));
      socket.on('content:lock', (data) => this.handleContentLock(socket, data));
      socket.on('content:unlock', (data) => this.handleContentUnlock(socket, data));
      
      // Analytics events
      socket.on('analytics:subscribe', (data) => this.handleAnalyticsSubscribe(socket, data));
      socket.on('analytics:unsubscribe', (data) => this.handleAnalyticsUnsubscribe(socket, data));
      
      // Notification events
      socket.on('notifications:mark-read', (data) => this.handleMarkNotificationRead(socket, data));
      socket.on('notifications:mark-all-read', () => this.handleMarkAllNotificationsRead(socket));
      
      // Chat/messaging events
      socket.on('message:send', (data) => this.handleSendMessage(socket, data));
      socket.on('message:typing', (data) => this.handleMessageTyping(socket, data));
      
      // Disconnect handler
      socket.on('disconnect', () => this.handleDisconnection(socket));
    });
  }

  handleConnection(socket) {
    const userId = socket.userId;
    const user = socket.user;
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, {
      userId,
      user,
      connectedAt: new Date(),
      rooms: new Set()
    });

    // Join user's personal room
    socket.join(`user:${userId}`);
    
    // Notify user is online
    this.broadcastUserStatus(userId, 'online');
    
    // Send pending notifications
    this.sendPendingNotifications(socket);
    
    console.log(`User ${user.name} connected (${socket.id})`);
    
    // Emit connection success
    socket.emit('connected', {
      message: 'Connected successfully',
      userId,
      socketId: socket.id
    });
  }

  handleDisconnection(socket) {
    const socketInfo = this.userSockets.get(socket.id);
    if (socketInfo) {
      const { userId, user } = socketInfo;
      
      // Clean up user connections
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);
      
      // Leave all rooms
      socketInfo.rooms.forEach(roomId => {
        socket.leave(roomId);
        this.updateRoomUserCount(roomId);
      });
      
      // Notify user is offline
      this.broadcastUserStatus(userId, 'offline');
      
      console.log(`User ${user.name} disconnected (${socket.id})`);
    }
  }

  handleUserOnline(socket) {
    const userId = socket.userId;
    this.broadcastUserStatus(userId, 'online');
    this.updateUserLastSeen(userId);
  }

  handleUserOffline(socket) {
    const userId = socket.userId;
    this.broadcastUserStatus(userId, 'offline');
    this.updateUserLastSeen(userId);
  }

  handleUserTyping(socket, data) {
    const { roomId, contentId } = data;
    const userId = socket.userId;
    const user = socket.user;
    
    socket.to(roomId).emit('user:typing', {
      userId,
      userName: user.name,
      contentId,
      timestamp: new Date()
    });
  }

  handleUserStopTyping(socket, data) {
    const { roomId, contentId } = data;
    const userId = socket.userId;
    
    socket.to(roomId).emit('user:stop-typing', {
      userId,
      contentId,
      timestamp: new Date()
    });
  }

  handleJoinRoom(socket, roomId) {
    socket.join(roomId);
    
    const socketInfo = this.userSockets.get(socket.id);
    if (socketInfo) {
      socketInfo.rooms.add(roomId);
    }
    
    this.updateRoomUserCount(roomId);
    
    socket.emit('room:joined', { roomId });
    socket.to(roomId).emit('user:joined-room', {
      userId: socket.userId,
      userName: socket.user.name,
      roomId
    });
  }

  handleLeaveRoom(socket, roomId) {
    socket.leave(roomId);
    
    const socketInfo = this.userSockets.get(socket.id);
    if (socketInfo) {
      socketInfo.rooms.delete(roomId);
    }
    
    this.updateRoomUserCount(roomId);
    
    socket.emit('room:left', { roomId });
    socket.to(roomId).emit('user:left-room', {
      userId: socket.userId,
      userName: socket.user.name,
      roomId
    });
  }

  handleContentEditing(socket, data) {
    const { contentId, changes, roomId } = data;
    const userId = socket.userId;
    const user = socket.user;
    
    // Broadcast changes to room members
    socket.to(roomId || `content:${contentId}`).emit('content:changes', {
      contentId,
      changes,
      userId,
      userName: user.name,
      timestamp: new Date()
    });
    
    // Store changes in Redis for conflict resolution
    this.storeContentChanges(contentId, userId, changes);
  }

  handleContentSave(socket, data) {
    const { contentId, content, roomId } = data;
    const userId = socket.userId;
    const user = socket.user;
    
    // Broadcast save event
    socket.to(roomId || `content:${contentId}`).emit('content:saved', {
      contentId,
      content,
      userId,
      userName: user.name,
      timestamp: new Date()
    });
    
    // Clear stored changes
    this.clearContentChanges(contentId);
  }

  handleContentLock(socket, data) {
    const { contentId, roomId } = data;
    const userId = socket.userId;
    const user = socket.user;
    
    // Set lock in Redis
    this.setContentLock(contentId, userId);
    
    // Broadcast lock event
    socket.to(roomId || `content:${contentId}`).emit('content:locked', {
      contentId,
      userId,
      userName: user.name,
      timestamp: new Date()
    });
  }

  handleContentUnlock(socket, data) {
    const { contentId, roomId } = data;
    const userId = socket.userId;
    
    // Remove lock from Redis
    this.removeContentLock(contentId, userId);
    
    // Broadcast unlock event
    socket.to(roomId || `content:${contentId}`).emit('content:unlocked', {
      contentId,
      userId,
      timestamp: new Date()
    });
  }

  handleAnalyticsSubscribe(socket, data) {
    const { type, filters } = data;
    const roomId = `analytics:${type}:${socket.userId}`;
    
    socket.join(roomId);
    socket.emit('analytics:subscribed', { type, roomId });
  }

  handleAnalyticsUnsubscribe(socket, data) {
    const { type } = data;
    const roomId = `analytics:${type}:${socket.userId}`;
    
    socket.leave(roomId);
    socket.emit('analytics:unsubscribed', { type, roomId });
  }

  handleMarkNotificationRead(socket, data) {
    const { notificationId } = data;
    const userId = socket.userId;
    
    // Update notification status (implement in notification service)
    socket.emit('notification:marked-read', { notificationId });
  }

  handleMarkAllNotificationsRead(socket) {
    const userId = socket.userId;
    
    // Update all notifications status (implement in notification service)
    socket.emit('notifications:all-marked-read');
  }

  handleSendMessage(socket, data) {
    const { roomId, message, type = 'text' } = data;
    const userId = socket.userId;
    const user = socket.user;
    
    const messageData = {
      id: this.generateMessageId(),
      userId,
      userName: user.name,
      userAvatar: user.avatar,
      message,
      type,
      roomId,
      timestamp: new Date()
    };
    
    // Broadcast message to room
    this.io.to(roomId).emit('message:received', messageData);
    
    // Store message in Redis
    this.storeMessage(roomId, messageData);
  }

  handleMessageTyping(socket, data) {
    const { roomId } = data;
    const userId = socket.userId;
    const user = socket.user;
    
    socket.to(roomId).emit('message:user-typing', {
      userId,
      userName: user.name,
      roomId,
      timestamp: new Date()
    });
  }

  // Utility methods
  broadcastUserStatus(userId, status) {
    this.io.emit('user:status-change', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  async updateUserLastSeen(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error updating user last seen:', error);
    }
  }

  updateRoomUserCount(roomId) {
    const room = this.io.sockets.adapter.rooms.get(roomId);
    const userCount = room ? room.size : 0;
    
    this.io.to(roomId).emit('room:user-count', {
      roomId,
      userCount
    });
  }

  async storeContentChanges(contentId, userId, changes) {
    if (this.redis) {
      const key = `content:changes:${contentId}`;
      const data = {
        userId,
        changes,
        timestamp: new Date().toISOString()
      };
      
      await this.redis.lpush(key, JSON.stringify(data));
      await this.redis.expire(key, 3600); // Expire after 1 hour
    }
  }

  async clearContentChanges(contentId) {
    if (this.redis) {
      await this.redis.del(`content:changes:${contentId}`);
    }
  }

  async setContentLock(contentId, userId) {
    if (this.redis) {
      const key = `content:lock:${contentId}`;
      await this.redis.setex(key, 300, userId); // Lock for 5 minutes
    }
  }

  async removeContentLock(contentId, userId) {
    if (this.redis) {
      const key = `content:lock:${contentId}`;
      const lockOwner = await this.redis.get(key);
      
      if (lockOwner === userId) {
        await this.redis.del(key);
      }
    }
  }

  async storeMessage(roomId, messageData) {
    if (this.redis) {
      const key = `messages:${roomId}`;
      await this.redis.lpush(key, JSON.stringify(messageData));
      await this.redis.ltrim(key, 0, 99); // Keep last 100 messages
      await this.redis.expire(key, 86400); // Expire after 24 hours
    }
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendPendingNotifications(socket) {
    // Implement notification retrieval and sending
    // This would integrate with your notification service
    const userId = socket.userId;
    
    // Example: Get pending notifications from database
    // const notifications = await NotificationService.getPendingNotifications(userId);
    // socket.emit('notifications:pending', notifications);
  }

  // Public methods for external use
  sendNotificationToUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit('notification:new', notification);
    }
  }

  sendAnalyticsUpdate(userId, data) {
    const roomId = `analytics:${data.type}:${userId}`;
    this.io.to(roomId).emit('analytics:update', data);
  }

  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  getUserSocketInfo(userId) {
    const socketId = this.connectedUsers.get(userId);
    return socketId ? this.userSockets.get(socketId) : null;
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketService();
