const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', (req, res) => {
  try {
    const { email, password, firstName, lastName, company } = req.body;
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // In a real app, you would hash the password and save to database
    // For now, we'll simulate a successful registration
    const user = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      company,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // In a real app, you would validate against database
    // For now, we'll simulate a successful login for any valid email format
    if (!email.includes('@')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    const user = {
      id: Date.now().toString(),
      email,
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
router.post('/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Simple admin authentication for testing
    if (email === 'admin@aisocialmedia.com' && password === 'admin123') {
      const adminUser = {
        id: 'admin_123',
        email: 'admin@aisocialmedia.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin'
      };
      
      // Generate JWT token with admin role
      const token = generateToken({
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      });
      
      res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          admin: adminUser,
          tokens: {
            accessToken: token
          }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    // Verify the old token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Generate new token
    const newToken = generateToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    });
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
