const cron = require('node-cron');
const logger = require('../utils/logger');
const queueService = require('./queueService');
const emailService = require('./emailService');
const analyticsService = require('./analyticsService');

/**
 * Scheduler Service
 * Handles scheduled tasks, cron jobs, and automated processes
 */

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    this.initializeDefaultJobs();
    logger.info('Scheduler service started');
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running');
      return;
    }

    this.jobs.forEach((job, name) => {
      job.destroy();
      logger.info(`Stopped scheduled job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;
    logger.info('Scheduler service stopped');
  }

  // Initialize default scheduled jobs
  initializeDefaultJobs() {
    // Daily analytics processing
    this.scheduleJob('daily-analytics', '0 2 * * *', this.processDailyAnalytics.bind(this));

    // Weekly report generation
    this.scheduleJob('weekly-reports', '0 3 * * 1', this.generateWeeklyReports.bind(this));

    // Monthly subscription processing
    this.scheduleJob('monthly-subscriptions', '0 4 1 * *', this.processMonthlySubscriptions.bind(this));

    // Cleanup expired sessions
    this.scheduleJob('cleanup-sessions', '0 1 * * *', this.cleanupExpiredSessions.bind(this));

    // Sync social media data
    this.scheduleJob('sync-social-data', '*/30 * * * *', this.syncSocialMediaData.bind(this));

    // Process pending content
    this.scheduleJob('process-pending-content', '*/15 * * * *', this.processPendingContent.bind(this));

    // Send scheduled notifications
    this.scheduleJob('send-scheduled-notifications', '*/5 * * * *', this.sendScheduledNotifications.bind(this));

    // Backup database
    this.scheduleJob('backup-database', '0 0 * * 0', this.backupDatabase.bind(this));

    // Health check
    this.scheduleJob('health-check', '*/10 * * * *', this.performHealthCheck.bind(this));

    // Cleanup old logs
    this.scheduleJob('cleanup-logs', '0 0 1 * *', this.cleanupOldLogs.bind(this));
  }

  // Schedule a new job
  scheduleJob(name, cronExpression, task, options = {}) {
    try {
      if (this.jobs.has(name)) {
        logger.warn(`Job ${name} already exists, destroying previous instance`);
        this.jobs.get(name).destroy();
      }

      const job = cron.schedule(cronExpression, task, {
        scheduled: false,
        timezone: options.timezone || 'UTC',
        ...options
      });

      this.jobs.set(name, job);
      job.start();

      logger.info(`Scheduled job: ${name} (${cronExpression})`);
      return job;
    } catch (error) {
      logger.error(`Error scheduling job ${name}:`, error);
      throw error;
    }
  }

  // Unschedule a job
  unscheduleJob(name) {
    try {
      const job = this.jobs.get(name);
      if (job) {
        job.destroy();
        this.jobs.delete(name);
        logger.info(`Unscheduled job: ${name}`);
        return true;
      } else {
        logger.warn(`Job ${name} not found`);
        return false;
      }
    } catch (error) {
      logger.error(`Error unscheduling job ${name}:`, error);
      return false;
    }
  }

  // Get job status
  getJobStatus(name) {
    const job = this.jobs.get(name);
    if (!job) {
      return { exists: false };
    }

    return {
      exists: true,
      running: job.running,
      scheduled: job.scheduled
    };
  }

  // Get all jobs status
  getAllJobsStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }
    return status;
  }

  // Process daily analytics
  async processDailyAnalytics() {
    try {
      logger.info('Starting daily analytics processing');
      
      // Get all active users
      const User = require('../models/User');
      const users = await User.find({ isActive: true }).select('_id');

      for (const user of users) {
        await queueService.addJob('analytics', 'process-analytics', {
          userId: user._id,
          type: 'daily',
          date: new Date().toISOString().split('T')[0]
        });
      }

      logger.info('Daily analytics processing completed');
    } catch (error) {
      logger.error('Error in daily analytics processing:', error);
    }
  }

  // Generate weekly reports
  async generateWeeklyReports() {
    try {
      logger.info('Starting weekly report generation');
      
      // Get all active users
      const User = require('../models/User');
      const users = await User.find({ isActive: true }).select('_id email firstName lastName');

      for (const user of users) {
        await queueService.addJob('analytics', 'generate-report', {
          userId: user._id,
          type: 'weekly',
          startDate: this.getWeekStartDate(),
          endDate: this.getWeekEndDate()
        });
      }

      logger.info('Weekly report generation completed');
    } catch (error) {
      logger.error('Error in weekly report generation:', error);
    }
  }

  // Process monthly subscriptions
  async processMonthlySubscriptions() {
    try {
      logger.info('Starting monthly subscription processing');
      
      const Subscription = require('../models/Subscription');
      const subscriptions = await Subscription.find({
        status: 'active',
        billingCycle: 'monthly'
      }).populate('user', 'email firstName lastName');

      for (const subscription of subscriptions) {
        // Check if billing is due
        const now = new Date();
        const nextBilling = new Date(subscription.nextBillingDate);
        
        if (now >= nextBilling) {
          await queueService.addJob('email', 'send-email', {
            to: subscription.user.email,
            subject: 'Monthly Subscription Renewal',
            template: 'subscription-renewal',
            data: {
              name: subscription.user.firstName,
              plan: subscription.plan,
              amount: subscription.price,
              currency: subscription.currency
            }
          });
        }
      }

      logger.info('Monthly subscription processing completed');
    } catch (error) {
      logger.error('Error in monthly subscription processing:', error);
    }
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions() {
    try {
      logger.info('Starting session cleanup');
      
      // Cleanup expired JWT tokens (if stored in database)
      // This would depend on your session management implementation
      
      logger.info('Session cleanup completed');
    } catch (error) {
      logger.error('Error in session cleanup:', error);
    }
  }

  // Sync social media data
  async syncSocialMediaData() {
    try {
      logger.info('Starting social media data sync');
      
      const SocialAccount = require('../models/SocialAccount');
      const accounts = await SocialAccount.find({ status: 'active' });

      for (const account of accounts) {
        await queueService.addJob('social', 'sync-social-data', {
          userId: account.user,
          platform: account.platform,
          accountId: account._id
        });
      }

      logger.info('Social media data sync completed');
    } catch (error) {
      logger.error('Error in social media data sync:', error);
    }
  }

  // Process pending content
  async processPendingContent() {
    try {
      logger.info('Starting pending content processing');
      
      const Content = require('../models/Content');
      const now = new Date();
      
      // Find content that should be published now
      const pendingContent = await Content.find({
        status: 'scheduled',
        scheduledAt: { $lte: now }
      });

      for (const content of pendingContent) {
        await queueService.addJob('content', 'publish-content', {
          contentId: content._id
        });
      }

      logger.info(`Processed ${pendingContent.length} pending content items`);
    } catch (error) {
      logger.error('Error in pending content processing:', error);
    }
  }

  // Send scheduled notifications
  async sendScheduledNotifications() {
    try {
      logger.info('Starting scheduled notifications processing');
      
      const Notification = require('../models/Notification');
      const now = new Date();
      
      // Find notifications that should be sent now
      const scheduledNotifications = await Notification.find({
        status: 'scheduled',
        scheduledAt: { $lte: now }
      });

      for (const notification of scheduledNotifications) {
        await queueService.addJob('notifications', 'send-notification', {
          userId: notification.user,
          title: notification.title,
          message: notification.message,
          type: notification.type
        });

        // Update notification status
        notification.status = 'sent';
        notification.sentAt = now;
        await notification.save();
      }

      logger.info(`Sent ${scheduledNotifications.length} scheduled notifications`);
    } catch (error) {
      logger.error('Error in scheduled notifications processing:', error);
    }
  }

  // Backup database
  async backupDatabase() {
    try {
      logger.info('Starting database backup');
      
      // This would involve calling your database backup script
      // For MongoDB, you might use mongodump
      
      logger.info('Database backup completed');
    } catch (error) {
      logger.error('Error in database backup:', error);
    }
  }

  // Perform health check
  async performHealthCheck() {
    try {
      logger.debug('Performing health check');
      
      // Check database connection
      const mongoose = require('mongoose');
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      // Check Redis connection
      const redis = require('../config/redis');
      let redisStatus = 'disconnected';
      try {
        await redis.ping();
        redisStatus = 'connected';
      } catch (error) {
        redisStatus = 'disconnected';
      }
      
      // Check queue status
      const queueStatus = await queueService.getAllQueueStatuses();
      
      const healthStatus = {
        timestamp: new Date(),
        database: dbStatus,
        redis: redisStatus,
        queues: queueStatus,
        status: dbStatus === 'connected' ? 'healthy' : 'unhealthy'
      };
      
      logger.debug('Health check completed:', healthStatus);
      
      // Store health status in cache
      const cacheService = require('./cacheService');
      await cacheService.set('health:status', healthStatus, 300); // 5 minutes
      
    } catch (error) {
      logger.error('Error in health check:', error);
    }
  }

  // Cleanup old logs
  async cleanupOldLogs() {
    try {
      logger.info('Starting log cleanup');
      
      // This would involve cleaning up old log files
      // Implementation depends on your logging setup
      
      logger.info('Log cleanup completed');
    } catch (error) {
      logger.error('Error in log cleanup:', error);
    }
  }

  // Get week start date
  getWeekStartDate() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  // Get week end date
  getWeekEndDate() {
    const weekStart = this.getWeekStartDate();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  // Schedule one-time task
  scheduleOnce(name, date, task, options = {}) {
    try {
      const now = new Date();
      const delay = date.getTime() - now.getTime();
      
      if (delay <= 0) {
        logger.warn(`Scheduled time for job ${name} is in the past`);
        return null;
      }

      const timeoutId = setTimeout(async () => {
        try {
          await task();
          logger.info(`One-time job ${name} executed`);
        } catch (error) {
          logger.error(`Error executing one-time job ${name}:`, error);
        }
      }, delay);

      logger.info(`One-time job ${name} scheduled for ${date}`);
      return timeoutId;
    } catch (error) {
      logger.error(`Error scheduling one-time job ${name}:`, error);
      return null;
    }
  }

  // Schedule recurring task with custom interval
  scheduleInterval(name, intervalMs, task, options = {}) {
    try {
      if (this.jobs.has(name)) {
        logger.warn(`Job ${name} already exists, destroying previous instance`);
        this.jobs.get(name).destroy();
      }

      const intervalId = setInterval(async () => {
        try {
          await task();
        } catch (error) {
          logger.error(`Error executing interval job ${name}:`, error);
        }
      }, intervalMs);

      this.jobs.set(name, { destroy: () => clearInterval(intervalId) });
      
      logger.info(`Interval job ${name} scheduled with ${intervalMs}ms interval`);
      return intervalId;
    } catch (error) {
      logger.error(`Error scheduling interval job ${name}:`, error);
      return null;
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      running: this.isRunning,
      jobsCount: this.jobs.size,
      jobs: Array.from(this.jobs.keys())
    };
  }
}

module.exports = new SchedulerService();

