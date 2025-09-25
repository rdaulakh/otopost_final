const SocialAccount = require('../models/SocialAccount');
const User = require('../models/User');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

/**
 * Social Accounts Controller
 * Handles social media account connections and management
 */

// OAuth configuration for different platforms
const OAUTH_CONFIG = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || 'your-instagram-client-id',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || 'your-instagram-client-secret',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BACKEND_URL}/api/social-accounts/oauth/instagram/callback`,
    scope: 'user_profile,user_media',
    authUrl: 'https://api.instagram.com/oauth/authorize'
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || 'your-facebook-client-id',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'your-facebook-client-secret',
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || `${process.env.BACKEND_URL}/api/social-accounts/oauth/facebook/callback`,
    scope: 'pages_manage_posts,pages_read_engagement',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || 'your-linkedin-client-id',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'your-linkedin-client-secret',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${process.env.BACKEND_URL}/api/social-accounts/oauth/linkedin/callback`,
    scope: 'r_liteprofile,r_emailaddress,w_member_social',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization'
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || 'your-twitter-client-id',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || 'your-twitter-client-secret',
    redirectUri: process.env.TWITTER_REDIRECT_URI || `${process.env.BACKEND_URL}/api/social-accounts/oauth/twitter/callback`,
    scope: 'tweet.read,tweet.write,users.read',
    authUrl: 'https://twitter.com/i/oauth2/authorize'
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || 'your-youtube-client-id',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || 'your-youtube-client-secret',
    redirectUri: process.env.YOUTUBE_REDIRECT_URI || `${process.env.BACKEND_URL}/api/social-accounts/oauth/youtube/callback`,
    scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  }
};

// Initiate OAuth flow
const initiateOAuth = async (req, res) => {
  try {
    console.log('OAuth initiateOAuth called for platform:', req.params.platform);
    const { platform } = req.params;
    
    if (!OAUTH_CONFIG[platform]) {
      console.log('Unsupported platform:', platform);
      return res.status(400).json({
        success: false,
        message: 'Unsupported platform'
      });
    }

    const config = OAUTH_CONFIG[platform];
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in session for verification
    req.session.oauthState = state;
    req.session.oauthPlatform = platform;
    // Note: No userId yet, will be determined after OAuth callback

    console.log('OAuth Initiate Debug:', {
      platform,
      state,
      sessionId: req.sessionID,
      hasSession: !!req.session,
      oauthState: req.session.oauthState,
      oauthPlatform: req.session.oauthPlatform
    });

    const authUrl = `${config.authUrl}?` + new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      response_type: 'code',
      state: state
    });

    console.log('Redirecting to OAuth URL:', authUrl);
    logger.info(`OAuth initiated for ${platform}`);
    res.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiateOAuth error:', error);
    logger.error('Error initiating OAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate OAuth flow',
      error: error.message
    });
  }
};

// Handle OAuth callback
const handleOAuthCallback = async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state, error } = req.query;

    console.log('OAuth Callback Debug:', {
      platform,
      code: !!code,
      state,
      error,
      sessionId: req.sessionID,
      hasSession: !!req.session,
      oauthState: req.session?.oauthState,
      oauthPlatform: req.session?.oauthPlatform,
      sessionKeys: Object.keys(req.session || {})
    });

    if (error) {
      logger.error(`OAuth error for ${platform}:`, error);
      return res.redirect(`${process.env.FRONTEND_URL}/settings?tab=platforms&error=${encodeURIComponent(error)}`);
    }

    // Verify state parameter
    if (!req.session.oauthState || state !== req.session.oauthState) {
      logger.error('Invalid OAuth state parameter', {
        expected: req.session.oauthState,
        received: state,
        sessionId: req.sessionID
      });
      return res.redirect(`${process.env.FRONTEND_URL}/settings?tab=platforms&error=invalid_state`);
    }

    if (!OAUTH_CONFIG[platform]) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported platform'
      });
    }

    const config = OAUTH_CONFIG[platform];
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch(`${config.tokenUrl || getTokenUrl(platform)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      logger.error(`Failed to get access token for ${platform}:`, tokenData);
      return res.redirect(`${process.env.FRONTEND_URL}/settings?tab=platforms&error=token_failed`);
    }

    // Get user profile information
    const profileResponse = await fetch(`${config.profileUrl || getProfileUrl(platform)}`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const profileData = await profileResponse.json();

    // Extract account information based on platform
    let accountId, accountName;
    
    if (platform === 'youtube') {
      // YouTube returns data in items array
      const channel = profileData.items?.[0];
      accountId = channel?.id;
      accountName = channel?.snippet?.title;
    } else {
      // Other platforms
      accountId = profileData.id || profileData.data?.id;
      accountName = profileData.username || profileData.name || profileData.data?.username;
    }

    // Store OAuth data in session for frontend to complete the connection
    req.session.oauthData = {
      platform: platform,
      accountId: accountId,
      accountName: accountName,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      accountData: profileData,
      timestamp: Date.now() // Add timestamp for session validation
    };

    // Clear OAuth state
    delete req.session.oauthState;
    delete req.session.oauthPlatform;

    logger.info(`OAuth callback completed for ${platform} - ${accountName}`, {
      sessionId: req.sessionID,
      hasOAuthData: !!req.session.oauthData,
      oauthDataKeys: req.session.oauthData ? Object.keys(req.session.oauthData) : []
    });
    
    // Log the redirect URL for debugging
    const redirectUrl = `${process.env.FRONTEND_URL}/settings?tab=platforms&oauth_success=true&platform=${platform}`;
    logger.info('OAuth redirect URL:', redirectUrl);
    
    // Add debugging for session data
    console.log('OAuth Callback Debug:', {
      sessionId: req.sessionID,
      hasOAuthData: !!req.session.oauthData,
      oauthData: req.session.oauthData,
      sessionKeys: Object.keys(req.session)
    });
    
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Error handling OAuth callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?tab=platforms&error=callback_failed`);
  }
};

// Complete OAuth connection after user is authenticated
const completeOAuthConnection = async (req, res) => {
  try {
    console.log('OAuth completion request received:', {
      hasUser: !!req.user,
      userId: req.user?._id,
      userEmail: req.user?.email,
      userObject: req.user
    });
    
    const userId = req.user._id;
    
    logger.info('Complete OAuth connection attempt', {
      userId,
      sessionId: req.sessionID,
      hasOAuthData: !!req.session.oauthData,
      oauthData: req.session.oauthData ? {
        platform: req.session.oauthData.platform,
        accountId: req.session.oauthData.accountId,
        accountName: req.session.oauthData.accountName,
        timestamp: req.session.oauthData.timestamp
      } : null
    });
    
    // Check if there's OAuth data in session
    if (!req.session.oauthData) {
      logger.error('No OAuth data found in session', {
        userId,
        sessionId: req.sessionID
      });
      return res.status(400).json({
        success: false,
        message: 'No OAuth data found. Please initiate OAuth flow again.'
      });
    }

    // Check if OAuth data is not too old (10 minutes)
    const oauthData = req.session.oauthData;
    const dataAge = Date.now() - (oauthData.timestamp || 0);
    if (dataAge > 10 * 60 * 1000) { // 10 minutes
      logger.error('OAuth data too old', {
        userId,
        sessionId: req.sessionID,
        dataAge: dataAge
      });
      delete req.session.oauthData;
      return res.status(400).json({
        success: false,
        message: 'OAuth data expired. Please initiate OAuth flow again.'
      });
    }
    
    // Get user's organization
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    console.log('User data for OAuth completion:', {
      userId,
      userFound: !!user,
      organizationId: user?.organizationId,
      userEmail: user?.email
    });
    
    if (!user) {
      logger.error('User not found', { userId });
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.organizationId) {
      logger.error('User has no organization', { userId, userEmail: user.email });
      return res.status(400).json({
        success: false,
        message: 'User organization not found. Please contact support.'
      });
    }
    
    // Check if user already has this platform connected
    const existingAccount = await SocialAccount.findOne({
      user: userId,
      platform: oauthData.platform
    });

    if (existingAccount) {
      // Update existing account
      existingAccount.accountId = oauthData.accountId;
      existingAccount.accountName = oauthData.accountName;
      existingAccount.accountUsername = oauthData.accountName; // Use accountName as username
      existingAccount.accessToken = oauthData.accessToken;
      existingAccount.refreshToken = oauthData.refreshToken;
      existingAccount.tokenExpiresAt = oauthData.tokenExpiresAt;
      existingAccount.metadata = {
        ...existingAccount.metadata,
        platformData: oauthData.accountData
      };
      existingAccount.isActive = true;
      existingAccount.isConnected = true;
      
      await existingAccount.save();
      
      // Clear OAuth data from session
      delete req.session.oauthData;
      
      logger.info(`Social account updated: ${oauthData.platform} - ${oauthData.accountName} by user ${userId}`, {
        userId,
        platform: oauthData.platform,
        accountId: oauthData.accountId,
        accountName: oauthData.accountName
      });
      
      return res.json({
        success: true,
        message: `${oauthData.platform} account connected successfully`,
        data: {
          platform: oauthData.platform,
          accountName: oauthData.accountName,
          accountId: oauthData.accountId
        }
      });
    } else {
      // Create new social account
      const socialAccount = new SocialAccount({
        user: userId,
        organization: user.organizationId,
        platform: oauthData.platform,
        accountId: oauthData.accountId,
        accountName: oauthData.accountName,
        accountUsername: oauthData.accountName, // Use accountName as username
        accessToken: oauthData.accessToken,
        refreshToken: oauthData.refreshToken,
        tokenExpiresAt: oauthData.tokenExpiresAt,
        metadata: {
          platformData: oauthData.accountData
        },
        isActive: true,
        isConnected: true
      });

      await socialAccount.save();
      
      // Clear OAuth data from session
      delete req.session.oauthData;
      
      logger.info(`Social account connected: ${oauthData.platform} - ${oauthData.accountName} by user ${userId}`, {
        userId,
        platform: oauthData.platform,
        accountId: oauthData.accountId,
        accountName: oauthData.accountName
      });
      
      return res.json({
        success: true,
        message: `${oauthData.platform} account connected successfully`,
        data: {
          platform: oauthData.platform,
          accountName: oauthData.accountName,
          accountId: oauthData.accountId
        }
      });
    }
  } catch (error) {
    logger.error('Error completing OAuth connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete OAuth connection',
      error: error.message
    });
  }
};

// Helper function to get token URL for different platforms
const getTokenUrl = (platform) => {
  const urls = {
    instagram: 'https://api.instagram.com/oauth/access_token',
    facebook: 'https://graph.facebook.com/v18.0/oauth/access_token',
    linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
    twitter: 'https://api.twitter.com/2/oauth2/token',
    youtube: 'https://oauth2.googleapis.com/token'
  };
  return urls[platform];
};

// Helper function to get profile URL for different platforms
const getProfileUrl = (platform) => {
  const urls = {
    instagram: 'https://graph.instagram.com/me?fields=id,username',
    facebook: 'https://graph.facebook.com/me',
    linkedin: 'https://api.linkedin.com/v2/people/~',
    twitter: 'https://api.twitter.com/2/users/me',
    youtube: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true'
  };
  return urls[platform];
};

// Get all social accounts for a user
const getSocialAccounts = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 20, platform, status } = req.query;

    const query = { user: userId };
    if (platform) query.platform = platform;
    if (status) query.status = status;

    const accounts = await SocialAccount.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SocialAccount.countDocuments(query);

    res.json({
      success: true,
      data: {
        accounts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching social accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social accounts',
      error: error.message
    });
  }
};

// Get a specific social account
const getSocialAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    }).populate('user', 'firstName lastName email');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    logger.error('Error fetching social account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social account',
      error: error.message
    });
  }
};

// Connect a new social account
const connectSocialAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.user;
    const {
      platform,
      accountId,
      accountName,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      accountData
    } = req.body;

    // Check if account already exists
    const existingAccount = await SocialAccount.findOne({
      user: userId,
      platform,
      accountId
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Social account already connected'
      });
    }

    const socialAccount = new SocialAccount({
      user: userId,
      platform,
      accountId,
      accountName,
      accessToken,
      refreshToken,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
      accountData: accountData || {},
      status: 'active',
      lastSyncAt: new Date()
    });

    await socialAccount.save();

    logger.info(`Social account connected: ${platform} - ${accountName} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Social account connected successfully',
      data: socialAccount
    });
  } catch (error) {
    logger.error('Error connecting social account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect social account',
      error: error.message
    });
  }
};

// Update social account
const updateSocialAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { accountId } = req.params;
    const { userId } = req.user;
    const updateData = req.body;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    // Update allowed fields
    const allowedFields = ['accountName', 'accessToken', 'refreshToken', 'tokenExpiresAt', 'accountData', 'status'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        account[field] = updateData[field];
      }
    });

    account.lastSyncAt = new Date();
    await account.save();

    logger.info(`Social account updated: ${account.platform} - ${account.accountName} by user ${userId}`);

    res.json({
      success: true,
      message: 'Social account updated successfully',
      data: account
    });
  } catch (error) {
    logger.error('Error updating social account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social account',
      error: error.message
    });
  }
};

// Disconnect social account
const disconnectSocialAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOneAndDelete({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    logger.info(`Social account disconnected: ${account.platform} - ${account.accountName} by user ${userId}`);

    res.json({
      success: true,
      message: 'Social account disconnected successfully'
    });
  } catch (error) {
    logger.error('Error disconnecting social account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect social account',
      error: error.message
    });
  }
};

// Refresh social account token
const refreshSocialAccountToken = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    if (!account.refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'No refresh token available for this account'
      });
    }

    // TODO: Implement platform-specific token refresh logic
    // This would involve calling the respective platform's token refresh API

    // For now, just update the last sync time
    account.lastSyncAt = new Date();
    await account.save();

    logger.info(`Social account token refreshed: ${account.platform} - ${account.accountName} by user ${userId}`);

    res.json({
      success: true,
      message: 'Social account token refreshed successfully',
      data: account
    });
  } catch (error) {
    logger.error('Error refreshing social account token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh social account token',
      error: error.message
    });
  }
};

// Sync social account data
const syncSocialAccountData = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    // TODO: Implement platform-specific data sync logic
    // This would involve calling the respective platform's API to fetch latest data

    account.lastSyncAt = new Date();
    await account.save();

    logger.info(`Social account data synced: ${account.platform} - ${account.accountName} by user ${userId}`);

    res.json({
      success: true,
      message: 'Social account data synced successfully',
      data: account
    });
  } catch (error) {
    logger.error('Error syncing social account data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync social account data',
      error: error.message
    });
  }
};

// Get social account analytics
const getSocialAccountAnalytics = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;
    const { startDate, endDate } = req.query;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    // TODO: Implement analytics fetching from platform APIs
    // This would involve calling the respective platform's analytics API

    const analytics = {
      followers: account.accountData.followers || 0,
      following: account.accountData.following || 0,
      posts: account.accountData.posts || 0,
      engagement: account.accountData.engagement || 0,
      reach: account.accountData.reach || 0,
      impressions: account.accountData.impressions || 0,
      lastUpdated: account.lastSyncAt
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching social account analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social account analytics',
      error: error.message
    });
  }
};

// Get connected platforms
const getConnectedPlatforms = async (req, res) => {
  try {
    const { userId } = req.user;

    const platforms = await SocialAccount.distinct('platform', { user: userId, status: 'active' });

    res.json({
      success: true,
      data: platforms
    });
  } catch (error) {
    logger.error('Error fetching connected platforms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connected platforms',
      error: error.message
    });
  }
};

// Get social account statistics
const getSocialAccountStats = async (req, res) => {
  try {
    const { userId } = req.user;

    const stats = await SocialAccount.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          byPlatform: {
            $push: {
              platform: '$platform',
              status: '$status'
            }
          }
        }
      }
    ]);

    const platformStats = await SocialAccount.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        active: stats[0]?.active || 0,
        byPlatform: platformStats
      }
    });
  } catch (error) {
    logger.error('Error fetching social account stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social account statistics',
      error: error.message
    });
  }
};

// Test social account connection
const testSocialAccountConnection = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    // TODO: Implement platform-specific connection test
    // This would involve calling the respective platform's API to verify the connection

    const isConnected = true; // Placeholder

    res.json({
      success: true,
      data: {
        isConnected,
        lastTested: new Date()
      }
    });
  } catch (error) {
    logger.error('Error testing social account connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test social account connection',
      error: error.message
    });
  }
};

// Debug endpoint to check OAuth session data
const debugOAuthSession = async (req, res) => {
  try {
    const { userId } = req.user;
    
    res.json({
      success: true,
      data: {
        userId,
        sessionId: req.sessionID,
        hasOAuthData: !!req.session.oauthData,
        oauthData: req.session.oauthData ? {
          platform: req.session.oauthData.platform,
          accountId: req.session.oauthData.accountId,
          accountName: req.session.oauthData.accountName,
          timestamp: req.session.oauthData.timestamp,
          dataAge: req.session.oauthData.timestamp ? Date.now() - req.session.oauthData.timestamp : null
        } : null,
        sessionKeys: Object.keys(req.session)
      }
    });
  } catch (error) {
    logger.error('Debug OAuth session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get social account by ID (alias for getSocialAccount)
const getSocialAccountById = getSocialAccount;

// Get account stats (alias for getSocialAccountStats)
const getAccountStats = getSocialAccountStats;

// Get accounts needing sync
const getAccountsNeedingSync = async (req, res) => {
  try {
    const { userId } = req.user;
    const { hours = 24 } = req.query;

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - parseInt(hours));

    const accounts = await SocialAccount.find({
      user: userId,
      status: 'active',
      $or: [
        { lastSyncAt: { $lt: cutoffTime } },
        { lastSyncAt: { $exists: false } }
      ]
    }).populate('user', 'firstName lastName email');

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    logger.error('Error fetching accounts needing sync:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts needing sync',
      error: error.message
    });
  }
};

// Refresh token (alias for refreshSocialAccountToken)
const refreshToken = refreshSocialAccountToken;

// Update analytics (alias for getSocialAccountAnalytics)
const updateAnalytics = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.user;
    const { analytics } = req.body;

    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }

    account.accountData = {
      ...account.accountData,
      ...analytics
    };
    account.lastSyncAt = new Date();
    await account.save();

    res.json({
      success: true,
      message: 'Analytics updated successfully',
      data: account
    });
  } catch (error) {
    logger.error('Error updating analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update analytics',
      error: error.message
    });
  }
};

// Sync account (alias for syncSocialAccountData)
const syncAccount = syncSocialAccountData;

module.exports = {
  initiateOAuth,
  handleOAuthCallback,
  completeOAuthConnection,
  getSocialAccounts,
  getSocialAccount,
  connectSocialAccount,
  updateSocialAccount,
  disconnectSocialAccount,
  refreshSocialAccountToken,
  syncSocialAccountData,
  getSocialAccountAnalytics,
  getConnectedPlatforms,
  getSocialAccountStats,
  testSocialAccountConnection,
  getSocialAccountById,
  getAccountStats,
  getAccountsNeedingSync,
  refreshToken,
  updateAnalytics,
  syncAccount,
  debugOAuthSession
};