const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.isConfigured = true;
    } else {
      console.warn('SendGrid API key not configured. Email functionality will be limited.');
      this.isConfigured = false;
    }
    
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com';
    this.templates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      welcome: {
        subject: 'Welcome to AI Social Media Platform! 🚀',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Welcome to AI Social Media Platform!</h1>
            <p>Hi {{name}},</p>
            <p>Thank you for joining our platform! We're excited to help you revolutionize your social media management with AI-powered tools.</p>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🎯 What you can do now:</h3>
              <ul>
                <li>✅ Generate engaging content with AI</li>
                <li>✅ Create trending hashtags automatically</li>
                <li>✅ Schedule posts across multiple platforms</li>
                <li>✅ Analyze your performance with detailed insights</li>
                <li>✅ Get real-time notifications and updates</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started Now</a>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The AI Social Media Platform Team</p>
          </div>
        `
      },
      
      passwordReset: {
        subject: 'Reset Your Password - AI Social Media Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Password Reset Request</h1>
            <p>Hi {{name}},</p>
            <p>We received a request to reset your password for your AI Social Media Platform account.</p>
            
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetUrl}}" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            
            <p><small>This link will expire in 1 hour for security reasons.</small></p>
            <p>Best regards,<br>The AI Social Media Platform Team</p>
          </div>
        `
      },
      
      contentPublished: {
        subject: '✅ Your content has been published successfully!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10B981;">Content Published Successfully! ✅</h1>
            <p>Hi {{name}},</p>
            <p>Great news! Your content "{{contentTitle}}" has been published successfully across your selected platforms.</p>
            
            <div style="background: #F0FDF4; border: 1px solid #10B981; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0;">📊 Publishing Summary:</h3>
              <ul style="margin-bottom: 0;">
                {{#each platforms}}
                <li>✅ {{this}}</li>
                {{/each}}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{analyticsUrl}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Analytics</a>
            </div>
            
            <p>You can track the performance of your post in real-time through your dashboard.</p>
            <p>Best regards,<br>The AI Social Media Platform Team</p>
          </div>
        `
      },
      
      analyticsReport: {
        subject: '📈 Your Weekly Analytics Report is Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">📈 Weekly Analytics Report</h1>
            <p>Hi {{name}},</p>
            <p>Here's your weekly performance summary for {{dateRange}}:</p>
            
            <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="text-align: center;">
                  <h3 style="color: #10B981; margin: 0;">{{totalPosts}}</h3>
                  <p style="margin: 5px 0;">Posts Published</p>
                </div>
                <div style="text-align: center;">
                  <h3 style="color: #F59E0B; margin: 0;">{{totalEngagement}}</h3>
                  <p style="margin: 5px 0;">Total Engagement</p>
                </div>
                <div style="text-align: center;">
                  <h3 style="color: #8B5CF6; margin: 0;">{{totalReach}}</h3>
                  <p style="margin: 5px 0;">Total Reach</p>
                </div>
                <div style="text-align: center;">
                  <h3 style="color: #EF4444; margin: 0;">{{engagementRate}}%</h3>
                  <p style="margin: 5px 0;">Engagement Rate</p>
                </div>
              </div>
            </div>
            
            <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0;">💡 AI Insights:</h3>
              <ul style="margin-bottom: 0;">
                {{#each insights}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Report</a>
            </div>
            
            <p>Keep up the great work!</p>
            <p>Best regards,<br>The AI Social Media Platform Team</p>
          </div>
        `
      },
      
      subscriptionUpgrade: {
        subject: '🎉 Welcome to {{planName}} - Your Upgrade is Active!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10B981;">🎉 Upgrade Successful!</h1>
            <p>Hi {{name}},</p>
            <p>Congratulations! Your account has been successfully upgraded to <strong>{{planName}}</strong>.</p>
            
            <div style="background: #F0FDF4; border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">🚀 New Features Unlocked:</h3>
              <ul style="margin-bottom: 0;">
                {{#each features}}
                <li>✅ {{this}}</li>
                {{/each}}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Explore New Features</a>
            </div>
            
            <p>Your billing cycle starts today, and you'll receive your next invoice on {{nextBillingDate}}.</p>
            <p>Thank you for choosing AI Social Media Platform!</p>
            <p>Best regards,<br>The AI Social Media Platform Team</p>
          </div>
        `
      },
      
      securityAlert: {
        subject: '🔒 Security Alert - New Login Detected',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #DC2626;">🔒 Security Alert</h1>
            <p>Hi {{name}},</p>
            <p>We detected a new login to your AI Social Media Platform account.</p>
            
            <div style="background: #FEF2F2; border: 1px solid #DC2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Login Details:</h3>
              <ul style="margin-bottom: 0;">
                <li><strong>Time:</strong> {{loginTime}}</li>
                <li><strong>Location:</strong> {{location}}</li>
                <li><strong>Device:</strong> {{device}}</li>
                <li><strong>IP Address:</strong> {{ipAddress}}</li>
              </ul>
            </div>
            
            <p><strong>Was this you?</strong></p>
            <p>If you recognize this login, you can ignore this email. If you don't recognize this activity, please secure your account immediately.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{secureAccountUrl}}" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Secure My Account</a>
            </div>
            
            <p>Best regards,<br>The AI Social Media Platform Security Team</p>
          </div>
        `
      }
    };
  }

  async sendEmail(to, templateName, data = {}) {
    if (!this.isConfigured) {
      console.log(`Email would be sent to ${to} with template ${templateName}:`, data);
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const template = this.templates[templateName];
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      // Simple template replacement (in production, use a proper template engine)
      let html = template.html;
      let subject = template.subject;

      // Replace variables in template
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, data[key] || '');
        subject = subject.replace(regex, data[key] || '');
      });

      const msg = {
        to,
        from: this.fromEmail,
        subject,
        html
      };

      const result = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        statusCode: result[0].statusCode
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail(user.email, 'welcome', {
      name: user.name,
      loginUrl: `${process.env.FRONTEND_URL}/login`
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    return this.sendEmail(user.email, 'passwordReset', {
      name: user.name,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    });
  }

  async sendContentPublishedEmail(user, content, platforms) {
    return this.sendEmail(user.email, 'contentPublished', {
      name: user.name,
      contentTitle: content.title,
      platforms: platforms,
      analyticsUrl: `${process.env.FRONTEND_URL}/analytics`
    });
  }

  async sendAnalyticsReportEmail(user, reportData) {
    return this.sendEmail(user.email, 'analyticsReport', {
      name: user.name,
      dateRange: reportData.dateRange,
      totalPosts: reportData.totalPosts,
      totalEngagement: reportData.totalEngagement,
      totalReach: reportData.totalReach,
      engagementRate: reportData.engagementRate,
      insights: reportData.insights,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
    });
  }

  async sendSubscriptionUpgradeEmail(user, planName, features) {
    return this.sendEmail(user.email, 'subscriptionUpgrade', {
      name: user.name,
      planName,
      features,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    });
  }

  async sendSecurityAlertEmail(user, loginDetails) {
    return this.sendEmail(user.email, 'securityAlert', {
      name: user.name,
      loginTime: loginDetails.time,
      location: loginDetails.location,
      device: loginDetails.device,
      ipAddress: loginDetails.ip,
      secureAccountUrl: `${process.env.FRONTEND_URL}/security`
    });
  }

  async sendBulkEmail(recipients, templateName, data = {}) {
    if (!this.isConfigured) {
      console.log(`Bulk email would be sent to ${recipients.length} recipients with template ${templateName}`);
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const results = [];
      
      // Send emails in batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const batchPromises = batch.map(recipient => {
          const personalizedData = { ...data, ...recipient };
          return this.sendEmail(recipient.email, templateName, personalizedData);
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Wait between batches to respect rate limits
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      return {
        success: true,
        total: recipients.length,
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error('Bulk email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getEmailStats() {
    // In a real implementation, you would fetch stats from SendGrid API
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0
    };
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async testEmailConfiguration() {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      // Send a test email to verify configuration
      const testResult = await this.sendEmail(
        this.fromEmail,
        'welcome',
        {
          name: 'Test User',
          loginUrl: `${process.env.FRONTEND_URL}/login`
        }
      );

      return {
        success: testResult.success,
        message: testResult.success ? 'Email configuration is working' : 'Email configuration failed',
        error: testResult.error
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();
