const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for revenue dashboard endpoints
const revenueDashboardRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150, // limit each IP to 150 requests per minute
  message: 'Too many revenue dashboard requests from this IP'
});

router.use(revenueDashboardRateLimit);
router.use(auth);
router.use(adminAuth);

// Generate mock revenue data
const generateRevenueData = (timeRange = '12m') => {
  const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : timeRange === '12m' ? 12 : 24;
  
  // Generate monthly revenue data
  const monthlyData = Array.from({ length: months }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - 1 - i));
    
    const baseRevenue = 50000 + (i * 2000) + (Math.random() * 10000);
    const subscriptionRevenue = baseRevenue * 0.8;
    const oneTimeRevenue = baseRevenue * 0.2;
    
    return {
      month: date.toISOString().slice(0, 7), // YYYY-MM format
      monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      totalRevenue: Math.floor(baseRevenue),
      subscriptionRevenue: Math.floor(subscriptionRevenue),
      oneTimeRevenue: Math.floor(oneTimeRevenue),
      newCustomers: Math.floor(Math.random() * 200) + 50,
      churnedCustomers: Math.floor(Math.random() * 50) + 10,
      upgrades: Math.floor(Math.random() * 100) + 25,
      downgrades: Math.floor(Math.random() * 30) + 5,
      refunds: Math.floor(Math.random() * 5000) + 1000,
      taxes: Math.floor(baseRevenue * 0.08),
      netRevenue: Math.floor(baseRevenue * 0.92)
    };
  });

  // Calculate current period vs previous period
  const currentPeriod = monthlyData.slice(-Math.floor(months/2));
  const previousPeriod = monthlyData.slice(0, Math.floor(months/2));
  
  const currentTotal = currentPeriod.reduce((sum, month) => sum + month.totalRevenue, 0);
  const previousTotal = previousPeriod.reduce((sum, month) => sum + month.totalRevenue, 0);
  const revenueGrowth = ((currentTotal - previousTotal) / previousTotal) * 100;

  return {
    monthlyData,
    currentTotal,
    previousTotal,
    revenueGrowth: Math.round(revenueGrowth * 100) / 100
  };
};

// Generate subscription analytics data
const generateSubscriptionData = () => {
  const plans = [
    { name: 'Starter', price: 29, color: '#3b82f6' },
    { name: 'Professional', price: 79, color: '#10b981' },
    { name: 'Enterprise', price: 199, color: '#8b5cf6' }
  ];

  return plans.map(plan => ({
    ...plan,
    subscribers: Math.floor(Math.random() * 1000) + 200,
    revenue: Math.floor((Math.random() * 1000 + 200) * plan.price),
    growth: (Math.random() - 0.3) * 50,
    churnRate: Math.random() * 5 + 1,
    avgLifetime: Math.floor(Math.random() * 24) + 12, // months
    conversionRate: Math.random() * 15 + 5
  }));
};

// Generate cohort analysis data
const generateCohortData = () => {
  const cohorts = [];
  
  for (let i = 0; i < 12; i++) {
    const cohortDate = new Date();
    cohortDate.setMonth(cohortDate.getMonth() - i);
    
    const initialSize = Math.floor(Math.random() * 200) + 100;
    const retentionRates = [];
    
    for (let month = 0; month < 12; month++) {
      const baseRetention = month === 0 ? 100 : retentionRates[month - 1] * (0.85 + Math.random() * 0.1);
      retentionRates.push(Math.max(baseRetention, 10));
    }
    
    cohorts.push({
      cohort: cohortDate.toISOString().slice(0, 7),
      cohortName: cohortDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      initialSize,
      retentionRates: retentionRates.map(rate => Math.round(rate * 100) / 100),
      totalRevenue: Math.floor(initialSize * (Math.random() * 100 + 50)),
      avgRevenuePerUser: Math.floor(Math.random() * 200 + 100)
    });
  }
  
  return cohorts.reverse(); // Most recent first
};

// @route   GET /api/revenue-dashboard/metrics
// @desc    Get revenue metrics overview
// @access  Admin
router.get('/metrics', async (req, res) => {
  try {
    const { timeRange = '12m' } = req.query;
    const revenueData = generateRevenueData(timeRange);
    
    const currentMonth = revenueData.monthlyData[revenueData.monthlyData.length - 1];
    const previousMonth = revenueData.monthlyData[revenueData.monthlyData.length - 2] || currentMonth;
    
    const metrics = {
      totalRevenue: revenueData.currentTotal,
      revenueGrowth: revenueData.revenueGrowth,
      monthlyRecurringRevenue: Math.floor(revenueData.currentTotal * 0.8 / (revenueData.monthlyData.length / 2)),
      averageRevenuePerUser: Math.floor(revenueData.currentTotal / (Math.random() * 1000 + 500)),
      
      // Monthly comparisons
      currentMonthRevenue: currentMonth.totalRevenue,
      previousMonthRevenue: previousMonth.totalRevenue,
      monthOverMonthGrowth: ((currentMonth.totalRevenue - previousMonth.totalRevenue) / previousMonth.totalRevenue) * 100,
      
      // Customer metrics
      totalCustomers: Math.floor(Math.random() * 5000) + 2000,
      newCustomers: currentMonth.newCustomers,
      churnedCustomers: currentMonth.churnedCustomers,
      netCustomerGrowth: currentMonth.newCustomers - currentMonth.churnedCustomers,
      
      // Conversion metrics
      conversionRate: Math.random() * 5 + 2,
      averageOrderValue: Math.floor(Math.random() * 200) + 100,
      customerLifetimeValue: Math.floor(Math.random() * 2000) + 1000,
      
      // Financial health
      grossMargin: Math.random() * 20 + 70, // 70-90%
      netMargin: Math.random() * 15 + 15, // 15-30%
      burnRate: Math.floor(Math.random() * 50000) + 25000,
      runway: Math.floor(Math.random() * 24) + 12, // months
      
      // Forecasting
      projectedRevenue: Math.floor(revenueData.currentTotal * 1.15),
      projectedGrowthRate: Math.random() * 10 + 5,
      
      timeRange,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Revenue metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue metrics',
      error: error.message
    });
  }
});

// @route   GET /api/revenue-dashboard/analytics
// @desc    Get detailed revenue analytics
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '12m' } = req.query;
    const revenueData = generateRevenueData(timeRange);
    
    const analytics = {
      timeSeriesData: revenueData.monthlyData,
      
      // Revenue breakdown
      revenueBreakdown: {
        subscription: revenueData.monthlyData.reduce((sum, month) => sum + month.subscriptionRevenue, 0),
        oneTime: revenueData.monthlyData.reduce((sum, month) => sum + month.oneTimeRevenue, 0),
        refunds: revenueData.monthlyData.reduce((sum, month) => sum + month.refunds, 0),
        taxes: revenueData.monthlyData.reduce((sum, month) => sum + month.taxes, 0),
        net: revenueData.monthlyData.reduce((sum, month) => sum + month.netRevenue, 0)
      },
      
      // Geographic breakdown
      revenueByRegion: [
        { region: 'North America', revenue: Math.floor(revenueData.currentTotal * 0.45), percentage: 45 },
        { region: 'Europe', revenue: Math.floor(revenueData.currentTotal * 0.30), percentage: 30 },
        { region: 'Asia Pacific', revenue: Math.floor(revenueData.currentTotal * 0.15), percentage: 15 },
        { region: 'Latin America', revenue: Math.floor(revenueData.currentTotal * 0.07), percentage: 7 },
        { region: 'Other', revenue: Math.floor(revenueData.currentTotal * 0.03), percentage: 3 }
      ],
      
      // Payment methods
      paymentMethods: [
        { method: 'Credit Card', revenue: Math.floor(revenueData.currentTotal * 0.70), percentage: 70 },
        { method: 'PayPal', revenue: Math.floor(revenueData.currentTotal * 0.20), percentage: 20 },
        { method: 'Bank Transfer', revenue: Math.floor(revenueData.currentTotal * 0.08), percentage: 8 },
        { method: 'Other', revenue: Math.floor(revenueData.currentTotal * 0.02), percentage: 2 }
      ],
      
      // Customer segments
      customerSegments: [
        { segment: 'Enterprise', revenue: Math.floor(revenueData.currentTotal * 0.50), customers: Math.floor(Math.random() * 100) + 50 },
        { segment: 'SMB', revenue: Math.floor(revenueData.currentTotal * 0.35), customers: Math.floor(Math.random() * 500) + 200 },
        { segment: 'Startup', revenue: Math.floor(revenueData.currentTotal * 0.15), customers: Math.floor(Math.random() * 1000) + 500 }
      ],
      
      // Growth metrics
      growthMetrics: {
        monthOverMonth: revenueData.monthlyData.map((month, index) => {
          if (index === 0) return { month: month.monthName, growth: 0 };
          const prevMonth = revenueData.monthlyData[index - 1];
          const growth = ((month.totalRevenue - prevMonth.totalRevenue) / prevMonth.totalRevenue) * 100;
          return { month: month.monthName, growth: Math.round(growth * 100) / 100 };
        }),
        yearOverYear: Math.random() * 50 + 25, // 25-75% YoY growth
        compoundAnnualGrowthRate: Math.random() * 40 + 20 // 20-60% CAGR
      },
      
      // Revenue quality metrics
      qualityMetrics: {
        recurringRevenuePercentage: 80 + Math.random() * 15, // 80-95%
        revenueConcentration: Math.random() * 30 + 20, // Top 10 customers percentage
        contractValue: {
          averageContractValue: Math.floor(Math.random() * 50000) + 25000,
          medianContractValue: Math.floor(Math.random() * 30000) + 15000,
          largestContract: Math.floor(Math.random() * 200000) + 100000
        }
      },
      
      timeRange,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
});

// @route   GET /api/revenue-dashboard/subscriptions
// @desc    Get subscription analytics
// @access  Admin
router.get('/subscriptions', async (req, res) => {
  try {
    const { timeRange = '12m' } = req.query;
    const subscriptionData = generateSubscriptionData();
    
    const analytics = {
      planBreakdown: subscriptionData,
      
      // Subscription metrics
      totalSubscribers: subscriptionData.reduce((sum, plan) => sum + plan.subscribers, 0),
      totalSubscriptionRevenue: subscriptionData.reduce((sum, plan) => sum + plan.revenue, 0),
      averageRevenuePerSubscriber: Math.floor(subscriptionData.reduce((sum, plan) => sum + plan.revenue, 0) / subscriptionData.reduce((sum, plan) => sum + plan.subscribers, 0)),
      
      // Churn analysis
      churnAnalysis: {
        overallChurnRate: subscriptionData.reduce((sum, plan) => sum + plan.churnRate, 0) / subscriptionData.length,
        churnByPlan: subscriptionData.map(plan => ({
          plan: plan.name,
          churnRate: plan.churnRate,
          churnedCustomers: Math.floor(plan.subscribers * plan.churnRate / 100)
        })),
        churnReasons: [
          { reason: 'Price too high', percentage: 35 },
          { reason: 'Not using features', percentage: 25 },
          { reason: 'Found alternative', percentage: 20 },
          { reason: 'Business closure', percentage: 12 },
          { reason: 'Other', percentage: 8 }
        ]
      },
      
      // Upgrade/downgrade patterns
      planChanges: {
        upgrades: subscriptionData.reduce((sum, plan) => sum + Math.floor(plan.subscribers * 0.05), 0),
        downgrades: subscriptionData.reduce((sum, plan) => sum + Math.floor(plan.subscribers * 0.02), 0),
        upgradeRevenue: Math.floor(Math.random() * 50000) + 25000,
        downgradeRevenue: Math.floor(Math.random() * 15000) + 5000
      },
      
      // Trial conversion
      trialMetrics: {
        trialSignups: Math.floor(Math.random() * 500) + 200,
        trialConversionRate: Math.random() * 20 + 15, // 15-35%
        averageTrialDuration: Math.floor(Math.random() * 10) + 7, // 7-17 days
        trialToRevenueConversion: Math.random() * 25 + 10 // 10-35%
      },
      
      // Subscription lifecycle
      lifecycleMetrics: {
        averageLifetime: subscriptionData.reduce((sum, plan) => sum + plan.avgLifetime, 0) / subscriptionData.length,
        lifetimeValue: subscriptionData.reduce((sum, plan) => sum + (plan.price * plan.avgLifetime), 0) / subscriptionData.length,
        paybackPeriod: Math.floor(Math.random() * 6) + 3, // 3-9 months
        retentionRate: {
          month1: 85 + Math.random() * 10,
          month3: 70 + Math.random() * 15,
          month6: 60 + Math.random() * 15,
          month12: 50 + Math.random() * 20
        }
      },
      
      timeRange,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Subscription analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription analytics',
      error: error.message
    });
  }
});

// @route   GET /api/revenue-dashboard/cohorts
// @desc    Get cohort analysis data
// @access  Admin
router.get('/cohorts', async (req, res) => {
  try {
    const { timeRange = '12m' } = req.query;
    const cohortData = generateCohortData();
    
    const analysis = {
      cohorts: cohortData,
      
      // Cohort summary
      summary: {
        totalCohorts: cohortData.length,
        averageRetention: {
          month1: cohortData.reduce((sum, cohort) => sum + cohort.retentionRates[1], 0) / cohortData.length,
          month3: cohortData.reduce((sum, cohort) => sum + cohort.retentionRates[3], 0) / cohortData.length,
          month6: cohortData.reduce((sum, cohort) => sum + cohort.retentionRates[6], 0) / cohortData.length,
          month12: cohortData.reduce((sum, cohort) => sum + cohort.retentionRates[11], 0) / cohortData.length
        },
        bestPerformingCohort: cohortData.reduce((best, current) => 
          current.retentionRates[6] > best.retentionRates[6] ? current : best
        ),
        worstPerformingCohort: cohortData.reduce((worst, current) => 
          current.retentionRates[6] < worst.retentionRates[6] ? current : worst
        )
      },
      
      // Revenue cohort analysis
      revenueCohorts: cohortData.map(cohort => ({
        cohort: cohort.cohort,
        cohortName: cohort.cohortName,
        initialRevenue: cohort.totalRevenue,
        currentRevenue: Math.floor(cohort.totalRevenue * (cohort.retentionRates[6] / 100)),
        revenueRetention: cohort.retentionRates.map((rate, index) => ({
          month: index,
          revenue: Math.floor(cohort.totalRevenue * (rate / 100)),
          retentionRate: rate
        }))
      })),
      
      // Cohort insights
      insights: [
        {
          type: 'trend',
          title: 'Improving Retention',
          description: 'Recent cohorts show 15% better 6-month retention than older cohorts.',
          impact: 'positive'
        },
        {
          type: 'opportunity',
          title: 'Month 2 Drop-off',
          description: 'Significant retention drop in month 2. Consider onboarding improvements.',
          impact: 'neutral'
        },
        {
          type: 'success',
          title: 'Enterprise Cohorts',
          description: 'Enterprise customer cohorts show 40% higher lifetime value.',
          impact: 'positive'
        }
      ],
      
      timeRange,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Cohort analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cohort analysis',
      error: error.message
    });
  }
});

// @route   GET /api/revenue-dashboard/forecasting
// @desc    Get revenue forecasting data
// @access  Admin
router.get('/forecasting', async (req, res) => {
  try {
    const { timeRange = '12m', forecastPeriod = '6m' } = req.query;
    const revenueData = generateRevenueData(timeRange);
    
    // Generate forecast data
    const forecastMonths = forecastPeriod === '3m' ? 3 : forecastPeriod === '6m' ? 6 : 12;
    const lastMonth = revenueData.monthlyData[revenueData.monthlyData.length - 1];
    const growthRate = revenueData.revenueGrowth / 100 / revenueData.monthlyData.length; // Monthly growth rate
    
    const forecast = Array.from({ length: forecastMonths }, (_, i) => {
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + i + 1);
      
      const baseRevenue = lastMonth.totalRevenue * Math.pow(1 + growthRate, i + 1);
      const seasonalFactor = 1 + (Math.sin((forecastDate.getMonth() / 12) * 2 * Math.PI) * 0.1);
      const forecastRevenue = baseRevenue * seasonalFactor;
      
      return {
        month: forecastDate.toISOString().slice(0, 7),
        monthName: forecastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        forecastRevenue: Math.floor(forecastRevenue),
        confidenceInterval: {
          low: Math.floor(forecastRevenue * 0.85),
          high: Math.floor(forecastRevenue * 1.15)
        },
        factors: {
          trend: Math.floor(baseRevenue),
          seasonal: Math.floor(forecastRevenue - baseRevenue),
          confidence: 85 - (i * 5) // Decreasing confidence over time
        }
      };
    });

    const forecasting = {
      forecast,
      
      // Model performance
      modelMetrics: {
        accuracy: 85 - Math.random() * 10, // 75-85%
        meanAbsoluteError: Math.floor(Math.random() * 5000) + 2000,
        rootMeanSquareError: Math.floor(Math.random() * 8000) + 3000,
        r2Score: 0.8 + Math.random() * 0.15 // 0.8-0.95
      },
      
      // Scenario analysis
      scenarios: {
        conservative: {
          growthRate: Math.max(growthRate * 0.7, 0.01),
          totalForecast: forecast.reduce((sum, month) => sum + month.forecastRevenue * 0.85, 0)
        },
        realistic: {
          growthRate: growthRate,
          totalForecast: forecast.reduce((sum, month) => sum + month.forecastRevenue, 0)
        },
        optimistic: {
          growthRate: growthRate * 1.3,
          totalForecast: forecast.reduce((sum, month) => sum + month.forecastRevenue * 1.15, 0)
        }
      },
      
      // Key assumptions
      assumptions: [
        'Historical growth trends continue',
        'No major market disruptions',
        'Current pricing strategy maintained',
        'Seasonal patterns remain consistent',
        'Customer acquisition costs stable'
      ],
      
      // Risk factors
      riskFactors: [
        { factor: 'Economic downturn', impact: 'high', probability: 'medium' },
        { factor: 'Increased competition', impact: 'medium', probability: 'high' },
        { factor: 'Churn rate increase', impact: 'high', probability: 'low' },
        { factor: 'Pricing pressure', impact: 'medium', probability: 'medium' }
      ],
      
      timeRange,
      forecastPeriod,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: forecasting
    });

  } catch (error) {
    console.error('Revenue forecasting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue forecasting',
      error: error.message
    });
  }
});

module.exports = router;
