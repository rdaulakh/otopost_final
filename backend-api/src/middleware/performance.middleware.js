const logger = require('../utils/logger');
const redisConnection = require('../config/redis');

/**
 * Advanced performance monitoring middleware
 */

// Performance metrics storage
const performanceMetrics = {
  requests: new Map(),
  responses: new Map(),
  errors: new Map(),
  slowQueries: new Map()
};

// Performance thresholds
const THRESHOLDS = {
  SLOW_REQUEST: 1000, // 1 second
  VERY_SLOW_REQUEST: 5000, // 5 seconds
  HIGH_MEMORY_USAGE: 100 * 1024 * 1024, // 100MB
  HIGH_CPU_USAGE: 80, // 80%
  ERROR_RATE_THRESHOLD: 0.05, // 5%
  RESPONSE_TIME_P95: 2000, // 2 seconds
  RESPONSE_TIME_P99: 5000 // 5 seconds
};

/**
 * Performance monitoring middleware
 */
const performanceMonitor = (options = {}) => {
  return (req, res, next) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    const requestId = req.headers['x-request-id'] || generateRequestId();
    
    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);
    
    // Store request metrics
    const requestMetrics = {
      id: requestId,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?._id,
      organizationId: req.organization?._id,
      startTime,
      startMemory,
      timestamp: new Date()
    };
    
    performanceMetrics.requests.set(requestId, requestMetrics);
    
    // Override res.end to capture response metrics
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      const duration = endTime - startTime;
      
      // Calculate response metrics
      const responseMetrics = {
        ...requestMetrics,
        endTime,
        duration,
        statusCode: res.statusCode,
        contentLength: res.get('Content-Length') || 0,
        endMemory,
        memoryDelta: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external
        }
      };
      
      // Store response metrics
      performanceMetrics.responses.set(requestId, responseMetrics);
      
      // Check for slow requests
      if (duration > THRESHOLDS.SLOW_REQUEST) {
        logSlowRequest(responseMetrics);
      }
      
      // Check for errors
      if (res.statusCode >= 400) {
        logError(responseMetrics);
      }
      
      // Update performance statistics
      updatePerformanceStats(responseMetrics);
      
      // Clean up old metrics
      cleanupOldMetrics();
      
      // Call original end
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

/**
 * Database query performance monitoring
 */
const queryPerformanceMonitor = (options = {}) => {
  return (req, res, next) => {
    const originalQuery = mongoose.Query.prototype.exec;
    const originalAggregate = mongoose.Aggregate.prototype.exec;
    
    // Monitor regular queries
    mongoose.Query.prototype.exec = function() {
      const startTime = Date.now();
      const query = this;
      
      return originalQuery.apply(this, arguments).then(result => {
        const duration = Date.now() - startTime;
        
        if (duration > THRESHOLDS.SLOW_REQUEST) {
          logSlowQuery({
            type: 'query',
            collection: query.model.collection.name,
            filter: query.getFilter(),
            options: query.getOptions(),
            duration,
            timestamp: new Date()
          });
        }
        
        return result;
      }).catch(error => {
        const duration = Date.now() - startTime;
        logQueryError({
          type: 'query',
          collection: query.model.collection.name,
          filter: query.getFilter(),
          error: error.message,
          duration,
          timestamp: new Date()
        });
        throw error;
      });
    };
    
    // Monitor aggregation queries
    mongoose.Aggregate.prototype.exec = function() {
      const startTime = Date.now();
      const aggregate = this;
      
      return originalAggregate.apply(this, arguments).then(result => {
        const duration = Date.now() - startTime;
        
        if (duration > THRESHOLDS.SLOW_REQUEST) {
          logSlowQuery({
            type: 'aggregate',
            collection: aggregate.model.collection.name,
            pipeline: aggregate.pipeline(),
            duration,
            timestamp: new Date()
          });
        }
        
        return result;
      }).catch(error => {
        const duration = Date.now() - startTime;
        logQueryError({
          type: 'aggregate',
          collection: aggregate.model.collection.name,
          pipeline: aggregate.pipeline(),
          error: error.message,
          duration,
          timestamp: new Date()
        });
        throw error;
      });
    };
    
    next();
  };
};

/**
 * Memory usage monitoring
 */
const memoryMonitor = (options = {}) => {
  const interval = options.interval || 30000; // 30 seconds
  
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Check for high memory usage
    if (memoryUsage.rss > THRESHOLDS.HIGH_MEMORY_USAGE) {
      logger.warn('High memory usage detected', {
        memoryUsage,
        threshold: THRESHOLDS.HIGH_MEMORY_USAGE
      });
      
      // Trigger garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }
    
    // Store memory metrics
    storeMemoryMetrics({
      timestamp: new Date(),
      memoryUsage,
      cpuUsage
    });
    
  }, interval);
};

/**
 * Error rate monitoring
 */
const errorRateMonitor = (options = {}) => {
  const windowSize = options.windowSize || 300000; // 5 minutes
  const checkInterval = options.checkInterval || 60000; // 1 minute
  
  setInterval(() => {
    const now = Date.now();
    const windowStart = now - windowSize;
    
    // Get recent responses
    const recentResponses = Array.from(performanceMetrics.responses.values())
      .filter(response => response.timestamp.getTime() > windowStart);
    
    if (recentResponses.length === 0) return;
    
    // Calculate error rate
    const errorCount = recentResponses.filter(response => response.statusCode >= 400).length;
    const errorRate = errorCount / recentResponses.length;
    
    if (errorRate > THRESHOLDS.ERROR_RATE_THRESHOLD) {
      logger.warn('High error rate detected', {
        errorRate,
        errorCount,
        totalRequests: recentResponses.length,
        threshold: THRESHOLDS.ERROR_RATE_THRESHOLD
      });
      
      // Alert administrators
      alertHighErrorRate(errorRate, errorCount, recentResponses.length);
    }
    
  }, checkInterval);
};

/**
 * Response time monitoring
 */
const responseTimeMonitor = (options = {}) => {
  const windowSize = options.windowSize || 300000; // 5 minutes
  const checkInterval = options.checkInterval || 60000; // 1 minute
  
  setInterval(() => {
    const now = Date.now();
    const windowStart = now - windowSize;
    
    // Get recent responses
    const recentResponses = Array.from(performanceMetrics.responses.values())
      .filter(response => response.timestamp.getTime() > windowStart);
    
    if (recentResponses.length === 0) return;
    
    // Calculate percentiles
    const responseTimes = recentResponses.map(response => response.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(responseTimes, 0.95);
    const p99 = calculatePercentile(responseTimes, 0.99);
    
    if (p95 > THRESHOLDS.RESPONSE_TIME_P95) {
      logger.warn('High P95 response time detected', {
        p95,
        p99,
        totalRequests: recentResponses.length,
        threshold: THRESHOLDS.RESPONSE_TIME_P95
      });
    }
    
    if (p99 > THRESHOLDS.RESPONSE_TIME_P99) {
      logger.warn('High P99 response time detected', {
        p95,
        p99,
        totalRequests: recentResponses.length,
        threshold: THRESHOLDS.RESPONSE_TIME_P99
      });
    }
    
  }, checkInterval);
};

/**
 * Log slow request
 */
const logSlowRequest = (metrics) => {
  logger.warn('Slow request detected', {
    requestId: metrics.id,
    method: metrics.method,
    url: metrics.url,
    duration: metrics.duration,
    statusCode: metrics.statusCode,
    userId: metrics.userId,
    organizationId: metrics.organizationId
  });
  
  // Store in Redis for analysis
  storeSlowRequest(metrics);
};

/**
 * Log error
 */
const logError = (metrics) => {
  logger.error('Request error', {
    requestId: metrics.id,
    method: metrics.method,
    url: metrics.url,
    statusCode: metrics.statusCode,
    duration: metrics.duration,
    userId: metrics.userId,
    organizationId: metrics.organizationId
  });
  
  // Store in Redis for analysis
  storeError(metrics);
};

/**
 * Log slow query
 */
const logSlowQuery = (queryMetrics) => {
  logger.warn('Slow database query detected', {
    type: queryMetrics.type,
    collection: queryMetrics.collection,
    duration: queryMetrics.duration,
    filter: queryMetrics.filter,
    pipeline: queryMetrics.pipeline
  });
  
  // Store in Redis for analysis
  storeSlowQuery(queryMetrics);
};

/**
 * Log query error
 */
const logQueryError = (errorMetrics) => {
  logger.error('Database query error', {
    type: errorMetrics.type,
    collection: errorMetrics.collection,
    error: errorMetrics.error,
    duration: errorMetrics.duration,
    filter: errorMetrics.filter,
    pipeline: errorMetrics.pipeline
  });
  
  // Store in Redis for analysis
  storeQueryError(errorMetrics);
};

/**
 * Update performance statistics
 */
const updatePerformanceStats = (metrics) => {
  const stats = {
    totalRequests: 1,
    totalDuration: metrics.duration,
    averageDuration: metrics.duration,
    minDuration: metrics.duration,
    maxDuration: metrics.duration,
    errorCount: metrics.statusCode >= 400 ? 1 : 0,
    successCount: metrics.statusCode < 400 ? 1 : 0
  };
  
  // Store in Redis
  updateRedisStats(stats);
};

/**
 * Store slow request in Redis
 */
const storeSlowRequest = async (metrics) => {
  try {
    const key = `slow_requests:${new Date().toISOString().split('T')[0]}`;
    await redisConnection.lpush(key, JSON.stringify(metrics));
    await redisConnection.expire(key, 86400 * 7); // Keep for 7 days
  } catch (error) {
    logger.error('Error storing slow request:', error);
  }
};

/**
 * Store error in Redis
 */
const storeError = async (metrics) => {
  try {
    const key = `errors:${new Date().toISOString().split('T')[0]}`;
    await redisConnection.lpush(key, JSON.stringify(metrics));
    await redisConnection.expire(key, 86400 * 7); // Keep for 7 days
  } catch (error) {
    logger.error('Error storing error metrics:', error);
  }
};

/**
 * Store slow query in Redis
 */
const storeSlowQuery = async (metrics) => {
  try {
    const key = `slow_queries:${new Date().toISOString().split('T')[0]}`;
    await redisConnection.lpush(key, JSON.stringify(metrics));
    await redisConnection.expire(key, 86400 * 7); // Keep for 7 days
  } catch (error) {
    logger.error('Error storing slow query:', error);
  }
};

/**
 * Store query error in Redis
 */
const storeQueryError = async (metrics) => {
  try {
    const key = `query_errors:${new Date().toISOString().split('T')[0]}`;
    await redisConnection.lpush(key, JSON.stringify(metrics));
    await redisConnection.expire(key, 86400 * 7); // Keep for 7 days
  } catch (error) {
    logger.error('Error storing query error:', error);
  }
};

/**
 * Store memory metrics in Redis
 */
const storeMemoryMetrics = async (metrics) => {
  try {
    const key = `memory_metrics:${new Date().toISOString().split('T')[0]}`;
    await redisConnection.lpush(key, JSON.stringify(metrics));
    await redisConnection.expire(key, 86400 * 7); // Keep for 7 days
  } catch (error) {
    logger.error('Error storing memory metrics:', error);
  }
};

/**
 * Update Redis statistics
 */
const updateRedisStats = async (stats) => {
  try {
    const key = `performance_stats:${new Date().toISOString().split('T')[0]}`;
    await redisConnection.hincrby(key, 'totalRequests', stats.totalRequests);
    await redisConnection.hincrby(key, 'totalDuration', stats.totalDuration);
    await redisConnection.hincrby(key, 'errorCount', stats.errorCount);
    await redisConnection.hincrby(key, 'successCount', stats.successCount);
    await redisConnection.expire(key, 86400 * 7); // Keep for 7 days
  } catch (error) {
    logger.error('Error updating Redis stats:', error);
  }
};

/**
 * Clean up old metrics
 */
const cleanupOldMetrics = () => {
  const now = Date.now();
  const maxAge = 300000; // 5 minutes
  
  // Clean up old requests
  for (const [id, metrics] of performanceMetrics.requests.entries()) {
    if (now - metrics.startTime > maxAge) {
      performanceMetrics.requests.delete(id);
    }
  }
  
  // Clean up old responses
  for (const [id, metrics] of performanceMetrics.responses.entries()) {
    if (now - metrics.timestamp.getTime() > maxAge) {
      performanceMetrics.responses.delete(id);
    }
  }
};

/**
 * Calculate percentile
 */
const calculatePercentile = (values, percentile) => {
  const index = Math.ceil((percentile * values.length) - 1);
  return values[index] || 0;
};

/**
 * Generate request ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Alert high error rate
 */
const alertHighErrorRate = (errorRate, errorCount, totalRequests) => {
  // This would typically send alerts to monitoring systems
  logger.error('ALERT: High error rate detected', {
    errorRate,
    errorCount,
    totalRequests,
    threshold: THRESHOLDS.ERROR_RATE_THRESHOLD
  });
};

/**
 * Get performance metrics
 */
const getPerformanceMetrics = async (timeRange = '1h') => {
  try {
    const now = new Date();
    const startTime = new Date(now.getTime() - getTimeRangeMs(timeRange));
    
    // Get metrics from Redis
    const keys = await redisConnection.keys(`performance_stats:${startTime.toISOString().split('T')[0]}*`);
    const metrics = [];
    
    for (const key of keys) {
      const data = await redisConnection.hgetall(key);
      if (data.totalRequests) {
        metrics.push({
          date: key.split(':')[1],
          totalRequests: parseInt(data.totalRequests),
          totalDuration: parseInt(data.totalDuration),
          errorCount: parseInt(data.errorCount),
          successCount: parseInt(data.successCount),
          averageDuration: parseInt(data.totalDuration) / parseInt(data.totalRequests)
        });
      }
    }
    
    return metrics;
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    return [];
  }
};

/**
 * Get slow requests
 */
const getSlowRequests = async (timeRange = '1h') => {
  try {
    const now = new Date();
    const startTime = new Date(now.getTime() - getTimeRangeMs(timeRange));
    
    const keys = await redisConnection.keys(`slow_requests:${startTime.toISOString().split('T')[0]}*`);
    const slowRequests = [];
    
    for (const key of keys) {
      const data = await redisConnection.lrange(key, 0, -1);
      for (const item of data) {
        const request = JSON.parse(item);
        if (new Date(request.timestamp) >= startTime) {
          slowRequests.push(request);
        }
      }
    }
    
    return slowRequests.sort((a, b) => b.duration - a.duration);
  } catch (error) {
    logger.error('Error getting slow requests:', error);
    return [];
  }
};

/**
 * Get error metrics
 */
const getErrorMetrics = async (timeRange = '1h') => {
  try {
    const now = new Date();
    const startTime = new Date(now.getTime() - getTimeRangeMs(timeRange));
    
    const keys = await redisConnection.keys(`errors:${startTime.toISOString().split('T')[0]}*`);
    const errors = [];
    
    for (const key of keys) {
      const data = await redisConnection.lrange(key, 0, -1);
      for (const item of data) {
        const error = JSON.parse(item);
        if (new Date(error.timestamp) >= startTime) {
          errors.push(error);
        }
      }
    }
    
    return errors;
  } catch (error) {
    logger.error('Error getting error metrics:', error);
    return [];
  }
};

/**
 * Get time range in milliseconds
 */
const getTimeRangeMs = (timeRange) => {
  const ranges = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };
  
  return ranges[timeRange] || ranges['1h'];
};

module.exports = {
  performanceMonitor,
  queryPerformanceMonitor,
  memoryMonitor,
  errorRateMonitor,
  responseTimeMonitor,
  getPerformanceMetrics,
  getSlowRequests,
  getErrorMetrics,
  THRESHOLDS
};

