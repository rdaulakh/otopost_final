const mongoose = require('mongoose');
const logger = require('../utils/logger');

class DatabaseMigrations {
  constructor() {
    this.migrations = new Map();
    this.migrationCollection = 'migrations';
    this.setupMigrations();
  }

  setupMigrations() {
    // Migration 001: Initial database setup
    this.migrations.set('001_initial_setup', {
      version: '001',
      name: 'initial_setup',
      description: 'Initial database setup with indexes and default data',
      up: async () => {
        const DatabaseInitializer = require('./init');
        const initializer = new DatabaseInitializer();
        await initializer.initializeDatabase();
      },
      down: async () => {
        logger.warn('Cannot rollback initial setup migration');
      }
    });

    // Migration 002: Add analytics indexes
    this.migrations.set('002_analytics_indexes', {
      version: '002',
      name: 'analytics_indexes',
      description: 'Add performance indexes for analytics queries',
      up: async () => {
        const Analytics = require('../models/Analytics');
        
        // Compound indexes for common queries
        await Analytics.collection.createIndex({ 
          organizationId: 1, 
          type: 1, 
          date: -1 
        });
        
        await Analytics.collection.createIndex({ 
          organizationId: 1, 
          'platformMetrics.platform': 1, 
          date: -1 
        });
        
        logger.info('Added analytics performance indexes');
      },
      down: async () => {
        const Analytics = require('../models/Analytics');
        
        await Analytics.collection.dropIndex({ 
          organizationId: 1, 
          type: 1, 
          date: -1 
        });
        
        await Analytics.collection.dropIndex({ 
          organizationId: 1, 
          'platformMetrics.platform': 1, 
          date: -1 
        });
        
        logger.info('Removed analytics performance indexes');
      }
    });

    // Migration 003: Add content search indexes
    this.migrations.set('003_content_search_indexes', {
      version: '003',
      name: 'content_search_indexes',
      description: 'Add text search indexes for content',
      up: async () => {
        const Content = require('../models/Content');
        
        // Text search index
        await Content.collection.createIndex({
          title: 'text',
          content: 'text',
          'tags': 'text'
        }, {
          name: 'content_text_search',
          weights: {
            title: 10,
            content: 5,
            tags: 1
          }
        });
        
        logger.info('Added content text search indexes');
      },
      down: async () => {
        const Content = require('../models/Content');
        await Content.collection.dropIndex('content_text_search');
        logger.info('Removed content text search indexes');
      }
    });

    // Migration 004: Add user activity tracking
    this.migrations.set('004_user_activity_tracking', {
      version: '004',
      name: 'user_activity_tracking',
      description: 'Add enhanced user activity tracking fields',
      up: async () => {
        const User = require('../models/User');
        
        // Add new activity tracking fields to existing users
        await User.updateMany(
          { 'activity.sessionCount': { $exists: false } },
          {
            $set: {
              'activity.sessionCount': 0,
              'activity.totalTimeSpent': 0,
              'activity.averageSessionDuration': 0,
              'activity.lastIpAddress': null,
              'activity.lastUserAgent': null
            }
          }
        );
        
        logger.info('Added user activity tracking fields');
      },
      down: async () => {
        const User = require('../models/User');
        
        await User.updateMany(
          {},
          {
            $unset: {
              'activity.sessionCount': '',
              'activity.totalTimeSpent': '',
              'activity.averageSessionDuration': '',
              'activity.lastIpAddress': '',
              'activity.lastUserAgent': ''
            }
          }
        );
        
        logger.info('Removed user activity tracking fields');
      }
    });

    // Migration 005: Add AI agent performance metrics
    this.migrations.set('005_ai_agent_metrics', {
      version: '005',
      name: 'ai_agent_metrics',
      description: 'Add enhanced AI agent performance metrics',
      up: async () => {
        const AIAgent = require('../models/AIAgent');
        
        // Add new performance metrics to existing agents
        await AIAgent.updateMany(
          { 'performance.costPerTask': { $exists: false } },
          {
            $set: {
              'performance.costPerTask': 0,
              'performance.averageResponseTime': 0,
              'performance.errorRate': 0,
              'performance.userSatisfactionScore': 0,
              'performance.learningProgress': 0
            }
          }
        );
        
        logger.info('Added AI agent performance metrics');
      },
      down: async () => {
        const AIAgent = require('../models/AIAgent');
        
        await AIAgent.updateMany(
          {},
          {
            $unset: {
              'performance.costPerTask': '',
              'performance.averageResponseTime': '',
              'performance.errorRate': '',
              'performance.userSatisfactionScore': '',
              'performance.learningProgress': ''
            }
          }
        );
        
        logger.info('Removed AI agent performance metrics');
      }
    });

    // Migration 006: Add subscription usage tracking
    this.migrations.set('006_subscription_usage_tracking', {
      version: '006',
      name: 'subscription_usage_tracking',
      description: 'Add detailed subscription usage tracking',
      up: async () => {
        const Organization = require('../models/Organization');
        
        // Add detailed usage tracking to existing organizations
        await Organization.updateMany(
          { 'subscription.usage.history': { $exists: false } },
          {
            $set: {
              'subscription.usage.history': [],
              'subscription.usage.alerts': {
                enabled: true,
                thresholds: {
                  posts: 0.8,
                  aiGenerations: 0.8,
                  storage: 0.9,
                  apiCalls: 0.8
                }
              },
              'subscription.usage.overages': {
                posts: 0,
                aiGenerations: 0,
                storage: 0,
                apiCalls: 0
              }
            }
          }
        );
        
        logger.info('Added subscription usage tracking');
      },
      down: async () => {
        const Organization = require('../models/Organization');
        
        await Organization.updateMany(
          {},
          {
            $unset: {
              'subscription.usage.history': '',
              'subscription.usage.alerts': '',
              'subscription.usage.overages': ''
            }
          }
        );
        
        logger.info('Removed subscription usage tracking');
      }
    });

    // Migration 007: Add GDPR compliance fields
    this.migrations.set('007_gdpr_compliance', {
      version: '007',
      name: 'gdpr_compliance',
      description: 'Add GDPR compliance and data retention fields',
      up: async () => {
        const User = require('../models/User');
        const Organization = require('../models/Organization');
        
        // Add GDPR fields to users
        await User.updateMany(
          { 'gdprConsent': { $exists: false } },
          {
            $set: {
              'gdprConsent': {
                marketing: false,
                analytics: false,
                functional: true,
                consentDate: new Date(),
                ipAddress: null
              },
              'dataRetention': {
                deleteAfter: null,
                lastDataExport: null,
                dataProcessingPurpose': ['service_provision']
              }
            }
          }
        );
        
        // Add GDPR fields to organizations
        await Organization.updateMany(
          { 'compliance.gdpr': { $exists: false } },
          {
            $set: {
              'compliance.gdpr': {
                dataProcessorAgreement': true,
                dataRetentionPeriod': 2555, // 7 years in days
                rightToErasure': true,
                dataPortability': true,
                consentManagement': true
              },
              'compliance.auditLog': []
            }
          }
        );
        
        logger.info('Added GDPR compliance fields');
      },
      down: async () => {
        const User = require('../models/User');
        const Organization = require('../models/Organization');
        
        await User.updateMany(
          {},
          {
            $unset: {
              'gdprConsent': '',
              'dataRetention': ''
            }
          }
        );
        
        await Organization.updateMany(
          {},
          {
            $unset: {
              'compliance.gdpr': '',
              'compliance.auditLog': ''
            }
          }
        );
        
        logger.info('Removed GDPR compliance fields');
      }
    });
  }

  async runMigrations() {
    try {
      logger.info('Starting database migrations...');

      // Ensure migrations collection exists
      await this.ensureMigrationsCollection();

      // Get completed migrations
      const completedMigrations = await this.getCompletedMigrations();
      const completedVersions = new Set(completedMigrations.map(m => m.version));

      // Run pending migrations
      const sortedMigrations = Array.from(this.migrations.entries()).sort();
      let migrationsRun = 0;

      for (const [key, migration] of sortedMigrations) {
        if (!completedVersions.has(migration.version)) {
          logger.info(`Running migration ${migration.version}: ${migration.name}`);
          
          try {
            await migration.up();
            await this.recordMigration(migration);
            migrationsRun++;
            
            logger.info(`✓ Migration ${migration.version} completed successfully`);
          } catch (error) {
            logger.logError(error, { 
              context: `Migration ${migration.version} failed`,
              migration: migration.name 
            });
            throw error;
          }
        } else {
          logger.info(`✓ Migration ${migration.version} already completed`);
        }
      }

      if (migrationsRun > 0) {
        logger.info(`Database migrations completed. ${migrationsRun} migrations run.`);
      } else {
        logger.info('No pending migrations found.');
      }

      return true;
    } catch (error) {
      logger.logError(error, { context: 'Database migrations failed' });
      throw error;
    }
  }

  async rollbackMigration(version) {
    try {
      logger.warn(`Rolling back migration ${version}...`);

      const migration = Array.from(this.migrations.values()).find(m => m.version === version);
      if (!migration) {
        throw new Error(`Migration ${version} not found`);
      }

      // Check if migration was completed
      const completedMigrations = await this.getCompletedMigrations();
      const isCompleted = completedMigrations.some(m => m.version === version);

      if (!isCompleted) {
        logger.warn(`Migration ${version} was not completed, nothing to rollback`);
        return false;
      }

      // Run rollback
      await migration.down();

      // Remove from completed migrations
      await mongoose.connection.db.collection(this.migrationCollection).deleteOne({
        version: version
      });

      logger.info(`✓ Migration ${version} rolled back successfully`);
      return true;
    } catch (error) {
      logger.logError(error, { 
        context: `Migration rollback failed`,
        version 
      });
      throw error;
    }
  }

  async ensureMigrationsCollection() {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const migrationCollectionExists = collections.some(c => c.name === this.migrationCollection);

    if (!migrationCollectionExists) {
      await mongoose.connection.db.createCollection(this.migrationCollection);
      logger.info('Created migrations collection');
    }
  }

  async getCompletedMigrations() {
    try {
      const migrations = await mongoose.connection.db
        .collection(this.migrationCollection)
        .find({})
        .sort({ version: 1 })
        .toArray();
      
      return migrations;
    } catch (error) {
      logger.logError(error, { context: 'Failed to get completed migrations' });
      return [];
    }
  }

  async recordMigration(migration) {
    await mongoose.connection.db.collection(this.migrationCollection).insertOne({
      version: migration.version,
      name: migration.name,
      description: migration.description,
      completedAt: new Date(),
      checksum: this.generateChecksum(migration)
    });
  }

  generateChecksum(migration) {
    // Simple checksum based on migration content
    const content = migration.up.toString() + migration.down.toString();
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  async getMigrationStatus() {
    try {
      const completedMigrations = await this.getCompletedMigrations();
      const allMigrations = Array.from(this.migrations.values());
      
      const status = allMigrations.map(migration => {
        const completed = completedMigrations.find(c => c.version === migration.version);
        return {
          version: migration.version,
          name: migration.name,
          description: migration.description,
          status: completed ? 'completed' : 'pending',
          completedAt: completed?.completedAt || null
        };
      });

      return {
        total: allMigrations.length,
        completed: completedMigrations.length,
        pending: allMigrations.length - completedMigrations.length,
        migrations: status
      };
    } catch (error) {
      logger.logError(error, { context: 'Failed to get migration status' });
      return {
        total: 0,
        completed: 0,
        pending: 0,
        migrations: [],
        error: error.message
      };
    }
  }

  async createMigration(name, description) {
    const version = String(this.migrations.size + 1).padStart(3, '0');
    const migrationKey = `${version}_${name}`;
    
    const migrationTemplate = {
      version,
      name,
      description,
      up: async () => {
        // TODO: Implement migration logic
        logger.info(`Running migration ${version}: ${name}`);
      },
      down: async () => {
        // TODO: Implement rollback logic
        logger.info(`Rolling back migration ${version}: ${name}`);
      }
    };

    this.migrations.set(migrationKey, migrationTemplate);
    
    logger.info(`Created migration template: ${migrationKey}`);
    return migrationTemplate;
  }

  async validateMigrations() {
    try {
      logger.info('Validating migrations...');
      
      const issues = [];
      const completedMigrations = await this.getCompletedMigrations();
      
      // Check for missing migrations
      for (const completed of completedMigrations) {
        const migration = Array.from(this.migrations.values()).find(m => m.version === completed.version);
        if (!migration) {
          issues.push(`Completed migration ${completed.version} not found in code`);
        }
      }
      
      // Check for checksum mismatches
      for (const completed of completedMigrations) {
        const migration = Array.from(this.migrations.values()).find(m => m.version === completed.version);
        if (migration) {
          const currentChecksum = this.generateChecksum(migration);
          if (completed.checksum && completed.checksum !== currentChecksum) {
            issues.push(`Migration ${completed.version} checksum mismatch - migration may have been modified`);
          }
        }
      }

      if (issues.length === 0) {
        logger.info('✓ All migrations validated successfully');
        return { valid: true, issues: [] };
      } else {
        logger.warn('Migration validation found issues:', issues);
        return { valid: false, issues };
      }
    } catch (error) {
      logger.logError(error, { context: 'Migration validation failed' });
      return { valid: false, issues: [error.message] };
    }
  }
}

module.exports = DatabaseMigrations;

