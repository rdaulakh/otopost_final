const AIAgent = require('../models/AIAgent');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');
const axios = require('axios');

class AgentProvisioningService {
  constructor() {
    this.aiAgentsUrl = process.env.AI_AGENTS_URL || 'http://localhost:8001';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Provision all AI agents for a new organization
   * @param {string} organizationId - Organization ID
   * @param {Object} organizationData - Organization data for context
   * @returns {Promise<Object>} Provisioning result
   */
  async provisionAgentsForOrganization(organizationId, organizationData = {}) {
    try {
      logger.info(`Starting agent provisioning for organization: ${organizationId}`);

      const agentTypes = [
        'intelligence_agent',
        'strategy_agent', 
        'content_agent',
        'execution_agent',
        'learning_agent',
        'engagement_agent',
        'analytics_agent'
      ];

      const provisionedAgents = [];
      const errors = [];

      // Get organization details for context
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error(`Organization ${organizationId} not found`);
      }

      // Create agents in database
      for (const agentType of agentTypes) {
        try {
          const agent = await this.createAgentInDatabase(organizationId, agentType, organization);
          provisionedAgents.push(agent);
          logger.info(`Created ${agentType} for organization ${organizationId}`);
        } catch (error) {
          logger.error(`Failed to create ${agentType} for organization ${organizationId}:`, error);
          errors.push({ agentType, error: error.message });
        }
      }

      // Register agents with AI agents service
      try {
        await this.registerAgentsWithAIService(organizationId, provisionedAgents);
        logger.info(`Registered ${provisionedAgents.length} agents with AI service for organization ${organizationId}`);
      } catch (error) {
        logger.error(`Failed to register agents with AI service for organization ${organizationId}:`, error);
        errors.push({ step: 'ai_service_registration', error: error.message });
      }

      const result = {
        success: errors.length === 0,
        organizationId,
        agentsCreated: provisionedAgents.length,
        agents: provisionedAgents.map(agent => ({
          id: agent._id,
          type: agent.type,
          name: agent.name,
          status: agent.status
        })),
        errors: errors.length > 0 ? errors : null
      };

      logger.info(`Agent provisioning completed for organization ${organizationId}:`, {
        success: result.success,
        agentsCreated: result.agentsCreated,
        errors: errors.length
      });

      return result;

    } catch (error) {
      logger.error(`Agent provisioning failed for organization ${organizationId}:`, error);
      throw error;
    }
  }

  /**
   * Create a single agent in the database
   * @param {string} organizationId - Organization ID
   * @param {string} agentType - Type of agent
   * @param {Object} organization - Organization data
   * @returns {Promise<Object>} Created agent
   */
  async createAgentInDatabase(organizationId, agentType, organization) {
    const agentName = `${agentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${organization.name}`;
    
    const agent = new AIAgent({
      name: agentName,
      type: agentType,
      description: `AI agent for ${agentType.replace('_', ' ')} tasks for ${organization.name}`,
      version: '1.0.0',
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: this.generateSystemPrompt(agentType, organization),
        customInstructions: this.generateCustomInstructions(agentType, organization),
        tools: this.getAgentTools(agentType),
        capabilities: this.getAgentCapabilities(agentType),
        organizationContext: {
          brandVoice: organization.brandSettings?.brandVoice || 'professional',
          industry: organization.businessInfo?.industry || 'other',
          targetAudience: organization.businessInfo?.targetAudience || 'Business professionals',
          businessType: organization.businessInfo?.businessType || 'b2b',
          companySize: organization.businessInfo?.companySize || '1-10'
        }
      },
      organizationSpecific: {
        organizationId: organizationId,
        isCustomized: false,
        customPrompts: new Map(),
        brandVoice: organization.brandSettings?.brandVoice || 'professional',
        targetAudience: organization.businessInfo?.targetAudience || 'Business professionals',
        businessObjectives: organization.businessInfo?.businessObjectives || [],
        industryContext: organization.businessInfo?.industry || 'other'
      },
      status: 'active',
      isEnabled: true,
      priority: 5,
      performance: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageExecutionTime: 0,
        successRate: 0,
        lastExecutionTime: 0,
        averageQualityScore: 0,
        totalTokensUsed: 0,
        totalCost: 0
      },
      memory: {
        vectorStoreId: `chroma_${organizationId}_${agentType}`,
        conversationHistory: [],
        learnedPatterns: [],
        knowledgeBase: [],
        maxMemoryEntries: 1000,
        memoryRetentionDays: 90
      },
      workflow: {
        dependencies: agentType === 'intelligence_agent' ? [] : [{
          agentType: 'intelligence_agent',
          relationship: 'requires',
          priority: 5
        }],
        triggers: [
          { event: 'manual', condition: {}, action: 'execute' },
          { event: 'scheduled', condition: { cron: '0 9 * * 1-5' }, action: 'execute' },
          { event: 'event_based', condition: {}, action: 'execute' }
        ],
        schedule: {
          enabled: true,
          cronExpression: '0 9 * * 1-5', // 9 AM weekdays
          timezone: 'UTC'
        },
        priority: 'normal',
        timeout: 300, // 5 minutes
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 5000, // 5 seconds
          backoffMultiplier: 2
        }
      },
      health: {
        status: 'healthy',
        lastHealthCheck: new Date(),
        uptime: 0,
        responseTime: 0,
        errorRate: 0
      },
      taskQueue: [],
      isActive: true,
      lastActivity: new Date(),
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        version: '1.0.0',
        tags: ['auto-provisioned', organization.businessInfo?.industry || 'other']
      }
    });

    await agent.save();
    return agent;
  }

  /**
   * Register agents with the AI agents service
   * @param {string} organizationId - Organization ID
   * @param {Array} agents - Array of created agents
   * @returns {Promise<void>}
   */
  async registerAgentsWithAIService(organizationId, agents) {
    try {
      logger.info(`Registering ${agents.length} agents with AI service for organization ${organizationId}`);
      
      // Call the AI agents service to register the agents
      const response = await axios.post(`${this.aiAgentsUrl}/agents/register-organization`, {
        organizationId: organizationId,
        organizationData: {
          name: agents[0]?.organizationSpecific?.organizationName || 'Organization',
          industry: agents[0]?.organizationSpecific?.industryContext || 'other',
          brandVoice: agents[0]?.organizationSpecific?.brandVoice || 'professional',
          targetAudience: agents[0]?.organizationSpecific?.targetAudience || 'Business professionals'
        }
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        logger.info(`Successfully registered agents with AI service for organization ${organizationId}`);
      } else {
        logger.warn(`AI service registration returned success: false for organization ${organizationId}`);
      }
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to register agents with AI service:`, error);
      // Don't throw error - agent provisioning should continue even if AI service registration fails
      logger.warn(`Continuing with agent provisioning despite AI service registration failure`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate system prompt for agent
   * @param {string} agentType - Type of agent
   * @param {Object} organization - Organization data
   * @returns {string} System prompt
   */
  generateSystemPrompt(agentType, organization) {
    const basePrompt = `You are a ${agentType.replace('_', ' ')} AI agent for ${organization.name}.`;
    
    const contextPrompts = {
      intelligence_agent: `Analyze data and provide insights for ${organization.name} in the ${organization.businessInfo?.industry || 'business'} industry.`,
      strategy_agent: `Develop content strategies for ${organization.name} targeting ${organization.businessInfo?.targetAudience || 'business professionals'}.`,
      content_agent: `Create engaging content for ${organization.name} with a ${organization.brandSettings?.brandVoice || 'professional'} voice.`,
      execution_agent: `Execute and manage content publishing for ${organization.name} across social media platforms.`,
      learning_agent: `Analyze performance and optimize strategies for ${organization.name}.`,
      engagement_agent: `Manage community engagement and responses for ${organization.name}.`,
      analytics_agent: `Provide detailed analytics and reporting for ${organization.name}.`
    };

    return `${basePrompt} ${contextPrompts[agentType] || ''}`;
  }

  /**
   * Generate custom instructions for agent
   * @param {string} agentType - Type of agent
   * @param {Object} organization - Organization data
   * @returns {string} Custom instructions
   */
  generateCustomInstructions(agentType, organization) {
    return `Focus on ${organization.businessInfo?.industry || 'business'} industry best practices. Maintain ${organization.brandSettings?.brandVoice || 'professional'} tone. Target audience: ${organization.businessInfo?.targetAudience || 'business professionals'}.`;
  }

  /**
   * Get tools for specific agent type
   * @param {string} agentType - Type of agent
   * @returns {Array} Array of tools
   */
  getAgentTools(agentType) {
    const toolSets = {
      intelligence_agent: [
        { name: 'web_search', description: 'Search the web for information' },
        { name: 'data_analysis', description: 'Analyze data and trends' },
        { name: 'trend_analysis', description: 'Analyze market trends' }
      ],
      strategy_agent: [
        { name: 'content_planning', description: 'Plan content strategies' },
        { name: 'audience_analysis', description: 'Analyze target audiences' },
        { name: 'competitor_analysis', description: 'Analyze competitors' }
      ],
      content_agent: [
        { name: 'content_generation', description: 'Generate content' },
        { name: 'content_optimization', description: 'Optimize content' },
        { name: 'hashtag_research', description: 'Research hashtags' }
      ],
      execution_agent: [
        { name: 'social_media_posting', description: 'Post to social media' },
        { name: 'scheduling', description: 'Schedule content' },
        { name: 'platform_management', description: 'Manage platforms' }
      ],
      learning_agent: [
        { name: 'performance_analysis', description: 'Analyze performance' },
        { name: 'optimization', description: 'Optimize strategies' },
        { name: 'learning', description: 'Learn from data' }
      ],
      engagement_agent: [
        { name: 'community_management', description: 'Manage community' },
        { name: 'response_generation', description: 'Generate responses' },
        { name: 'sentiment_analysis', description: 'Analyze sentiment' }
      ],
      analytics_agent: [
        { name: 'analytics_reporting', description: 'Generate reports' },
        { name: 'metrics_analysis', description: 'Analyze metrics' },
        { name: 'roi_calculation', description: 'Calculate ROI' }
      ]
    };

    return toolSets[agentType] || [];
  }

  /**
   * Get capabilities for specific agent type
   * @param {string} agentType - Type of agent
   * @returns {Array} Array of capabilities
   */
  getAgentCapabilities(agentType) {
    const capabilitySets = {
      intelligence_agent: ['data_analysis', 'web_search', 'trend_analysis'],
      strategy_agent: ['text_generation', 'data_analysis', 'trend_analysis'],
      content_agent: ['text_generation', 'content_optimization', 'image_analysis'],
      execution_agent: ['social_media_posting', 'analytics_reporting', 'content_optimization'],
      learning_agent: ['data_analysis', 'analytics_reporting', 'content_optimization'],
      engagement_agent: ['text_generation', 'sentiment_analysis', 'content_optimization'],
      analytics_agent: ['data_analysis', 'analytics_reporting', 'trend_analysis']
    };

    return capabilitySets[agentType] || [];
  }

  /**
   * Remove all agents for an organization
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} Removal result
   */
  async removeAgentsForOrganization(organizationId) {
    try {
      logger.info(`Removing agents for organization: ${organizationId}`);

      const result = await AIAgent.deleteMany({
        'organizationSpecific.organizationId': organizationId
      });

      logger.info(`Removed ${result.deletedCount} agents for organization ${organizationId}`);

      return {
        success: true,
        organizationId,
        agentsRemoved: result.deletedCount
      };
    } catch (error) {
      logger.error(`Failed to remove agents for organization ${organizationId}:`, error);
      throw error;
    }
  }

  /**
   * Get agents for an organization
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Array>} Array of agents
   */
  async getAgentsForOrganization(organizationId) {
    try {
      const agents = await AIAgent.find({
        'organizationSpecific.organizationId': organizationId,
        isEnabled: true
      });

      return agents;
    } catch (error) {
      logger.error(`Failed to get agents for organization ${organizationId}:`, error);
      throw error;
    }
  }
}

module.exports = new AgentProvisioningService();
