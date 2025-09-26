const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../../middleware/auth');
const User = require('../../models/User');
const Plan = require('../../models/Plan');
const logger = require('../../utils/logger');

// Middleware to protect admin subscription routes
router.use(authenticateAdmin);

// GET /api/admin/user-subscriptions - Get all user subscriptions
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      plan,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Note: Status and plan filtering will be done after population
    // since subscription data is now in the organization
    
    // Execute query
    const [users, total] = await Promise.all([
      User.find(query).populate('organizationId', 'name subscription limits')
        .select('-password')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);
    
    // Get plan details for each user
    const subscriptions = await Promise.all(
      users.map(async (user) => {
        let planDetails = null;
        const planId = user.organizationId?.subscription?.planId || 'free';
        if (planId !== 'free') {
          planDetails = await Plan.findOne({ planId: planId });
        }
        
        return {
          id: user._id,
          user_id: user._id,
          user_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          user_email: user.email,
          organization_id: user.organizationId?._id,
          organization_name: user.organizationId?.name,
          plan: user.organizationId?.subscription?.planId || 'free',
          plan_name: planDetails?.name || user.organizationId?.subscription?.planId || 'free',
          status: user.organizationId?.subscription?.status || 'active',
          amount: planDetails?.pricing?.monthly?.amount || 0,
          billing_cycle: user.organizationId?.subscription?.billingCycle || 'monthly',
          next_billing: user.organizationId?.subscription?.nextBillingDate || null,
          created_at: user.createdAt,
          trial_end: user.organizationId?.subscription?.trialEndsAt || null,
          payment_method: 'N/A', // TODO: Add payment method tracking
          mrr: planDetails?.pricing?.monthly?.amount || 0,
          usage: {
            posts: user.stats?.totalPosts || 0,
            accounts: user.socialAccounts?.length || 0,
            ai_tokens: user.stats?.aiCreditsUsed || 0
          },
          limits: {
            posts: user.organizationId?.limits?.monthlyPosts || 0,
            accounts: user.organizationId?.limits?.socialAccounts || 0,
            ai_tokens: user.organizationId?.limits?.aiGenerations || 0
          },
          plan_details: planDetails
        };
      })
    );
    
    // Log admin activity
    logger.logAdminActivity(req.admin._id, 'user_subscriptions_viewed', 'system', null, {
      query: req.query,
      resultCount: subscriptions.length,
      ip: req.ip
    });
    
    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Error fetching user subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user subscriptions',
      error: error.message
    });
  }
});

// GET /api/admin/user-subscriptions/stats - Get subscription statistics
router.get('/stats', async (req, res) => {
  try {
    // Total subscriptions - now using User model with populated organizationId
    const totalSubscriptions = await User.countDocuments({ 
      'organizationId.subscription.planId': { $ne: 'free' } 
    });
    const activeSubscriptions = await User.countDocuments({ 
      'organizationId.subscription.status': 'active', 
      'organizationId.subscription.planId': { $ne: 'free' } 
    });
    const freeUsers = await User.countDocuments({ 
      'organizationId.subscription.planId': 'free' 
    });
    
    // Plan distribution - using User model with populated organizationId
    let planDistribution = [];
    try {
      planDistribution = await User.aggregate([
        { $lookup: { from: 'organizations', localField: 'organizationId', foreignField: '_id', as: 'organization' } },
        { $unwind: '$organization' },
        { $match: { 'organization.subscription.planId': { $ne: 'free' } } },
        { $group: { _id: '$organization.subscription.planId', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
    } catch (error) {
      console.error('Plan distribution aggregation error:', error);
      planDistribution = [];
    }
    
    // Revenue calculation - using User model with populated organizationId
    let revenueAggregate = [];
    try {
      revenueAggregate = await User.aggregate([
        { $lookup: { from: 'organizations', localField: 'organizationId', foreignField: '_id', as: 'organization' } },
        { $unwind: '$organization' },
        { $match: { 
          'organization.subscription.planId': { $ne: 'free' }, 
          'organization.subscription.status': 'active' 
        } },
        {
          $lookup: {
            from: 'plans',
            localField: 'organization.subscription.planId',
            foreignField: 'planId',
            as: 'planDetails'
          }
        },
        { $unwind: { path: '$planDetails', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ['$planDetails.pricing.monthly.amount', 0] } }
          }
        }
      ]);
    } catch (error) {
      console.error('Revenue aggregation error:', error);
      revenueAggregate = [];
    }
    
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;
    
    res.json({
      success: true,
      data: {
        overview: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          free: freeUsers,
          totalRevenue: totalRevenue
        },
        byPlan: planDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        period: { start: new Date(), end: new Date() }
      }
    });
    
  } catch (error) {
    logger.error('Error fetching subscription stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription statistics',
      error: error.message
    });
  }
});

module.exports = router;
