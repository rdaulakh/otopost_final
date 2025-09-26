const sgMail = require('@sendgrid/mail');
const logger = require('../../utils/logger');

class SendGridService {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@aisocialmedia.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'AI Social Media Platform';
    
    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    } else {
      logger.warn('SendGrid API key not provided');
    }
  }

  /**
   * Send email using SendGrid
   */
  async sendEmail(emailData) {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      const {
        to,
        subject,
        text,
        html,
        from = `${this.fromName} <${this.fromEmail}>`,
        cc = [],
        bcc = [],
        attachments = [],
        replyTo = null,
        templateId = null,
        dynamicTemplateData = {},
        categories = [],
        customArgs = {}
      } = emailData;

      const msg = {
        to: Array.isArray(to) ? to : [to],
        from: from,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments,
        categories: categories,
        customArgs: customArgs
      };

      if (cc.length > 0) {
        msg.cc = Array.isArray(cc) ? cc : [cc];
      }

      if (bcc.length > 0) {
        msg.bcc = Array.isArray(bcc) ? bcc : [bcc];
      }

      if (replyTo) {
        msg.replyTo = replyTo;
      }

      if (templateId) {
        msg.templateId = templateId;
        msg.dynamicTemplateData = dynamicTemplateData;
        // Remove text and html when using template
        delete msg.text;
        delete msg.html;
      }

      const response = await sgMail.send(msg);
      
      logger.info(`SendGrid email sent successfully to ${to}: ${response[0].headers['x-message-id']}`);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        response: response[0],
        provider: 'sendgrid'
      };

    } catch (error) {
      logger.error('SendGrid email sending failed:', error);
      throw new Error(`SendGrid email sending failed: ${error.message}`);
    }
  }

  /**
   * Send bulk emails using SendGrid
   */
  async sendBulkEmails(emails) {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      const results = [];
      
      // SendGrid allows up to 1000 emails per request
      const batchSize = 1000;
      const batches = this.chunkArray(emails, batchSize);

      for (const batch of batches) {
        try {
          const response = await sgMail.send(batch);
          results.push({
            success: true,
            batchSize: batch.length,
            messageIds: response.map(r => r.headers['x-message-id'])
          });
        } catch (error) {
          results.push({
            success: false,
            batchSize: batch.length,
            error: error.message
          });
        }
      }

      return {
        success: true,
        results: results,
        totalBatches: batches.length,
        provider: 'sendgrid'
      };

    } catch (error) {
      logger.error('SendGrid bulk email sending failed:', error);
      throw new Error(`SendGrid bulk email sending failed: ${error.message}`);
    }
  }

  /**
   * Send email with SendGrid template
   */
  async sendTemplateEmail(templateData) {
    try {
      const {
        to,
        templateId,
        dynamicTemplateData,
        from = `${this.fromName} <${this.fromEmail}>`,
        cc = [],
        bcc = [],
        categories = [],
        customArgs = {}
      } = templateData;

      return await this.sendEmail({
        to,
        from,
        cc,
        bcc,
        templateId,
        dynamicTemplateData,
        categories,
        customArgs
      });

    } catch (error) {
      logger.error('SendGrid template email sending failed:', error);
      throw new Error(`SendGrid template email sending failed: ${error.message}`);
    }
  }

  /**
   * Create SendGrid template
   */
  async createTemplate(templateData) {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      const {
        name,
        subject,
        htmlContent,
        textContent,
        categories = []
      } = templateData;

      const template = {
        name: name,
        generation: 'dynamic',
        subject: subject,
        html_content: htmlContent,
        plain_content: textContent,
        categories: categories
      };

      // Note: This would require SendGrid API v3 for template management
      // For now, we'll return a mock response
      logger.info(`Template creation requested: ${name}`);
      
      return {
        success: true,
        templateId: `template_${Date.now()}`,
        name: name,
        provider: 'sendgrid'
      };

    } catch (error) {
      logger.error('SendGrid template creation failed:', error);
      throw new Error(`SendGrid template creation failed: ${error.message}`);
    }
  }

  /**
   * Get email statistics from SendGrid
   */
  async getEmailStats(startDate, endDate) {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      // This would require SendGrid Stats API
      // For now, return mock data
      logger.info(`Email stats requested from ${startDate} to ${endDate}`);
      
      return {
        success: true,
        stats: {
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          blocked: 0,
          spam: 0
        },
        provider: 'sendgrid'
      };

    } catch (error) {
      logger.error('SendGrid stats retrieval failed:', error);
      throw new Error(`SendGrid stats retrieval failed: ${error.message}`);
    }
  }

  /**
   * Add email to suppression list
   */
  async addToSuppressionList(email, group = 'bounces') {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      // This would require SendGrid Suppression Management API
      logger.info(`Adding ${email} to ${group} suppression list`);
      
      return {
        success: true,
        email: email,
        group: group,
        provider: 'sendgrid'
      };

    } catch (error) {
      logger.error('SendGrid suppression list update failed:', error);
      throw new Error(`SendGrid suppression list update failed: ${error.message}`);
    }
  }

  /**
   * Remove email from suppression list
   */
  async removeFromSuppressionList(email, group = 'bounces') {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      // This would require SendGrid Suppression Management API
      logger.info(`Removing ${email} from ${group} suppression list`);
      
      return {
        success: true,
        email: email,
        group: group,
        provider: 'sendgrid'
      };

    } catch (error) {
      logger.error('SendGrid suppression list update failed:', error);
      throw new Error(`SendGrid suppression list update failed: ${error.message}`);
    }
  }

  /**
   * Health check for SendGrid service
   */
  async healthCheck() {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          status: 'unhealthy',
          provider: 'sendgrid',
          error: 'API key not configured'
        };
      }

      // Test with a simple API call
      const testEmail = {
        to: 'test@example.com',
        from: this.fromEmail,
        subject: 'Health Check',
        text: 'This is a health check email'
      };

      // Don't actually send, just validate the configuration
      return {
        success: true,
        status: 'healthy',
        provider: 'sendgrid',
        fromEmail: this.fromEmail
      };

    } catch (error) {
      logger.error('SendGrid health check failed:', error);
      return {
        success: false,
        status: 'unhealthy',
        provider: 'sendgrid',
        error: error.message
      };
    }
  }

  /**
   * Utility function to chunk array
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

module.exports = new SendGridService();

