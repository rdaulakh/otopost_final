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
    
    // Handle different token structures
    const userId = decoded.user?.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        message: 'Invalid token structure'
      });
    }
    
    // Check if user still exists
    const user = await User.findById(userId).select('-password');
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

    // Add user to request object (normalize structure)
    req.user = {
      id: userId,
      email: decoded.email || user.email,
      role: decoded.role || user.role
    };
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


// Admin authentication middleware
const adminAuth = (req, res, next) => {
  if (!req.user || !req.userDoc || !req.userDoc.isAdmin) {
    return res.status(403).json({
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

module.exports = {
  auth,
  checkSubscription,
  adminAuth
};
