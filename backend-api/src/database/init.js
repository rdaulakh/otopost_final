const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Import all models to ensure they are registered
const User = require('../models/User');
const Organization = require('../models/Organization');
const AdminUser = require('../models/AdminUser');
const Content = require('../models/Content');
const AIAgent = require('../models/AIAgent');
const Analytics = require('../models/Analytics');
const Subscription = require('../models/Subscription');

class DatabaseInitializer {
  constructor() {
    this.models = {
      User,
      Organization,
      AdminUser,
      Content,
      AIAgent,
      Analytics,
      Subscription
    };
  }

  async initializeDatabase() {
    try {
      logger.info('Starting database initialization...');

      // Create indexes for all models
      await this.createIndexes();

      // Create default admin user if none exists
      await this.createDefaultAdmin();

      // Create default subscription plans
      await this.createDefaultPlans();

      logger.info('Database initialization completed successfully');
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Database initialization failed' });
      throw error;
    }
  }

  async createIndexes() {
    logger.info('Creating database indexes...');

    const indexOperations = [
      // User indexes
      { model: 'User', indexes: [
        { email: 1 }, // Unique index for email
        { organizationId: 1 },
        { 'socialAccounts.platform': 1 },
        { isActive: 1 },
        { createdAt: -1 },
        { 'activity.lastActiveAt': -1 }
      ]},

      // Organization indexes
      { model: 'Organization', indexes: [
        { name: 1 },
        { owner: 1 },
        { 'contactInfo.primaryEmail': 1 },
        { isActive: 1 },
        { 'subscription.planId': 1 },
        { 'subscription.status': 1 },
        { createdAt: -1 }
      ]},

      // AdminUser indexes
      { model: 'AdminUser', indexes: [
        { email: 1 }, // Unique index for email
        { role: 1 },
        { department: 1 },
        { isActive: 1 },
        { createdAt: -1 },
        { 'activity.lastLoginAt': -1 }
      ]},

      // Content indexes
      { model: 'Content', indexes: [
        { organizationId: 1 },
        { createdBy: 1 },
        { status: 1 },
        { 'platforms.platform': 1 },
        { 'scheduling.publishAt': 1 },
        { createdAt: -1 },
        { updatedAt: -1 },
        { 'campaign.id': 1 }
      ]},

      // AIAgent indexes
      { model: 'AIAgent', indexes: [
        { organizationId: 1 },
        { agentType: 1 },
        { status: 1 },
        { isActive: 1 },
        { createdAt: -1 },
        { 'performance.lastExecutionAt': -1 }
      ]},

      // Analytics indexes
      { model: 'Analytics', indexes: [
        { organizationId: 1 },
        { type: 1 },
        { date: -1 },
        { 'contentId': 1 },
        { 'platformMetrics.platform': 1 },
        { createdAt: -1 }
      ]},

      // Subscription indexes
      { model: 'Subscription', indexes: [
        { organizationId: 1 },
        { planId: 1 },
        { status: 1 },
        { 'billing.nextBillingDate': 1 },
        { createdAt: -1 },
        { 'trial.endDate': 1 }
      ]}
    ];

    for (const { model, indexes } of indexOperations) {
      const Model = this.models[model];
      if (!Model) {
        logger.warn(`Model ${model} not found, skipping indexes`);
        continue;
      }

      for (const index of indexes) {
        try {
          await Model.collection.createIndex(index);
          logger.info(`Created index for ${model}: ${JSON.stringify(index)}`);
        } catch (error) {
          if (error.code === 11000 || error.codeName === 'IndexOptionsConflict') {
            logger.info(`Index already exists for ${model}: ${JSON.stringify(index)}`);
          } else {
            logger.logError(error, { 
              context: `Failed to create index for ${model}`,
              index 
            });
          }
        }
      }
    }

    logger.info('Database indexes creation completed');
  }

  async createDefaultAdmin() {
    try {
      const adminCount = await AdminUser.countDocuments();
      
      if (adminCount === 0) {
        logger.info('Creating default super admin user...');
        
        const defaultAdmin = new AdminUser({
          firstName: 'Super',
          lastName: 'Admin',
          email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
          password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!@#',
          role: 'super_admin',
          department: 'management',
          permissions: {
            users: { read: true, create: true, update: true, delete: true, manage: true, impersonate: true, export: true },
            organizations: { read: true, create: true, update: true, delete: true, manage: true },
            analytics: { read: true, reports: true, export: true },
            system: { read: true, manage: true, maintenance: true },
            content: { read: true, moderate: true },
            billing: { read: true, manage: true }
          },
          isActive: true,
          employmentInfo: {
            employeeId: 'ADMIN001',
            startDate: new Date(),
            position: 'System Administrator'
          }
        });

        await defaultAdmin.save();
        logger.info(`Default admin created with email: ${defaultAdmin.email}`);
      } else {
        logger.info('Admin users already exist, skipping default admin creation');
      }
    } catch (error) {
      logger.logError(error, { context: 'Failed to create default admin' });
    }
  }

  async createDefaultPlans() {
    try {
      // Note: This is a placeholder for subscription plans
      // In a real implementation, you might have a separate Plans model
      logger.info('Default subscription plans setup completed');
    } catch (error) {
      logger.logError(error, { context: 'Failed to create default plans' });
    }
  }

  async dropDatabase() {
    try {
      logger.warn('Dropping entire database...');
      await mongoose.connection.db.dropDatabase();
      logger.warn('Database dropped successfully');
    } catch (error) {
      logger.logError(error, { context: 'Failed to drop database' });
      throw error;
    }
  }

  async resetDatabase() {
    try {
      logger.warn('Resetting database...');
      
      // Drop all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      for (const collection of collections) {
        await mongoose.connection.db.dropCollection(collection.name);
        logger.info(`Dropped collection: ${collection.name}`);
      }

      // Reinitialize
      await this.initializeDatabase();
      
      logger.info('Database reset completed');
    } catch (error) {
      logger.logError(error, { context: 'Failed to reset database' });
      throw error;
    }
  }

  async getCollectionStats() {
    try {
      const stats = {};
      
      for (const [modelName, Model] of Object.entries(this.models)) {
        const count = await Model.countDocuments();
        const collectionStats = await mongoose.connection.db.collection(Model.collection.name).stats();
        
        stats[modelName] = {
          documents: count,
          size: collectionStats.size,
          avgObjSize: collectionStats.avgObjSize,
          indexes: collectionStats.nindexes
        };
      }

      return stats;
    } catch (error) {
      logger.logError(error, { context: 'Failed to get collection stats' });
      return {};
    }
  }

  async validateDatabase() {
    try {
      logger.info('Validating database structure...');
      
      const issues = [];

      // Check if all models are properly registered
      for (const [modelName, Model] of Object.entries(this.models)) {
        try {
          await Model.findOne().limit(1);
          logger.info(`✓ Model ${modelName} is accessible`);
        } catch (error) {
          issues.push(`✗ Model ${modelName} is not accessible: ${error.message}`);
        }
      }

      // Check database connection
      const dbState = mongoose.connection.readyState;
      if (dbState === 1) {
        logger.info('✓ Database connection is active');
      } else {
        issues.push(`✗ Database connection state: ${dbState}`);
      }

      // Check indexes
      for (const [modelName, Model] of Object.entries(this.models)) {
        try {
          const indexes = await Model.collection.getIndexes();
          logger.info(`✓ Model ${modelName} has ${Object.keys(indexes).length} indexes`);
        } catch (error) {
          issues.push(`✗ Failed to check indexes for ${modelName}: ${error.message}`);
        }
      }

      if (issues.length === 0) {
        logger.info('✓ Database validation completed successfully');
        return { valid: true, issues: [] };
      } else {
        logger.warn('Database validation found issues:', issues);
        return { valid: false, issues };
      }
    } catch (error) {
      logger.logError(error, { context: 'Database validation failed' });
      return { valid: false, issues: [error.message] };
    }
  }
}

module.exports = DatabaseInitializer;

