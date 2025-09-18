const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

class JWTManager {
  constructor() {
    // Customer JWT configuration
    this.customerSecret = process.env.JWT_SECRET;
    this.customerRefreshSecret = process.env.JWT_REFRESH_SECRET;
    this.customerExpire = process.env.JWT_EXPIRE || '24h';
    this.customerRefreshExpire = process.env.JWT_REFRESH_EXPIRE || '7d';

    // Admin JWT configuration (separate from customer)
    this.adminSecret = process.env.ADMIN_JWT_SECRET;
    this.adminRefreshSecret = process.env.ADMIN_JWT_REFRESH_SECRET;
    this.adminExpire = process.env.ADMIN_JWT_EXPIRE || '8h';
    this.adminRefreshExpire = process.env.ADMIN_JWT_REFRESH_EXPIRE || '24h';

    // Validate required secrets
    this.validateSecrets();
  }

  validateSecrets() {
    const requiredSecrets = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'ADMIN_JWT_SECRET',
      'ADMIN_JWT_REFRESH_SECRET'
    ];

    for (const secret of requiredSecrets) {
      if (!process.env[secret]) {
        throw new Error(`${secret} environment variable is required`);
      }
    }
  }

  // Customer JWT methods
  generateCustomerTokens(payload) {
    try {
      const tokenPayload = {
        ...payload,
        type: 'customer',
        iat: Math.floor(Date.now() / 1000)
      };

      const accessToken = jwt.sign(tokenPayload, this.customerSecret, {
        expiresIn: this.customerExpire,
        issuer: 'ai-social-media-platform',
        audience: 'customer'
      });

      const refreshToken = jwt.sign(
        { 
          userId: payload.userId,
          organizationId: payload.organizationId,
          type: 'customer-refresh',
          iat: Math.floor(Date.now() / 1000)
        },
        this.customerRefreshSecret,
        {
          expiresIn: this.customerRefreshExpire,
          issuer: 'ai-social-media-platform',
          audience: 'customer'
        }
      );

      return {
        accessToken,
        refreshToken,
        expiresIn: this.customerExpire,
        tokenType: 'Bearer'
      };
    } catch (error) {
      logger.error('Error generating customer tokens:', error);
      throw new Error('Token generation failed');
    }
  }

  verifyCustomerToken(token) {
    try {
      const decoded = jwt.verify(token, this.customerSecret, {
        issuer: 'ai-social-media-platform',
        audience: 'customer'
      });

      if (decoded.type !== 'customer') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  verifyCustomerRefreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.customerRefreshSecret, {
        issuer: 'ai-social-media-platform',
        audience: 'customer'
      });

      if (decoded.type !== 'customer-refresh') {
        throw new Error('Invalid refresh token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  // Admin JWT methods
  generateAdminTokens(payload) {
    try {
      const tokenPayload = {
        ...payload,
        type: 'admin',
        iat: Math.floor(Date.now() / 1000)
      };

      const accessToken = jwt.sign(tokenPayload, this.adminSecret, {
        expiresIn: this.adminExpire,
        issuer: 'ai-social-media-platform',
        audience: 'admin'
      });

      const refreshToken = jwt.sign(
        { 
          adminId: payload.adminId,
          role: payload.role,
          type: 'admin-refresh',
          iat: Math.floor(Date.now() / 1000)
        },
        this.adminRefreshSecret,
        {
          expiresIn: this.adminRefreshExpire,
          issuer: 'ai-social-media-platform',
          audience: 'admin'
        }
      );

      return {
        accessToken,
        refreshToken,
        expiresIn: this.adminExpire,
        tokenType: 'Bearer'
      };
    } catch (error) {
      logger.error('Error generating admin tokens:', error);
      throw new Error('Admin token generation failed');
    }
  }

  verifyAdminToken(token) {
    try {
      const decoded = jwt.verify(token, this.adminSecret, {
        issuer: 'ai-social-media-platform',
        audience: 'admin'
      });

      if (decoded.type !== 'admin') {
        throw new Error('Invalid admin token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Admin token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid admin token');
      }
      throw error;
    }
  }

  verifyAdminRefreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.adminRefreshSecret, {
        issuer: 'ai-social-media-platform',
        audience: 'admin'
      });

      if (decoded.type !== 'admin-refresh') {
        throw new Error('Invalid admin refresh token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Admin refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid admin refresh token');
      }
      throw error;
    }
  }

  // Utility methods
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  generateResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return {
      token,
      hashedToken,
      expiresAt
    };
  }

  verifyResetToken(token, hashedToken) {
    const hashedInputToken = crypto.createHash('sha256').update(token).digest('hex');
    return hashedInputToken === hashedToken;
  }

  generateEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      token,
      hashedToken,
      expiresAt
    };
  }

  // Session management
  generateSessionId() {
    return crypto.randomUUID();
  }

  // API Key generation for third-party integrations
  generateAPIKey(prefix = 'sk') {
    const randomPart = crypto.randomBytes(24).toString('base64url');
    return `${prefix}_${randomPart}`;
  }

  // Token blacklist methods (for logout)
  generateTokenId() {
    return crypto.randomUUID();
  }

  // Decode token without verification (for debugging)
  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }

  // Get token expiration time
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      logger.error('Error getting token expiration:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      return expiration < new Date();
    } catch (error) {
      return true;
    }
  }

  // Refresh customer tokens
  async refreshCustomerTokens(refreshToken, userService) {
    try {
      const decoded = this.verifyCustomerRefreshToken(refreshToken);
      
      // Get fresh user data
      const user = await userService.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const payload = {
        userId: user._id,
        organizationId: user.organizationId,
        email: user.email,
        role: user.role
      };

      return this.generateCustomerTokens(payload);
    } catch (error) {
      logger.error('Error refreshing customer tokens:', error);
      throw error;
    }
  }

  // Refresh admin tokens
  async refreshAdminTokens(refreshToken, adminService) {
    try {
      const decoded = this.verifyAdminRefreshToken(refreshToken);
      
      // Get fresh admin data
      const admin = await adminService.findById(decoded.adminId);
      if (!admin || !admin.isActive) {
        throw new Error('Admin not found or inactive');
      }

      // Generate new tokens
      const payload = {
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      };

      return this.generateAdminTokens(payload);
    } catch (error) {
      logger.error('Error refreshing admin tokens:', error);
      throw error;
    }
  }
}

// Export singleton instance
const jwtManager = new JWTManager();
module.exports = jwtManager;

