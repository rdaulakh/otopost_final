require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('./src/models/Organization');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media');

async function createMultipleSubscriptions() {
  try {
    console.log('Creating multiple subscriptions...');

    // Get all organizations
    const organizations = await Organization.find().limit(5);
    
    if (organizations.length === 0) {
      console.log('No organizations found. Please create organizations first.');
      return;
    }

    const plans = [
      {
        planId: 'free',
        plan: 'free',
        planName: 'Free Plan',
        amount: 0,
        features: {
          users: { included: 1, used: 0, additional: 0, additionalCost: 0 },
          socialAccounts: { included: 2, used: 0, additional: 0, additionalCost: 0 },
          monthlyPosts: { included: 10, used: 0, resetDate: new Date() },
          aiGenerations: { included: 5, used: 0, resetDate: new Date() },
          storageGB: { included: 1, used: 0, additional: 0, additionalCost: 0 },
          analyticsRetentionDays: 7
        }
      },
      {
        planId: 'basic',
        plan: 'basic',
        planName: 'Basic Plan',
        amount: 29,
        features: {
          users: { included: 3, used: 0, additional: 0, additionalCost: 0 },
          socialAccounts: { included: 5, used: 0, additional: 0, additionalCost: 0 },
          monthlyPosts: { included: 100, used: 0, resetDate: new Date() },
          aiGenerations: { included: 50, used: 0, resetDate: new Date() },
          storageGB: { included: 10, used: 0, additional: 0, additionalCost: 0 },
          analyticsRetentionDays: 30
        }
      },
      {
        planId: 'premium',
        plan: 'premium',
        planName: 'Premium Plan',
        amount: 79,
        features: {
          users: { included: 10, used: 0, additional: 0, additionalCost: 0 },
          socialAccounts: { included: 15, used: 0, additional: 0, additionalCost: 0 },
          monthlyPosts: { included: 500, used: 0, resetDate: new Date() },
          aiGenerations: { included: 200, used: 0, resetDate: new Date() },
          storageGB: { included: 50, used: 0, additional: 0, additionalCost: 0 },
          analyticsRetentionDays: 90
        }
      },
      {
        planId: 'enterprise',
        plan: 'enterprise',
        planName: 'Enterprise Plan',
        amount: 199,
        features: {
          users: { included: -1, used: 0, additional: 0, additionalCost: 0 }, // unlimited
          socialAccounts: { included: -1, used: 0, additional: 0, additionalCost: 0 }, // unlimited
          monthlyPosts: { included: -1, used: 0, resetDate: new Date() }, // unlimited
          aiGenerations: { included: -1, used: 0, resetDate: new Date() }, // unlimited
          storageGB: { included: 200, used: 0, additional: 0, additionalCost: 0 },
          analyticsRetentionDays: 365
        }
      }
    ];

    // Create subscriptions for each organization
    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i];
      const planIndex = i % plans.length;
      const plan = plans[planIndex];
      
      // Check if organization already has a subscription
      const existingSubscription = await mongoose.connection.db.collection('subscriptions').findOne({ organizationId: org._id });
      if (existingSubscription) {
        console.log(`Organization ${org.name} already has a subscription`);
        continue;
      }

      const now = new Date();
      const currentPeriodEnd = new Date(now);
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      const subscriptionData = {
        organizationId: org._id,
        planId: plan.planId,
        plan: plan.plan,
        planName: plan.planName,
        status: 'active',
        stripeSubscriptionId: 'sub_' + Date.now() + '_' + i,
        billing: {
          cycle: 'monthly',
          currency: 'USD',
          amount: plan.amount,
          totalAmount: plan.amount,
          currentPeriodStart: now,
          currentPeriodEnd: currentPeriodEnd,
          nextBillingDate: currentPeriodEnd
        },
        features: plan.features,
        paymentProvider: {
          provider: 'manual',
          customerId: 'temp_' + Date.now() + '_' + org._id
        },
        usage: {
          currentPeriod: {
            posts: Math.floor(Math.random() * 20),
            aiGenerations: Math.floor(Math.random() * 10),
            apiCalls: Math.floor(Math.random() * 50),
            storageUsed: Math.floor(Math.random() * 2)
          },
          historical: [],
          lastResetDate: now
        }
      };

      const result = await mongoose.connection.db.collection('subscriptions').insertOne(subscriptionData);
      console.log(`Created ${plan.planName} subscription for ${org.name}`, result.insertedId);

      // Update organization
      await Organization.findByIdAndUpdate(org._id, {
        subscriptionStatus: 'active',
        subscriptionId: result.insertedId
      });
    }

    console.log('Multiple subscriptions created successfully!');

  } catch (error) {
    console.error('Error creating subscriptions:', error);
    console.error('Error details:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createMultipleSubscriptions();

