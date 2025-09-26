/**
 * Sample Data Seed
 * Creates sample organizations, users, and content for testing
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const logger = require('../../backend-api/src/utils/logger');

class SampleDataSeed {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
      await client.connect();
      this.db = client.db(process.env.DB_NAME || 'ai_social_media_platform');
      logger.info('Connected to MongoDB for sample data seed');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async seed() {
    try {
      await this.connect();
      
      // Create sample organizations
      const organizations = await this.createSampleOrganizations();
      
      // Create sample users
      await this.createSampleUsers(organizations);
      
      // Create sample content
      await this.createSampleContent(organizations);
      
      // Create sample campaigns
      await this.createSampleCampaigns(organizations);
      
      // Create sample analytics
      await this.createSampleAnalytics(organizations);
      
      logger.info('Sample data seed completed successfully');
    } catch (error) {
      logger.error('Sample data seed failed:', error);
      throw error;
    }
  }

  async createSampleOrganizations() {
    const organizations = [
      {
        name: 'TechStart Inc.',
        domain: 'techstart.com',
        type: 'startup',
        status: 'active',
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          language: 'en',
          features: {
            aiAgents: true,
            analytics: true,
            scheduling: true,
            teamCollaboration: true,
            apiAccess: false
          }
        },
        subscription: {
          plan: 'professional',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          features: ['5_users', 'unlimited_content', 'basic_analytics', 'ai_agents']
        },
        billing: {
          address: {
            street: '456 Innovation Drive',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          paymentMethod: 'credit_card',
          billingEmail: 'billing@techstart.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Marketing Pro Agency',
        domain: 'marketingpro.com',
        type: 'agency',
        status: 'active',
        settings: {
          timezone: 'America/Los_Angeles',
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
            street: '789 Marketing Blvd',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          paymentMethod: 'credit_card',
          billingEmail: 'billing@marketingpro.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'E-commerce Store',
        domain: 'ecommercestore.com',
        type: 'ecommerce',
        status: 'active',
        settings: {
          timezone: 'America/Chicago',
          currency: 'USD',
          language: 'en',
          features: {
            aiAgents: true,
            analytics: true,
            scheduling: true,
            teamCollaboration: false,
            apiAccess: false
          }
        },
        subscription: {
          plan: 'basic',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          features: ['2_users', '100_content', 'basic_analytics']
        },
        billing: {
          address: {
            street: '321 Commerce Street',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          },
          paymentMethod: 'credit_card',
          billingEmail: 'billing@ecommercestore.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const insertedOrgs = [];
    for (const org of organizations) {
      try {
        const result = await this.db.collection('organizations').insertOne(org);
        insertedOrgs.push({ ...org, _id: result.insertedId });
        logger.info(`Created organization: ${org.name}`);
      } catch (error) {
        if (error.code === 11000) {
          logger.info(`Organization ${org.name} already exists`);
        } else {
          logger.error(`Failed to create organization ${org.name}:`, error);
          throw error;
        }
      }
    }

    return insertedOrgs;
  }

  async createSampleUsers(organizations) {
    const users = [
      // TechStart Inc. users
      {
        email: 'ceo@techstart.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'owner',
        organizationId: organizations[0]._id,
        status: 'active',
        profile: {
          firstName: 'John',
          lastName: 'Smith',
          avatar: null,
          bio: 'CEO and Founder of TechStart Inc.',
          phone: '+1-555-0101',
          timezone: 'America/New_York'
        },
        permissions: ['all'],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'marketing@techstart.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'manager',
        organizationId: organizations[0]._id,
        status: 'active',
        profile: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          avatar: null,
          bio: 'Marketing Manager at TechStart Inc.',
          phone: '+1-555-0102',
          timezone: 'America/New_York'
        },
        permissions: ['content:read', 'content:write', 'analytics:read', 'ai_agents:read'],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Marketing Pro Agency users
      {
        email: 'director@marketingpro.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'owner',
        organizationId: organizations[1]._id,
        status: 'active',
        profile: {
          firstName: 'Michael',
          lastName: 'Brown',
          avatar: null,
          bio: 'Creative Director at Marketing Pro Agency',
          phone: '+1-555-0201',
          timezone: 'America/Los_Angeles'
        },
        permissions: ['all'],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'social@marketingpro.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'manager',
        organizationId: organizations[1]._id,
        status: 'active',
        profile: {
          firstName: 'Emily',
          lastName: 'Davis',
          avatar: null,
          bio: 'Social Media Manager at Marketing Pro Agency',
          phone: '+1-555-0202',
          timezone: 'America/Los_Angeles'
        },
        permissions: ['content:read', 'content:write', 'analytics:read', 'ai_agents:read', 'ai_agents:write'],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // E-commerce Store users
      {
        email: 'owner@ecommercestore.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'owner',
        organizationId: organizations[2]._id,
        status: 'active',
        profile: {
          firstName: 'David',
          lastName: 'Wilson',
          avatar: null,
          bio: 'Owner of E-commerce Store',
          phone: '+1-555-0301',
          timezone: 'America/Chicago'
        },
        permissions: ['all'],
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const user of users) {
      try {
        await this.db.collection('users').insertOne(user);
        logger.info(`Created user: ${user.email}`);
      } catch (error) {
        if (error.code === 11000) {
          logger.info(`User ${user.email} already exists`);
        } else {
          logger.error(`Failed to create user ${user.email}:`, error);
          throw error;
        }
      }
    }
  }

  async createSampleContent(organizations) {
    const content = [
      {
        title: 'Welcome to TechStart Inc.!',
        content: 'We\'re excited to announce our new AI-powered social media management platform. Join us on this journey of innovation! #TechStart #AI #Innovation',
        platforms: ['instagram', 'facebook', 'twitter', 'linkedin'],
        status: 'published',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        organizationId: organizations[0]._id,
        userId: null, // Will be set by the system
        metadata: {
          hashtags: ['#TechStart', '#AI', '#Innovation'],
          mentions: [],
          links: []
        },
        analytics: {
          views: 1250,
          likes: 89,
          comments: 12,
          shares: 23,
          clicks: 45
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Marketing Tips for Small Businesses',
        content: 'Here are 5 essential marketing tips that every small business owner should know. From social media strategy to customer engagement, these insights will help you grow your business. #MarketingTips #SmallBusiness #Growth',
        platforms: ['linkedin', 'facebook'],
        status: 'published',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        organizationId: organizations[1]._id,
        userId: null,
        metadata: {
          hashtags: ['#MarketingTips', '#SmallBusiness', '#Growth'],
          mentions: [],
          links: []
        },
        analytics: {
          views: 2100,
          likes: 156,
          comments: 28,
          shares: 45,
          clicks: 78
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'New Product Launch - Summer Collection',
        content: 'Introducing our latest summer collection! Fresh designs, comfortable fabrics, and unbeatable prices. Shop now and get 20% off your first order! #SummerCollection #NewProducts #Fashion',
        platforms: ['instagram', 'facebook', 'twitter'],
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        organizationId: organizations[2]._id,
        userId: null,
        metadata: {
          hashtags: ['#SummerCollection', '#NewProducts', '#Fashion'],
          mentions: [],
          links: ['https://ecommercestore.com/summer-collection']
        },
        analytics: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const item of content) {
      try {
        await this.db.collection('content').insertOne(item);
        logger.info(`Created content: ${item.title}`);
      } catch (error) {
        logger.error(`Failed to create content ${item.title}:`, error);
        throw error;
      }
    }
  }

  async createSampleCampaigns(organizations) {
    const campaigns = [
      {
        name: 'TechStart Launch Campaign',
        description: 'Campaign to promote our new AI platform launch',
        status: 'active',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        budget: 5000,
        platforms: ['instagram', 'facebook', 'twitter', 'linkedin'],
        organizationId: organizations[0]._id,
        userId: null,
        goals: {
          reach: 10000,
          engagement: 500,
          clicks: 200,
          conversions: 50
        },
        metrics: {
          reach: 8500,
          engagement: 420,
          clicks: 180,
          conversions: 35,
          spend: 3200
        },
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        name: 'Marketing Tips Series',
        description: 'Educational content series about marketing best practices',
        status: 'active',
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        budget: 3000,
        platforms: ['linkedin', 'facebook'],
        organizationId: organizations[1]._id,
        userId: null,
        goals: {
          reach: 15000,
          engagement: 800,
          clicks: 300,
          conversions: 100
        },
        metrics: {
          reach: 12000,
          engagement: 650,
          clicks: 250,
          conversions: 75,
          spend: 1800
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    for (const campaign of campaigns) {
      try {
        await this.db.collection('campaigns').insertOne(campaign);
        logger.info(`Created campaign: ${campaign.name}`);
      } catch (error) {
        logger.error(`Failed to create campaign ${campaign.name}:`, error);
        throw error;
      }
    }
  }

  async createSampleAnalytics(organizations) {
    const analytics = [
      {
        contentId: null, // Will be linked to actual content
        campaignId: null, // Will be linked to actual campaign
        organizationId: organizations[0]._id,
        eventType: 'content_published',
        platform: 'instagram',
        metrics: {
          views: 1250,
          likes: 89,
          comments: 12,
          shares: 23,
          clicks: 45,
          reach: 1500,
          impressions: 1800
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      },
      {
        contentId: null,
        campaignId: null,
        organizationId: organizations[1]._id,
        eventType: 'content_published',
        platform: 'linkedin',
        metrics: {
          views: 2100,
          likes: 156,
          comments: 28,
          shares: 45,
          clicks: 78,
          reach: 2500,
          impressions: 3000
        },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    ];

    for (const analytic of analytics) {
      try {
        await this.db.collection('analytics').insertOne(analytic);
        logger.info(`Created analytics event: ${analytic.eventType}`);
      } catch (error) {
        logger.error(`Failed to create analytics event:`, error);
        throw error;
      }
    }
  }
}

module.exports = SampleDataSeed;

