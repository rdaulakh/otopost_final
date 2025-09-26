const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Subscriptions Controller
 * Handles subscription management, billing, and payment processing
 */

// Get all subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, plan, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (plan) query.plan = plan;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const subscriptions = await Subscription.find(query)
      .populate('organizationId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscription.countDocuments(query);

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
};

// Get a specific subscription
const getSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId)
      .populate('organizationId', 'name email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
};

// Create a new subscription
const createSubscription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      organizationId,
      planId,
      planName,
      planDescription,
      billing,
      features,
      trial,
      paymentProvider,
      metadata = {}
    } = req.body;

    // Calculate billing dates
    const now = new Date();
    const currentPeriodStart = now;
    const currentPeriodEnd = calculateNextBillingDate(billing.cycle, now);
    const nextBillingDate = currentPeriodEnd;

    const subscription = new Subscription({
      organizationId,
      planId,
      planName,
      planDescription,
      status: 'active',
      billing: {
        ...billing,
        currentPeriodStart,
        currentPeriodEnd,
        nextBillingDate,
        totalAmount: billing.amount + (billing.setupFee || 0) - (billing.discount || 0)
      },
      features,
      trial: trial || {
        isTrialing: false,
        trialDays: 14
      },
      paymentProvider: paymentProvider || {
        provider: 'manual',
        customerId: 'temp_' + Date.now()
      },
      metadata
    });

    await subscription.save();

    // Update organization subscription status
    if (organizationId) {
      await Organization.findByIdAndUpdate(organizationId, {
        subscriptionStatus: 'active',
        subscriptionId: subscription._id
      });
    }

    logger.info(`Subscription created: ${planId} for organization ${organizationId}`);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message,
      details: error.errors || error
    });
  }
};

// Update subscription
const updateSubscription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subscriptionId } = req.params;
    const updateData = req.body;

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizationId', 'name email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    logger.info(`Subscription updated: ${subscription.planId} - ${subscription.status}`);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    logger.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { reason, cancelAtPeriodEnd = true } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Use the model's cancel method
    await subscription.cancel(
      req.admin?.id || req.user?.id,
      reason,
      req.body.feedback,
      cancelAtPeriodEnd
    );

    // Update organization subscription status
    if (subscription.organizationId) {
      await Organization.findByIdAndUpdate(subscription.organizationId, {
        subscriptionStatus: 'cancelled'
      });
    }

    logger.info(`Subscription cancelled: ${subscription.planId} - ${subscription.status}`);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

// Reactivate subscription
const reactivateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled subscriptions can be reactivated'
      });
    }

    subscription.status = 'active';
    subscription.cancellation.isCancelled = false;
    subscription.cancellation.cancelledAt = null;
    subscription.cancellation.cancelledBy = null;
    subscription.cancellation.cancellationReason = null;
    subscription.cancellation.cancellationFeedback = null;
    subscription.billing.nextBillingDate = calculateNextBillingDate(subscription.billing.cycle, new Date());

    await subscription.save();

    // Update organization subscription status
    if (subscription.organizationId) {
      await Organization.findByIdAndUpdate(subscription.organizationId, {
        subscriptionStatus: 'active'
      });
    }

    logger.info(`Subscription reactivated: ${subscription.planId}`);

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: subscription
    });
  } catch (error) {
    logger.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription',
      error: error.message
    });
  }
};

// Get subscription analytics
const getSubscriptionAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Subscription.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalRevenue: { $sum: '$billing.totalAmount' },
          avgRevenue: { $avg: '$billing.totalAmount' }
        }
      }
    ]);

    const planStats = await Subscription.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$planId',
          count: { $sum: 1 },
          revenue: { $sum: '$billing.totalAmount' },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      }
    ]);

    const monthlyRevenue = await Subscription.aggregate([
      { $match: { ...dateFilter, status: 'active' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$billing.totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: analytics[0] || {
          total: 0,
          active: 0,
          cancelled: 0,
          totalRevenue: 0,
          avgRevenue: 0
        },
        byPlan: planStats,
        monthlyRevenue
      }
    });
  } catch (error) {
    logger.error('Error fetching subscription analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription analytics',
      error: error.message
    });
  }
};

// Get subscription statistics
const getSubscriptionStats = async (req, res) => {
  try {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalRevenue: { $sum: '$billing.totalAmount' }
        }
      }
    ]);

    const statusStats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      }
    ]);

    const planStats = await Subscription.aggregate([
      {
        $group: {
          _id: '$planId',
          count: { $sum: 1 },
          revenue: { $sum: '$billing.totalAmount' },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        active: stats[0]?.active || 0,
        cancelled: stats[0]?.cancelled || 0,
        totalRevenue: stats[0]?.totalRevenue || 0,
        byStatus: statusStats,
        byPlan: planStats
      }
    });
  } catch (error) {
    logger.error('Error fetching subscription stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription statistics',
      error: error.message
    });
  }
};

// Get available subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for individuals and small businesses',
        price: 29,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          '5 social media accounts',
          '100 posts per month',
          'Basic analytics',
          'Email support'
        ],
        limits: {
          accounts: 5,
          postsPerMonth: 100,
          teamMembers: 1
        }
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Ideal for growing businesses',
        price: 79,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          '15 social media accounts',
          '500 posts per month',
          'Advanced analytics',
          'AI content generation',
          'Priority support'
        ],
        limits: {
          accounts: 15,
          postsPerMonth: 500,
          teamMembers: 5
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: 199,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          'Unlimited social media accounts',
          'Unlimited posts',
          'Advanced analytics & reporting',
          'AI content generation',
          'White-label options',
          'Dedicated support'
        ],
        limits: {
          accounts: -1, // unlimited
          postsPerMonth: -1, // unlimited
          teamMembers: -1 // unlimited
        }
      }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    logger.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
};

// Get only subscribed plans (plans that customers have actually subscribed to)
const getSubscribedPlans = async (req, res) => {
  try {
    // Get all unique plan IDs from active subscriptions
    const subscribedPlanIds = await Subscription.distinct('planId', { status: 'active' });
    
    if (subscribedPlanIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No subscribed plans found'
      });
    }

    // Get subscription statistics for each subscribed plan
    const planStats = await Subscription.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$planId',
          planName: { $first: '$planName' },
          planDescription: { $first: '$planDescription' },
          subscriberCount: { $sum: 1 },
          totalRevenue: { $sum: '$billing.totalAmount' },
          avgRevenue: { $avg: '$billing.totalAmount' },
          features: { $first: '$features' },
          billing: { $first: '$billing' }
        }
      },
      { $sort: { subscriberCount: -1 } }
    ]);

    // Format the response
    const subscribedPlans = planStats.map(plan => ({
      id: plan._id,
      name: plan.planName || plan._id,
      description: plan.planDescription || `Plan ${plan._id}`,
      subscriberCount: plan.subscriberCount,
      totalRevenue: plan.totalRevenue,
      avgRevenue: plan.avgRevenue,
      features: plan.features || [],
      billing: plan.billing || {},
      isSubscribed: true
    }));

    res.json({
      success: true,
      data: subscribedPlans
    });
  } catch (error) {
    logger.error('Error fetching subscribed plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribed plans',
      error: error.message
    });
  }
};

// Calculate next billing date
const calculateNextBillingDate = (billingCycle, startDate) => {
  const date = new Date(startDate);
  
  switch (billingCycle) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date;
};

// Process subscription renewal
const processSubscriptionRenewal = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active subscriptions can be renewed'
      });
    }

    // Update next billing date
    subscription.billing.nextBillingDate = calculateNextBillingDate(
      subscription.billing.cycle,
      subscription.billing.nextBillingDate || new Date()
    );

    // Add invoice
    subscription.addInvoice({
      invoiceId: 'inv_' + Date.now(),
      number: 'INV-' + Date.now(),
      status: 'paid',
      amount: subscription.billing.amount,
      currency: subscription.billing.currency,
      total: subscription.billing.totalAmount,
      paidAt: new Date(),
      description: `Subscription renewal for ${subscription.planName}`,
      lineItems: [{
        description: subscription.planName,
        quantity: 1,
        unitPrice: subscription.billing.amount,
        amount: subscription.billing.amount
      }]
    });

    await subscription.save();

    logger.info(`Subscription renewed: ${subscription.planId}`);

    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      data: subscription
    });
  } catch (error) {
    logger.error('Error processing subscription renewal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process subscription renewal',
      error: error.message
    });
  }
};

module.exports = {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionAnalytics,
  getSubscriptionStats,
  getSubscriptionPlans,
  getSubscribedPlans,
  processSubscriptionRenewal
};

