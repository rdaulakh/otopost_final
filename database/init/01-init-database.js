// MongoDB Database Initialization Script
// This script sets up the initial database structure and indexes

print('🚀 Initializing AI Social Media Platform Database...');

// Switch to the application database
db = db.getSiblingDB('ai-social-media');

// Create collections with validation schemas
print('📋 Creating collections with validation schemas...');

// Users Collection
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'passwordHash', 'organizationId', 'profile', 'createdAt'],
      properties: {
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        passwordHash: { bsonType: 'string' },
        organizationId: { bsonType: 'objectId' },
        profile: {
          bsonType: 'object',
          required: ['firstName', 'lastName'],
          properties: {
            firstName: { bsonType: 'string' },
            lastName: { bsonType: 'string' },
            avatarUrl: { bsonType: 'string' },
            timezone: { bsonType: 'string' },
            language: { bsonType: 'string' }
          }
        },
        isActive: { bsonType: 'bool' },
        lastLoginAt: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Organizations Collection
db.createCollection('organizations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'ownerId', 'subscription', 'createdAt'],
      properties: {
        name: { bsonType: 'string' },
        ownerId: { bsonType: 'objectId' },
        subscription: {
          bsonType: 'object',
          required: ['plan', 'status'],
          properties: {
            plan: { enum: ['free', 'basic', 'premium', 'enterprise'] },
            status: { enum: ['active', 'cancelled', 'past_due', 'trialing'] }
          }
        },
        settings: { bsonType: 'object' },
        isActive: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Admin Users Collection
db.createCollection('admin_users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'passwordHash', 'role', 'createdAt'],
      properties: {
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        passwordHash: { bsonType: 'string' },
        role: { enum: ['super_admin', 'admin', 'moderator', 'support'] },
        permissions: { bsonType: 'array' },
        profile: { bsonType: 'object' },
        isActive: { bsonType: 'bool' },
        lastLoginAt: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Content Collection
db.createCollection('content', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['organizationId', 'userId', 'type', 'status', 'createdAt'],
      properties: {
        organizationId: { bsonType: 'objectId' },
        userId: { bsonType: 'objectId' },
        type: { enum: ['post', 'story', 'reel', 'video', 'carousel', 'article'] },
        status: { enum: ['draft', 'scheduled', 'published', 'failed', 'archived'] },
        platforms: { bsonType: 'array' },
        content: { bsonType: 'object' },
        media: { bsonType: 'array' },
        scheduledAt: { bsonType: 'date' },
        publishedAt: { bsonType: 'date' },
        analytics: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// AI Agents Collection
db.createCollection('ai_agents', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['organizationId', 'agentType', 'status', 'createdAt'],
      properties: {
        organizationId: { bsonType: 'objectId' },
        agentType: { enum: ['intelligence', 'strategy', 'content', 'execution', 'learning', 'engagement', 'analytics'] },
        status: { enum: ['active', 'inactive', 'processing', 'error'] },
        configuration: { bsonType: 'object' },
        tasks: { bsonType: 'array' },
        performance: { bsonType: 'object' },
        lastRunAt: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Analytics Collection
db.createCollection('analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['organizationId', 'type', 'date', 'metrics'],
      properties: {
        organizationId: { bsonType: 'objectId' },
        contentId: { bsonType: 'objectId' },
        type: { enum: ['content', 'platform', 'campaign', 'user', 'system'] },
        platform: { bsonType: 'string' },
        date: { bsonType: 'date' },
        metrics: { bsonType: 'object' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

// Subscriptions Collection
db.createCollection('subscriptions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['organizationId', 'stripeSubscriptionId', 'plan', 'status'],
      properties: {
        organizationId: { bsonType: 'objectId' },
        stripeCustomerId: { bsonType: 'string' },
        stripeSubscriptionId: { bsonType: 'string' },
        plan: { enum: ['free', 'basic', 'premium', 'enterprise'] },
        status: { enum: ['active', 'cancelled', 'past_due', 'trialing', 'incomplete'] },
        currentPeriodStart: { bsonType: 'date' },
        currentPeriodEnd: { bsonType: 'date' },
        cancelAtPeriodEnd: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

print('✅ Collections created successfully!');

// Create indexes for performance
print('🔍 Creating performance indexes...');

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ organizationId: 1 });
db.users.createIndex({ 'profile.email': 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

// Organizations indexes
db.organizations.createIndex({ ownerId: 1 });
db.organizations.createIndex({ 'subscription.status': 1 });
db.organizations.createIndex({ isActive: 1 });
db.organizations.createIndex({ createdAt: -1 });

// Admin users indexes
db.admin_users.createIndex({ email: 1 }, { unique: true });
db.admin_users.createIndex({ role: 1 });
db.admin_users.createIndex({ isActive: 1 });

// Content indexes
db.content.createIndex({ organizationId: 1 });
db.content.createIndex({ userId: 1 });
db.content.createIndex({ status: 1 });
db.content.createIndex({ type: 1 });
db.content.createIndex({ scheduledAt: 1 });
db.content.createIndex({ publishedAt: -1 });
db.content.createIndex({ platforms: 1 });
db.content.createIndex({ createdAt: -1 });

// AI Agents indexes
db.ai_agents.createIndex({ organizationId: 1 });
db.ai_agents.createIndex({ agentType: 1 });
db.ai_agents.createIndex({ status: 1 });
db.ai_agents.createIndex({ lastRunAt: -1 });

// Analytics indexes
db.analytics.createIndex({ organizationId: 1 });
db.analytics.createIndex({ contentId: 1 });
db.analytics.createIndex({ type: 1 });
db.analytics.createIndex({ platform: 1 });
db.analytics.createIndex({ date: -1 });
db.analytics.createIndex({ organizationId: 1, date: -1 });

// Subscriptions indexes
db.subscriptions.createIndex({ organizationId: 1 }, { unique: true });
db.subscriptions.createIndex({ stripeCustomerId: 1 });
db.subscriptions.createIndex({ stripeSubscriptionId: 1 });
db.subscriptions.createIndex({ status: 1 });

print('✅ Indexes created successfully!');

// Create default admin user
print('👤 Creating default admin user...');

const adminUser = {
  email: 'admin@aisocialmedia.com',
  passwordHash: '$2b$10$8K1p/a0drtIWinzBWJ5.6OKgdGNrKpata/IhSJMeGNNUDYpGDdvSi', // admin123
  role: 'super_admin',
  permissions: [
    'users:read', 'users:write', 'users:delete',
    'organizations:read', 'organizations:write', 'organizations:delete',
    'content:read', 'content:write', 'content:delete',
    'analytics:read', 'analytics:write',
    'system:read', 'system:write', 'system:admin'
  ],
  profile: {
    firstName: 'Super',
    lastName: 'Admin',
    avatarUrl: null,
    timezone: 'UTC',
    language: 'en'
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

db.admin_users.insertOne(adminUser);
print('✅ Default admin user created: admin@aisocialmedia.com / admin123');

// Create sample organization for demo
print('🏢 Creating demo organization...');

const demoOrg = {
  name: 'Demo Organization',
  ownerId: null, // Will be set when demo user is created
  subscription: {
    plan: 'premium',
    status: 'active',
    features: ['ai_agents', 'analytics', 'multi_platform', 'advanced_scheduling'],
    limits: {
      users: 10,
      posts_per_month: 1000,
      ai_tasks_per_month: 500
    }
  },
  settings: {
    timezone: 'UTC',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      slack: false
    },
    branding: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      logo: null
    }
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const orgResult = db.organizations.insertOne(demoOrg);
const demoOrgId = orgResult.insertedId;

print('✅ Demo organization created with ID: ' + demoOrgId);

// Create demo user
print('👤 Creating demo user...');

const demoUser = {
  email: 'demo@example.com',
  passwordHash: '$2b$10$8K1p/a0drtIWinzBWJ5.6OKgdGNrKpata/IhSJMeGNNUDYpGDdvSi', // password123
  organizationId: demoOrgId,
  profile: {
    firstName: 'Demo',
    lastName: 'User',
    avatarUrl: null,
    timezone: 'UTC',
    language: 'en',
    phoneNumber: '+1234567890',
    businessProfile: {
      companyName: 'Demo Company',
      industry: 'Technology',
      targetAudience: 'Tech professionals',
      brandVoice: 'Professional and friendly',
      contentGoals: ['brand_awareness', 'lead_generation', 'engagement']
    }
  },
  socialAccounts: [],
  preferences: {
    notifications: {
      email: true,
      push: true,
      frequency: 'daily'
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false
    }
  },
  isActive: true,
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
};

const userResult = db.users.insertOne(demoUser);
const demoUserId = userResult.insertedId;

// Update organization with owner ID
db.organizations.updateOne(
  { _id: demoOrgId },
  { $set: { ownerId: demoUserId } }
);

print('✅ Demo user created: demo@example.com / password123');

// Initialize AI Agents for demo organization
print('🤖 Initializing AI Agents...');

const aiAgents = [
  {
    organizationId: demoOrgId,
    agentType: 'intelligence',
    status: 'active',
    configuration: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4000,
      analysisDepth: 'comprehensive'
    },
    tasks: [],
    performance: {
      tasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastPerformanceUpdate: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    organizationId: demoOrgId,
    agentType: 'strategy',
    status: 'active',
    configuration: {
      model: 'gpt-4',
      temperature: 0.8,
      maxTokens: 4000,
      strategyHorizon: '30_days'
    },
    tasks: [],
    performance: {
      tasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastPerformanceUpdate: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    organizationId: demoOrgId,
    agentType: 'content',
    status: 'active',
    configuration: {
      model: 'gpt-4',
      temperature: 0.9,
      maxTokens: 4000,
      contentTypes: ['post', 'story', 'reel', 'article']
    },
    tasks: [],
    performance: {
      tasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastPerformanceUpdate: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    organizationId: demoOrgId,
    agentType: 'execution',
    status: 'active',
    configuration: {
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 2000,
      platforms: ['instagram', 'facebook', 'twitter', 'linkedin']
    },
    tasks: [],
    performance: {
      tasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastPerformanceUpdate: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    organizationId: demoOrgId,
    agentType: 'learning',
    status: 'active',
    configuration: {
      model: 'gpt-4',
      temperature: 0.6,
      maxTokens: 4000,
      learningRate: 'adaptive'
    },
    tasks: [],
    performance: {
      tasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastPerformanceUpdate: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    organizationId: demoOrgId,
    agentType: 'engagement',
    status: 'active',
    configuration: {
      model: 'gpt-4',
      temperature: 0.8,
      maxTokens: 2000,
      responseStyle: 'friendly_professional'
    },
    tasks: [],
    performance: {
      tasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastPerformanceUpdate: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    organizationId: demoOrgId,
    agentType: 'analytics',
    status: 'active',
    configuration: {
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 4000,
      reportingFrequency: 'daily'
    },
    tasks: [],
    performance: {
      tasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastPerformanceUpdate: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.ai_agents.insertMany(aiAgents);
print('✅ AI Agents initialized for demo organization');

// Create sample content
print('📝 Creating sample content...');

const sampleContent = [
  {
    organizationId: demoOrgId,
    userId: demoUserId,
    type: 'post',
    status: 'published',
    platforms: ['instagram', 'facebook'],
    content: {
      text: 'Excited to share our latest AI-powered social media management features! 🚀 #AI #SocialMedia #Innovation',
      hashtags: ['AI', 'SocialMedia', 'Innovation', 'Technology'],
      mentions: []
    },
    media: [
      {
        type: 'image',
        url: 'https://example.com/sample-image.jpg',
        altText: 'AI Social Media Dashboard'
      }
    ],
    scheduledAt: new Date(Date.now() - 86400000), // 1 day ago
    publishedAt: new Date(Date.now() - 86400000),
    analytics: {
      impressions: 1250,
      reach: 980,
      engagement: 156,
      likes: 89,
      comments: 23,
      shares: 44,
      clicks: 67,
      saves: 12
    },
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    organizationId: demoOrgId,
    userId: demoUserId,
    type: 'post',
    status: 'scheduled',
    platforms: ['twitter', 'linkedin'],
    content: {
      text: 'The future of social media management is here! Our AI agents work 24/7 to optimize your content strategy. #FutureOfWork #AI',
      hashtags: ['FutureOfWork', 'AI', 'Automation', 'Productivity'],
      mentions: []
    },
    media: [],
    scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
    publishedAt: null,
    analytics: {},
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.content.insertMany(sampleContent);
print('✅ Sample content created');

print('🎉 Database initialization completed successfully!');
print('');
print('📋 Summary:');
print('- Collections created with validation schemas');
print('- Performance indexes created');
print('- Default admin user: admin@aisocialmedia.com / admin123');
print('- Demo user: demo@example.com / password123');
print('- Demo organization with 7 AI agents');
print('- Sample content for testing');
print('');
print('🚀 Your AI Social Media Platform database is ready!');

