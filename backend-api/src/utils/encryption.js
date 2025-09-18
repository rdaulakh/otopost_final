const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const logger = require('./logger');

class EncryptionManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    
    // Get encryption key from environment
    this.encryptionKey = process.env.ENCRYPTION_KEY;
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    if (this.encryptionKey.length !== this.keyLength) {
      throw new Error(`ENCRYPTION_KEY must be exactly ${this.keyLength} characters long`);
    }
  }

  // Password hashing methods
  async hashPassword(password) {
    try {
      if (!password) {
        throw new Error('Password is required');
      }
      
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      return hashedPassword;
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Password hashing failed');
    }
  }

  async verifyPassword(password, hashedPassword) {
    try {
      if (!password || !hashedPassword) {
        return false;
      }
      
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Error verifying password:', error);
      return false;
    }
  }

  // Symmetric encryption methods for sensitive data
  encrypt(text) {
    try {
      if (!text) {
        return null;
      }

      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine iv, tag, and encrypted data
      const result = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
      
      return result;
    } catch (error) {
      logger.error('Error encrypting data:', error);
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedData) {
    try {
      if (!encryptedData) {
        return null;
      }

      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Error decrypting data:', error);
      throw new Error('Decryption failed');
    }
  }

  // Social media token encryption (for storing API tokens securely)
  encryptSocialToken(token, platform) {
    try {
      const data = JSON.stringify({
        token,
        platform,
        timestamp: Date.now()
      });
      
      return this.encrypt(data);
    } catch (error) {
      logger.error('Error encrypting social token:', error);
      throw new Error('Social token encryption failed');
    }
  }

  decryptSocialToken(encryptedToken) {
    try {
      const decryptedData = this.decrypt(encryptedToken);
      if (!decryptedData) {
        return null;
      }
      
      return JSON.parse(decryptedData);
    } catch (error) {
      logger.error('Error decrypting social token:', error);
      return null;
    }
  }

  // Payment information encryption
  encryptPaymentInfo(paymentData) {
    try {
      const data = JSON.stringify({
        ...paymentData,
        timestamp: Date.now()
      });
      
      return this.encrypt(data);
    } catch (error) {
      logger.error('Error encrypting payment info:', error);
      throw new Error('Payment info encryption failed');
    }
  }

  decryptPaymentInfo(encryptedPaymentInfo) {
    try {
      const decryptedData = this.decrypt(encryptedPaymentInfo);
      if (!decryptedData) {
        return null;
      }
      
      return JSON.parse(decryptedData);
    } catch (error) {
      logger.error('Error decrypting payment info:', error);
      return null;
    }
  }

  // Personal data encryption (for GDPR compliance)
  encryptPersonalData(personalData) {
    try {
      if (typeof personalData === 'object') {
        personalData = JSON.stringify(personalData);
      }
      
      return this.encrypt(personalData);
    } catch (error) {
      logger.error('Error encrypting personal data:', error);
      throw new Error('Personal data encryption failed');
    }
  }

  decryptPersonalData(encryptedPersonalData) {
    try {
      const decryptedData = this.decrypt(encryptedPersonalData);
      if (!decryptedData) {
        return null;
      }
      
      try {
        return JSON.parse(decryptedData);
      } catch {
        return decryptedData;
      }
    } catch (error) {
      logger.error('Error decrypting personal data:', error);
      return null;
    }
  }

  // Generate secure random tokens
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  // Hash sensitive data for comparison (one-way)
  hashSensitiveData(data) {
    try {
      return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
      logger.error('Error hashing sensitive data:', error);
      throw new Error('Data hashing failed');
    }
  }

  // Generate HMAC for data integrity
  generateHMAC(data, secret = null) {
    try {
      const hmacSecret = secret || this.encryptionKey;
      return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
    } catch (error) {
      logger.error('Error generating HMAC:', error);
      throw new Error('HMAC generation failed');
    }
  }

  verifyHMAC(data, hmac, secret = null) {
    try {
      const expectedHmac = this.generateHMAC(data, secret);
      return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'));
    } catch (error) {
      logger.error('Error verifying HMAC:', error);
      return false;
    }
  }

  // Encrypt database connection strings
  encryptConnectionString(connectionString) {
    try {
      return this.encrypt(connectionString);
    } catch (error) {
      logger.error('Error encrypting connection string:', error);
      throw new Error('Connection string encryption failed');
    }
  }

  decryptConnectionString(encryptedConnectionString) {
    try {
      return this.decrypt(encryptedConnectionString);
    } catch (error) {
      logger.error('Error decrypting connection string:', error);
      throw new Error('Connection string decryption failed');
    }
  }

  // Encrypt API keys
  encryptAPIKey(apiKey, service) {
    try {
      const data = JSON.stringify({
        apiKey,
        service,
        timestamp: Date.now()
      });
      
      return this.encrypt(data);
    } catch (error) {
      logger.error('Error encrypting API key:', error);
      throw new Error('API key encryption failed');
    }
  }

  decryptAPIKey(encryptedAPIKey) {
    try {
      const decryptedData = this.decrypt(encryptedAPIKey);
      if (!decryptedData) {
        return null;
      }
      
      return JSON.parse(decryptedData);
    } catch (error) {
      logger.error('Error decrypting API key:', error);
      return null;
    }
  }

  // Generate encryption key (for setup)
  static generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Validate encryption key format
  static validateEncryptionKey(key) {
    if (!key) {
      return false;
    }
    
    if (key.length !== 64) { // 32 bytes = 64 hex characters
      return false;
    }
    
    // Check if it's valid hex
    return /^[0-9a-fA-F]+$/.test(key);
  }

  // Secure data comparison (timing-safe)
  secureCompare(a, b) {
    try {
      if (a.length !== b.length) {
        return false;
      }
      
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch (error) {
      return false;
    }
  }

  // Generate salt for additional security
  generateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Key derivation function
  deriveKey(password, salt, iterations = 100000, keyLength = 32) {
    try {
      return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
    } catch (error) {
      logger.error('Error deriving key:', error);
      throw new Error('Key derivation failed');
    }
  }
}

// Export singleton instance
const encryptionManager = new EncryptionManager();
module.exports = encryptionManager;

