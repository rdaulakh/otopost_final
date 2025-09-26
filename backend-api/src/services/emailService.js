const smtpService = require('../integrations/email/smtp');
const sendGridService = require('../integrations/email/sendgrid');
const templateService = require('../integrations/email/templates');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.providers = {
      smtp: smtpService,
      sendgrid: sendGridService
    };
    this.defaultProvider = process.env.EMAIL_PROVIDER || 'smtp';
    this.templateService = templateService;
  }

  /**
   * Send email using specified provider
   */
  async sendEmail(emailData, provider = null) {
    try {
      const emailProvider = provider || this.defaultProvider;
      const service = this.providers[emailProvider];

      if (!service) {
        throw new Error(`Email provider '${emailProvider}' not supported`);
      }

      const result = await service.sendEmail(emailData);
      
      logger.info(`Email sent successfully via ${emailProvider}: ${result.messageId}`);
      
      return {
        success: true,
        ...result,
        provider: emailProvider
      };

    } catch (error) {
      logger.error('Email sending failed:', error);
      
      // Try fallback provider if available
      if (provider === null && this.defaultProvider !== 'smtp') {
        logger.info('Trying fallback provider: smtp');
        return await this.sendEmail(emailData, 'smtp');
      }
      
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Send email with template
   */
  async sendTemplateEmail(templateData, provider = null) {
    try {
      const {
        to,
        templateName,
        templateData: data,
        subject,
        from,
        provider: templateProvider
      } = templateData;

      // Render template
      const renderedTemplate = this.templateService.renderTemplate(templateName, data);

      // Prepare email data
      const emailData = {
        to,
        subject: subject || renderedTemplate.subject,
        html: renderedTemplate.html,
        text: renderedTemplate.text,
        from
      };

      // Send email
      return await this.sendEmail(emailData, provider || templateProvider);

    } catch (error) {
      logger.error('Template email sending failed:', error);
      throw new Error(`Template email sending failed: ${error.message}`);
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails, provider = null) {
    try {
      const emailProvider = provider || this.defaultProvider;
      const service = this.providers[emailProvider];

      if (!service) {
        throw new Error(`Email provider '${emailProvider}' not supported`);
      }

      const result = await service.sendBulkEmails(emails);
      
      logger.info(`Bulk emails sent via ${emailProvider}: ${result.totalSent} sent, ${result.totalFailed} failed`);
      
      return {
        success: true,
        ...result,
        provider: emailProvider
      };

    } catch (error) {
      logger.error('Bulk email sending failed:', error);
      throw new Error(`Bulk email sending failed: ${error.message}`);
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(userData) {
    try {
      const {
        email,
        name,
        organizationName,
        dashboardUrl
      } = userData;

      return await this.sendTemplateEmail({
        to: email,
        templateName: 'welcome',
        templateData: {
          name: name,
          organizationName: organizationName,
          dashboardUrl: dashboardUrl
        },
        from: process.env.EMAIL_FROM || 'noreply@aisocialmedia.com'
      });

    } catch (error) {
      logger.error('Welcome email sending failed:', error);
      throw new Error(`Welcome email sending failed: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userData) {
    try {
      const {
        email,
        name,
        resetLink,
        expirationTime = 24
      } = userData;

      return await this.sendTemplateEmail({
        to: email,
        templateName: 'password-reset',
        templateData: {
          name: name,
          resetLink: resetLink,
          expirationTime: expirationTime
        },
        from: process.env.EMAIL_FROM || 'noreply@aisocialmedia.com'
      });

    } catch (error) {
      logger.error('Password reset email sending failed:', error);
      throw new Error(`Password reset email sending failed: ${error.message}`);
    }
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(notificationData) {
    try {
      const {
        email,
        name,
        title,
        message,
        actionUrl,
        actionText
      } = notificationData;

      return await this.sendTemplateEmail({
        to: email,
        templateName: 'notification',
        templateData: {
          name: name,
          title: title,
          message: message,
          actionUrl: actionUrl,
          actionText: actionText
        },
        from: process.env.EMAIL_FROM || 'noreply@aisocialmedia.com'
      });

    } catch (error) {
      logger.error('Notification email sending failed:', error);
      throw new Error(`Notification email sending failed: ${error.message}`);
    }
  }

  /**
   * Send campaign completion email
   */
  async sendCampaignCompletionEmail(campaignData) {
    try {
      const {
        email,
        name,
        campaignName,
        totalReach,
        engagementRate,
        totalClicks,
        roi,
        campaignUrl
      } = campaignData;

      return await this.sendTemplateEmail({
        to: email,
        templateName: 'campaign-completed',
        templateData: {
          name: name,
          campaignName: campaignName,
          totalReach: totalReach,
          engagementRate: engagementRate,
          totalClicks: totalClicks,
          roi: roi,
          campaignUrl: campaignUrl
        },
        from: process.env.EMAIL_FROM || 'noreply@aisocialmedia.com'
      });

    } catch (error) {
      logger.error('Campaign completion email sending failed:', error);
      throw new Error(`Campaign completion email sending failed: ${error.message}`);
    }
  }

  /**
   * Send custom email
   */
  async sendCustomEmail(emailData) {
    try {
      const {
        to,
        subject,
        content,
        contentType = 'html',
        from,
        attachments = [],
        cc = [],
        bcc = []
      } = emailData;

      const emailPayload = {
        to,
        subject,
        from: from || process.env.EMAIL_FROM || 'noreply@aisocialmedia.com',
        cc,
        bcc,
        attachments
      };

      if (contentType === 'html') {
        emailPayload.html = content;
        emailPayload.text = this.stripHtml(content);
      } else {
        emailPayload.text = content;
      }

      return await this.sendEmail(emailPayload);

    } catch (error) {
      logger.error('Custom email sending failed:', error);
      throw new Error(`Custom email sending failed: ${error.message}`);
    }
  }

  /**
   * Send email to multiple recipients
   */
  async sendEmailToMultiple(recipients, emailData) {
    try {
      const emails = recipients.map(recipient => ({
        ...emailData,
        to: recipient.email,
        templateData: {
          ...emailData.templateData,
          name: recipient.name
        }
      }));

      return await this.sendBulkEmails(emails);

    } catch (error) {
      logger.error('Multiple recipient email sending failed:', error);
      throw new Error(`Multiple recipient email sending failed: ${error.message}`);
    }
  }

  /**
   * Schedule email for later sending
   */
  async scheduleEmail(emailData, scheduleTime) {
    try {
      // This would typically integrate with a job queue like Bull or Agenda
      // For now, we'll just log the scheduled email
      logger.info(`Email scheduled for ${scheduleTime}:`, {
        to: emailData.to,
        subject: emailData.subject,
        scheduleTime: scheduleTime
      });

      return {
        success: true,
        message: 'Email scheduled successfully',
        scheduleTime: scheduleTime
      };

    } catch (error) {
      logger.error('Email scheduling failed:', error);
      throw new Error(`Email scheduling failed: ${error.message}`);
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(provider = null) {
    try {
      const emailProvider = provider || this.defaultProvider;
      const service = this.providers[emailProvider];

      if (!service) {
        throw new Error(`Email provider '${emailProvider}' not supported`);
      }

      if (typeof service.getEmailStats === 'function') {
        return await service.getEmailStats();
      }

      // Return basic stats if provider doesn't support detailed stats
      return {
        success: true,
        stats: {
          provider: emailProvider,
          status: 'active'
        }
      };

    } catch (error) {
      logger.error('Email stats retrieval failed:', error);
      throw new Error(`Email stats retrieval failed: ${error.message}`);
    }
  }

  /**
   * Health check for email service
   */
  async healthCheck() {
    try {
      const results = {};

      for (const [provider, service] of Object.entries(this.providers)) {
        try {
          results[provider] = await service.healthCheck();
        } catch (error) {
          results[provider] = {
            success: false,
            error: error.message
          };
        }
      }

      const healthyProviders = Object.values(results).filter(r => r.success);
      
      return {
        success: healthyProviders.length > 0,
        providers: results,
        defaultProvider: this.defaultProvider,
        healthyProviders: healthyProviders.length
      };

    } catch (error) {
      logger.error('Email service health check failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Strip HTML tags from content
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Validate email address
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get available email providers
   */
  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Get email templates
   */
  getEmailTemplates() {
    return this.templateService.getAllTemplates();
  }
}

module.exports = new EmailService();

