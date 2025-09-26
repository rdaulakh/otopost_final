/**
 * AI Agents Migration
 * Adds AI agent configurations and workflows
 */

const { MongoClient } = require('mongodb');
const logger = require('../../backend-api/src/utils/logger');

class AIAgentsMigration {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
      await client.connect();
      this.db = client.db(process.env.DB_NAME || 'ai_social_media_platform');
      logger.info('Connected to MongoDB for AI agents migration');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async up() {
    try {
      await this.connect();
      
      // Create AI agents collection
      await this.createAIAgentsCollection();
      
      // Insert default AI agents
      await this.insertDefaultAIAgents();
      
      // Create AI workflows collection
      await this.createAIWorkflowsCollection();
      
      // Create AI memory collection
      await this.createAIMemoryCollection();
      
      logger.info('AI agents migration completed successfully');
    } catch (error) {
      logger.error('AI agents migration failed:', error);
      throw error;
    }
  }

  async down() {
    try {
      await this.connect();
      
      // Drop AI-related collections
      await this.db.collection('ai_agents').drop();
      await this.db.collection('ai_workflows').drop();
      await this.db.collection('ai_memory').drop();
      
      logger.info('AI agents migration rolled back successfully');
    } catch (error) {
      logger.error('AI agents migration rollback failed:', error);
      throw error;
    }
  }

  async createAIAgentsCollection() {
    try {
      await this.db.createCollection('ai_agents');
      
      // Create indexes for AI agents
      await this.db.collection('ai_agents').createIndex({ name: 1 }, { unique: true });
      await this.db.collection('ai_agents').createIndex({ type: 1 });
      await this.db.collection('ai_agents').createIndex({ status: 1 });
      await this.db.collection('ai_agents').createIndex({ organizationId: 1 });
      await this.db.collection('ai_agents').createIndex({ createdAt: 1 });
      
      logger.info('AI agents collection created successfully');
    } catch (error) {
      if (error.code !== 48) {
        logger.error('Failed to create AI agents collection:', error);
        throw error;
      }
    }
  }

  async createAIWorkflowsCollection() {
    try {
      await this.db.createCollection('ai_workflows');
      
      // Create indexes for AI workflows
      await this.db.collection('ai_workflows').createIndex({ name: 1 }, { unique: true });
      await this.db.collection('ai_workflows').createIndex({ organizationId: 1 });
      await this.db.collection('ai_workflows').createIndex({ status: 1 });
      await this.db.collection('ai_workflows').createIndex({ createdAt: 1 });
      
      logger.info('AI workflows collection created successfully');
    } catch (error) {
      if (error.code !== 48) {
        logger.error('Failed to create AI workflows collection:', error);
        throw error;
      }
    }
  }

  async createAIMemoryCollection() {
    try {
      await this.db.createCollection('ai_memory');
      
      // Create indexes for AI memory
      await this.db.collection('ai_memory').createIndex({ agentId: 1 });
      await this.db.collection('ai_memory').createIndex({ organizationId: 1 });
      await this.db.collection('ai_memory').createIndex({ type: 1 });
      await this.db.collection('ai_memory').createIndex({ timestamp: 1 });
      await this.db.collection('ai_memory').createIndex({ 'metadata.key': 1 });
      
      logger.info('AI memory collection created successfully');
    } catch (error) {
      if (error.code !== 48) {
        logger.error('Failed to create AI memory collection:', error);
        throw error;
      }
    }
  }

  async insertDefaultAIAgents() {
    const defaultAgents = [
      {
        name: 'Content Creator Agent',
        type: 'content_creator',
        description: 'Generates and optimizes social media content',
        status: 'active',
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          capabilities: ['text_generation', 'content_optimization', 'hashtag_generation'],
          settings: {
            tone: 'engaging',
            style: 'casual',
            length: 'medium'
          }
        },
        organizationId: null, // Global agent
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trend Analyzer Agent',
        type: 'trend_analyzer',
        description: 'Analyzes social media trends and provides insights',
        status: 'active',
        configuration: {
          model: 'gpt-4',
          temperature: 0.3,
          maxTokens: 1500,
          capabilities: ['trend_analysis', 'sentiment_analysis', 'market_research'],
          settings: {
            analysisDepth: 'comprehensive',
            updateFrequency: 'hourly',
            platforms: ['twitter', 'instagram', 'facebook', 'linkedin']
          }
        },
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Engagement Optimizer Agent',
        type: 'engagement_optimizer',
        description: 'Optimizes content for maximum engagement',
        status: 'active',
        configuration: {
          model: 'gpt-4',
          temperature: 0.5,
          maxTokens: 1000,
          capabilities: ['engagement_prediction', 'content_optimization', 'timing_analysis'],
          settings: {
            optimizationGoals: ['likes', 'comments', 'shares', 'clicks'],
            analysisWindow: '7d',
            platforms: ['instagram', 'facebook', 'twitter', 'linkedin']
          }
        },
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Smart Scheduler Agent',
        type: 'scheduler',
        description: 'Intelligently schedules content for optimal reach',
        status: 'active',
        configuration: {
          model: 'gpt-4',
          temperature: 0.4,
          maxTokens: 800,
          capabilities: ['optimal_timing', 'audience_analysis', 'content_scheduling'],
          settings: {
            timezone: 'UTC',
            bufferTime: 15,
            maxPostsPerDay: 10,
            platforms: ['instagram', 'facebook', 'twitter', 'linkedin']
          }
        },
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Performance Tracker Agent',
        type: 'performance_tracker',
        description: 'Tracks and analyzes content performance metrics',
        status: 'active',
        configuration: {
          model: 'gpt-4',
          temperature: 0.2,
          maxTokens: 1200,
          capabilities: ['performance_analysis', 'metric_tracking', 'report_generation'],
          settings: {
            metrics: ['reach', 'engagement', 'clicks', 'conversions'],
            reportingFrequency: 'daily',
            alertThresholds: {
              engagement: 0.05,
              reach: 1000,
              clicks: 50
            }
          }
        },
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Competitor Monitor Agent',
        type: 'competitor_monitor',
        description: 'Monitors competitor activities and strategies',
        status: 'active',
        configuration: {
          model: 'gpt-4',
          temperature: 0.3,
          maxTokens: 1000,
          capabilities: ['competitor_analysis', 'strategy_insights', 'market_monitoring'],
          settings: {
            monitoringFrequency: 'daily',
            analysisDepth: 'comprehensive',
            platforms: ['instagram', 'facebook', 'twitter', 'linkedin']
          }
        },
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Crisis Manager Agent',
        type: 'crisis_manager',
        description: 'Manages crisis situations and negative sentiment',
        status: 'active',
        configuration: {
          model: 'gpt-4',
          temperature: 0.6,
          maxTokens: 1500,
          capabilities: ['crisis_detection', 'sentiment_analysis', 'response_generation'],
          settings: {
            alertThresholds: {
              negativeSentiment: 0.3,
              crisisKeywords: ['scandal', 'crisis', 'problem', 'issue']
            },
            responseTime: 'immediate',
            escalationLevels: ['low', 'medium', 'high', 'critical']
          }
        },
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    try {
      await this.db.collection('ai_agents').insertMany(defaultAgents);
      logger.info('Default AI agents inserted successfully');
    } catch (error) {
      if (error.code === 11000) {
        logger.info('Default AI agents already exist');
      } else {
        logger.error('Failed to insert default AI agents:', error);
        throw error;
      }
    }
  }
}

module.exports = AIAgentsMigration;

