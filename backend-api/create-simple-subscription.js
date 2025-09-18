require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('./src/models/Subscription');
const Organization = require('./src/models/Organization');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media');

async function createSimpleSubscription() {
  try {
    console.log('Creating simple subscription...');

    // Get first organization
    const org = await Organization.findOne();
    
    if (!org) {
      console.log('No organizations found. Please create organizations first.');
      return;
    }

    console.log(`Creating subscription for organization: ${org.name}`);

    const now = new Date();
    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    const subscription = new Subscription({
      organizationId: org._id,
      planId: 'starter',
      planName: 'Starter Plan',
      planDescription: 'Perfect for individuals and small businesses',
      status: 'active',
      billing: {
        cycle: 'monthly',
        currency: 'USD',
        amount: 29,
        setupFee: 0,
        discount: 0,
        tax: { rate: 0, amount: 0 },
        currentPeriodStart: now,
        currentPeriodEnd: currentPeriodEnd,
        nextBillingDate: currentPeriodEnd,
        totalAmount: 29
      },
      features: {
        users: { included: 1, used: 0, additional: 0, additionalCost: 0 },
        socialAccounts: { included: 5, used: 0, additional: 0, additionalCost: 0 },
        monthlyPosts: { included: 100, used: 0, resetDate: now },
        aiGenerations: { included: 50, used: 0, resetDate: now },
        storageGB: { included: 10, used: 0, additional: 0, additionalCost: 0 },
        analyticsRetentionDays: 30,
        aiAgents: true,
        analytics: true,
        teamCollaboration: false,
        whiteLabel: false,
        apiAccess: false,
        prioritySupport: false,
        customBranding: false,
        advancedAnalytics: false,
        multipleWorkspaces: false,
        sso: false
      },
      trial: {
        isTrialing: false,
        trialDays: 14,
        hasUsedTrial: false
      },
      paymentProvider: {
        provider: 'manual',
        customerId: 'temp_' + Date.now()
      },
      usage: {
        currentPeriod: {
          posts: 0,
          aiGenerations: 0,
          apiCalls: 0,
          storageUsed: 0
        },
        historical: [],
        lastResetDate: now
      }
    });

    console.log('Subscription data prepared, saving...');
    await subscription.save();
    console.log('Subscription saved successfully!');

    // Update organization
    await Organization.findByIdAndUpdate(org._id, {
      subscriptionStatus: 'active',
      subscriptionId: subscription._id
    });

    console.log(`Created subscription for ${org.name}`);

  } catch (error) {
    console.error('Error creating subscription:', error);
    console.error('Error details:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createSimpleSubscription();

