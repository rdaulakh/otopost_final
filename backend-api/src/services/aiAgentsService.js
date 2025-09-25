const axios = require('axios');
const logger = require('../utils/logger');

class AIAgentsService {
  constructor() {
    this.aiAgentsUrl = process.env.AI_AGENTS_URL || 'http://localhost:8001';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Send a task to the AI agents system
   * @param {string} agentType - Type of agent (strategy, content, etc.)
   * @param {Object} taskData - Task data to send
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Agent response
   */
  async sendTask(agentType, taskData, options = {}) {
    try {
      // First, get the available agents to find the correct agent ID
      const agentsResponse = await axios.get(`${this.aiAgentsUrl}/agents`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!agentsResponse.data.success) {
        throw new Error('Failed to get available agents');
      }

      // Find the appropriate agent for the task
      const agents = agentsResponse.data.data.agents;
      
      // First try to find agent for specific organization
      let targetAgent = agents.find(agent => 
        agent.type === `${agentType}_agent` && 
        agent.organizationId === options.organizationId
      );
      
      // If not found, use any available agent of the same type
      if (!targetAgent) {
        targetAgent = agents.find(agent => 
          agent.type === `${agentType}_agent`
        );
        
        if (targetAgent) {
          logger.info(`Using available ${agentType} agent for organization ${options.organizationId}`, {
            agentId: targetAgent.agentId,
            originalOrgId: targetAgent.organizationId,
            requestedOrgId: options.organizationId
          });
        }
      }

      if (!targetAgent) {
        logger.warn(`No ${agentType} agent found for organization ${options.organizationId}, using fallback`);
        return this.getFallbackResponse(agentType, taskData);
      }

      const payload = {
        task_type: taskData.type || 'generate_strategy',
        organization_id: options.organizationId,
        user_id: options.userId,
        input_data: taskData,
        priority: options.priority || 'medium'
      };

      logger.info(`Sending task to AI agent: ${targetAgent.agentId}`, {
        organizationId: options.organizationId,
        userId: options.userId,
        taskType: taskData.type || 'unknown',
        agentId: targetAgent.agentId
      });

      const response = await axios.post(
        `${this.aiAgentsUrl}/agents/${targetAgent.agentId}/process`,
        payload,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        logger.info(`AI agent task completed successfully: ${agentType}`, {
          agentId: targetAgent.agentId,
          agentType
        });
        return response.data;
      } else {
        throw new Error(response.data.message || 'AI agent task failed');
      }
    } catch (error) {
      logger.error(`AI agent task failed: ${agentType}`, {
        error: error.message,
        agentType,
        organizationId: options.organizationId
      });
      
      // Handle AI agents service unavailability gracefully
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ERR_BAD_RESPONSE' ||
          error.response?.status === 404 || error.response?.status === 500 ||
          error.status === 500 || error.message.includes('status code 500')) {
        logger.error('AI agents service unavailable', {
          error: error.message,
          status: error.response?.status || error.status,
          code: error.code,
          agentType,
          organizationId: options.organizationId
        });
        throw new Error('AI agents service is currently unavailable. Please try again later.');
      }
      
      throw error;
    }
  }

  /**
   * Generate AI strategy using the Strategy Agent
   * @param {Object} strategyData - Strategy generation data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated strategy
   */
  async generateStrategy(strategyData, options = {}) {
    logger.info('🤖 AI AGENTS SERVICE: generateStrategy - START', {
      function: 'generateStrategy',
      inputStrategyData: strategyData,
      inputOptions: options,
      timestamp: new Date().toISOString()
    });

    const taskData = {
      type: 'generate_strategy',
      objectives: strategyData.objectives || [],
      timeframe: strategyData.timeframe || '30d',
      platforms: strategyData.platforms || ['instagram', 'linkedin', 'twitter'],
      target_audience: strategyData.targetAudience || '',
      business_goals: strategyData.businessGoals || '',
      current_challenges: strategyData.currentChallenges || '',
      organization_context: {
        // Basic organization info
        id: strategyData.organization?.id,
        name: strategyData.organization?.name,
        industry: strategyData.organization?.industry,
        businessType: strategyData.organization?.businessType,
        companySize: strategyData.organization?.companySize,
        website: strategyData.organization?.website,
        description: strategyData.organization?.description,
        
        // Brand settings
        brandVoice: strategyData.organization?.brandVoice,
        contentStyle: strategyData.organization?.contentStyle,
        brandGuidelines: strategyData.organization?.brandGuidelines,
        
        // AI agent configuration
        customInstructions: strategyData.organization?.customInstructions,
        agentPersonality: strategyData.organization?.agentPersonality,
        
        // Marketing strategy
        postingFrequency: strategyData.organization?.postingFrequency,
        geographicReach: strategyData.organization?.geographicReach,
        contentCategories: strategyData.organization?.contentCategories,
        
        // Business details
        foundedYear: strategyData.organization?.foundedYear,
        headquarters: strategyData.organization?.headquarters
      },
      social_profiles: strategyData.socialProfiles || [],
      // Additional context for AI agents
      business_context: {
        industry: strategyData.organization?.industry,
        business_type: strategyData.organization?.businessType,
        company_size: strategyData.organization?.companySize,
        brand_voice: strategyData.organization?.brandVoice,
        content_style: strategyData.organization?.contentStyle,
        posting_frequency: strategyData.organization?.postingFrequency,
        geographic_reach: strategyData.organization?.geographicReach,
        content_categories: strategyData.organization?.contentCategories,
        custom_instructions: strategyData.organization?.customInstructions,
        agent_personality: strategyData.organization?.agentPersonality
      }
    };

    logger.info('📋 AI AGENTS SERVICE: generateStrategy - TASK DATA PREPARED', {
      taskData,
      taskDataSize: JSON.stringify(taskData).length,
      objectivesCount: taskData.objectives.length,
      platformsCount: taskData.platforms.length,
      socialProfilesCount: taskData.social_profiles.length,
      timestamp: new Date().toISOString()
    });

    const result = await this.sendTask('strategy', taskData, {
      priority: 'high',
      ...options
    });

    logger.info('📤 AI AGENTS SERVICE: generateStrategy - RESULT RECEIVED', {
      resultSuccess: result?.success,
      resultKeys: result ? Object.keys(result) : 'No result',
      resultDataKeys: result?.data ? Object.keys(result.data) : 'No data',
      confidence: result?.data?.confidence,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * Generate content using the Content Agent
   * @param {Object} contentData - Content generation data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated content
   */
  async generateContent(contentData, options = {}) {
    const taskData = {
      type: 'generate_content',
      content_type: contentData.type || 'post',
      platform: contentData.platform || 'instagram',
      topic: contentData.topic || '',
      tone: contentData.tone || 'professional',
      length: contentData.length || 'medium',
      include_hashtags: contentData.includeHashtags !== false,
      include_cta: contentData.includeCta !== false,
      strategy_context: contentData.strategyContext || {}
    };

    return await this.sendTask('content', taskData, {
      priority: 'medium',
      ...options
    });
  }

  /**
   * Analyze content using the Analytics Agent
   * @param {Object} analysisData - Analysis data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeContent(analysisData, options = {}) {
    const taskData = {
      type: 'analyze_content',
      content: analysisData.content || '',
      platform: analysisData.platform || 'instagram',
      metrics: analysisData.metrics || ['engagement', 'reach', 'sentiment'],
      time_range: analysisData.timeRange || '7d'
    };

    return await this.sendTask('analytics', taskData, {
      priority: 'low',
      ...options
    });
  }

  /**
   * Get AI agents status
   * @returns {Promise<Object>} Agents status
   */
  async getAgentsStatus() {
    try {
      const response = await axios.get(`${this.aiAgentsUrl}/agents`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get AI agents status', { error: error.message });
      return {
        success: false,
        message: 'AI agents service unavailable',
        agents: [],
        system_status: 'offline'
      };
    }
  }

}

module.exports = new AIAgentsService();

