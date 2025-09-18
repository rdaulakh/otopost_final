const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(401).json({
        message: 'Token is valid but user no longer exists'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        message: 'User account is deactivated'
      });
    }

    // Add user to request object
    req.user = decoded.user;
    req.userDoc = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check subscription level
const checkSubscription = (requiredLevel) => {
  const subscriptionLevels = {
    'free': 0,
    'basic': 1,
    'premium': 2,
    'enterprise': 3
  };

  return async (req, res, next) => {
    try {
      const user = req.userDoc;
      const userLevel = subscriptionLevels[user.subscription] || 0;
      const requiredLevelNum = subscriptionLevels[requiredLevel] || 0;

      if (userLevel < requiredLevelNum) {
        return res.status(403).json({
          message: `This feature requires ${requiredLevel} subscription or higher`,
          currentSubscription: user.subscription,
          requiredSubscription: requiredLevel
        });
      }

      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({
        message: 'Server error in subscription check'
      });
    }
  };
};

// Admin middleware (for super admin features)
const adminAuth = async (req, res, next) => {
  try {
    // Check if user has admin role
    const user = req.userDoc;
    
    if (!user.isAdmin) {
      return res.status(403).json({
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      message: 'Server error in admin authentication'
    });
  }
};

module.exports = {
  auth,
  checkSubscription,
  adminAuth
};
