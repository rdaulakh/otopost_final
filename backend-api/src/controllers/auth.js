const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const Organization = require('../models/Organization');
const jwtManager = require('../utils/jwt');
const redisConnection = require('../config/redis');
const logger = require('../utils/logger');

// Customer Authentication Controllers
const customerAuth = {
  // Register new customer
  register: async (req, res) => {
    try {
      const { email, password, firstName, lastName, organizationName, acceptTerms } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
          code: 'USER_EXISTS'
        });
      }
      
      // Create organization first
      const organization = new Organization({
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
        contactInfo: {
          primaryEmail: email
        },
        subscription: {
          planId: 'free',
          status: 'trialing',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
        }
      });
      
      await organization.save();
      
      // Create user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        organizationId: organization._id,
        role: 'owner',
        permissions: {
          canCreateContent: true,
          canEditContent: true,
          canDeleteContent: true,
          canPublishContent: true,
          canManageTeam: true,
          canManageBilling: true,
          canManageSettings: true,
          canViewAnalytics: true,
          canManageAIAgents: true
        }
      });
      
      await user.save();
      
      // Organization is already saved, no need to update with owner
      // The organization doesn't have an owner field in the schema
      
      // Generate tokens
      const tokens = jwtManager.generateCustomerTokens({
        userId: user._id,
        organizationId: organization._id,
        email: user.email,
        role: user.role
      });
      const { accessToken, refreshToken } = tokens;
      
      // Store refresh token in Redis
      await redisConnection.set(`refresh:customer:${user._id}`, refreshToken, 30 * 24 * 60 * 60);
      
      // Log successful registration
      logger.logUserActivity(user._id, 'register', {
        organizationId: organization._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: organization._id,
            organizationName: organization.name
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: '24h'
          },
          trial: {
            isTrialing: true,
            trialEnd: organization.subscription.trialEndsAt,
            daysRemaining: 14
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'customerAuth.register',
        body: req.body,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  },
  
  // Customer login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user with organization
      const user = await User.findOne({ email }).populate('organizationId');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive',
          code: 'ACCOUNT_INACTIVE'
        });
      }
      
      // Check if organization is active
      if (!user.organizationId || !user.organizationId.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Organization is inactive',
          code: 'ORGANIZATION_INACTIVE'
        });
      }
      
      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        // Log failed login attempt
        logger.logSecurity('failed_login', {
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Generate tokens
      const tokens = jwtManager.generateCustomerTokens({
        userId: user._id,
        organizationId: user.organizationId._id,
        email: user.email,
        role: user.role
      });
      const { accessToken, refreshToken } = tokens;
      
      // Store refresh token in Redis
      await redisConnection.set(`refresh:customer:${user._id}`, refreshToken, 30 * 24 * 60 * 60);
      
      // Update last login
      user.activity.lastLoginAt = new Date();
      user.activity.lastActiveAt = new Date();
      await user.save();
      
      // Log successful login
      logger.logUserActivity(user._id, 'login', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId._id,
            organizationName: user.organizationId.name,
            permissions: user.permissions
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: '24h'
          },
          subscription: {
            planId: user.organizationId.subscription.planId,
            status: user.organizationId.subscription.status,
            trialEnd: user.organizationId.subscription.trialEndsAt
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'customerAuth.login',
        email: req.body.email,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      });
    }
  },
  
  // Customer logout
  logout: async (req, res) => {
    try {
      const { token } = req;
      const userId = req.user._id;
      
      // Add token to blacklist
      await redisConnection.set(`blacklist:customer:${token}`, 'true', 24 * 60 * 60);
      
      // Remove refresh token
      await redisConnection.del(`refresh:customer:${userId}`);
      
      // Log logout
      logger.logUserActivity(userId, 'logout', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'customerAuth.logout',
        userId: req.user?._id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        code: 'LOGOUT_ERROR'
      });
    }
  },
  
  // Refresh access token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          code: 'REFRESH_TOKEN_REQUIRED'
        });
      }
      
      // Verify refresh token
      const decoded = jwtManager.verifyCustomerRefreshToken(refreshToken);
      
      if (decoded.type !== 'customer') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }
      
      // Check if refresh token exists in Redis
      const storedToken = await redisConnection.get(`refresh:customer:${decoded.userId}`);
      if (storedToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }
      
      // Get user
      const user = await User.findById(decoded.userId).populate('organizationId');
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive',
          code: 'USER_INACTIVE'
        });
      }
      
      // Generate new tokens
      const newTokens = jwtManager.generateCustomerTokens({
        userId: user._id,
        organizationId: user.organizationId._id,
        email: user.email,
        role: user.role
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = newTokens;
      
      // Update refresh token in Redis
      await redisConnection.set(`refresh:customer:${user._id}`, newRefreshToken, 30 * 24 * 60 * 60);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: '24h'
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'customerAuth.refreshToken',
        ip: req.ip
      });
      
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        code: 'TOKEN_REFRESH_ERROR'
      });
    }
  },
  
  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent'
        });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Save reset token
      user.security.passwordReset = {
        token: resetToken,
        expiresAt: resetTokenExpiry,
        requestedAt: new Date()
      };
      await user.save();
      
      // Store reset token in Redis for quick lookup
      await redisConnection.set(`password_reset:${resetToken}`, user._id.toString(), 60 * 60);
      
      // Log password reset request
      logger.logSecurity('password_reset_requested', {
        userId: user._id,
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      // TODO: Send email with reset link
      // await emailService.sendPasswordResetEmail(user.email, resetToken);
      
      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'customerAuth.forgotPassword',
        email: req.body.email,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
        code: 'PASSWORD_RESET_ERROR'
      });
    }
  },
  
  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      // Get user ID from Redis
      const userId = await redisConnection.get(`password_reset:${token}`);
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
          code: 'INVALID_RESET_TOKEN'
        });
      }
      
      // Get user and verify token
      const user = await User.findById(userId);
      if (!user || !user.security.passwordReset || 
          user.security.passwordReset.token !== token ||
          user.security.passwordReset.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
          code: 'INVALID_RESET_TOKEN'
        });
      }
      
      // Update password
      user.password = newPassword;
      user.security.passwordReset = undefined;
      user.security.passwordChangedAt = new Date();
      await user.save();
      
      // Remove reset token from Redis
      await redisConnection.del(`password_reset:${token}`);
      
      // Invalidate all existing sessions
      await redisConnection.del(`refresh:customer:${userId}`);
      
      // Log password reset
      logger.logSecurity('password_reset_completed', {
        userId: user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        success: true,
        message: 'Password reset successful'
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'customerAuth.resetPassword',
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        code: 'PASSWORD_RESET_ERROR'
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('organizationId')
        .select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId._id,
            organizationName: user.organizationId.name,
            permissions: user.permissions,
            lastLoginAt: user.activity.lastLoginAt,
            createdAt: user.createdAt
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'customerAuth.getProfile',
        userId: req.user?._id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
        code: 'PROFILE_ERROR'
      });
    }
  }
};

// Admin Authentication Controllers
const adminAuth = {
  // Admin login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find admin user
      const admin = await AdminUser.findOne({ email });
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Check if admin is active
      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account is inactive',
          code: 'ADMIN_INACTIVE'
        });
      }
      
      // Verify password
      const isPasswordValid = await admin.verifyPassword(password);
      if (!isPasswordValid) {
        // Log failed login attempt
        logger.logSecurity('admin_failed_login', {
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Generate tokens
      const tokens = jwtManager.generateAdminTokens({
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      });
      const { accessToken, refreshToken } = tokens;
      
      // Store refresh token in Redis
      await redisConnection.set(`refresh:admin:${admin._id}`, refreshToken, 7 * 24 * 60 * 60);
      
      // Update last login
      admin.activity.lastLoginAt = new Date();
      admin.activity.lastActiveAt = new Date();
      await admin.save();
      
      // Log successful login
      logger.logAdminActivity(admin._id, 'login', 'system', null, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          admin: {
            id: admin._id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            department: admin.department,
            permissions: admin.permissions
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: '8h'
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminAuth.login',
        email: req.body.email,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Admin login failed',
        code: 'ADMIN_LOGIN_ERROR'
      });
    }
  },
  
  // Admin logout
  logout: async (req, res) => {
    try {
      const { token } = req;
      const adminId = req.admin._id;
      
      // Add token to blacklist
      await redisConnection.set(`blacklist:admin:${token}`, 'true', 8 * 60 * 60);
      
      // Remove refresh token
      await redisConnection.del(`refresh:admin:${adminId}`);
      
      // Log logout
      logger.logAdminActivity(adminId, 'logout', 'system', null, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        success: true,
        message: 'Admin logout successful'
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminAuth.logout',
        adminId: req.admin?._id,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Admin logout failed',
        code: 'ADMIN_LOGOUT_ERROR'
      });
    }
  },
  
  // Admin refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          code: 'REFRESH_TOKEN_REQUIRED'
        });
      }
      
      // Verify refresh token
      const decoded = jwtManager.verifyAdminRefreshToken(refreshToken);
      
      if (decoded.type !== 'admin-refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }
      
      // Check if refresh token exists in Redis
      const storedToken = await redisConnection.get(`refresh:admin:${decoded.userId}`);
      if (storedToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }
      
      // Get admin
      const admin = await AdminUser.findById(decoded.userId);
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found or inactive',
          code: 'ADMIN_INACTIVE'
        });
      }
      
      // Generate new tokens
      const newTokens = jwtManager.generateAdminTokens({
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = newTokens;
      
      // Update refresh token in Redis
      await redisConnection.set(`refresh:admin:${admin._id}`, newRefreshToken, 7 * 24 * 60 * 60);
      
      res.json({
        success: true,
        message: 'Admin token refreshed successfully',
        data: {
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: '8h'
          }
        }
      });
      
    } catch (error) {
      logger.logError(error, {
        controller: 'adminAuth.refreshToken',
        ip: req.ip
      });
      
      res.status(401).json({
        success: false,
        message: 'Admin token refresh failed',
        code: 'ADMIN_TOKEN_REFRESH_ERROR'
      });
    }
  }
};

module.exports = {
  customerAuth,
  adminAuth
};

