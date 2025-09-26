const Redis = require('redis');
const logger = require('../utils/logger');

class RedisSetup {
  constructor() {
    this.client = null;
    this.subscriber = null;
    this.publisher = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      logger.info('Initializing Redis setup...');

      // Create Redis clients
      await this.createClients();
      
      // Setup Redis data structures
      await this.setupDataStructures();
      
      // Setup pub/sub channels
      await this.setupPubSubChannels();
      
      // Setup cache policies
      await this.setupCachePolicies();

      logger.info('Redis setup completed successfully');
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Redis setup failed' });
      throw error;
    }
  }

  async createClients() {
    const redisConfig = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.logError(new Error('Redis server refused connection'));
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.logError(new Error('Redis retry time exhausted'));
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.logError(new Error('Redis max retry attempts reached'));
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    };

    // Main Redis client
    this.client = Redis.createClient(redisConfig);
    
    // Subscriber client for pub/sub
    this.subscriber = Redis.createClient(redisConfig);
    
    // Publisher client for pub/sub
    this.publisher = Redis.createClient(redisConfig);

    // Setup error handlers
    this.client.on('error', (err) => {
      logger.logError(err, { context: 'Redis client error' });
    });

    this.subscriber.on('error', (err) => {
      logger.logError(err, { context: 'Redis subscriber error' });
    });

    this.publisher.on('error', (err) => {
      logger.logError(err, { context: 'Redis publisher error' });
    });

    // Connect all clients
    await Promise.all([
      this.client.connect(),
      this.subscriber.connect(),
      this.publisher.connect()
    ]);

    this.isConnected = true;
    logger.info('Redis clients connected successfully');
  }

  async setupDataStructures() {
    logger.info('Setting up Redis data structures...');

    // Setup key prefixes for different data types
    const keyPrefixes = {
      session: 'session:',
      cache: 'cache:',
      rateLimit: 'rate_limit:',
      queue: 'queue:',
      lock: 'lock:',
      notification: 'notification:',
      analytics: 'analytics:',
      websocket: 'ws:'
    };

    // Store key prefixes in Redis for reference
    await this.client.hSet('system:key_prefixes', keyPrefixes);

    // Setup default TTL values
    const defaultTTLs = {
      session: 86400, // 24 hours
      cache: 3600, // 1 hour
      rateLimit: 900, // 15 minutes
      notification: 604800, // 7 days
      analytics: 2592000, // 30 days
      websocket: 300 // 5 minutes
    };

    await this.client.hSet('system:default_ttls', defaultTTLs);

    // Initialize counters
    const counters = {
      'counter:total_requests': 0,
      'counter:total_users': 0,
      'counter:total_organizations': 0,
      'counter:active_sessions': 0,
      'counter:websocket_connections': 0
    };

    for (const [key, value] of Object.entries(counters)) {
      await this.client.set(key, value);
    }

    logger.info('Redis data structures setup completed');
  }

  async setupPubSubChannels() {
    logger.info('Setting up Redis pub/sub channels...');

    const channels = [
      // Admin panel channels
      'admin:user_activity',
      'admin:organization_activity', 
      'admin:system_metrics',
      'admin:security_alerts',
      
      // Customer channels
      'customer:content_updates',
      'customer:analytics_updates',
      'customer:ai_agent_updates',
      'customer:notifications',
      
      // System channels
      'system:health_checks',
      'system:performance_alerts',
      'system:backup_status',
      
      // AI agent channels
      'ai:task_queue',
      'ai:task_completed',
      'ai:agent_status',
      'ai:learning_updates'
    ];

    // Subscribe to all channels with the subscriber client
    for (const channel of channels) {
      await this.subscriber.subscribe(channel, (message, channel) => {
        logger.info(`Received message on channel ${channel}:`, { message });
      });
    }

    // Store active channels list
    await this.client.sAdd('system:active_channels', channels);

    logger.info(`Setup ${channels.length} pub/sub channels`);
  }

  async setupCachePolicies() {
    logger.info('Setting up Redis cache policies...');

    // Cache policies for different data types
    const cachePolicies = {
      user_profile: {
        ttl: 3600, // 1 hour
        pattern: 'cache:user:profile:*',
        maxSize: 1000
      },
      organization_data: {
        ttl: 1800, // 30 minutes
        pattern: 'cache:org:*',
        maxSize: 500
      },
      analytics_dashboard: {
        ttl: 900, // 15 minutes
        pattern: 'cache:analytics:dashboard:*',
        maxSize: 200
      },
      content_list: {
        ttl: 600, // 10 minutes
        pattern: 'cache:content:list:*',
        maxSize: 1000
      },
      ai_agent_status: {
        ttl: 300, // 5 minutes
        pattern: 'cache:ai:status:*',
        maxSize: 100
      }
    };

    // Store cache policies
    for (const [type, policy] of Object.entries(cachePolicies)) {
      await this.client.hSet(`cache_policy:${type}`, policy);
    }

    // Setup cache cleanup job (runs every hour)
    setInterval(async () => {
      await this.cleanupExpiredCache();
    }, 3600000); // 1 hour

    logger.info('Cache policies setup completed');
  }

  async cleanupExpiredCache() {
    try {
      logger.info('Running Redis cache cleanup...');
      
      const patterns = [
        'cache:*',
        'session:*',
        'rate_limit:*',
        'notification:*'
      ];

      let totalCleaned = 0;

      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        
        for (const key of keys) {
          const ttl = await this.client.ttl(key);
          if (ttl === -1) { // Key exists but has no TTL
            await this.client.expire(key, 3600); // Set default 1 hour TTL
          } else if (ttl === -2) { // Key doesn't exist
            totalCleaned++;
          }
        }
      }

      logger.info(`Cache cleanup completed, cleaned ${totalCleaned} expired keys`);
    } catch (error) {
      logger.logError(error, { context: 'Redis cache cleanup failed' });
    }
  }

  // Utility methods for common Redis operations
  async cacheSet(key, value, ttl = 3600) {
    try {
      const cacheKey = `cache:${key}`;
      await this.client.setEx(cacheKey, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Redis cache set failed', key });
      return false;
    }
  }

  async cacheGet(key) {
    try {
      const cacheKey = `cache:${key}`;
      const value = await this.client.get(cacheKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.logError(error, { context: 'Redis cache get failed', key });
      return null;
    }
  }

  async cacheDelete(key) {
    try {
      const cacheKey = `cache:${key}`;
      await this.client.del(cacheKey);
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Redis cache delete failed', key });
      return false;
    }
  }

  async sessionSet(sessionId, data, ttl = 86400) {
    try {
      const sessionKey = `session:${sessionId}`;
      await this.client.setEx(sessionKey, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Redis session set failed', sessionId });
      return false;
    }
  }

  async sessionGet(sessionId) {
    try {
      const sessionKey = `session:${sessionId}`;
      const data = await this.client.get(sessionKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.logError(error, { context: 'Redis session get failed', sessionId });
      return null;
    }
  }

  async sessionDelete(sessionId) {
    try {
      const sessionKey = `session:${sessionId}`;
      await this.client.del(sessionKey);
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Redis session delete failed', sessionId });
      return false;
    }
  }

  async publishMessage(channel, message) {
    try {
      await this.publisher.publish(channel, JSON.stringify(message));
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Redis publish failed', channel });
      return false;
    }
  }

  async incrementCounter(key, increment = 1) {
    try {
      const counterKey = `counter:${key}`;
      const newValue = await this.client.incrBy(counterKey, increment);
      return newValue;
    } catch (error) {
      logger.logError(error, { context: 'Redis counter increment failed', key });
      return null;
    }
  }

  async getCounter(key) {
    try {
      const counterKey = `counter:${key}`;
      const value = await this.client.get(counterKey);
      return value ? parseInt(value) : 0;
    } catch (error) {
      logger.logError(error, { context: 'Redis counter get failed', key });
      return 0;
    }
  }

  async setLock(key, ttl = 300) {
    try {
      const lockKey = `lock:${key}`;
      const result = await this.client.setNX(lockKey, Date.now().toString());
      if (result) {
        await this.client.expire(lockKey, ttl);
        return true;
      }
      return false;
    } catch (error) {
      logger.logError(error, { context: 'Redis lock set failed', key });
      return false;
    }
  }

  async releaseLock(key) {
    try {
      const lockKey = `lock:${key}`;
      await this.client.del(lockKey);
      return true;
    } catch (error) {
      logger.logError(error, { context: 'Redis lock release failed', key });
      return false;
    }
  }

  async getRedisInfo() {
    try {
      const info = await this.client.info();
      const memory = await this.client.info('memory');
      const stats = await this.client.info('stats');
      
      return {
        connected: this.isConnected,
        info: info,
        memory: memory,
        stats: stats,
        keyCount: await this.client.dbSize()
      };
    } catch (error) {
      logger.logError(error, { context: 'Failed to get Redis info' });
      return { connected: false, error: error.message };
    }
  }

  async healthCheck() {
    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      
      const keyCount = await this.client.dbSize();
      const memory = await this.client.info('memory');
      
      return {
        status: 'healthy',
        latency: `${latency}ms`,
        keyCount,
        memory: memory.split('\r\n').find(line => line.startsWith('used_memory_human'))?.split(':')[1]
      };
    } catch (error) {
      logger.logError(error, { context: 'Redis health check failed' });
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async disconnect() {
    try {
      if (this.client) await this.client.disconnect();
      if (this.subscriber) await this.subscriber.disconnect();
      if (this.publisher) await this.publisher.disconnect();
      
      this.isConnected = false;
      logger.info('Redis clients disconnected');
    } catch (error) {
      logger.logError(error, { context: 'Redis disconnect failed' });
    }
  }
}

module.exports = RedisSetup;

