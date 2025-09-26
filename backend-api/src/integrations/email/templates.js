const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class EmailTemplateService {
  constructor() {
    this.templatesPath = path.join(__dirname, '../../../templates/email');
    this.templates = new Map();
    this.loadTemplates();
  }

  /**
   * Load all email templates
   */
  async loadTemplates() {
    try {
      // Ensure templates directory exists
      await this.ensureTemplatesDirectory();

      // Load built-in templates
      this.loadBuiltInTemplates();

      // Load custom templates from filesystem
      await this.loadCustomTemplates();

      logger.info(`Loaded ${this.templates.size} email templates`);

    } catch (error) {
      logger.error('Failed to load email templates:', error);
    }
  }

  /**
   * Ensure templates directory exists
   */
  async ensureTemplatesDirectory() {
    try {
      await fs.mkdir(this.templatesPath, { recursive: true });
    } catch (error) {
      logger.error('Failed to create templates directory:', error);
    }
  }

  /**
   * Load built-in templates
   */
  loadBuiltInTemplates() {
    const builtInTemplates = {
      'welcome': {
        subject: 'Welcome to AI Social Media Platform! 🚀',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome {{name}}! 🎉</h1>
                <p>Your AI-powered social media journey starts here</p>
              </div>
              <div class="content">
                <h2>Thank you for joining our platform!</h2>
                <p>We're excited to help you revolutionize your social media presence with the power of AI.</p>
                
                <h3>What you can do next:</h3>
                <ul>
                  <li>📝 Create engaging content with AI assistance</li>
                  <li>📊 Analyze your social media performance</li>
                  <li>📅 Schedule posts across multiple platforms</li>
                  <li>🎯 Optimize your campaigns with AI insights</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
                </div>
                
                <p>If you have any questions, feel free to reach out to our support team.</p>
              </div>
              <div class="footer">
                <p>© 2024 AI Social Media Platform. All rights reserved.</p>
                <p>You received this email because you signed up for our service.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Welcome {{name}}!
          
          Thank you for joining AI Social Media Platform! We're excited to help you revolutionize your social media presence with the power of AI.
          
          What you can do next:
          - Create engaging content with AI assistance
          - Analyze your social media performance
          - Schedule posts across multiple platforms
          - Optimize your campaigns with AI insights
          
          Go to your dashboard: {{dashboardUrl}}
          
          If you have any questions, feel free to reach out to our support team.
          
          © 2024 AI Social Media Platform. All rights reserved.
        `
      },
      'password-reset': {
        subject: 'Reset Your Password - AI Social Media Platform',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request 🔐</h1>
              </div>
              <div class="content">
                <h2>Hello {{name}},</h2>
                <p>We received a request to reset your password for your AI Social Media Platform account.</p>
                
                <div style="text-align: center;">
                  <a href="{{resetLink}}" class="button">Reset Password</a>
                </div>
                
                <div class="warning">
                  <strong>Important:</strong> This link will expire in {{expirationTime}} hours for security reasons.
                </div>
                
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                
                <p>For security reasons, never share this link with anyone.</p>
              </div>
              <div class="footer">
                <p>© 2024 AI Social Media Platform. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Password Reset Request
          
          Hello {{name}},
          
          We received a request to reset your password for your AI Social Media Platform account.
          
          Reset your password: {{resetLink}}
          
          Important: This link will expire in {{expirationTime}} hours for security reasons.
          
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          
          For security reasons, never share this link with anyone.
          
          © 2024 AI Social Media Platform. All rights reserved.
        `
      },
      'notification': {
        subject: '{{title}} - AI Social Media Platform',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{{title}}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4ecdc4; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #4ecdc4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>{{title}}</h1>
              </div>
              <div class="content">
                <h2>Hello {{name}},</h2>
                <p>{{message}}</p>
                
                {{#if actionUrl}}
                <div style="text-align: center;">
                  <a href="{{actionUrl}}" class="button">{{actionText}}</a>
                </div>
                {{/if}}
                
                <p>Best regards,<br>The AI Social Media Platform Team</p>
              </div>
              <div class="footer">
                <p>© 2024 AI Social Media Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          {{title}}
          
          Hello {{name}},
          
          {{message}}
          
          {{#if actionUrl}}
          {{actionText}}: {{actionUrl}}
          {{/if}}
          
          Best regards,
          The AI Social Media Platform Team
          
          © 2024 AI Social Media Platform. All rights reserved.
        `
      },
      'campaign-completed': {
        subject: 'Campaign "{{campaignName}}" Completed Successfully! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Campaign Completed</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2ecc71; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .stat-item { display: flex; justify-content: space-between; margin: 10px 0; }
              .button { display: inline-block; background: #2ecc71; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Campaign Completed! 🎉</h1>
                <p>Your campaign "{{campaignName}}" has finished successfully</p>
              </div>
              <div class="content">
                <h2>Great job, {{name}}!</h2>
                <p>Your campaign has reached its end date and here are the results:</p>
                
                <div class="stats">
                  <h3>Campaign Performance</h3>
                  <div class="stat-item">
                    <span>Total Reach:</span>
                    <strong>{{totalReach}}</strong>
                  </div>
                  <div class="stat-item">
                    <span>Engagement Rate:</span>
                    <strong>{{engagementRate}}%</strong>
                  </div>
                  <div class="stat-item">
                    <span>Total Clicks:</span>
                    <strong>{{totalClicks}}</strong>
                  </div>
                  <div class="stat-item">
                    <span>ROI:</span>
                    <strong>{{roi}}%</strong>
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <a href="{{campaignUrl}}" class="button">View Full Report</a>
                </div>
                
                <p>Keep up the great work! Consider creating a new campaign to continue growing your social media presence.</p>
              </div>
              <div class="footer">
                <p>© 2024 AI Social Media Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Campaign Completed! 🎉
          
          Great job, {{name}}!
          
          Your campaign "{{campaignName}}" has finished successfully. Here are the results:
          
          Campaign Performance:
          - Total Reach: {{totalReach}}
          - Engagement Rate: {{engagementRate}}%
          - Total Clicks: {{totalClicks}}
          - ROI: {{roi}}%
          
          View full report: {{campaignUrl}}
          
          Keep up the great work! Consider creating a new campaign to continue growing your social media presence.
          
          © 2024 AI Social Media Platform. All rights reserved.
        `
      }
    };

    for (const [name, template] of Object.entries(builtInTemplates)) {
      this.templates.set(name, template);
    }
  }

  /**
   * Load custom templates from filesystem
   */
  async loadCustomTemplates() {
    try {
      const files = await fs.readdir(this.templatesPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const templatePath = path.join(this.templatesPath, file);
          const templateData = await fs.readFile(templatePath, 'utf8');
          const template = JSON.parse(templateData);
          
          const templateName = path.basename(file, '.json');
          this.templates.set(templateName, template);
        }
      }
    } catch (error) {
      logger.error('Failed to load custom templates:', error);
    }
  }

  /**
   * Get template by name
   */
  getTemplate(templateName) {
    return this.templates.get(templateName);
  }

  /**
   * Get all available templates
   */
  getAllTemplates() {
    const templates = [];
    for (const [name, template] of this.templates) {
      templates.push({
        name,
        subject: template.subject,
        hasHtml: !!template.html,
        hasText: !!template.text
      });
    }
    return templates;
  }

  /**
   * Render template with data
   */
  renderTemplate(templateName, data) {
    const template = this.getTemplate(templateName);
    
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    const rendered = {
      subject: this.replaceVariables(template.subject, data),
      html: template.html ? this.replaceVariables(template.html, data) : null,
      text: template.text ? this.replaceVariables(template.text, data) : null
    };

    return rendered;
  }

  /**
   * Replace template variables
   */
  replaceVariables(template, data) {
    let result = template;
    
    // Replace simple variables {{variable}}
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    }
    
    // Handle conditional blocks {{#if condition}}...{{/if}}
    result = this.processConditionals(result, data);
    
    return result;
  }

  /**
   * Process conditional blocks in templates
   */
  processConditionals(template, data) {
    const conditionalRegex = /{{#if\s+(\w+)}}(.*?){{\/if}}/gs;
    
    return template.replace(conditionalRegex, (match, condition, content) => {
      if (data[condition]) {
        return content;
      }
      return '';
    });
  }

  /**
   * Create new template
   */
  async createTemplate(templateName, templateData) {
    try {
      const template = {
        subject: templateData.subject,
        html: templateData.html,
        text: templateData.text,
        createdAt: new Date().toISOString()
      };

      this.templates.set(templateName, template);

      // Save to filesystem
      const templatePath = path.join(this.templatesPath, `${templateName}.json`);
      await fs.writeFile(templatePath, JSON.stringify(template, null, 2));

      logger.info(`Template '${templateName}' created successfully`);
      
      return {
        success: true,
        templateName,
        message: 'Template created successfully'
      };

    } catch (error) {
      logger.error('Failed to create template:', error);
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  /**
   * Update existing template
   */
  async updateTemplate(templateName, templateData) {
    try {
      const existingTemplate = this.getTemplate(templateName);
      
      if (!existingTemplate) {
        throw new Error(`Template '${templateName}' not found`);
      }

      const updatedTemplate = {
        ...existingTemplate,
        ...templateData,
        updatedAt: new Date().toISOString()
      };

      this.templates.set(templateName, updatedTemplate);

      // Save to filesystem
      const templatePath = path.join(this.templatesPath, `${templateName}.json`);
      await fs.writeFile(templatePath, JSON.stringify(updatedTemplate, null, 2));

      logger.info(`Template '${templateName}' updated successfully`);
      
      return {
        success: true,
        templateName,
        message: 'Template updated successfully'
      };

    } catch (error) {
      logger.error('Failed to update template:', error);
      throw new Error(`Failed to update template: ${error.message}`);
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateName) {
    try {
      if (!this.templates.has(templateName)) {
        throw new Error(`Template '${templateName}' not found`);
      }

      this.templates.delete(templateName);

      // Remove from filesystem
      const templatePath = path.join(this.templatesPath, `${templateName}.json`);
      try {
        await fs.unlink(templatePath);
      } catch (error) {
        // File might not exist, that's okay
      }

      logger.info(`Template '${templateName}' deleted successfully`);
      
      return {
        success: true,
        templateName,
        message: 'Template deleted successfully'
      };

    } catch (error) {
      logger.error('Failed to delete template:', error);
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }

  /**
   * Health check for template service
   */
  async healthCheck() {
    try {
      return {
        success: true,
        status: 'healthy',
        provider: 'email-templates',
        templateCount: this.templates.size
      };
    } catch (error) {
      logger.error('Email template service health check failed:', error);
      return {
        success: false,
        status: 'unhealthy',
        provider: 'email-templates',
        error: error.message
      };
    }
  }
}

module.exports = new EmailTemplateService();

