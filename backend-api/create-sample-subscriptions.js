require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('./src/models/Subscription');
const Organization = require('./src/models/Organization');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-social-media', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleSubscriptions() {
  try {
    console.log('Creating sample subscriptions...');

    // Get existing organizations
    const organizations = await Organization.find().limit(5);
    
    if (organizations.length === 0) {
      console.log('No organizations found. Please create organizations first.');
      return;
    }

    const subscriptionPlans = [
      {
        planId: 'starter',
        planName: 'Starter Plan',
        planDescription: 'Perfect for individuals and small businesses',
        billing: {
          cycle: 'monthly',
          currency: 'USD',
          amount: 29,
          setupFee: 0,
          discount: 0,
          tax: { rate: 0, amount: 0 }
        },
        features: {
          users: { included: 1, used: 0, additional: 0, additionalCost: 0 },
          socialAccounts: { included: 5, used: 0, additional: 0, additionalCost: 0 },
          monthlyPosts: { included: 100, used: 0, resetDate: new Date() },
          aiGenerations: { included: 50, used: 0, resetDate: new Date() },
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
        }
      },
      {
        planId: 'professional',
        planName: 'Professional Plan',
        planDescription: 'Ideal for growing businesses',
        billing: {
          cycle: 'monthly',
          currency: 'USD',
          amount: 79,
          setupFee: 0,
          discount: 0,
          tax: { rate: 0, amount: 0 }
        },
        features: {
          users: { included: 5, used: 0, additional: 0, additionalCost: 0 },
          socialAccounts: { included: 15, used: 0, additional: 0, additionalCost: 0 },
          monthlyPosts: { included: 500, used: 0, resetDate: new Date() },
          aiGenerations: { included: 200, used: 0, resetDate: new Date() },
          storageGB: { included: 50, used: 0, additional: 0, additionalCost: 0 },
          analyticsRetentionDays: 90,
          aiAgents: true,
          analytics: true,
          teamCollaboration: true,
          whiteLabel: false,
          apiAccess: true,
          prioritySupport: true,
          customBranding: false,
          advancedAnalytics: true,
          multipleWorkspaces: true,
          sso: false
        }
      },
      {
        planId: 'enterprise',
        planName: 'Enterprise Plan',
        planDescription: 'For large organizations',
        billing: {
          cycle: 'yearly',
          currency: 'USD',
          amount: 199,
          setupFee: 0,
          discount: 0,
          tax: { rate: 0, amount: 0 }
        },
        features: {
          users: { included: -1, used: 0, additional: 0, additionalCost: 0 }, // unlimited
          socialAccounts: { included: -1, used: 0, additional: 0, additionalCost: 0 }, // unlimited
          monthlyPosts: { included: -1, used: 0, resetDate: new Date() }, // unlimited
          aiGenerations: { included: -1, used: 0, resetDate: new Date() }, // unlimited
          storageGB: { included: 200, used: 0, additional: 0, additionalCost: 0 },
          analyticsRetentionDays: 365,
          aiAgents: true,
          analytics: true,
          teamCollaboration: true,
          whiteLabel: true,
          apiAccess: true,
          prioritySupport: true,
          customBranding: true,
          advancedAnalytics: true,
          multipleWorkspaces: true,
          sso: true
        }
      }
    ];

    // Create subscriptions for each organization
    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i];
      const planIndex = i % subscriptionPlans.length;
      const plan = subscriptionPlans[planIndex];
      
      // Check if organization already has a subscription
      const existingSubscription = await Subscription.findOne({ organizationId: org._id });
      if (existingSubscription) {
        console.log(`Organization ${org.name} already has a subscription`);
        continue;
      }

      const now = new Date();
      const currentPeriodStart = now;
      const currentPeriodEnd = new Date(now);
      
      // Calculate billing period end
      if (plan.billing.cycle === 'monthly') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else if (plan.billing.cycle === 'yearly') {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      } else if (plan.billing.cycle === 'quarterly') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
      }

      const subscription = new Subscription({
        organizationId: org._id,
        planId: plan.planId,
        planName: plan.planName,
        planDescription: plan.planDescription,
        status: 'active',
        billing: {
          ...plan.billing,
          currentPeriodStart,
          currentPeriodEnd,
          nextBillingDate: currentPeriodEnd,
          totalAmount: plan.billing.amount + plan.billing.setupFee - plan.billing.discount
        },
        features: plan.features,
        trial: {
          isTrialing: false,
          trialDays: 14,
          hasUsedTrial: false
        },
        paymentProvider: {
          provider: 'manual',
          customerId: 'temp_' + Date.now() + '_' + org._id
        },
        usage: {
          currentPeriod: {
            posts: Math.floor(Math.random() * 50),
            aiGenerations: Math.floor(Math.random() * 20),
            apiCalls: Math.floor(Math.random() * 100),
            storageUsed: Math.floor(Math.random() * 5)
          },
          historical: [],
          lastResetDate: now
        },
        metadata: {
          createdBy: 'sample_data_script',
          source: 'admin_panel'
        }
      });

      await subscription.save();

      // Update organization with subscription info
      await Organization.findByIdAndUpdate(org._id, {
        subscriptionStatus: 'active',
        subscriptionId: subscription._id
      });

      console.log(`Created ${plan.planName} subscription for ${org.name}`);
    }

    console.log('Sample subscriptions created successfully!');
    console.log(`Created ${organizations.length} subscriptions`);

  } catch (error) {
    console.error('Error creating sample subscriptions:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleSubscriptions();

