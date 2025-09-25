const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../../middleware/auth');
const Plan = require('../../models/Plan');
const User = require('../../models/User');
const logger = require('../../utils/logger');

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Get subscription statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total plans count
    const totalPlans = await Plan.countDocuments();
    const activePlans = await Plan.countDocuments({ isActive: true });
    
    // Get total users count
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Get plan distribution
    const planDistribution = await Plan.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Calculate monthly revenue (mock data for now)
    const monthlyRevenue = totalUsers * 25; // Assuming average $25 per user
    const yearlyRevenue = monthlyRevenue * 12;
    
    // Calculate growth rates (mock data for now)
    const userGrowthRate = 12; // 12% growth
    const revenueGrowthRate = 8; // 8% growth
    
    // System uptime (mock data)
    const systemUptime = 99.97;
    
    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        growthRate: userGrowthRate
      },
      revenue: {
        monthly: monthlyRevenue,
        yearly: yearlyRevenue,
        growthRate: revenueGrowthRate
      },
      plans: {
        total: totalPlans,
        active: activePlans,
        distribution: planDistribution
      },
      system: {
        uptime: systemUptime,
        status: 'stable'
      }
    };
    
    logger.info('Subscription stats retrieved', { adminId: req.admin._id });
    
    res.json({
      success: true,
      message: 'Subscription statistics retrieved successfully',
      data: stats
    });
    
  } catch (error) {
    logger.error('Error fetching subscription stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription statistics',
      error: error.message
    });
  }
});

// Get subscription details
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, planId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (planId) query.planId = planId;
    
    const subscriptions = await User.find(query)
      .populate('subscription.planId', 'name pricing')
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: {
        subscriptions,
        pagination: {
          current: parseInt(page),
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
});

module.exports = router;












