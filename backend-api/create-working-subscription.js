require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('./src/models/Organization');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media');

async function createWorkingSubscription() {
  try {
    console.log('Creating working subscription...');

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

    // Create subscription with the expected fields from validation
    const subscriptionData = {
      organizationId: org._id,
      planId: 'starter',
      plan: 'starter', // Add the expected 'plan' field
      planName: 'Starter Plan',
      status: 'active',
      stripeSubscriptionId: 'sub_' + Date.now(), // Add the expected 'stripeSubscriptionId' field
      billing: {
        cycle: 'monthly',
        currency: 'USD',
        amount: 29,
        totalAmount: 29,
        currentPeriodStart: now,
        currentPeriodEnd: currentPeriodEnd,
        nextBillingDate: currentPeriodEnd
      },
      features: {
        users: { included: 1, used: 0, additional: 0, additionalCost: 0 },
        socialAccounts: { included: 5, used: 0, additional: 0, additionalCost: 0 },
        monthlyPosts: { included: 100, used: 0, resetDate: now },
        aiGenerations: { included: 50, used: 0, resetDate: now },
        storageGB: { included: 10, used: 0, additional: 0, additionalCost: 0 },
        analyticsRetentionDays: 30
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
    };

    console.log('Subscription data prepared, saving...');
    
    // Insert directly into MongoDB
    const result = await mongoose.connection.db.collection('subscriptions').insertOne(subscriptionData);
    console.log('Subscription saved successfully!', result.insertedId);

    // Update organization
    await Organization.findByIdAndUpdate(org._id, {
      subscriptionStatus: 'active',
      subscriptionId: result.insertedId
    });

    console.log(`Created subscription for ${org.name}`);

  } catch (error) {
    console.error('Error creating subscription:', error);
    console.error('Error details:', error.message);
    if (error.errInfo && error.errInfo.details) {
      console.error('Validation details:', JSON.stringify(error.errInfo.details, null, 2));
    }
  } finally {
    mongoose.connection.close();
  }
}

createWorkingSubscription();

