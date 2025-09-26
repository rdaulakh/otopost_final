const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');
const logger = require('../utils/logger');

class WebSocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });
    
    this.adminNamespace = this.io.of('/admin');
    this.customerNamespace = this.io.of('/customer');
    
    this.setupAdminNamespace();
    this.setupCustomerNamespace();
    
    logger.info('WebSocket server initialized');
  }
  
  setupAdminNamespace() {
    this.adminNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }
        
        // Verify admin JWT token
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        
        if (decoded.type !== 'admin') {
          return next(new Error('Invalid token type'));
        }
        
        // Get admin user
        const admin = await AdminUser.findById(decoded.userId);
        if (!admin || !admin.isActive) {
          return next(new Error('Admin not found or inactive'));
        }
        
        socket.adminId = admin._id;
        socket.adminEmail = admin.email;
        socket.adminRole = admin.role;
        socket.adminPermissions = admin.permissions;
        
        next();
      } catch (error) {
        logger.logError(error, {
          context: 'WebSocket admin authentication',
          socketId: socket.id
        });
        next(new Error('Authentication failed'));
      }
    });
    
    this.adminNamespace.on('connection', (socket) => {
      logger.logAdminActivity(socket.adminId, 'websocket_connected', 'system', null, {
        socketId: socket.id,
        ip: socket.handshake.address
      });
      
      // Join admin room for broadcasting
      socket.join('admin-room');
      
      // Handle admin-specific events
      socket.on('subscribe-user-activity', (userId) => {
        if (socket.adminPermissions.users?.read) {
          socket.join(`user-activity-${userId}`);
          logger.logAdminActivity(socket.adminId, 'subscribed_user_activity', 'user', userId, {
            socketId: socket.id
          });
        }
      });
      
      socket.on('subscribe-organization-activity', (organizationId) => {
        if (socket.adminPermissions.organizations?.read) {
          socket.join(`org-activity-${organizationId}`);
          logger.logAdminActivity(socket.adminId, 'subscribed_org_activity', 'organization', organizationId, {
            socketId: socket.id
          });
        }
      });
      
      socket.on('subscribe-system-metrics', () => {
        if (socket.adminPermissions.analytics?.read) {
          socket.join('system-metrics');
          logger.logAdminActivity(socket.adminId, 'subscribed_system_metrics', 'system', null, {
            socketId: socket.id
          });
        }
      });
      
      socket.on('disconnect', (reason) => {
        logger.logAdminActivity(socket.adminId, 'websocket_disconnected', 'system', null, {
          socketId: socket.id,
          reason,
          ip: socket.handshake.address
        });
      });
      
      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to admin panel',
        adminId: socket.adminId,
        role: socket.adminRole,
        timestamp: new Date()
      });
    });
  }
  
  setupCustomerNamespace() {
    this.customerNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }
        
        // Verify customer JWT token
        const decoded = jwt.verify(token, process.env.JWT_CUSTOMER_SECRET);
        
        if (decoded.type !== 'customer') {
          return next(new Error('Invalid token type'));
        }
        
        // Get customer user
        const user = await User.findById(decoded.userId).populate('organizationId');
        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }
        
        socket.userId = user._id;
        socket.userEmail = user.email;
        socket.organizationId = user.organizationId._id;
        socket.userRole = user.role;
        
        next();
      } catch (error) {
        logger.logError(error, {
          context: 'WebSocket customer authentication',
          socketId: socket.id
        });
        next(new Error('Authentication failed'));
      }
    });
    
    this.customerNamespace.on('connection', (socket) => {
      logger.logUserActivity(socket.userId, 'websocket_connected', {
        socketId: socket.id,
        ip: socket.handshake.address
      });
      
      // Join organization room
      socket.join(`org-${socket.organizationId}`);
      
      // Handle customer-specific events
      socket.on('subscribe-content-updates', () => {
        socket.join(`content-updates-${socket.organizationId}`);
      });
      
      socket.on('subscribe-analytics-updates', () => {
        socket.join(`analytics-updates-${socket.organizationId}`);
      });
      
      socket.on('subscribe-ai-agent-updates', () => {
        socket.join(`ai-updates-${socket.organizationId}`);
      });
      
      socket.on('disconnect', (reason) => {
        logger.logUserActivity(socket.userId, 'websocket_disconnected', {
          socketId: socket.id,
          reason,
          ip: socket.handshake.address
        });
      });
      
      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to customer platform',
        userId: socket.userId,
        organizationId: socket.organizationId,
        timestamp: new Date()
      });
    });
  }
  
  // Admin notification methods
  notifyAdmins(event, data) {
    this.adminNamespace.to('admin-room').emit(event, {
      ...data,
      timestamp: new Date()
    });
  }
  
  notifyUserActivity(userId, activity) {
    this.adminNamespace.to(`user-activity-${userId}`).emit('user-activity', {
      userId,
      activity,
      timestamp: new Date()
    });
  }
  
  notifyOrganizationActivity(organizationId, activity) {
    this.adminNamespace.to(`org-activity-${organizationId}`).emit('organization-activity', {
      organizationId,
      activity,
      timestamp: new Date()
    });
  }
  
  notifySystemMetrics(metrics) {
    this.adminNamespace.to('system-metrics').emit('system-metrics', {
      metrics,
      timestamp: new Date()
    });
  }
  
  // Customer notification methods
  notifyOrganization(organizationId, event, data) {
    this.customerNamespace.to(`org-${organizationId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }
  
  notifyContentUpdate(organizationId, contentData) {
    this.customerNamespace.to(`content-updates-${organizationId}`).emit('content-update', {
      content: contentData,
      timestamp: new Date()
    });
  }
  
  notifyAnalyticsUpdate(organizationId, analyticsData) {
    this.customerNamespace.to(`analytics-updates-${organizationId}`).emit('analytics-update', {
      analytics: analyticsData,
      timestamp: new Date()
    });
  }
  
  notifyAIAgentUpdate(organizationId, agentData) {
    this.customerNamespace.to(`ai-updates-${organizationId}`).emit('ai-agent-update', {
      agent: agentData,
      timestamp: new Date()
    });
  }
  
  // Utility methods
  getConnectedAdmins() {
    const adminSockets = this.adminNamespace.sockets;
    return Array.from(adminSockets.values()).map(socket => ({
      adminId: socket.adminId,
      email: socket.adminEmail,
      role: socket.adminRole,
      connectedAt: socket.handshake.time
    }));
  }
  
  getConnectedCustomers() {
    const customerSockets = this.customerNamespace.sockets;
    return Array.from(customerSockets.values()).map(socket => ({
      userId: socket.userId,
      email: socket.userEmail,
      organizationId: socket.organizationId,
      connectedAt: socket.handshake.time
    }));
  }
  
  getConnectionStats() {
    return {
      admins: this.adminNamespace.sockets.size,
      customers: this.customerNamespace.sockets.size,
      total: this.io.engine.clientsCount
    };
  }
}

module.exports = WebSocketServer;

