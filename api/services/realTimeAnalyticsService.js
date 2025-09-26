const socketService = require('./socketService');
const notificationService = require('./notificationService');

class RealTimeAnalyticsService {
  constructor() {
    this.subscribers = new Map(); // userId -> subscription details
    this.dataCache = new Map(); // Cache for recent analytics data
    this.updateIntervals = new Map(); // Active update intervals
    this.thresholds = {
      engagement: {
        spike: 50, // 50% increase
        drop: -30  // 30% decrease
      },
      reach: {
        milestone: [1000, 5000, 10000, 50000, 100000]
      },
      followers: {
        milestone: [100, 500, 1000, 5000, 10000, 50000]
      }
    };
  }

  // Subscription management
  async subscribeToAnalytics(userId, subscriptionData) {
    const {
      type = 'overview', // overview, content, engagement, reach, followers
      contentId = null,
      platform = null,
      updateInterval = 30000, // 30 seconds default
      filters = {}
    } = subscriptionData;

    const subscriptionId = this.generateSubscriptionId();
    const subscription = {
      id: subscriptionId,
      userId,
      type,
      contentId,
      platform,
      updateInterval,
      filters,
      createdAt: new Date(),
      lastUpdate: null
    };

    // Store subscription
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Map());
    }
    this.subscribers.get(userId).set(subscriptionId, subscription);

    // Start real-time updates
    this.startRealTimeUpdates(subscription);

    // Send initial data
    await this.sendInitialData(subscription);

    return {
      success: true,
      subscriptionId,
      message: 'Subscribed to real-time analytics'
    };
  }

  async unsubscribeFromAnalytics(userId, subscriptionId) {
    const userSubscriptions = this.subscribers.get(userId);
    if (userSubscriptions && userSubscriptions.has(subscriptionId)) {
      const subscription = userSubscriptions.get(subscriptionId);
      
      // Stop updates
      this.stopRealTimeUpdates(subscription);
      
      // Remove subscription
      userSubscriptions.delete(subscriptionId);
      
      if (userSubscriptions.size === 0) {
        this.subscribers.delete(userId);
      }

      return {
        success: true,
        message: 'Unsubscribed from real-time analytics'
      };
    }

    return {
      success: false,
      message: 'Subscription not found'
    };
  }

  async unsubscribeAllAnalytics(userId) {
    const userSubscriptions = this.subscribers.get(userId);
    if (userSubscriptions) {
      // Stop all updates for this user
      for (const subscription of userSubscriptions.values()) {
        this.stopRealTimeUpdates(subscription);
      }
      
      // Remove all subscriptions
      this.subscribers.delete(userId);
    }

    return {
      success: true,
      message: 'Unsubscribed from all real-time analytics'
    };
  }

  // Real-time update management
  startRealTimeUpdates(subscription) {
    const intervalId = setInterval(async () => {
      await this.sendAnalyticsUpdate(subscription);
    }, subscription.updateInterval);

    this.updateIntervals.set(subscription.id, intervalId);
  }

  stopRealTimeUpdates(subscription) {
    const intervalId = this.updateIntervals.get(subscription.id);
    if (intervalId) {
      clearInterval(intervalId);
      this.updateIntervals.delete(subscription.id);
    }
  }

  // Data fetching and processing
  async sendInitialData(subscription) {
    try {
      const data = await this.fetchAnalyticsData(subscription);
      
      socketService.sendAnalyticsUpdate(subscription.userId, {
        type: 'initial',
        subscriptionId: subscription.id,
        data,
        timestamp: new Date()
      });

      subscription.lastUpdate = new Date();
    } catch (error) {
      console.error('Error sending initial analytics data:', error);
    }
  }

  async sendAnalyticsUpdate(subscription) {
    try {
      const data = await this.fetchAnalyticsData(subscription);
      const previousData = this.getCachedData(subscription);
      
      // Calculate changes
      const changes = this.calculateChanges(previousData, data);
      
      // Check for significant changes or milestones
      await this.checkForNotifications(subscription, data, changes);
      
      // Send update
      socketService.sendAnalyticsUpdate(subscription.userId, {
        type: 'update',
        subscriptionId: subscription.id,
        data,
        changes,
        timestamp: new Date()
      });

      // Cache the data
      this.setCachedData(subscription, data);
      subscription.lastUpdate = new Date();

    } catch (error) {
      console.error('Error sending analytics update:', error);
    }
  }

  async fetchAnalyticsData(subscription) {
    const { type, contentId, platform, filters } = subscription;
    
    // This would integrate with your actual analytics data sources
    // For now, we'll return mock data based on the subscription type
    
    switch (type) {
      case 'overview':
        return this.fetchOverviewData(subscription.userId, filters);
      
      case 'content':
        return this.fetchContentData(contentId, filters);
      
      case 'engagement':
        return this.fetchEngagementData(subscription.userId, platform, filters);
      
      case 'reach':
        return this.fetchReachData(subscription.userId, platform, filters);
      
      case 'followers':
        return this.fetchFollowersData(subscription.userId, platform, filters);
      
      default:
        return this.fetchOverviewData(subscription.userId, filters);
    }
  }

  async fetchOverviewData(userId, filters) {
    // Mock overview data - replace with actual database queries
    const now = new Date();
    const baseMetrics = {
      totalPosts: Math.floor(Math.random() * 100) + 50,
      totalEngagement: Math.floor(Math.random() * 10000) + 1000,
      totalReach: Math.floor(Math.random() * 50000) + 5000,
      totalFollowers: Math.floor(Math.random() * 5000) + 500,
      engagementRate: (Math.random() * 5 + 1).toFixed(2),
      topPerformingPost: {
        id: 'post_123',
        title: 'Sample Post',
        engagement: Math.floor(Math.random() * 1000) + 100
      }
    };

    return {
      ...baseMetrics,
      timestamp: now,
      period: filters.period || '24h'
    };
  }

  async fetchContentData(contentId, filters) {
    // Mock content-specific data
    const now = new Date();
    return {
      contentId,
      views: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 100) + 10,
      comments: Math.floor(Math.random() * 50) + 5,
      shares: Math.floor(Math.random() * 20) + 2,
      clicks: Math.floor(Math.random() * 200) + 20,
      engagementRate: (Math.random() * 10 + 1).toFixed(2),
      reachRate: (Math.random() * 15 + 5).toFixed(2),
      timestamp: now
    };
  }

  async fetchEngagementData(userId, platform, filters) {
    // Mock engagement data
    const now = new Date();
    return {
      platform,
      totalEngagement: Math.floor(Math.random() * 5000) + 500,
      likes: Math.floor(Math.random() * 2000) + 200,
      comments: Math.floor(Math.random() * 500) + 50,
      shares: Math.floor(Math.random() * 300) + 30,
      saves: Math.floor(Math.random() * 100) + 10,
      engagementRate: (Math.random() * 8 + 2).toFixed(2),
      avgEngagementPerPost: (Math.random() * 100 + 10).toFixed(0),
      timestamp: now
    };
  }

  async fetchReachData(userId, platform, filters) {
    // Mock reach data
    const now = new Date();
    return {
      platform,
      totalReach: Math.floor(Math.random() * 20000) + 2000,
      impressions: Math.floor(Math.random() * 50000) + 5000,
      uniqueReach: Math.floor(Math.random() * 15000) + 1500,
      reachRate: (Math.random() * 20 + 5).toFixed(2),
      impressionRate: (Math.random() * 50 + 10).toFixed(2),
      timestamp: now
    };
  }

  async fetchFollowersData(userId, platform, filters) {
    // Mock followers data
    const now = new Date();
    return {
      platform,
      totalFollowers: Math.floor(Math.random() * 10000) + 1000,
      newFollowers: Math.floor(Math.random() * 100) + 10,
      unfollowers: Math.floor(Math.random() * 20) + 2,
      netGrowth: Math.floor(Math.random() * 80) + 8,
      growthRate: (Math.random() * 5 + 0.5).toFixed(2),
      followerDemographics: {
        ageGroups: {
          '18-24': Math.floor(Math.random() * 30) + 10,
          '25-34': Math.floor(Math.random() * 40) + 20,
          '35-44': Math.floor(Math.random() * 25) + 15,
          '45+': Math.floor(Math.random() * 20) + 10
        },
        topLocations: ['United States', 'United Kingdom', 'Canada']
      },
      timestamp: now
    };
  }

  // Data comparison and change detection
  calculateChanges(previousData, currentData) {
    if (!previousData) return null;

    const changes = {};
    
    // Calculate percentage changes for numeric values
    for (const key in currentData) {
      if (typeof currentData[key] === 'number' && typeof previousData[key] === 'number') {
        const change = currentData[key] - previousData[key];
        const percentChange = previousData[key] !== 0 
          ? ((change / previousData[key]) * 100).toFixed(2)
          : 0;
        
        changes[key] = {
          absolute: change,
          percentage: parseFloat(percentChange),
          direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
      }
    }

    return changes;
  }

  // Notification triggers
  async checkForNotifications(subscription, data, changes) {
    if (!changes) return;

    const { userId, type } = subscription;

    // Check for engagement spikes
    if (changes.engagementRate && changes.engagementRate.percentage > this.thresholds.engagement.spike) {
      await notificationService.notifyEngagementSpike(userId, {
        contentType: type,
        increase: changes.engagementRate.percentage,
        currentValue: data.engagementRate,
        contentId: subscription.contentId
      });
    }

    // Check for reach milestones
    if (data.totalReach && this.thresholds.reach.milestone.includes(data.totalReach)) {
      await notificationService.notifyAnalyticsMilestone(userId, {
        metric: 'total reach',
        value: data.totalReach,
        type: 'reach'
      });
    }

    // Check for follower milestones
    if (data.totalFollowers && this.thresholds.followers.milestone.includes(data.totalFollowers)) {
      await notificationService.notifyAnalyticsMilestone(userId, {
        metric: 'followers',
        value: data.totalFollowers,
        type: 'followers',
        platform: subscription.platform
      });
    }
  }

  // Cache management
  getCachedData(subscription) {
    const cacheKey = `${subscription.userId}_${subscription.type}_${subscription.contentId || 'all'}_${subscription.platform || 'all'}`;
    return this.dataCache.get(cacheKey);
  }

  setCachedData(subscription, data) {
    const cacheKey = `${subscription.userId}_${subscription.type}_${subscription.contentId || 'all'}_${subscription.platform || 'all'}`;
    this.dataCache.set(cacheKey, data);
    
    // Clean up old cache entries (keep last 10 entries per key)
    if (this.dataCache.size > 1000) {
      const oldestKey = this.dataCache.keys().next().value;
      this.dataCache.delete(oldestKey);
    }
  }

  // Utility methods
  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Manual data push (for external triggers)
  async pushAnalyticsUpdate(userId, data) {
    const userSubscriptions = this.subscribers.get(userId);
    if (userSubscriptions) {
      for (const subscription of userSubscriptions.values()) {
        if (this.matchesSubscription(subscription, data)) {
          socketService.sendAnalyticsUpdate(userId, {
            type: 'push',
            subscriptionId: subscription.id,
            data,
            timestamp: new Date()
          });
        }
      }
    }
  }

  matchesSubscription(subscription, data) {
    // Check if the pushed data matches the subscription criteria
    if (subscription.contentId && data.contentId !== subscription.contentId) {
      return false;
    }
    
    if (subscription.platform && data.platform !== subscription.platform) {
      return false;
    }
    
    return true;
  }

  // Cleanup methods
  cleanup() {
    // Stop all intervals
    for (const intervalId of this.updateIntervals.values()) {
      clearInterval(intervalId);
    }
    
    // Clear all data
    this.subscribers.clear();
    this.dataCache.clear();
    this.updateIntervals.clear();
  }

  // Get statistics
  getServiceStats() {
    return {
      totalSubscribers: this.subscribers.size,
      totalSubscriptions: Array.from(this.subscribers.values())
        .reduce((total, userSubs) => total + userSubs.size, 0),
      activeIntervals: this.updateIntervals.size,
      cacheSize: this.dataCache.size
    };
  }
}

module.exports = new RealTimeAnalyticsService();
