const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs').promises;
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Content = require('../models/Content');
const rateLimit = require('express-rate-limit');

// Rate limiting for monitoring endpoints
const monitoringRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: 'Too many monitoring requests from this IP'
});

router.use(monitoringRateLimit);
router.use(auth);
router.use(adminAuth);

// Helper function to get system metrics
const getSystemMetrics = async () => {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    // Calculate CPU usage
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    // Get disk usage (Linux/Unix systems)
    let diskUsage = { used: 0, total: 0, percentage: 0 };
    try {
      const stats = await fs.stat('/');
      // This is a simplified disk usage calculation
      // In production, you might want to use a more robust solution
      diskUsage = {
        used: 120 + Math.random() * 20, // Mock data for now
        total: 500,
        percentage: (120 + Math.random() * 20) / 500 * 100
      };
    } catch (error) {
      console.log('Disk usage calculation error:', error.message);
    }

    return {
      cpu: {
        usage: usage || Math.random() * 100,
        cores: cpus.length,
        temperature: 45 + Math.random() * 10 // Mock temperature
      },
      memory: {
        used: Math.round((usedMem / 1024 / 1024 / 1024) * 100) / 100,
        total: Math.round((totalMem / 1024 / 1024 / 1024) * 100) / 100,
        percentage: Math.round((usedMem / totalMem) * 100 * 100) / 100
      },
      disk: diskUsage,
      network: {
        in: Math.random() * 100,
        out: Math.random() * 50,
        latency: 20 + Math.random() * 10
      },
      uptime: os.uptime()
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return null;
  }
};

// Helper function to get database metrics
const getDatabaseMetrics = async () => {
  try {
    // Get user and content counts for database activity simulation
    const userCount = await User.countDocuments();
    const contentCount = await Content.countDocuments();
    
    return {
      connections: 15 + Math.floor(Math.random() * 10),
      queries: 1250 + Math.floor(Math.random() * 500),
      slowQueries: Math.floor(Math.random() * 5),
      collections: {
        users: userCount,
        content: contentCount,
        totalDocuments: userCount + contentCount
      }
    };
  } catch (error) {
    console.error('Error getting database metrics:', error);
    return {
      connections: 15,
      queries: 1250,
      slowQueries: 0,
      collections: {
        users: 0,
        content: 0,
        totalDocuments: 0
      }
    };
  }
};

// Helper function to get Redis metrics (mock for now)
const getRedisMetrics = () => {
  return {
    memory: 50 + Math.random() * 20,
    keys: 10000 + Math.floor(Math.random() * 5000),
    hitRate: 95 + Math.random() * 5,
    connections: 5 + Math.floor(Math.random() * 5)
  };
};

// Helper function to get request metrics (mock for now)
const getRequestMetrics = () => {
  const total = 15000 + Math.floor(Math.random() * 5000);
  const errors = 50 + Math.floor(Math.random() * 20);
  
  return {
    total,
    errors,
    success: total - errors,
    responseTime: {
      average: 150 + Math.random() * 50,
      p95: 300 + Math.random() * 100,
      p99: 500 + Math.random() * 200
    }
  };
};

// @route   GET /api/monitoring/system-metrics
// @desc    Get real-time system metrics
// @access  Admin
router.get('/system-metrics', async (req, res) => {
  try {
    const systemMetrics = await getSystemMetrics();
    const databaseMetrics = await getDatabaseMetrics();
    const redisMetrics = getRedisMetrics();
    const requestMetrics = getRequestMetrics();

    if (!systemMetrics) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve system metrics'
      });
    }

    const metrics = {
      ...systemMetrics,
      database: databaseMetrics,
      redis: redisMetrics,
      requests: requestMetrics,
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system metrics',
      error: error.message
    });
  }
});

// @route   GET /api/monitoring/alerts
// @desc    Get system alerts based on current metrics
// @access  Admin
router.get('/alerts', async (req, res) => {
  try {
    const systemMetrics = await getSystemMetrics();
    const alerts = [];

    if (systemMetrics) {
      // Generate alerts based on thresholds
      if (systemMetrics.cpu.usage > 80) {
        alerts.push({
          id: Date.now() + 1,
          type: 'warning',
          title: 'High CPU Usage',
          message: `CPU usage is at ${systemMetrics.cpu.usage.toFixed(1)}%`,
          timestamp: new Date(),
          severity: systemMetrics.cpu.usage > 90 ? 'high' : 'medium',
          resolved: false
        });
      }

      if (systemMetrics.memory.percentage > 85) {
        alerts.push({
          id: Date.now() + 2,
          type: 'error',
          title: 'High Memory Usage',
          message: `Memory usage is at ${systemMetrics.memory.percentage.toFixed(1)}%`,
          timestamp: new Date(),
          severity: 'high',
          resolved: false
        });
      }

      if (systemMetrics.disk.percentage > 90) {
        alerts.push({
          id: Date.now() + 3,
          type: 'error',
          title: 'Low Disk Space',
          message: `Disk usage is at ${systemMetrics.disk.percentage.toFixed(1)}%`,
          timestamp: new Date(),
          severity: 'high',
          resolved: false
        });
      }
    }

    // Add some mock alerts for demonstration
    if (alerts.length === 0) {
      alerts.push({
        id: Date.now() + 4,
        type: 'info',
        title: 'System Running Normally',
        message: 'All systems are operating within normal parameters',
        timestamp: new Date(),
        severity: 'low',
        resolved: true
      });
    }

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Monitoring alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// @route   GET /api/monitoring/performance-data
// @desc    Get performance data over time
// @access  Admin
router.get('/performance-data', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // Generate mock performance data over time
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 24;
    const interval = timeRange === '24h' ? 1 : timeRange === '7d' ? 6 : 1;
    
    const performanceData = [];
    
    for (let i = 0; i < hours; i += interval) {
      const timestamp = new Date(Date.now() - (hours - i) * 60 * 60 * 1000);
      performanceData.push({
        timestamp,
        cpu: 20 + Math.random() * 60,
        memory: 40 + Math.random() * 30,
        requests: 100 + Math.random() * 200,
        responseTime: 100 + Math.random() * 300,
        errors: Math.floor(Math.random() * 10)
      });
    }

    res.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance data',
      error: error.message
    });
  }
});

// @route   GET /api/monitoring/error-logs
// @desc    Get recent error logs
// @access  Admin
router.get('/error-logs', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    // Mock error logs - in production, this would come from your logging system
    const errorLogs = [
      {
        id: 1,
        timestamp: new Date(),
        level: 'error',
        message: 'Database connection timeout',
        source: 'database',
        userId: 'user123',
        requestId: 'req_' + Date.now(),
        stack: 'Error: Connection timeout\n    at Database.connect...'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 300000),
        level: 'warning',
        message: 'Slow query detected',
        source: 'database',
        userId: 'user456',
        requestId: 'req_' + (Date.now() - 1),
        stack: null
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 600000),
        level: 'error',
        message: 'Redis connection failed',
        source: 'redis',
        userId: 'user789',
        requestId: 'req_' + (Date.now() - 2),
        stack: 'Error: Redis connection failed\n    at Redis.connect...'
      }
    ];

    res.json({
      success: true,
      data: errorLogs.slice(0, parseInt(limit))
    });

  } catch (error) {
    console.error('Error logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch error logs',
      error: error.message
    });
  }
});

// @route   GET /api/monitoring/slow-queries
// @desc    Get recent slow database queries
// @access  Admin
router.get('/slow-queries', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Mock slow queries - in production, this would come from your database monitoring
    const slowQueries = [
      {
        id: 1,
        query: 'User.find({ email: { $regex: ".*@gmail.com" } }).sort({ createdAt: -1 })',
        duration: 2500,
        collection: 'users',
        timestamp: new Date(),
        userId: 'user123',
        explain: {
          executionTimeMillis: 2500,
          totalDocsExamined: 50000,
          totalDocsReturned: 1250
        }
      },
      {
        id: 2,
        query: 'Content.aggregate([{ $match: { status: "published" } }, { $group: { _id: "$userId", count: { $sum: 1 } } }])',
        duration: 1800,
        collection: 'content',
        timestamp: new Date(Date.now() - 300000),
        userId: 'user456',
        explain: {
          executionTimeMillis: 1800,
          totalDocsExamined: 25000,
          totalDocsReturned: 500
        }
      },
      {
        id: 3,
        query: 'User.find({ "subscription.plan": "premium", lastLogin: { $gte: new Date("2024-01-01") } })',
        duration: 1200,
        collection: 'users',
        timestamp: new Date(Date.now() - 600000),
        userId: 'user789',
        explain: {
          executionTimeMillis: 1200,
          totalDocsExamined: 15000,
          totalDocsReturned: 150
        }
      }
    ];

    res.json({
      success: true,
      data: slowQueries.slice(0, parseInt(limit))
    });

  } catch (error) {
    console.error('Slow queries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slow queries',
      error: error.message
    });
  }
});

// @route   GET /api/monitoring/health-check
// @desc    Basic health check endpoint
// @access  Public
router.get('/health-check', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

module.exports = router;
