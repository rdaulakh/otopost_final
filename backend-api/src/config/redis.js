const redis = require('redis');
const logger = require('../utils/logger');

class RedisConnection {
  constructor() {
    this.client = null;
    this.subscriber = null;
    this.publisher = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        logger.info('Redis already connected');
        return this.client;
      }

      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      };

      // Create main client
      this.client = redis.createClient({
        socket: {
          host: redisConfig.host,
          port: redisConfig.port,
          connectTimeout: redisConfig.connectTimeout,
          commandTimeout: redisConfig.commandTimeout,
          keepAlive: redisConfig.keepAlive
        },
        password: redisConfig.password,
        database: 0,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          logger.warn(`Redis retry attempt ${times}, delay: ${delay}ms`);
          return delay;
        }
      });

      // Create subscriber client for pub/sub
      this.subscriber = redis.createClient({
        socket: {
          host: redisConfig.host,
          port: redisConfig.port,
          connectTimeout: redisConfig.connectTimeout,
          commandTimeout: redisConfig.commandTimeout,
          keepAlive: redisConfig.keepAlive
        },
        password: redisConfig.password,
        database: 0
      });

      // Create publisher client for pub/sub
      this.publisher = redis.createClient({
        socket: {
          host: redisConfig.host,
          port: redisConfig.port,
          connectTimeout: redisConfig.connectTimeout,
          commandTimeout: redisConfig.commandTimeout,
          keepAlive: redisConfig.keepAlive
        },
        password: redisConfig.password,
        database: 0
      });

      // Event handlers for main client
      this.client.on('connect', () => {
        logger.info('Redis client connecting...');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.warn('Redis client connection ended');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting...');
      });

      // Event handlers for subscriber
      this.subscriber.on('error', (err) => {
        logger.error('Redis subscriber error:', err);
      });

      this.subscriber.on('ready', () => {
        logger.info('Redis subscriber ready');
      });

      // Event handlers for publisher
      this.publisher.on('error', (err) => {
        logger.error('Redis publisher error:', err);
      });

      this.publisher.on('ready', () => {
        logger.info('Redis publisher ready');
      });

      // Connect all clients
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect()
      ]);

      logger.info('Redis connected successfully', {
        host: redisConfig.host,
        port: redisConfig.port,
        database: 0
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
      });

      return this.client;

    } catch (error) {
      logger.error('Redis connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      const disconnectPromises = [];

      if (this.client) {
        disconnectPromises.push(this.client.quit());
      }
      if (this.subscriber) {
        disconnectPromises.push(this.subscriber.quit());
      }
      if (this.publisher) {
        disconnectPromises.push(this.publisher.quit());
      }

      await Promise.all(disconnectPromises);
      
      this.isConnected = false;
      logger.info('Redis disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  getClient() {
    return this.client;
  }

  getSubscriber() {
    return this.subscriber;
  }

  getPublisher() {
    return this.publisher;
  }

  isHealthy() {
    return this.isConnected && this.client && this.client.isReady;
  }

  async getStats() {
    try {
      if (!this.isConnected || !this.client) {
        return { status: 'disconnected' };
      }

      const info = await this.client.info();
      const memory = await this.client.info('memory');
      const stats = await this.client.info('stats');

      return {
        status: 'connected',
        uptime: this.parseRedisInfo(info, 'uptime_in_seconds'),
        connected_clients: this.parseRedisInfo(info, 'connected_clients'),
        used_memory: this.parseRedisInfo(memory, 'used_memory_human'),
        used_memory_peak: this.parseRedisInfo(memory, 'used_memory_peak_human'),
        total_commands_processed: this.parseRedisInfo(stats, 'total_commands_processed'),
        instantaneous_ops_per_sec: this.parseRedisInfo(stats, 'instantaneous_ops_per_sec')
      };
    } catch (error) {
      logger.error('Error getting Redis stats:', error);
      return { status: 'error', error: error.message };
    }
  }

  parseRedisInfo(info, key) {
    const lines = info.split('\r\n');
    for (const line of lines) {
      if (line.startsWith(key + ':')) {
        return line.split(':')[1];
      }
    }
    return null;
  }

  // Cache methods
  async set(key, value, expireInSeconds = null) {
    try {
      const serializedValue = JSON.stringify(value);
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  // Pub/Sub methods
  async publish(channel, message) {
    try {
      const serializedMessage = JSON.stringify(message);
      await this.publisher.publish(channel, serializedMessage);
      return true;
    } catch (error) {
      logger.error('Redis PUBLISH error:', error);
      return false;
    }
  }

  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          logger.error('Error parsing Redis message:', error);
          callback(message);
        }
      });
      return true;
    } catch (error) {
      logger.error('Redis SUBSCRIBE error:', error);
      return false;
    }
  }

  async unsubscribe(channel) {
    try {
      await this.subscriber.unsubscribe(channel);
      return true;
    } catch (error) {
      logger.error('Redis UNSUBSCRIBE error:', error);
      return false;
    }
  }

  // Session methods
  async setSession(sessionId, sessionData, expireInSeconds = 86400) {
    return await this.set(`session:${sessionId}`, sessionData, expireInSeconds);
  }

  async getSession(sessionId) {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return await this.del(`session:${sessionId}`);
  }

  // Rate limiting methods
  async incrementRateLimit(key, windowInSeconds, maxRequests) {
    try {
      const current = await this.client.incr(key);
      if (current === 1) {
        await this.client.expire(key, windowInSeconds);
      }
      return {
        current,
        remaining: Math.max(0, maxRequests - current),
        resetTime: Date.now() + (windowInSeconds * 1000)
      };
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      return { current: 0, remaining: maxRequests, resetTime: Date.now() };
    }
  }
}

// Export singleton instance
const redisConnection = new RedisConnection();
module.exports = redisConnection;

