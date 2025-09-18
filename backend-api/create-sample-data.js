require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Organization = require('./src/models/Organization');
const Content = require('./src/models/Content');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ai-social-media', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample data
const createSampleData = async () => {
  try {
    // Check if sample data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 1) { // More than just the admin user
      console.log('Sample data already exists');
      return;
    }

    // Create sample organizations
    const organizations = [
      {
        name: 'TechCorp Solutions',
        slug: 'techcorp-solutions',
        contactInfo: {
          primaryEmail: 'contact@techcorp.com',
          phone: '+1-555-0123',
          address: {
            street: '123 Tech Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          }
        },
        subscription: {
          planId: 'pro',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      {
        name: 'Creative Agency Inc',
        slug: 'creative-agency-inc',
        contactInfo: {
          primaryEmail: 'hello@creativeagency.com',
          phone: '+1-555-0456',
          address: {
            street: '456 Creative Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        subscription: {
          planId: 'premium',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      {
        name: 'StartupXYZ',
        slug: 'startupxyz',
        contactInfo: {
          primaryEmail: 'team@startupxyz.com',
          phone: '+1-555-0789',
          address: {
            street: '789 Startup Blvd',
            city: 'Austin',
            state: 'TX',
            zipCode: '73301',
            country: 'USA'
          }
        },
        subscription: {
          planId: 'starter',
          status: 'trialing',
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    const createdOrgs = await Organization.insertMany(organizations);
    console.log('Created organizations:', createdOrgs.length);

    // Create sample users
    const users = [
      {
        email: 'john.doe@techcorp.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        organizationId: createdOrgs[0]._id,
        role: 'owner',
        permissions: {
          canCreateContent: true,
          canEditContent: true,
          canDeleteContent: true,
          canPublishContent: true,
          canManageTeam: true,
          canManageBilling: true,
          canManageSettings: true,
          canViewAnalytics: true,
          canManageAIAgents: true
        }
      },
      {
        email: 'jane.smith@creativeagency.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        organizationId: createdOrgs[1]._id,
        role: 'owner',
        permissions: {
          canCreateContent: true,
          canEditContent: true,
          canDeleteContent: true,
          canPublishContent: true,
          canManageTeam: true,
          canManageBilling: true,
          canManageSettings: true,
          canViewAnalytics: true,
          canManageAIAgents: true
        }
      },
      {
        email: 'mike.wilson@startupxyz.com',
        password: 'password123',
        firstName: 'Mike',
        lastName: 'Wilson',
        organizationId: createdOrgs[2]._id,
        role: 'owner',
        permissions: {
          canCreateContent: true,
          canEditContent: true,
          canDeleteContent: true,
          canPublishContent: true,
          canManageTeam: true,
          canManageBilling: true,
          canManageSettings: true,
          canViewAnalytics: true,
          canManageAIAgents: true
        }
      },
      {
        email: 'sarah.johnson@techcorp.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        organizationId: createdOrgs[0]._id,
        role: 'member',
        permissions: {
          canCreateContent: true,
          canEditContent: true,
          canPublishContent: true,
          canViewAnalytics: true
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Created users:', createdUsers.length);

    // Create sample content
    const content = [
      {
        title: 'Welcome to TechCorp Solutions',
        content: 'We are excited to announce our new AI-powered social media management platform!',
        type: 'post',
        status: 'published',
        author: createdUsers[0]._id,
        organizationId: createdOrgs[0]._id,
        platforms: ['linkedin', 'twitter'],
        scheduledFor: new Date(),
        publishedAt: new Date(),
        engagement: {
          likes: 45,
          shares: 12,
          comments: 8,
          clicks: 156
        }
      },
      {
        title: 'Creative Design Trends 2024',
        content: 'Discover the latest design trends that will shape 2024. From bold colors to minimalist layouts.',
        type: 'post',
        status: 'published',
        author: createdUsers[1]._id,
        organizationId: createdOrgs[1]._id,
        platforms: ['instagram', 'facebook'],
        scheduledFor: new Date(),
        publishedAt: new Date(),
        engagement: {
          likes: 89,
          shares: 23,
          comments: 15,
          clicks: 234
        }
      },
      {
        title: 'Startup Funding Tips',
        content: 'Essential tips for securing funding for your startup. Learn from successful entrepreneurs.',
        type: 'post',
        status: 'draft',
        author: createdUsers[2]._id,
        organizationId: createdOrgs[2]._id,
        platforms: ['linkedin', 'twitter'],
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ];

    const createdContent = await Content.insertMany(content);
    console.log('Created content:', createdContent.length);

    console.log('Sample data created successfully!');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createSampleData();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

main();

