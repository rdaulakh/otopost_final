const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const Organization = require('../models/Organization');
const jwtManager = require('../utils/jwt');
const agentProvisioningService = require('../services/agentProvisioningService');
const logger = require('../utils/logger');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Customer Register
router.post('/customer/register', async (req, res) => {
  try {
    const { name, email, password, firstName, lastName, company, industry, role = 'owner' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { name }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or name already exists'
      });
    }

    // Create organization first
    const organization = new Organization({
      name: company || `${firstName} ${lastName}`.trim() || 'My Organization',
      slug: `${name || email.split('@')[0]}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: `Organization for ${firstName} ${lastName}`,
      industry: industry || 'Technology',
      contactInfo: {
        primaryEmail: email
      },
      subscription: {
        planId: 'free',
        status: 'active',
        billingCycle: 'monthly',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
      },
      limits: {
        users: 1,
        socialAccounts: 2,
        monthlyPosts: 10,
        aiGenerations: 50,
        storageGB: 1,
        analyticsRetentionDays: 30
      }
    });

    await organization.save();

    // Provision AI agents for the new organization
    try {
      const agentProvisioningResult = await agentProvisioningService.provisionAgentsForOrganization(
        organization._id,
        organization.toObject()
      );
      
      logger.info(`AI agents provisioned for organization ${organization._id}:`, {
        agentsCreated: agentProvisioningResult.agentsCreated,
        success: agentProvisioningResult.success
      });
    } catch (agentError) {
      logger.error(`Failed to provision AI agents for organization ${organization._id}:`, agentError);
      // Don't fail the registration if agent provisioning fails
    }

    // Create user with organization reference
    const user = new User({
      username: name, // Use name as username for compatibility
      name,
      email,
      password,
      firstName,
      lastName,
      company,
      industry,
      role,
      organizationId: organization._id
    });

    await user.save();

    // Generate token using proper JWT manager
    const tokens = jwtManager.generateCustomerTokens({
      userId: user._id,
      organizationId: organization._id,
      email: user.email,
      role: user.role
    });
    const token = tokens.accessToken;

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        tokens: {
          accessToken: token
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    console.error('Register error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Customer Login
router.post('/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate token using proper JWT manager
    const tokens = jwtManager.generateCustomerTokens({
      userId: user._id,
      organizationId: user.organizationId || user._id, // Use user ID as fallback
      email: user.email,
      role: user.role
    });
    const token = tokens.accessToken;

    // Update last login stats
    if (!user.stats) {
      user.stats = {};
    }
    user.stats.loginCount = (user.stats.loginCount || 0) + 1;
    user.stats.lastLoginAt = new Date();
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          accessToken: token
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current customer profile
router.get('/customer/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Update customer profile
router.put('/customer/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['profile.displayName', 'profile.bio', 'preferences'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.some(allowed => key.startsWith(allowed.split('.')[0]))) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(user, updates);
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find admin user and include password for comparison
    const admin = await AdminUser.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const passwordMatch = await admin.comparePassword(password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Admin account is inactive'
      });
    }

    // Generate admin token using jwtManager
    const tokens = jwtManager.generateAdminTokens({
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
      permissions: ['all'] // Use simple array for JWT
    });
    const token = tokens.accessToken;

    // Don't modify the admin user to avoid pre-save hook conflicts
    // The admin user already has the correct permissions structure

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          firstName: adminResponse.firstName,
          lastName: adminResponse.lastName,
          email: adminResponse.email,
          role: 'admin',
          permissions: adminResponse.permissions || ['all'],
          id: adminResponse._id,
          createdAt: adminResponse.createdAt,
          updatedAt: adminResponse.updatedAt
        },
        tokens: {
          accessToken: token
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Customer logout (client-side token removal)
router.post('/customer/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
