const Stripe = require('stripe');
const User = require('../models/User');

class StripeService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Subscription plans configuration
    this.plans = {
      free: {
        name: 'Free Plan',
        price: 0,
        features: {
          aiGenerationsPerMonth: 10,
          socialAccountsLimit: 2,
          postsPerMonth: 50,
          analyticsAccess: 'basic',
          supportLevel: 'community'
        }
      },
      pro: {
        name: 'Pro Plan',
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        price: 29.99,
        features: {
          aiGenerationsPerMonth: 500,
          socialAccountsLimit: 10,
          postsPerMonth: 1000,
          analyticsAccess: 'advanced',
          supportLevel: 'email',
          teamMembers: 3
        }
      },
      enterprise: {
        name: 'Enterprise Plan',
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        price: 99.99,
        features: {
          aiGenerationsPerMonth: 'unlimited',
          socialAccountsLimit: 'unlimited',
          postsPerMonth: 'unlimited',
          analyticsAccess: 'premium',
          supportLevel: 'priority',
          teamMembers: 'unlimited',
          whiteLabel: true,
          customIntegrations: true
        }
      }
    };
  }

  // Create Stripe customer
  async createCustomer(user) {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
          platform: 'ai-social-media'
        }
      });

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: customer.id
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Create subscription
  async createSubscription(userId, planType, paymentMethodId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let customerId = user.stripeCustomerId;
      
      // Create customer if doesn't exist
      if (!customerId) {
        const customer = await this.createCustomer(user);
        customerId = customer.id;
      }

      const plan = this.plans[planType];
      if (!plan || planType === 'free') {
        throw new Error('Invalid plan type');
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: plan.priceId,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user subscription
      await User.findByIdAndUpdate(userId, {
        subscription: {
          plan: planType,
          status: subscription.status,
          stripeSubscriptionId: subscription.id,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          features: plan.features
        }
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Cancel subscription
  async cancelSubscription(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      const subscription = await this.stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );

      // Update user subscription
      await User.findByIdAndUpdate(userId, {
        'subscription.status': 'canceled',
        'subscription.cancelAtPeriodEnd': true
      });

      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Update subscription
  async updateSubscription(userId, newPlanType) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      const newPlan = this.plans[newPlanType];
      if (!newPlan || newPlanType === 'free') {
        throw new Error('Invalid plan type');
      }

      // Get current subscription
      const currentSubscription = await this.stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      );

      // Update subscription
      const subscription = await this.stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        {
          items: [{
            id: currentSubscription.items.data[0].id,
            price: newPlan.priceId,
          }],
          proration_behavior: 'create_prorations',
        }
      );

      // Update user subscription
      await User.findByIdAndUpdate(userId, {
        'subscription.plan': newPlanType,
        'subscription.features': newPlan.features
      });

      return subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  // Get subscription details
  async getSubscription(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Return free plan if no subscription
      if (!user.subscription?.stripeSubscriptionId) {
        return {
          plan: 'free',
          status: 'active',
          features: this.plans.free.features,
          currentPeriodEnd: null
        };
      }

      const subscription = await this.stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      );

      return {
        plan: user.subscription.plan,
        status: subscription.status,
        features: user.subscription.features,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error('Failed to get subscription details');
    }
  }

  // Handle webhook events
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  async handleSubscriptionUpdated(subscription) {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        'subscription.status': subscription.status,
        'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
      });
    }
  }

  async handleSubscriptionDeleted(subscription) {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        'subscription.plan': 'free',
        'subscription.status': 'canceled',
        'subscription.features': this.plans.free.features
      });
    }
  }

  async handlePaymentSucceeded(invoice) {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    if (user) {
      // Reset usage counters for new billing period
      await User.findByIdAndUpdate(user._id, {
        'usage.aiGenerationsThisMonth': 0,
        'usage.postsThisMonth': 0,
        'usage.lastResetDate': new Date()
      });
    }
  }

  async handlePaymentFailed(invoice) {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    if (user) {
      // Handle failed payment - could send notification, etc.
      console.log(`Payment failed for user ${user._id}`);
    }
  }

  // Check if user can use feature
  async checkFeatureAccess(userId, feature, currentUsage = 0) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { allowed: false, reason: 'User not found' };
      }

      const plan = user.subscription?.plan || 'free';
      const features = user.subscription?.features || this.plans.free.features;

      switch (feature) {
        case 'aiGeneration':
          const limit = features.aiGenerationsPerMonth;
          if (limit === 'unlimited') return { allowed: true };
          return {
            allowed: currentUsage < limit,
            remaining: Math.max(0, limit - currentUsage),
            limit
          };
        
        case 'socialAccounts':
          const accountLimit = features.socialAccountsLimit;
          if (accountLimit === 'unlimited') return { allowed: true };
          return {
            allowed: currentUsage < accountLimit,
            remaining: Math.max(0, accountLimit - currentUsage),
            limit: accountLimit
          };
        
        case 'posts':
          const postLimit = features.postsPerMonth;
          if (postLimit === 'unlimited') return { allowed: true };
          return {
            allowed: currentUsage < postLimit,
            remaining: Math.max(0, postLimit - currentUsage),
            limit: postLimit
          };
        
        default:
          return { allowed: true };
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      return { allowed: false, reason: 'Error checking access' };
    }
  }

  // Get all available plans
  getPlans() {
    return this.plans;
  }
}

module.exports = new StripeService();
