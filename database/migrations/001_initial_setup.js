/**
 * Initial Database Setup Migration
 * Creates all core collections and indexes
 */

const { MongoClient } = require('mongodb');
const logger = require('../../backend-api/src/utils/logger');

class InitialSetupMigration {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
      await client.connect();
      this.db = client.db(process.env.DB_NAME || 'ai_social_media_platform');
      logger.info('Connected to MongoDB for migration');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async up() {
    try {
      await this.connect();
      
      // Create collections
      await this.createCollections();
      
      // Create indexes
      await this.createIndexes();
      
      // Create initial admin user
      await this.createInitialAdmin();
      
      logger.info('Initial setup migration completed successfully');
    } catch (error) {
      logger.error('Initial setup migration failed:', error);
      throw error;
    }
  }

  async down() {
    try {
      await this.connect();
      
      // Drop all collections
      const collections = await this.db.listCollections().toArray();
      for (const collection of collections) {
        await this.db.collection(collection.name).drop();
        logger.info(`Dropped collection: ${collection.name}`);
      }
      
      logger.info('Initial setup migration rolled back successfully');
    } catch (error) {
      logger.error('Initial setup migration rollback failed:', error);
      throw error;
    }
  }

  async createCollections() {
    const collections = [
      'users',
      'organizations',
      'content',
      'campaigns',
      'analytics',
      'ai_agents',
      'subscriptions',
      'notifications',
      'templates',
      'webhooks',
      'audit_logs',
      'sessions'
    ];

    for (const collectionName of collections) {
      try {
        await this.db.createCollection(collectionName);
        logger.info(`Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code !== 48) { // Collection already exists
          logger.error(`Failed to create collection ${collectionName}:`, error);
          throw error;
        }
      }
    }
  }

  async createIndexes() {
    // Users collection indexes
    await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await this.db.collection('users').createIndex({ organizationId: 1 });
    await this.db.collection('users').createIndex({ createdAt: 1 });
    await this.db.collection('users').createIndex({ status: 1 });
    await this.db.collection('users').createIndex({ 'profile.firstName': 'text', 'profile.lastName': 'text' });

    // Organizations collection indexes
    await this.db.collection('organizations').createIndex({ name: 1 }, { unique: true });
    await this.db.collection('organizations').createIndex({ domain: 1 }, { unique: true, sparse: true });
    await this.db.collection('organizations').createIndex({ createdAt: 1 });
    await this.db.collection('organizations').createIndex({ status: 1 });

    // Content collection indexes
    await this.db.collection('content').createIndex({ userId: 1 });
    await this.db.collection('content').createIndex({ organizationId: 1 });
    await this.db.collection('content').createIndex({ status: 1 });
    await this.db.collection('content').createIndex({ platforms: 1 });
    await this.db.collection('content').createIndex({ createdAt: 1 });
    await this.db.collection('content').createIndex({ scheduledAt: 1 });
    await this.db.collection('content').createIndex({ publishedAt: 1 });
    await this.db.collection('content').createIndex({ title: 'text', content: 'text' });

    // Campaigns collection indexes
    await this.db.collection('campaigns').createIndex({ userId: 1 });
    await this.db.collection('campaigns').createIndex({ organizationId: 1 });
    await this.db.collection('campaigns').createIndex({ status: 1 });
    await this.db.collection('campaigns').createIndex({ startDate: 1 });
    await this.db.collection('campaigns').createIndex({ endDate: 1 });
    await this.db.collection('campaigns').createIndex({ createdAt: 1 });

    // Analytics collection indexes
    await this.db.collection('analytics').createIndex({ contentId: 1 });
    await this.db.collection('analytics').createIndex({ campaignId: 1 });
    await this.db.collection('analytics').createIndex({ organizationId: 1 });
    await this.db.collection('analytics').createIndex({ eventType: 1 });
    await this.db.collection('analytics').createIndex({ timestamp: 1 });
    await this.db.collection('analytics').createIndex({ platform: 1 });

    // AI Agents collection indexes
    await this.db.collection('ai_agents').createIndex({ name: 1 }, { unique: true });
    await this.db.collection('ai_agents').createIndex({ type: 1 });
    await this.db.collection('ai_agents').createIndex({ status: 1 });
    await this.db.collection('ai_agents').createIndex({ organizationId: 1 });

    // Subscriptions collection indexes
    await this.db.collection('subscriptions').createIndex({ organizationId: 1 }, { unique: true });
    await this.db.collection('subscriptions').createIndex({ status: 1 });
    await this.db.collection('subscriptions').createIndex({ planId: 1 });
    await this.db.collection('subscriptions').createIndex({ currentPeriodEnd: 1 });

    // Notifications collection indexes
    await this.db.collection('notifications').createIndex({ userId: 1 });
    await this.db.collection('notifications').createIndex({ organizationId: 1 });
    await this.db.collection('notifications').createIndex({ type: 1 });
    await this.db.collection('notifications').createIndex({ read: 1 });
    await this.db.collection('notifications').createIndex({ createdAt: 1 });

    // Templates collection indexes
    await this.db.collection('templates').createIndex({ name: 1 }, { unique: true });
    await this.db.collection('templates').createIndex({ type: 1 });
    await this.db.collection('templates').createIndex({ category: 1 });
    await this.db.collection('templates').createIndex({ organizationId: 1 });

    // Webhooks collection indexes
    await this.db.collection('webhooks').createIndex({ organizationId: 1 });
    await this.db.collection('webhooks').createIndex({ event: 1 });
    await this.db.collection('webhooks').createIndex({ status: 1 });
    await this.db.collection('webhooks').createIndex({ createdAt: 1 });

    // Audit logs collection indexes
    await this.db.collection('audit_logs').createIndex({ userId: 1 });
    await this.db.collection('audit_logs').createIndex({ organizationId: 1 });
    await this.db.collection('audit_logs').createIndex({ action: 1 });
    await this.db.collection('audit_logs').createIndex({ timestamp: 1 });
    await this.db.collection('audit_logs').createIndex({ resource: 1 });

    // Sessions collection indexes
    await this.db.collection('sessions').createIndex({ userId: 1 });
    await this.db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await this.db.collection('sessions').createIndex({ expiresAt: 1 });
    await this.db.collection('sessions').createIndex({ createdAt: 1 });

    logger.info('All indexes created successfully');
  }

  async createInitialAdmin() {
    try {
      const bcrypt = require('bcryptjs');
      
      const adminUser = {
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12),
        role: 'super_admin',
        status: 'active',
        profile: {
          firstName: 'Super',
          lastName: 'Admin',
          avatar: null
        },
        permissions: [
          'users:read', 'users:write', 'users:delete',
          'organizations:read', 'organizations:write', 'organizations:delete',
          'content:read', 'content:write', 'content:delete',
          'analytics:read', 'analytics:write',
          'ai_agents:read', 'ai_agents:write', 'ai_agents:delete',
          'subscriptions:read', 'subscriptions:write',
          'system:admin'
        ],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.db.collection('users').insertOne(adminUser);
      logger.info('Initial admin user created successfully');
    } catch (error) {
      if (error.code === 11000) {
        logger.info('Admin user already exists');
      } else {
        logger.error('Failed to create initial admin user:', error);
        throw error;
      }
    }
  }
}

module.exports = InitialSetupMigration;

