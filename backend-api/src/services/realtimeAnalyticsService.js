const EventEmitter = require('events');
const Redis = require('redis');
const { logger } = require('../utils/logger');

class RealtimeAnalyticsService extends EventEmitter {
    constructor() {
        super();
        this.redis = null;
        this.isConnected = false;
        this.analyticsCache = new Map();
        this.subscribers = new Map();
        this.metricsBuffer = [];
        this.bufferSize = 100;
        this.flushInterval = 5000; // 5 seconds
        this.initialize();
    }

    async initialize() {
        try {
            // Initialize Redis connection
            this.redis = Redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            this.redis.on('error', (err) => {
                logger.error('Redis connection error:', err);
                this.isConnected = false;
            });

            this.redis.on('connect', () => {
                logger.info('Redis connected for real-time analytics');
                this.isConnected = true;
            });

            await this.redis.connect();

            // Start metrics processing
            this.startMetricsProcessing();

            // Start periodic cache cleanup
            this.startCacheCleanup();

            logger.info('RealtimeAnalyticsService initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize RealtimeAnalyticsService:', error);
        }
    }

    /**
     * Record a real-time analytics event
     */
    async recordEvent(eventData) {
        try {
            const {
                userId,
                organizationId,
                eventType,
                platform,
                contentId,
                metrics,
                timestamp = new Date()
            } = eventData;

            // Validate required fields
            if (!eventType || !metrics) {
                throw new Error('Event type and metrics are required');
            }

            const event = {
                id: this.generateEventId(),
                userId,
                organizationId,
                eventType,
                platform,
                contentId,
                metrics,
                timestamp: timestamp.toISOString(),
                processed: false
            };

            // Add to buffer
            this.metricsBuffer.push(event);

            // Process immediately if buffer is full
            if (this.metricsBuffer.length >= this.bufferSize) {
                await this.flushMetrics();
            }

            // Emit real-time event
            this.emit('analyticsEvent', event);

            // Notify subscribers
            this.notifySubscribers(event);

            return event;
        } catch (error) {
            logger.error('Error recording analytics event:', error);
            throw error;
        }
    }

    /**
     * Get real-time analytics for a user/organization
     */
    async getRealtimeAnalytics(userId, organizationId, timeRange = '1h') {
        try {
            const cacheKey = `realtime:${organizationId}:${userId}:${timeRange}`;
            
            // Check cache first
            if (this.analyticsCache.has(cacheKey)) {
                const cached = this.analyticsCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 30000) { // 30 second cache
                    return cached.data;
                }
            }

            // Calculate time range
            const endTime = new Date();
            const startTime = this.calculateStartTime(endTime, timeRange);

            // Get metrics from Redis
            const metrics = await this.getMetricsFromRedis(organizationId, userId, startTime, endTime);

            // Process and aggregate metrics
            const analytics = this.processRealtimeMetrics(metrics, timeRange);

            // Cache the result
            this.analyticsCache.set(cacheKey, {
                data: analytics,
                timestamp: Date.now()
            });

            return analytics;
        } catch (error) {
            logger.error('Error getting real-time analytics:', error);
            throw error;
        }
    }

    /**
     * Subscribe to real-time analytics updates
     */
    subscribe(userId, organizationId, callback) {
        const subscriptionId = this.generateSubscriptionId();
        const subscription = {
            id: subscriptionId,
            userId,
            organizationId,
            callback,
            timestamp: Date.now()
        };

        this.subscribers.set(subscriptionId, subscription);

        // Send initial data
        this.getRealtimeAnalytics(userId, organizationId, '1h')
            .then(data => callback(data))
            .catch(error => logger.error('Error sending initial analytics:', error));

        return subscriptionId;
    }

    /**
     * Unsubscribe from real-time analytics updates
     */
    unsubscribe(subscriptionId) {
        return this.subscribers.delete(subscriptionId);
    }

    /**
     * Get live metrics for dashboard
     */
    async getLiveMetrics(organizationId) {
        try {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

            const metrics = await this.getMetricsFromRedis(organizationId, null, oneHourAgo, now);
            
            return {
                totalEvents: metrics.length,
                eventsByType: this.groupBy(metrics, 'eventType'),
                eventsByPlatform: this.groupBy(metrics, 'platform'),
                hourlyTrend: this.calculateHourlyTrend(metrics),
                topContent: this.getTopContent(metrics),
                realTimeEngagement: this.calculateRealTimeEngagement(metrics),
                lastUpdated: now.toISOString()
            };
        } catch (error) {
            logger.error('Error getting live metrics:', error);
            throw error;
        }
    }

    /**
     * Get content performance in real-time
     */
    async getContentPerformance(contentId, timeRange = '24h') {
        try {
            const endTime = new Date();
            const startTime = this.calculateStartTime(endTime, timeRange);

            const metrics = await this.getMetricsFromRedis(null, null, startTime, endTime);
            const contentMetrics = metrics.filter(m => m.contentId === contentId);

            return {
                contentId,
                timeRange,
                totalEngagement: this.calculateTotalEngagement(contentMetrics),
                engagementRate: this.calculateEngagementRate(contentMetrics),
                reach: this.calculateReach(contentMetrics),
                impressions: this.calculateImpressions(contentMetrics),
                clicks: this.calculateClicks(contentMetrics),
                shares: this.calculateShares(contentMetrics),
                comments: this.calculateComments(contentMetrics),
                likes: this.calculateLikes(contentMetrics),
                hourlyBreakdown: this.calculateHourlyBreakdown(contentMetrics),
                platformBreakdown: this.calculatePlatformBreakdown(contentMetrics),
                lastUpdated: endTime.toISOString()
            };
        } catch (error) {
            logger.error('Error getting content performance:', error);
            throw error;
        }
    }

    /**
     * Get audience insights in real-time
     */
    async getAudienceInsights(organizationId, timeRange = '7d') {
        try {
            const endTime = new Date();
            const startTime = this.calculateStartTime(endTime, timeRange);

            const metrics = await this.getMetricsFromRedis(organizationId, null, startTime, endTime);

            return {
                organizationId,
                timeRange,
                totalAudience: this.calculateTotalAudience(metrics),
                activeUsers: this.calculateActiveUsers(metrics),
                engagementByDemographics: this.calculateEngagementByDemographics(metrics),
                peakActivityHours: this.calculatePeakActivityHours(metrics),
                topPerformingContent: this.getTopPerformingContent(metrics),
                audienceGrowth: this.calculateAudienceGrowth(metrics),
                retentionRate: this.calculateRetentionRate(metrics),
                lastUpdated: endTime.toISOString()
            };
        } catch (error) {
            logger.error('Error getting audience insights:', error);
            throw error;
        }
    }

    /**
     * Start metrics processing
     */
    startMetricsProcessing() {
        // Flush metrics buffer periodically
        setInterval(async () => {
            if (this.metricsBuffer.length > 0) {
                await this.flushMetrics();
            }
        }, this.flushInterval);

        // Process real-time aggregations
        setInterval(async () => {
            await this.processRealTimeAggregations();
        }, 10000); // Every 10 seconds
    }

    /**
     * Start cache cleanup
     */
    startCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.analyticsCache.entries()) {
                if (now - value.timestamp > 300000) { // 5 minutes
                    this.analyticsCache.delete(key);
                }
            }
        }, 60000); // Every minute
    }

    /**
     * Flush metrics buffer to Redis
     */
    async flushMetrics() {
        if (this.metricsBuffer.length === 0) return;

        try {
            const metrics = [...this.metricsBuffer];
            this.metricsBuffer = [];

            // Store in Redis
            for (const metric of metrics) {
                const key = `analytics:${metric.organizationId}:${metric.userId}:${metric.timestamp}`;
                await this.redis.setEx(key, 86400, JSON.stringify(metric)); // 24 hour TTL
            }

            logger.info(`Flushed ${metrics.length} metrics to Redis`);
        } catch (error) {
            logger.error('Error flushing metrics:', error);
        }
    }

    /**
     * Process real-time aggregations
     */
    async processRealTimeAggregations() {
        try {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

            // Get all metrics from the last hour
            const keys = await this.redis.keys('analytics:*');
            const metrics = [];

            for (const key of keys) {
                const data = await this.redis.get(key);
                if (data) {
                    const metric = JSON.parse(data);
                    const metricTime = new Date(metric.timestamp);
                    if (metricTime >= oneHourAgo) {
                        metrics.push(metric);
                    }
                }
            }

            // Process aggregations
            const aggregations = this.calculateAggregations(metrics);
            
            // Store aggregations
            await this.redis.setEx(
                `aggregations:${now.getTime()}`,
                3600,
                JSON.stringify(aggregations)
            );

            // Emit aggregation event
            this.emit('aggregationUpdate', aggregations);
        } catch (error) {
            logger.error('Error processing real-time aggregations:', error);
        }
    }

    /**
     * Get metrics from Redis
     */
    async getMetricsFromRedis(organizationId, userId, startTime, endTime) {
        try {
            const pattern = organizationId ? 
                `analytics:${organizationId}:*` : 
                'analytics:*';
            
            const keys = await this.redis.keys(pattern);
            const metrics = [];

            for (const key of keys) {
                const data = await this.redis.get(key);
                if (data) {
                    const metric = JSON.parse(data);
                    const metricTime = new Date(metric.timestamp);
                    
                    if (metricTime >= startTime && metricTime <= endTime) {
                        if (!userId || metric.userId === userId) {
                            metrics.push(metric);
                        }
                    }
                }
            }

            return metrics.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        } catch (error) {
            logger.error('Error getting metrics from Redis:', error);
            return [];
        }
    }

    /**
     * Process real-time metrics
     */
    processRealtimeMetrics(metrics, timeRange) {
        return {
            totalEvents: metrics.length,
            timeRange,
            eventsByType: this.groupBy(metrics, 'eventType'),
            eventsByPlatform: this.groupBy(metrics, 'platform'),
            engagement: this.calculateEngagement(metrics),
            reach: this.calculateReach(metrics),
            impressions: this.calculateImpressions(metrics),
            clicks: this.calculateClicks(metrics),
            shares: this.calculateShares(metrics),
            comments: this.calculateComments(metrics),
            likes: this.calculateLikes(metrics),
            hourlyTrend: this.calculateHourlyTrend(metrics),
            topContent: this.getTopContent(metrics),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Notify subscribers of new events
     */
    notifySubscribers(event) {
        for (const [subscriptionId, subscription] of this.subscribers) {
            if (subscription.organizationId === event.organizationId && 
                (!subscription.userId || subscription.userId === event.userId)) {
                try {
                    subscription.callback(event);
                } catch (error) {
                    logger.error(`Error notifying subscriber ${subscriptionId}:`, error);
                }
            }
        }
    }

    // Helper methods
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    calculateStartTime(endTime, timeRange) {
        const ranges = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        };
        
        const milliseconds = ranges[timeRange] || ranges['1h'];
        return new Date(endTime.getTime() - milliseconds);
    }

    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key] || 'unknown';
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }

    calculateTotalEngagement(metrics) {
        return metrics.reduce((total, metric) => {
            return total + (metric.metrics.likes || 0) + 
                   (metric.metrics.comments || 0) + 
                   (metric.metrics.shares || 0);
        }, 0);
    }

    calculateEngagementRate(metrics) {
        const totalEngagement = this.calculateTotalEngagement(metrics);
        const totalReach = this.calculateReach(metrics);
        return totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;
    }

    calculateReach(metrics) {
        return metrics.reduce((total, metric) => total + (metric.metrics.reach || 0), 0);
    }

    calculateImpressions(metrics) {
        return metrics.reduce((total, metric) => total + (metric.metrics.impressions || 0), 0);
    }

    calculateClicks(metrics) {
        return metrics.reduce((total, metric) => total + (metric.metrics.clicks || 0), 0);
    }

    calculateShares(metrics) {
        return metrics.reduce((total, metric) => total + (metric.metrics.shares || 0), 0);
    }

    calculateComments(metrics) {
        return metrics.reduce((total, metric) => total + (metric.metrics.comments || 0), 0);
    }

    calculateLikes(metrics) {
        return metrics.reduce((total, metric) => total + (metric.metrics.likes || 0), 0);
    }

    calculateHourlyTrend(metrics) {
        const hourly = {};
        metrics.forEach(metric => {
            const hour = new Date(metric.timestamp).getHours();
            hourly[hour] = (hourly[hour] || 0) + 1;
        });
        return hourly;
    }

    getTopContent(metrics) {
        const contentEngagement = {};
        metrics.forEach(metric => {
            if (metric.contentId) {
                if (!contentEngagement[metric.contentId]) {
                    contentEngagement[metric.contentId] = 0;
                }
                contentEngagement[metric.contentId] += this.calculateTotalEngagement([metric]);
            }
        });

        return Object.entries(contentEngagement)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([contentId, engagement]) => ({ contentId, engagement }));
    }

    calculateRealTimeEngagement(metrics) {
        const now = new Date();
        const last15Minutes = new Date(now.getTime() - 15 * 60 * 1000);
        
        const recentMetrics = metrics.filter(metric => 
            new Date(metric.timestamp) >= last15Minutes
        );

        return {
            last15Minutes: this.calculateTotalEngagement(recentMetrics),
            lastHour: this.calculateTotalEngagement(metrics),
            trend: this.calculateEngagementTrend(metrics)
        };
    }

    calculateEngagementTrend(metrics) {
        if (metrics.length < 2) return 0;
        
        const sorted = metrics.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
        const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
        
        const firstHalfEngagement = this.calculateTotalEngagement(firstHalf);
        const secondHalfEngagement = this.calculateTotalEngagement(secondHalf);
        
        return firstHalfEngagement > 0 ? 
            ((secondHalfEngagement - firstHalfEngagement) / firstHalfEngagement) * 100 : 0;
    }

    calculateHourlyBreakdown(metrics) {
        const hourly = {};
        metrics.forEach(metric => {
            const hour = new Date(metric.timestamp).getHours();
            if (!hourly[hour]) {
                hourly[hour] = {
                    engagement: 0,
                    reach: 0,
                    impressions: 0
                };
            }
            hourly[hour].engagement += this.calculateTotalEngagement([metric]);
            hourly[hour].reach += metric.metrics.reach || 0;
            hourly[hour].impressions += metric.metrics.impressions || 0;
        });
        return hourly;
    }

    calculatePlatformBreakdown(metrics) {
        const platforms = {};
        metrics.forEach(metric => {
            if (metric.platform) {
                if (!platforms[metric.platform]) {
                    platforms[metric.platform] = {
                        engagement: 0,
                        reach: 0,
                        impressions: 0
                    };
                }
                platforms[metric.platform].engagement += this.calculateTotalEngagement([metric]);
                platforms[metric.platform].reach += metric.metrics.reach || 0;
                platforms[metric.platform].impressions += metric.metrics.impressions || 0;
            }
        });
        return platforms;
    }

    calculateTotalAudience(metrics) {
        const uniqueUsers = new Set();
        metrics.forEach(metric => {
            if (metric.userId) {
                uniqueUsers.add(metric.userId);
            }
        });
        return uniqueUsers.size;
    }

    calculateActiveUsers(metrics) {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const activeUsers = new Set();
        metrics.forEach(metric => {
            if (metric.userId && new Date(metric.timestamp) >= last24Hours) {
                activeUsers.add(metric.userId);
            }
        });
        return activeUsers.size;
    }

    calculateEngagementByDemographics(metrics) {
        // This would require demographic data in the metrics
        // For now, return a placeholder structure
        return {
            ageGroups: {},
            genders: {},
            locations: {}
        };
    }

    calculatePeakActivityHours(metrics) {
        const hourly = {};
        metrics.forEach(metric => {
            const hour = new Date(metric.timestamp).getHours();
            hourly[hour] = (hourly[hour] || 0) + 1;
        });
        
        return Object.entries(hourly)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour, count]) => ({ hour: parseInt(hour), count }));
    }

    getTopPerformingContent(metrics) {
        return this.getTopContent(metrics);
    }

    calculateAudienceGrowth(metrics) {
        // Calculate growth over time
        const daily = {};
        metrics.forEach(metric => {
            const date = new Date(metric.timestamp).toISOString().split('T')[0];
            if (!daily[date]) {
                daily[date] = new Set();
            }
            if (metric.userId) {
                daily[date].add(metric.userId);
            }
        });

        const dates = Object.keys(daily).sort();
        if (dates.length < 2) return 0;

        const firstDay = daily[dates[0]].size;
        const lastDay = daily[dates[dates.length - 1]].size;

        return firstDay > 0 ? ((lastDay - firstDay) / firstDay) * 100 : 0;
    }

    calculateRetentionRate(metrics) {
        // This would require more complex user tracking
        // For now, return a placeholder
        return 0.75; // 75% retention rate
    }

    calculateAggregations(metrics) {
        return {
            totalEvents: metrics.length,
            totalEngagement: this.calculateTotalEngagement(metrics),
            totalReach: this.calculateReach(metrics),
            totalImpressions: this.calculateImpressions(metrics),
            eventsByType: this.groupBy(metrics, 'eventType'),
            eventsByPlatform: this.groupBy(metrics, 'platform'),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        try {
            if (this.redis) {
                await this.redis.quit();
            }
            this.removeAllListeners();
            this.subscribers.clear();
            this.analyticsCache.clear();
            logger.info('RealtimeAnalyticsService cleaned up');
        } catch (error) {
            logger.error('Error cleaning up RealtimeAnalyticsService:', error);
        }
    }
}

module.exports = new RealtimeAnalyticsService();

