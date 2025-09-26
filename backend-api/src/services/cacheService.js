const redis = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Cache Service
 * Handles Redis caching operations with fallback to memory cache
 */

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 3600; // 1 hour in seconds
    this.isRedisConnected = false;
    this.checkRedisConnection();
  }

  // Check Redis connection
  async checkRedisConnection() {
    try {
      await redis.ping();
      this.isRedisConnected = true;
      logger.info('Redis connection established');
    } catch (error) {
      this.isRedisConnected = false;
      logger.warn('Redis connection failed, using memory cache:', error.message);
    }
  }

  // Set cache value
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (this.isRedisConnected) {
        await redis.setex(key, ttl, serializedValue);
      } else {
        // Fallback to memory cache
        this.memoryCache.set(key, {
          value: serializedValue,
          expiresAt: Date.now() + (ttl * 1000)
        });
      }
      
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error(`Error setting cache for key ${key}:`, error);
      return false;
    }
  }

  // Get cache value
  async get(key) {
    try {
      let value = null;
      
      if (this.isRedisConnected) {
        value = await redis.get(key);
      } else {
        // Fallback to memory cache
        const cached = this.memoryCache.get(key);
        if (cached) {
          if (cached.expiresAt > Date.now()) {
            value = cached.value;
          } else {
            this.memoryCache.delete(key);
          }
        }
      }
      
      if (value) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(value);
      } else {
        logger.debug(`Cache miss: ${key}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  // Delete cache value
  async del(key) {
    try {
      if (this.isRedisConnected) {
        await redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
      
      logger.debug(`Cache deleted: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting cache for key ${key}:`, error);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      if (this.isRedisConnected) {
        const result = await redis.exists(key);
        return result === 1;
      } else {
        const cached = this.memoryCache.get(key);
        return cached && cached.expiresAt > Date.now();
      }
    } catch (error) {
      logger.error(`Error checking cache existence for key ${key}:`, error);
      return false;
    }
  }

  // Set cache with expiration
  async setex(key, value, ttl) {
    return this.set(key, value, ttl);
  }

  // Get multiple keys
  async mget(keys) {
    try {
      if (this.isRedisConnected) {
        const values = await redis.mget(keys);
        return values.map(value => value ? JSON.parse(value) : null);
      } else {
        return keys.map(key => {
          const cached = this.memoryCache.get(key);
          if (cached && cached.expiresAt > Date.now()) {
            return JSON.parse(cached.value);
          }
          return null;
        });
      }
    } catch (error) {
      logger.error(`Error getting multiple cache keys:`, error);
      return keys.map(() => null);
    }
  }

  // Set multiple keys
  async mset(keyValuePairs, ttl = this.defaultTTL) {
    try {
      if (this.isRedisConnected) {
        const pipeline = redis.pipeline();
        keyValuePairs.forEach(([key, value]) => {
          pipeline.setex(key, ttl, JSON.stringify(value));
        });
        await pipeline.exec();
      } else {
        keyValuePairs.forEach(([key, value]) => {
          this.memoryCache.set(key, {
            value: JSON.stringify(value),
            expiresAt: Date.now() + (ttl * 1000)
          });
        });
      }
      
      logger.debug(`Cache mset: ${keyValuePairs.length} keys`);
      return true;
    } catch (error) {
      logger.error(`Error setting multiple cache keys:`, error);
      return false;
    }
  }

  // Increment counter
  async incr(key, ttl = this.defaultTTL) {
    try {
      if (this.isRedisConnected) {
        const result = await redis.incr(key);
        await redis.expire(key, ttl);
        return result;
      } else {
        const cached = this.memoryCache.get(key);
        const currentValue = cached ? parseInt(cached.value) : 0;
        const newValue = currentValue + 1;
        this.memoryCache.set(key, {
          value: newValue.toString(),
          expiresAt: Date.now() + (ttl * 1000)
        });
        return newValue;
      }
    } catch (error) {
      logger.error(`Error incrementing cache counter for key ${key}:`, error);
      return 0;
    }
  }

  // Decrement counter
  async decr(key, ttl = this.defaultTTL) {
    try {
      if (this.isRedisConnected) {
        const result = await redis.decr(key);
        await redis.expire(key, ttl);
        return result;
      } else {
        const cached = this.memoryCache.get(key);
        const currentValue = cached ? parseInt(cached.value) : 0;
        const newValue = Math.max(0, currentValue - 1);
        this.memoryCache.set(key, {
          value: newValue.toString(),
          expiresAt: Date.now() + (ttl * 1000)
        });
        return newValue;
      }
    } catch (error) {
      logger.error(`Error decrementing cache counter for key ${key}:`, error);
      return 0;
    }
  }

  // Get or set cache value
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    try {
      let value = await this.get(key);
      
      if (value === null) {
        value = await fetchFunction();
        if (value !== null && value !== undefined) {
          await this.set(key, value, ttl);
        }
      }
      
      return value;
    } catch (error) {
      logger.error(`Error in getOrSet for key ${key}:`, error);
      return null;
    }
  }

  // Clear all cache
  async clear() {
    try {
      if (this.isRedisConnected) {
        await redis.flushdb();
      } else {
        this.memoryCache.clear();
      }
      
      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing cache:', error);
      return false;
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      if (this.isRedisConnected) {
        const info = await redis.info('memory');
        const keyspace = await redis.info('keyspace');
        return {
          type: 'redis',
          connected: true,
          info: info,
          keyspace: keyspace
        };
      } else {
        return {
          type: 'memory',
          connected: true,
          size: this.memoryCache.size,
          keys: Array.from(this.memoryCache.keys())
        };
      }
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        type: 'unknown',
        connected: false,
        error: error.message
      };
    }
  }

  // Set hash field
  async hset(key, field, value, ttl = this.defaultTTL) {
    try {
      if (this.isRedisConnected) {
        await redis.hset(key, field, JSON.stringify(value));
        await redis.expire(key, ttl);
      } else {
        const hashKey = `${key}:${field}`;
        this.memoryCache.set(hashKey, {
          value: JSON.stringify(value),
          expiresAt: Date.now() + (ttl * 1000)
        });
      }
      
      logger.debug(`Cache hset: ${key}.${field}`);
      return true;
    } catch (error) {
      logger.error(`Error setting hash field ${key}.${field}:`, error);
      return false;
    }
  }

  // Get hash field
  async hget(key, field) {
    try {
      if (this.isRedisConnected) {
        const value = await redis.hget(key, field);
        return value ? JSON.parse(value) : null;
      } else {
        const hashKey = `${key}:${field}`;
        const cached = this.memoryCache.get(hashKey);
        if (cached && cached.expiresAt > Date.now()) {
          return JSON.parse(cached.value);
        }
        return null;
      }
    } catch (error) {
      logger.error(`Error getting hash field ${key}.${field}:`, error);
      return null;
    }
  }

  // Get all hash fields
  async hgetall(key) {
    try {
      if (this.isRedisConnected) {
        const hash = await redis.hgetall(key);
        const result = {};
        for (const [field, value] of Object.entries(hash)) {
          result[field] = JSON.parse(value);
        }
        return result;
      } else {
        const result = {};
        for (const [cacheKey, cached] of this.memoryCache.entries()) {
          if (cacheKey.startsWith(`${key}:`) && cached.expiresAt > Date.now()) {
            const field = cacheKey.replace(`${key}:`, '');
            result[field] = JSON.parse(cached.value);
          }
        }
        return result;
      }
    } catch (error) {
      logger.error(`Error getting all hash fields for key ${key}:`, error);
      return {};
    }
  }

  // Delete hash field
  async hdel(key, field) {
    try {
      if (this.isRedisConnected) {
        await redis.hdel(key, field);
      } else {
        const hashKey = `${key}:${field}`;
        this.memoryCache.delete(hashKey);
      }
      
      logger.debug(`Cache hdel: ${key}.${field}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting hash field ${key}.${field}:`, error);
      return false;
    }
  }

  // Set with tags for easy invalidation
  async setWithTags(key, value, tags = [], ttl = this.defaultTTL) {
    try {
      await this.set(key, value, ttl);
      
      // Store tags for this key
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const existingKeys = await this.get(tagKey) || [];
        if (!existingKeys.includes(key)) {
          existingKeys.push(key);
          await this.set(tagKey, existingKeys, ttl);
        }
      }
      
      return true;
    } catch (error) {
      logger.error(`Error setting cache with tags for key ${key}:`, error);
      return false;
    }
  }

  // Invalidate by tag
  async invalidateByTag(tag) {
    try {
      const tagKey = `tag:${tag}`;
      const keys = await this.get(tagKey) || [];
      
      for (const key of keys) {
        await this.del(key);
      }
      
      await this.del(tagKey);
      logger.info(`Cache invalidated for tag: ${tag} (${keys.length} keys)`);
      return true;
    } catch (error) {
      logger.error(`Error invalidating cache by tag ${tag}:`, error);
      return false;
    }
  }

  // Clean expired memory cache entries
  cleanExpiredEntries() {
    try {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, cached] of this.memoryCache.entries()) {
        if (cached.expiresAt <= now) {
          this.memoryCache.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        logger.debug(`Cleaned ${cleaned} expired cache entries`);
      }
      
      return cleaned;
    } catch (error) {
      logger.error('Error cleaning expired cache entries:', error);
      return 0;
    }
  }

  // Start periodic cleanup
  startCleanup(intervalMs = 300000) { // 5 minutes
    setInterval(() => {
      this.cleanExpiredEntries();
    }, intervalMs);
    
    logger.info(`Cache cleanup started with ${intervalMs}ms interval`);
  }
}

module.exports = new CacheService();

