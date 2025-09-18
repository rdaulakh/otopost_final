const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

class SMTPService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize SMTP transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('SMTP connection failed:', error);
        } else {
          logger.info('SMTP server is ready to take our messages');
        }
      });

    } catch (error) {
      logger.error('Failed to initialize SMTP transporter:', error);
    }
  }

  /**
   * Send email using SMTP
   */
  async sendEmail(emailData) {
    try {
      const {
        to,
        subject,
        text,
        html,
        from = process.env.SMTP_FROM || process.env.SMTP_USER,
        cc = [],
        bcc = [],
        attachments = [],
        replyTo = null
      } = emailData;

      if (!this.transporter) {
        throw new Error('SMTP transporter not initialized');
      }

      const mailOptions = {
        from: from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments
      };

      if (cc.length > 0) {
        mailOptions.cc = Array.isArray(cc) ? cc.join(', ') : cc;
      }

      if (bcc.length > 0) {
        mailOptions.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc;
      }

      if (replyTo) {
        mailOptions.replyTo = replyTo;
      }

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${to}: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
        provider: 'smtp'
      };

    } catch (error) {
      logger.error('SMTP email sending failed:', error);
      throw new Error(`SMTP email sending failed: ${error.message}`);
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails) {
    try {
      const results = [];
      
      for (const emailData of emails) {
        try {
          const result = await this.sendEmail(emailData);
          results.push({
            success: true,
            to: emailData.to,
            messageId: result.messageId
          });
        } catch (error) {
          results.push({
            success: false,
            to: emailData.to,
            error: error.message
          });
        }
      }

      return {
        success: true,
        results: results,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        provider: 'smtp'
      };

    } catch (error) {
      logger.error('SMTP bulk email sending failed:', error);
      throw new Error(`SMTP bulk email sending failed: ${error.message}`);
    }
  }

  /**
   * Send email with template
   */
  async sendTemplateEmail(templateData) {
    try {
      const {
        to,
        templateName,
        templateData: data,
        subject,
        from = process.env.SMTP_FROM || process.env.SMTP_USER
      } = templateData;

      // Load template (you would implement template loading logic here)
      const template = await this.loadTemplate(templateName);
      
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      // Replace template variables
      const html = this.replaceTemplateVariables(template.html, data);
      const text = this.replaceTemplateVariables(template.text, data);

      return await this.sendEmail({
        to,
        subject: subject || template.subject,
        html,
        text,
        from
      });

    } catch (error) {
      logger.error('SMTP template email sending failed:', error);
      throw new Error(`SMTP template email sending failed: ${error.message}`);
    }
  }

  /**
   * Load email template
   */
  async loadTemplate(templateName) {
    try {
      // This would typically load from database or file system
      // For now, return a basic template structure
      const templates = {
        'welcome': {
          subject: 'Welcome to AI Social Media Platform',
          html: '<h1>Welcome {{name}}!</h1><p>Thank you for joining our platform.</p>',
          text: 'Welcome {{name}}! Thank you for joining our platform.'
        },
        'password-reset': {
          subject: 'Password Reset Request',
          html: '<h1>Password Reset</h1><p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
          text: 'Password Reset: Click {{resetLink}} to reset your password.'
        },
        'notification': {
          subject: '{{title}}',
          html: '<h2>{{title}}</h2><p>{{message}}</p>',
          text: '{{title}}\n\n{{message}}'
        }
      };

      return templates[templateName] || null;

    } catch (error) {
      logger.error('Failed to load email template:', error);
      return null;
    }
  }

  /**
   * Replace template variables
   */
  replaceTemplateVariables(template, data) {
    let result = template;
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    }
    
    return result;
  }

  /**
   * Health check for SMTP service
   */
  async healthCheck() {
    try {
      if (!this.transporter) {
        return {
          success: false,
          status: 'unhealthy',
          provider: 'smtp',
          error: 'Transporter not initialized'
        };
      }

      await this.transporter.verify();
      
      return {
        success: true,
        status: 'healthy',
        provider: 'smtp'
      };

    } catch (error) {
      logger.error('SMTP health check failed:', error);
      return {
        success: false,
        status: 'unhealthy',
        provider: 'smtp',
        error: error.message
      };
    }
  }

  /**
   * Close SMTP connection
   */
  async close() {
    try {
      if (this.transporter) {
        this.transporter.close();
        logger.info('SMTP connection closed');
      }
    } catch (error) {
      logger.error('Error closing SMTP connection:', error);
    }
  }
}

module.exports = new SMTPService();

