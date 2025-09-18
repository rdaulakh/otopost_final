const AWS = require('aws-sdk');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');

class SESIntegration {
    constructor() {
        this.ses = null;
        this.region = process.env.AWS_REGION || 'us-east-1';
    }

    /**
     * Initialize AWS SES with credentials
     */
    initialize(credentials) {
        const config = {
            region: this.region,
            apiVersion: '2010-12-01'
        };

        if (credentials) {
            config.accessKeyId = decrypt(credentials.accessKeyId);
            config.secretAccessKey = decrypt(credentials.secretAccessKey);
        }

        this.ses = new AWS.SES(config);
        return this.ses;
    }

    /**
     * Send transactional email
     */
    async sendEmail(emailData, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                Source: emailData.fromEmail,
                Destination: {
                    ToAddresses: Array.isArray(emailData.toEmails) ? emailData.toEmails : [emailData.toEmails]
                },
                Message: {
                    Subject: {
                        Data: emailData.subject,
                        Charset: 'UTF-8'
                    },
                    Body: {}
                }
            };

            // Add CC and BCC if provided
            if (emailData.ccEmails && emailData.ccEmails.length > 0) {
                params.Destination.CcAddresses = Array.isArray(emailData.ccEmails) ? emailData.ccEmails : [emailData.ccEmails];
            }
            if (emailData.bccEmails && emailData.bccEmails.length > 0) {
                params.Destination.BccAddresses = Array.isArray(emailData.bccEmails) ? emailData.bccEmails : [emailData.bccEmails];
            }

            // Add reply-to if provided
            if (emailData.replyToEmails) {
                params.ReplyToAddresses = Array.isArray(emailData.replyToEmails) ? emailData.replyToEmails : [emailData.replyToEmails];
            }

            // Set email body (HTML or text)
            if (emailData.htmlBody) {
                params.Message.Body.Html = {
                    Data: emailData.htmlBody,
                    Charset: 'UTF-8'
                };
            }
            if (emailData.textBody) {
                params.Message.Body.Text = {
                    Data: emailData.textBody,
                    Charset: 'UTF-8'
                };
            }

            // Add tags for tracking
            if (emailData.tags && Object.keys(emailData.tags).length > 0) {
                params.Tags = Object.entries(emailData.tags).map(([key, value]) => ({
                    Name: key,
                    Value: value
                }));
            }

            const result = await sesClient.sendEmail(params).promise();

            logger.info('SES email sent successfully:', {
                messageId: result.MessageId,
                to: emailData.toEmails,
                subject: emailData.subject
            });

            return {
                success: true,
                messageId: result.MessageId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('SES sendEmail error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to send email'
            };
        }
    }

    /**
     * Send templated email
     */
    async sendTemplatedEmail(templateData, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                Source: templateData.fromEmail,
                Template: templateData.templateName,
                Destination: {
                    ToAddresses: Array.isArray(templateData.toEmails) ? templateData.toEmails : [templateData.toEmails]
                },
                TemplateData: JSON.stringify(templateData.templateData || {})
            };

            // Add CC and BCC if provided
            if (templateData.ccEmails && templateData.ccEmails.length > 0) {
                params.Destination.CcAddresses = Array.isArray(templateData.ccEmails) ? templateData.ccEmails : [templateData.ccEmails];
            }
            if (templateData.bccEmails && templateData.bccEmails.length > 0) {
                params.Destination.BccAddresses = Array.isArray(templateData.bccEmails) ? templateData.bccEmails : [templateData.bccEmails];
            }

            // Add reply-to if provided
            if (templateData.replyToEmails) {
                params.ReplyToAddresses = Array.isArray(templateData.replyToEmails) ? templateData.replyToEmails : [templateData.replyToEmails];
            }

            // Add tags for tracking
            if (templateData.tags && Object.keys(templateData.tags).length > 0) {
                params.Tags = Object.entries(templateData.tags).map(([key, value]) => ({
                    Name: key,
                    Value: value
                }));
            }

            const result = await sesClient.sendTemplatedEmail(params).promise();

            logger.info('SES templated email sent successfully:', {
                messageId: result.MessageId,
                template: templateData.templateName,
                to: templateData.toEmails
            });

            return {
                success: true,
                messageId: result.MessageId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('SES sendTemplatedEmail error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to send templated email'
            };
        }
    }

    /**
     * Send bulk emails
     */
    async sendBulkTemplatedEmail(bulkData, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                Source: bulkData.fromEmail,
                Template: bulkData.templateName,
                DefaultTemplateData: JSON.stringify(bulkData.defaultTemplateData || {}),
                Destinations: bulkData.destinations.map(dest => ({
                    Destination: {
                        ToAddresses: [dest.email]
                    },
                    ReplacementTemplateData: JSON.stringify(dest.templateData || {})
                }))
            };

            // Add reply-to if provided
            if (bulkData.replyToEmails) {
                params.ReplyToAddresses = Array.isArray(bulkData.replyToEmails) ? bulkData.replyToEmails : [bulkData.replyToEmails];
            }

            // Add tags for tracking
            if (bulkData.tags && Object.keys(bulkData.tags).length > 0) {
                params.Tags = Object.entries(bulkData.tags).map(([key, value]) => ({
                    Name: key,
                    Value: value
                }));
            }

            const result = await sesClient.sendBulkTemplatedEmail(params).promise();

            logger.info('SES bulk email sent successfully:', {
                messageId: result.MessageId,
                template: bulkData.templateName,
                recipientCount: bulkData.destinations.length
            });

            return {
                success: true,
                messageId: result.MessageId,
                status: result.Status,
                recipientCount: bulkData.destinations.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('SES sendBulkTemplatedEmail error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to send bulk email'
            };
        }
    }

    /**
     * Create email template
     */
    async createTemplate(templateData, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                Template: {
                    TemplateName: templateData.name,
                    SubjectPart: templateData.subject,
                    HtmlPart: templateData.htmlBody,
                    TextPart: templateData.textBody || ''
                }
            };

            await sesClient.createTemplate(params).promise();

            logger.info('SES template created successfully:', {
                templateName: templateData.name
            });

            return {
                success: true,
                templateName: templateData.name,
                message: 'Template created successfully'
            };
        } catch (error) {
            logger.error('SES createTemplate error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to create template'
            };
        }
    }

    /**
     * Update email template
     */
    async updateTemplate(templateData, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                Template: {
                    TemplateName: templateData.name,
                    SubjectPart: templateData.subject,
                    HtmlPart: templateData.htmlBody,
                    TextPart: templateData.textBody || ''
                }
            };

            await sesClient.updateTemplate(params).promise();

            logger.info('SES template updated successfully:', {
                templateName: templateData.name
            });

            return {
                success: true,
                templateName: templateData.name,
                message: 'Template updated successfully'
            };
        } catch (error) {
            logger.error('SES updateTemplate error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to update template'
            };
        }
    }

    /**
     * Delete email template
     */
    async deleteTemplate(templateName, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                TemplateName: templateName
            };

            await sesClient.deleteTemplate(params).promise();

            logger.info('SES template deleted successfully:', {
                templateName: templateName
            });

            return {
                success: true,
                templateName: templateName,
                message: 'Template deleted successfully'
            };
        } catch (error) {
            logger.error('SES deleteTemplate error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to delete template'
            };
        }
    }

    /**
     * Get template details
     */
    async getTemplate(templateName, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                TemplateName: templateName
            };

            const result = await sesClient.getTemplate(params).promise();

            return {
                success: true,
                template: {
                    name: result.Template.TemplateName,
                    subject: result.Template.SubjectPart,
                    htmlBody: result.Template.HtmlPart,
                    textBody: result.Template.TextPart,
                    createdTimestamp: result.Template.CreatedTimestamp
                }
            };
        } catch (error) {
            logger.error('SES getTemplate error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to get template'
            };
        }
    }

    /**
     * List email templates
     */
    async listTemplates(credentials = null, maxItems = 50, nextToken = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                MaxItems: maxItems
            };

            if (nextToken) {
                params.NextToken = nextToken;
            }

            const result = await sesClient.listTemplates(params).promise();

            return {
                success: true,
                templates: result.TemplatesMetadata.map(template => ({
                    name: template.Name,
                    createdTimestamp: template.CreatedTimestamp
                })),
                nextToken: result.NextToken
            };
        } catch (error) {
            logger.error('SES listTemplates error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to list templates'
            };
        }
    }

    /**
     * Verify email address
     */
    async verifyEmailAddress(emailAddress, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                EmailAddress: emailAddress
            };

            await sesClient.verifyEmailIdentity(params).promise();

            logger.info('SES email verification initiated:', {
                emailAddress: emailAddress
            });

            return {
                success: true,
                emailAddress: emailAddress,
                message: 'Verification email sent'
            };
        } catch (error) {
            logger.error('SES verifyEmailAddress error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to verify email address'
            };
        }
    }

    /**
     * Verify domain
     */
    async verifyDomain(domain, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                Domain: domain
            };

            const result = await sesClient.verifyDomainIdentity(params).promise();

            logger.info('SES domain verification initiated:', {
                domain: domain,
                verificationToken: result.VerificationToken
            });

            return {
                success: true,
                domain: domain,
                verificationToken: result.VerificationToken,
                message: 'Domain verification initiated'
            };
        } catch (error) {
            logger.error('SES verifyDomain error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to verify domain'
            };
        }
    }

    /**
     * Get sending statistics
     */
    async getSendingStatistics(credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const result = await sesClient.getSendStatistics().promise();

            return {
                success: true,
                statistics: result.SendDataPoints.map(point => ({
                    timestamp: point.Timestamp,
                    deliveryAttempts: point.DeliveryAttempts,
                    bounces: point.Bounces,
                    complaints: point.Complaints,
                    rejects: point.Rejects
                }))
            };
        } catch (error) {
            logger.error('SES getSendingStatistics error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to get sending statistics'
            };
        }
    }

    /**
     * Get sending quota
     */
    async getSendingQuota(credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const result = await sesClient.getSendQuota().promise();

            return {
                success: true,
                quota: {
                    max24HourSend: result.Max24HourSend,
                    maxSendRate: result.MaxSendRate,
                    sentLast24Hours: result.SentLast24Hours
                }
            };
        } catch (error) {
            logger.error('SES getSendingQuota error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to get sending quota'
            };
        }
    }

    /**
     * List verified email addresses
     */
    async listVerifiedEmailAddresses(credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const result = await sesClient.listVerifiedEmailAddresses().promise();

            return {
                success: true,
                verifiedEmails: result.VerifiedEmailAddresses
            };
        } catch (error) {
            logger.error('SES listVerifiedEmailAddresses error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to list verified email addresses'
            };
        }
    }

    /**
     * Set identity notification topic (for bounces, complaints, deliveries)
     */
    async setIdentityNotificationTopic(identity, notificationType, snsTopic, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                Identity: identity,
                NotificationType: notificationType, // Bounce, Complaint, Delivery
                SnsTopic: snsTopic
            };

            await sesClient.setIdentityNotificationTopic(params).promise();

            logger.info('SES notification topic set successfully:', {
                identity: identity,
                notificationType: notificationType,
                snsTopic: snsTopic
            });

            return {
                success: true,
                message: 'Notification topic set successfully'
            };
        } catch (error) {
            logger.error('SES setIdentityNotificationTopic error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to set notification topic'
            };
        }
    }

    /**
     * Put identity policy (for cross-account access)
     */
    async putIdentityPolicy(identity, policyName, policy, credentials = null) {
        try {
            const sesClient = this.initialize(credentials);
            
            const params = {
                Identity: identity,
                PolicyName: policyName,
                Policy: JSON.stringify(policy)
            };

            await sesClient.putIdentityPolicy(params).promise();

            logger.info('SES identity policy set successfully:', {
                identity: identity,
                policyName: policyName
            });

            return {
                success: true,
                message: 'Identity policy set successfully'
            };
        } catch (error) {
            logger.error('SES putIdentityPolicy error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to set identity policy'
            };
        }
    }
}

module.exports = new SESIntegration();

