const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Check if token exists
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authorized, no token provided' 
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token has expired' 
        });
      }

      // Add user from payload with additional validation
      req.user = { 
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
        iat: decoded.iat,
        exp: decoded.exp
      };

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token has expired' 
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      } else if (error.name === 'NotBeforeError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token not active yet' 
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authorized, token failed' 
        });
      }
    }
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token provided' 
    });
  }
};

// Admin role protection middleware
const adminProtect = (req, res, next) => {
  protect(req, res, (error) => {
    if (error) return;
    
    // Check if user has admin role
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    next();
  });
};

// Super admin role protection middleware
const superAdminProtect = (req, res, next) => {
  protect(req, res, (error) => {
    if (error) return;
    
    // Check if user has super admin role
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Super admin privileges required.' 
      });
    }
    
    next();
  });
};

module.exports = { protect, adminProtect, superAdminProtect };
