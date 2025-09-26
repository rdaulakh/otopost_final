const mongoose = require('mongoose');
const logger = require('../utils/logger');

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        logger.info('Database already connected');
        return this.connection;
      }

      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      // MongoDB connection options
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
        retryWrites: true,
        retryReads: true
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(mongoUri, options);
      this.isConnected = true;

      logger.info('MongoDB connected successfully', {
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        database: this.connection.connection.name
      });

      // Connection event handlers
      mongoose.connection.on('connected', () => {
        logger.info('Mongoose connected to MongoDB');
        this.isConnected = true;
      });

      mongoose.connection.on('error', (err) => {
        logger.error('Mongoose connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose disconnected from MongoDB');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;

    } catch (error) {
      logger.error('Database connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        this.isConnected = false;
        logger.info('Database disconnected successfully');
      }
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  isHealthy() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  async getStats() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected' };
      }

      const admin = mongoose.connection.db.admin();
      const stats = await admin.serverStatus();
      
      return {
        status: 'connected',
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        uptime: stats.uptime,
        connections: stats.connections,
        memory: stats.mem,
        version: stats.version
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Create indexes for performance
  async createIndexes() {
    try {
      logger.info('Creating database indexes...');

      // Users collection indexes
      await mongoose.connection.db.collection('users').createIndex(
        { "organizationId": 1, "email": 1 }
      );
      await mongoose.connection.db.collection('users').createIndex(
        { "email": 1 }, { unique: true }
      );
      await mongoose.connection.db.collection('users').createIndex(
        { "authentication.lastLogin": -1 }
      );
      await mongoose.connection.db.collection('users').createIndex(
        { "createdAt": -1 }
      );

      // Admin users collection indexes
      await mongoose.connection.db.collection('admin_users').createIndex(
        { "email": 1 }, { unique: true }
      );
      await mongoose.connection.db.collection('admin_users').createIndex(
        { "role": 1, "isActive": 1 }
      );

      // Organizations collection indexes
      await mongoose.connection.db.collection('organizations').createIndex(
        { "slug": 1 }, { unique: true }
      );
      await mongoose.connection.db.collection('organizations').createIndex(
        { "subscription.status": 1 }
      );
      await mongoose.connection.db.collection('organizations').createIndex(
        { "subscription.nextBillingDate": 1 }
      );

      // Content collection indexes
      await mongoose.connection.db.collection('content').createIndex(
        { "organizationId": 1, "createdAt": -1 }
      );
      await mongoose.connection.db.collection('content').createIndex(
        { "userId": 1, "createdAt": -1 }
      );
      await mongoose.connection.db.collection('content').createIndex(
        { "platforms.status": 1, "platforms.scheduledAt": 1 }
      );
      await mongoose.connection.db.collection('content').createIndex(
        { "approval.status": 1 }
      );

      // AI agents collection indexes
      await mongoose.connection.db.collection('ai_agents').createIndex(
        { "type": 1, "status": 1 }
      );
      await mongoose.connection.db.collection('ai_agents').createIndex(
        { "organizationSpecific.organizationId": 1 }
      );

      // Analytics collection indexes
      await mongoose.connection.db.collection('analytics').createIndex(
        { "organizationId": 1, "date": -1 }
      );
      await mongoose.connection.db.collection('analytics').createIndex(
        { "type": 1, "date": -1 }
      );
      await mongoose.connection.db.collection('analytics').createIndex(
        { "aggregation": 1, "date": -1 }
      );

      // Subscriptions collection indexes
      await mongoose.connection.db.collection('subscriptions').createIndex(
        { "organizationId": 1 }
      );
      await mongoose.connection.db.collection('subscriptions').createIndex(
        { "status": 1, "billing.currentPeriodEnd": 1 }
      );

      // Admin activity logs collection indexes
      await mongoose.connection.db.collection('admin_activity_logs').createIndex(
        { "adminUserId": 1, "timestamp": -1 }
      );
      await mongoose.connection.db.collection('admin_activity_logs').createIndex(
        { "targetType": 1, "targetId": 1 }
      );
      await mongoose.connection.db.collection('admin_activity_logs').createIndex(
        { "timestamp": -1 }
      );

      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating database indexes:', error);
      throw error;
    }
  }
}

// Export singleton instance
const databaseConnection = new DatabaseConnection();
module.exports = databaseConnection;

