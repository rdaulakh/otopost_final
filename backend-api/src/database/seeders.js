const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// Import models
const User = require('../models/User');
const Organization = require('../models/Organization');
const AdminUser = require('../models/AdminUser');
const Content = require('../models/Content');
const AIAgent = require('../models/AIAgent');
const Analytics = require('../models/Analytics');

class DatabaseSeeder {
  constructor() {
    this.sampleData = {
      organizations: [],
      users: [],
      admins: [],
      content: [],
      aiAgents: [],
      analytics: []
    };
  }

  async seedDatabase() {
    try {
      logger.info('Starting database seeding...');

      // Check if database already has data
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        logger.info('Database already contains data, skipping seeding');
        return false;
      }

      // Seed in order due to dependencies
      await this.seedOrganizations();
      await this.seedUsers();
      await this.seedAdminUsers();
      await this.seedAIAgents();
      await this.seedContent();
      await this.seedAnalytics();

      logger.info('Database seeding completed successfully');
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Database seeding failed' });
      throw error;
    }
  }

  async seedOrganizations() {
    logger.info('Seeding organizations...');

    const organizations = [
      {
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider',
        contactInfo: {
          primaryEmail: 'contact@techcorp.com',
          phone: '+1-555-0101',
          website: 'https://techcorp.com',
          address: {
            street: '123 Tech Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          }
        },
        subscription: {
          planId: 'professional',
          status: 'active',
          billingCycle: 'monthly',
          trialEnd: null,
          features: {
            maxUsers: 50,
            maxPosts: 1000,
            maxAIGenerations: 500,
            maxStorage: 10737418240, // 10GB
            maxApiCalls: 10000,
            advancedAnalytics: true,
            customBranding: true,
            prioritySupport: true
          },
          usage: {
            currentPeriod: {
              posts: 45,
              aiGenerations: 23,
              teamMembers: 8,
              storage: 2147483648, // 2GB
              apiCalls: 1250
            },
            lastReset: new Date()
          }
        },
        brandSettings: {
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          logo: 'https://example.com/logos/techcorp.png',
          brandVoice: 'Professional and innovative'
        },
        isActive: true
      },
      {
        name: 'Creative Agency Pro',
        description: 'Full-service creative and marketing agency',
        contactInfo: {
          primaryEmail: 'hello@creativeagency.com',
          phone: '+1-555-0202',
          website: 'https://creativeagency.com',
          address: {
            street: '456 Creative Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        subscription: {
          planId: 'enterprise',
          status: 'active',
          billingCycle: 'yearly',
          trialEnd: null,
          features: {
            maxUsers: 200,
            maxPosts: 5000,
            maxAIGenerations: 2000,
            maxStorage: 53687091200, // 50GB
            maxApiCalls: 50000,
            advancedAnalytics: true,
            customBranding: true,
            prioritySupport: true,
            whiteLabel: true,
            customIntegrations: true
          },
          usage: {
            currentPeriod: {
              posts: 234,
              aiGenerations: 156,
              teamMembers: 25,
              storage: 12884901888, // 12GB
              apiCalls: 5670
            },
            lastReset: new Date()
          }
        },
        brandSettings: {
          primaryColor: '#7c3aed',
          secondaryColor: '#a78bfa',
          logo: 'https://example.com/logos/creative.png',
          brandVoice: 'Creative and engaging'
        },
        isActive: true
      },
      {
        name: 'StartupHub',
        description: 'Innovative startup accelerator',
        contactInfo: {
          primaryEmail: 'info@startuphub.com',
          phone: '+1-555-0303',
          website: 'https://startuphub.com',
          address: {
            street: '789 Innovation Blvd',
            city: 'Austin',
            state: 'TX',
            zipCode: '73301',
            country: 'USA'
          }
        },
        subscription: {
          planId: 'starter',
          status: 'trialing',
          billingCycle: 'monthly',
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          features: {
            maxUsers: 10,
            maxPosts: 100,
            maxAIGenerations: 50,
            maxStorage: 1073741824, // 1GB
            maxApiCalls: 1000,
            advancedAnalytics: false,
            customBranding: false,
            prioritySupport: false
          },
          usage: {
            currentPeriod: {
              posts: 12,
              aiGenerations: 8,
              teamMembers: 3,
              storage: 268435456, // 256MB
              apiCalls: 145
            },
            lastReset: new Date()
          }
        },
        brandSettings: {
          primaryColor: '#059669',
          secondaryColor: '#10b981',
          logo: 'https://example.com/logos/startup.png',
          brandVoice: 'Dynamic and forward-thinking'
        },
        isActive: true
      }
    ];

    for (const orgData of organizations) {
      const organization = new Organization(orgData);
      await organization.save();
      this.sampleData.organizations.push(organization);
      logger.info(`Created organization: ${organization.name}`);
    }
  }

  async seedUsers() {
    logger.info('Seeding users...');

    const users = [
      // TechCorp users
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        password: 'Password123!',
        organizationId: this.sampleData.organizations[0]._id,
        role: 'owner',
        permissions: {
          content: { create: true, read: true, update: true, delete: true, schedule: true, approve: true, ai_generate: true },
          analytics: { read: true, export: true },
          team: { read: true, invite: true, manage: true },
          settings: { read: true, update: true },
          billing: { read: true, manage: true }
        },
        profilePicture: 'https://example.com/avatars/john.jpg',
        bio: 'CEO and Founder of TechCorp Solutions',
        socialAccounts: [
          {
            platform: 'linkedin',
            username: 'johnsmith-ceo',
            isConnected: true,
            connectedAt: new Date()
          }
        ],
        preferences: {
          notifications: {
            email: true,
            push: true,
            contentApproval: true,
            performanceReports: true,
            teamActivity: true
          },
          timezone: 'America/Los_Angeles',
          language: 'en'
        },
        isActive: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        password: 'Password123!',
        organizationId: this.sampleData.organizations[0]._id,
        role: 'manager',
        permissions: {
          content: { create: true, read: true, update: true, delete: false, schedule: true, approve: true, ai_generate: true },
          analytics: { read: true, export: false },
          team: { read: true, invite: false, manage: false },
          settings: { read: true, update: false },
          billing: { read: false, manage: false }
        },
        profilePicture: 'https://example.com/avatars/sarah.jpg',
        bio: 'Marketing Manager at TechCorp',
        socialAccounts: [
          {
            platform: 'twitter',
            username: 'sarahj_marketing',
            isConnected: true,
            connectedAt: new Date()
          },
          {
            platform: 'instagram',
            username: 'sarahj_creative',
            isConnected: true,
            connectedAt: new Date()
          }
        ],
        preferences: {
          notifications: {
            email: true,
            push: true,
            contentApproval: true,
            performanceReports: true,
            teamActivity: false
          },
          timezone: 'America/Los_Angeles',
          language: 'en'
        },
        isActive: true
      },
      // Creative Agency users
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@creativeagency.com',
        password: 'Password123!',
        organizationId: this.sampleData.organizations[1]._id,
        role: 'owner',
        permissions: {
          content: { create: true, read: true, update: true, delete: true, schedule: true, approve: true, ai_generate: true },
          analytics: { read: true, export: true },
          team: { read: true, invite: true, manage: true },
          settings: { read: true, update: true },
          billing: { read: true, manage: true }
        },
        profilePicture: 'https://example.com/avatars/michael.jpg',
        bio: 'Creative Director and Agency Owner',
        socialAccounts: [
          {
            platform: 'instagram',
            username: 'michaelchen_creative',
            isConnected: true,
            connectedAt: new Date()
          },
          {
            platform: 'behance',
            username: 'michaelchen',
            isConnected: true,
            connectedAt: new Date()
          }
        ],
        preferences: {
          notifications: {
            email: true,
            push: true,
            contentApproval: true,
            performanceReports: true,
            teamActivity: true
          },
          timezone: 'America/New_York',
          language: 'en'
        },
        isActive: true
      },
      // StartupHub users
      {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@startuphub.com',
        password: 'Password123!',
        organizationId: this.sampleData.organizations[2]._id,
        role: 'owner',
        permissions: {
          content: { create: true, read: true, update: true, delete: true, schedule: true, approve: true, ai_generate: true },
          analytics: { read: true, export: true },
          team: { read: true, invite: true, manage: true },
          settings: { read: true, update: true },
          billing: { read: true, manage: true }
        },
        profilePicture: 'https://example.com/avatars/emily.jpg',
        bio: 'Startup Founder and Innovation Leader',
        socialAccounts: [
          {
            platform: 'twitter',
            username: 'emilyrod_startup',
            isConnected: true,
            connectedAt: new Date()
          }
        ],
        preferences: {
          notifications: {
            email: true,
            push: false,
            contentApproval: true,
            performanceReports: true,
            teamActivity: false
          },
          timezone: 'America/Chicago',
          language: 'en'
        },
        isActive: true
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      this.sampleData.users.push(user);
      logger.info(`Created user: ${user.email}`);
    }

    // Update organization owners
    for (let i = 0; i < this.sampleData.organizations.length; i++) {
      const org = this.sampleData.organizations[i];
      const owner = this.sampleData.users.find(u => u.organizationId.equals(org._id) && u.role === 'owner');
      if (owner) {
        org.owner = owner._id;
        await org.save();
      }
    }
  }

  async seedAdminUsers() {
    logger.info('Seeding admin users...');

    const admins = [
      {
        firstName: 'Admin',
        lastName: 'Manager',
        email: 'admin.manager@platform.com',
        password: 'AdminPass123!',
        role: 'admin',
        department: 'management',
        permissions: {
          users: { read: true, create: true, update: true, delete: false, manage: true, impersonate: false, export: true },
          organizations: { read: true, create: true, update: true, delete: false, manage: true },
          analytics: { read: true, reports: true, export: true },
          system: { read: true, manage: false, maintenance: false },
          content: { read: true, moderate: true },
          billing: { read: true, manage: false }
        },
        employmentInfo: {
          employeeId: 'ADM001',
          startDate: new Date('2023-01-15'),
          position: 'Platform Administrator',
          manager: null
        },
        isActive: true
      },
      {
        firstName: 'Support',
        lastName: 'Specialist',
        email: 'support@platform.com',
        password: 'SupportPass123!',
        role: 'support_manager',
        department: 'support',
        permissions: {
          users: { read: true, create: false, update: true, delete: false, manage: false, impersonate: true, export: false },
          organizations: { read: true, create: false, update: false, delete: false, manage: false },
          analytics: { read: true, reports: false, export: false },
          system: { read: true, manage: false, maintenance: false },
          content: { read: true, moderate: true },
          billing: { read: true, manage: false }
        },
        employmentInfo: {
          employeeId: 'SUP001',
          startDate: new Date('2023-03-01'),
          position: 'Customer Support Specialist',
          manager: null
        },
        isActive: true
      }
    ];

    for (const adminData of admins) {
      const admin = new AdminUser(adminData);
      await admin.save();
      this.sampleData.admins.push(admin);
      logger.info(`Created admin: ${admin.email}`);
    }
  }

  async seedAIAgents() {
    logger.info('Seeding AI agents...');

    const agentTypes = [
      'intelligence_agent',
      'strategy_agent', 
      'content_agent',
      'execution_agent',
      'learning_agent',
      'engagement_agent',
      'analytics_agent'
    ];

    for (const org of this.sampleData.organizations) {
      for (const agentType of agentTypes) {
        const agent = new AIAgent({
          organizationId: org._id,
          agentType,
          name: `${agentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${org.name}`,
          description: `AI agent for ${agentType.replace('_', ' ')} tasks`,
          configuration: {
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: `You are a ${agentType.replace('_', ' ')} AI agent for ${org.name}.`,
            tools: ['web_search', 'content_generation', 'data_analysis'],
            organizationContext: {
              brandVoice: org.brandSettings.brandVoice,
              industry: 'Technology',
              targetAudience: 'Business professionals'
            }
          },
          memory: {
            vectorStoreId: `chroma_${org._id}_${agentType}`,
            conversationHistory: [],
            learnedPatterns: [],
            knowledgeBase: []
          },
          workflow: {
            dependencies: agentType === 'intelligence_agent' ? [] : ['intelligence_agent'],
            triggers: ['manual', 'scheduled', 'event_based'],
            schedule: {
              enabled: true,
              cronExpression: '0 9 * * 1-5', // 9 AM weekdays
              timezone: 'UTC'
            }
          },
          performance: {
            totalTasks: Math.floor(Math.random() * 100) + 10,
            completedTasks: Math.floor(Math.random() * 90) + 5,
            averageQuality: Math.random() * 0.3 + 0.7, // 0.7-1.0
            averageExecutionTime: Math.random() * 5000 + 1000, // 1-6 seconds
            successRate: Math.random() * 0.2 + 0.8, // 0.8-1.0
            lastExecutionAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          },
          status: 'active',
          isActive: true
        });

        await agent.save();
        this.sampleData.aiAgents.push(agent);
      }
      logger.info(`Created AI agents for organization: ${org.name}`);
    }
  }

  async seedContent() {
    logger.info('Seeding content...');

    const sampleContent = [
      {
        title: 'Introducing Our Latest Tech Innovation',
        content: 'We are excited to announce our groundbreaking new technology that will revolutionize the industry. This innovation represents months of research and development.',
        type: 'post',
        platforms: [
          { platform: 'linkedin', status: 'published', publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { platform: 'twitter', status: 'published', publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
        ],
        status: 'published'
      },
      {
        title: 'Behind the Scenes: Our Creative Process',
        content: 'Take a look at how our creative team brings ideas to life. From concept to execution, every step is carefully crafted.',
        type: 'post',
        platforms: [
          { platform: 'instagram', status: 'scheduled', scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          { platform: 'facebook', status: 'scheduled', scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) }
        ],
        status: 'scheduled'
      },
      {
        title: 'Startup Success Stories',
        content: 'Celebrating the achievements of our portfolio companies. These startups are changing the world one innovation at a time.',
        type: 'post',
        platforms: [
          { platform: 'twitter', status: 'draft' },
          { platform: 'linkedin', status: 'draft' }
        ],
        status: 'draft'
      }
    ];

    for (let i = 0; i < this.sampleData.organizations.length; i++) {
      const org = this.sampleData.organizations[i];
      const user = this.sampleData.users.find(u => u.organizationId.equals(org._id) && u.role === 'owner');
      const contentData = sampleContent[i];

      if (contentData && user) {
        const content = new Content({
          ...contentData,
          organizationId: org._id,
          createdBy: user._id,
          analytics: {
            impressions: Math.floor(Math.random() * 10000) + 1000,
            reach: Math.floor(Math.random() * 8000) + 800,
            engagement: {
              likes: Math.floor(Math.random() * 500) + 50,
              comments: Math.floor(Math.random() * 100) + 10,
              shares: Math.floor(Math.random() * 50) + 5,
              saves: Math.floor(Math.random() * 30) + 3,
              clicks: Math.floor(Math.random() * 200) + 20
            },
            totalEngagement: 0
          },
          aiGenerated: {
            isGenerated: Math.random() > 0.5,
            agentId: this.sampleData.aiAgents.find(a => a.organizationId.equals(org._id) && a.agentType === 'content_agent')?._id,
            confidence: Math.random() * 0.3 + 0.7,
            prompt: 'Generate engaging social media content about our latest innovation'
          }
        });

        // Calculate total engagement
        content.analytics.totalEngagement = Object.values(content.analytics.engagement).reduce((sum, val) => sum + val, 0);

        await content.save();
        this.sampleData.content.push(content);
      }
    }

    logger.info('Created sample content for organizations');
  }

  async seedAnalytics() {
    logger.info('Seeding analytics...');

    const analyticsTypes = [
      'content_performance',
      'platform_analytics', 
      'audience_insights',
      'ai_agent_performance',
      'business_metrics'
    ];

    for (const org of this.sampleData.organizations) {
      for (const type of analyticsTypes) {
        // Create analytics for the last 30 days
        for (let i = 0; i < 30; i++) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          
          const analytics = new Analytics({
            organizationId: org._id,
            type,
            date,
            contentId: this.sampleData.content.find(c => c.organizationId.equals(org._id))?._id,
            platformMetrics: type === 'platform_analytics' ? [
              {
                platform: 'linkedin',
                impressions: Math.floor(Math.random() * 1000) + 100,
                reach: Math.floor(Math.random() * 800) + 80,
                engagement: {
                  likes: Math.floor(Math.random() * 50) + 5,
                  comments: Math.floor(Math.random() * 20) + 2,
                  shares: Math.floor(Math.random() * 10) + 1
                },
                followers: Math.floor(Math.random() * 10000) + 1000
              },
              {
                platform: 'twitter',
                impressions: Math.floor(Math.random() * 2000) + 200,
                reach: Math.floor(Math.random() * 1500) + 150,
                engagement: {
                  likes: Math.floor(Math.random() * 100) + 10,
                  comments: Math.floor(Math.random() * 30) + 3,
                  shares: Math.floor(Math.random() * 20) + 2
                },
                followers: Math.floor(Math.random() * 5000) + 500
              }
            ] : undefined,
            audienceMetrics: type === 'audience_insights' ? {
              demographics: {
                ageGroups: {
                  '18-24': Math.floor(Math.random() * 20) + 5,
                  '25-34': Math.floor(Math.random() * 30) + 15,
                  '35-44': Math.floor(Math.random() * 25) + 10,
                  '45-54': Math.floor(Math.random() * 15) + 5,
                  '55+': Math.floor(Math.random() * 10) + 2
                },
                gender: {
                  male: Math.floor(Math.random() * 30) + 20,
                  female: Math.floor(Math.random() * 30) + 20,
                  other: Math.floor(Math.random() * 5) + 1
                },
                locations: [
                  { country: 'USA', percentage: Math.floor(Math.random() * 40) + 30 },
                  { country: 'Canada', percentage: Math.floor(Math.random() * 15) + 10 },
                  { country: 'UK', percentage: Math.floor(Math.random() * 10) + 5 }
                ]
              },
              interests: ['Technology', 'Business', 'Innovation', 'Startups'],
              behavior: {
                avgSessionDuration: Math.floor(Math.random() * 300) + 60,
                bounceRate: Math.random() * 0.3 + 0.2,
                pageViews: Math.floor(Math.random() * 10) + 2
              }
            } : undefined,
            aiAgentMetrics: type === 'ai_agent_performance' ? {
              totalTasks: Math.floor(Math.random() * 20) + 5,
              completedTasks: Math.floor(Math.random() * 18) + 4,
              avgResponseTime: Math.random() * 2000 + 500,
              costMetrics: {
                totalCost: Math.random() * 10 + 1,
                costPerTask: Math.random() * 0.5 + 0.1
              },
              agentPerformance: this.sampleData.aiAgents
                .filter(a => a.organizationId.equals(org._id))
                .map(agent => ({
                  agentType: agent.agentType,
                  tasksCompleted: Math.floor(Math.random() * 5) + 1,
                  averageQuality: Math.random() * 0.3 + 0.7,
                  executionTime: Math.random() * 3000 + 500,
                  successRate: Math.random() * 0.2 + 0.8,
                  cost: Math.random() * 2 + 0.2,
                  errors: Math.floor(Math.random() * 2)
                })),
              contentGenerated: {
                total: Math.floor(Math.random() * 10) + 2,
                byType: {
                  posts: Math.floor(Math.random() * 5) + 1,
                  captions: Math.floor(Math.random() * 3) + 1,
                  hashtags: Math.floor(Math.random() * 2) + 1
                }
              }
            } : undefined,
            businessMetrics: type === 'business_metrics' ? {
              revenue: Math.random() * 10000 + 1000,
              leads: Math.floor(Math.random() * 50) + 10,
              conversions: Math.floor(Math.random() * 20) + 2,
              roi: Math.random() * 300 + 100,
              customerAcquisitionCost: Math.random() * 100 + 20,
              lifetimeValue: Math.random() * 1000 + 200
            } : undefined
          });

          await analytics.save();
        }
      }
      logger.info(`Created analytics data for organization: ${org.name}`);
    }
  }

  async clearDatabase() {
    try {
      logger.warn('Clearing all seeded data...');
      
      await Analytics.deleteMany({});
      await Content.deleteMany({});
      await AIAgent.deleteMany({});
      await User.deleteMany({ email: { $ne: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com' } });
      await AdminUser.deleteMany({ email: { $ne: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com' } });
      await Organization.deleteMany({});

      logger.info('Database cleared successfully');
    } catch (error) {
      logger.logError(error, { context: 'Failed to clear database' });
      throw error;
    }
  }

  getSeedingSummary() {
    return {
      organizations: this.sampleData.organizations.length,
      users: this.sampleData.users.length,
      admins: this.sampleData.admins.length,
      content: this.sampleData.content.length,
      aiAgents: this.sampleData.aiAgents.length,
      analytics: this.sampleData.analytics.length
    };
  }
}

module.exports = DatabaseSeeder;

