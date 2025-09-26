/**
 * Admin Users Seed
 * Creates initial admin users for the platform
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const logger = require('../../backend-api/src/utils/logger');

class AdminUsersSeed {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
      await client.connect();
      this.db = client.db(process.env.DB_NAME || 'ai_social_media_platform');
      logger.info('Connected to MongoDB for admin users seed');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async seed() {
    try {
      await this.connect();
      
      // Create admin users
      await this.createAdminUsers();
      
      // Create organization for admin
      await this.createAdminOrganization();
      
      logger.info('Admin users seed completed successfully');
    } catch (error) {
      logger.error('Admin users seed failed:', error);
      throw error;
    }
  }

  async createAdminUsers() {
    const adminUsers = [
      {
        email: 'superadmin@ai-social-platform.com',
        password: await bcrypt.hash('SuperAdmin123!', 12),
        role: 'super_admin',
        status: 'active',
        profile: {
          firstName: 'Super',
          lastName: 'Admin',
          avatar: null,
          bio: 'Platform Super Administrator',
          phone: '+1-555-0001',
          timezone: 'UTC'
        },
        permissions: [
          'users:read', 'users:write', 'users:delete',
          'organizations:read', 'organizations:write', 'organizations:delete',
          'content:read', 'content:write', 'content:delete',
          'analytics:read', 'analytics:write',
          'ai_agents:read', 'ai_agents:write', 'ai_agents:delete',
          'subscriptions:read', 'subscriptions:write', 'subscriptions:delete',
          'system:admin', 'system:config', 'system:logs'
        ],
        emailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin@ai-social-platform.com',
        password: await bcrypt.hash('Admin123!', 12),
        role: 'admin',
        status: 'active',
        profile: {
          firstName: 'Platform',
          lastName: 'Admin',
          avatar: null,
          bio: 'Platform Administrator',
          phone: '+1-555-0002',
          timezone: 'UTC'
        },
        permissions: [
          'users:read', 'users:write',
          'organizations:read', 'organizations:write',
          'content:read', 'content:write',
          'analytics:read',
          'ai_agents:read', 'ai_agents:write',
          'subscriptions:read', 'subscriptions:write'
        ],
        emailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'support@ai-social-platform.com',
        password: await bcrypt.hash('Support123!', 12),
        role: 'support',
        status: 'active',
        profile: {
          firstName: 'Customer',
          lastName: 'Support',
          avatar: null,
          bio: 'Customer Support Representative',
          phone: '+1-555-0003',
          timezone: 'UTC'
        },
        permissions: [
          'users:read',
          'organizations:read',
          'content:read',
          'analytics:read',
          'support:tickets'
        ],
        emailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const user of adminUsers) {
      try {
        await this.db.collection('users').insertOne(user);
        logger.info(`Created admin user: ${user.email}`);
      } catch (error) {
        if (error.code === 11000) {
          logger.info(`Admin user ${user.email} already exists`);
        } else {
          logger.error(`Failed to create admin user ${user.email}:`, error);
          throw error;
        }
      }
    }
  }

  async createAdminOrganization() {
    const adminOrg = {
      name: 'AI Social Media Platform',
      domain: 'ai-social-platform.com',
      type: 'platform',
      status: 'active',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        features: {
          aiAgents: true,
          analytics: true,
          scheduling: true,
          teamCollaboration: true,
          apiAccess: true
        }
      },
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        features: ['unlimited_users', 'unlimited_content', 'advanced_analytics', 'ai_agents', 'api_access']
      },
      billing: {
        address: {
          street: '123 AI Street',
          city: 'Tech City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        paymentMethod: 'credit_card',
        billingEmail: 'billing@ai-social-platform.com'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await this.db.collection('organizations').insertOne(adminOrg);
      logger.info('Created admin organization');
    } catch (error) {
      if (error.code === 11000) {
        logger.info('Admin organization already exists');
      } else {
        logger.error('Failed to create admin organization:', error);
        throw error;
      }
    }
  }
}

module.exports = AdminUsersSeed;

