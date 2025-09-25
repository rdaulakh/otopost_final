const AIAgent = require('../models/AIAgent');
const Organization = require('../models/Organization');
const agentProvisioningService = require('../services/agentProvisioningService');
const logger = require('../utils/logger');

const agentManagementController = {
  // Get all agents for an organization
  getOrganizationAgents: async (req, res) => {
    try {
      const { organizationId } = req.user;
      
      const agents = await agentProvisioningService.getAgentsForOrganization(organizationId);
      
      // Calculate summary statistics
      const totalAgents = agents.length;
      const activeAgents = agents.filter(agent => agent.status === 'active').length;
      const totalTasks = agents.reduce((sum, agent) => sum + agent.performance.completedTasks, 0);
      const avgEfficiency = agents.length > 0 
        ? Math.round(agents.reduce((sum, agent) => sum + agent.performance.successRate, 0) / agents.length)
        : 0;

      res.json({
        success: true,
        data: {
          agents: agents.map(agent => ({
            id: agent._id,
            name: agent.name,
            type: agent.type,
            status: agent.status,
            description: agent.description,
            isEnabled: agent.isEnabled,
            performance: {
              completedTasks: agent.performance.completedTasks,
              successRate: agent.performance.successRate,
              averageQualityScore: agent.performance.averageQualityScore,
              totalTokensUsed: agent.performance.totalTokensUsed,
              totalCost: agent.performance.totalCost
            },
            health: {
              status: agent.health.status,
              lastHealthCheck: agent.health.lastHealthCheck,
              uptime: agent.health.uptime,
              responseTime: agent.health.responseTime
            },
            configuration: {
              model: agent.configuration.model,
              temperature: agent.configuration.temperature,
              maxTokens: agent.configuration.maxTokens,
              capabilities: agent.configuration.capabilities
            },
            lastActivity: agent.lastActivity,
            createdAt: agent.metadata?.createdAt
          })),
          summary: {
            totalAgents,
            activeAgents,
            avgEfficiency,
            totalTasksCompleted: totalTasks,
            totalTasksInProgress: agents.reduce((sum, agent) => 
              sum + (agent.taskQueue ? agent.taskQueue.filter(task => 
                task.status === 'processing' || task.status === 'queued'
              ).length : 0), 0),
            systemStatus: avgEfficiency > 80 ? 'excellent' : avgEfficiency > 60 ? 'good' : 'needs_attention'
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching organization agents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agents',
        error: error.message
      });
    }
  },

  // Get specific agent details
  getAgentDetails: async (req, res) => {
    try {
      const { agentId } = req.params;
      const { organizationId } = req.user;
      
      const agent = await AIAgent.findOne({
        _id: agentId,
        'organizationSpecific.organizationId': organizationId
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: agent._id,
          name: agent.name,
          type: agent.type,
          status: agent.status,
          description: agent.description,
          version: agent.version,
          isEnabled: agent.isEnabled,
          priority: agent.priority,
          configuration: agent.configuration,
          organizationSpecific: agent.organizationSpecific,
          performance: agent.performance,
          memory: agent.memory,
          workflow: agent.workflow,
          health: agent.health,
          taskQueue: agent.taskQueue,
          isActive: agent.isActive,
          lastActivity: agent.lastActivity,
          metadata: agent.metadata
        }
      });
    } catch (error) {
      logger.error('Error fetching agent details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agent details',
        error: error.message
      });
    }
  },

  // Provision agents for organization (manual trigger)
  provisionAgents: async (req, res) => {
    try {
      const { organizationId } = req.user;
      
      // Get organization details
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      // Check if agents already exist
      const existingAgents = await agentProvisioningService.getAgentsForOrganization(organizationId);
      if (existingAgents.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Agents already exist for this organization',
          data: {
            existingAgents: existingAgents.length,
            agents: existingAgents.map(agent => ({
              id: agent._id,
              type: agent.type,
              name: agent.name,
              status: agent.status
            }))
          }
        });
      }

      // Provision agents
      const result = await agentProvisioningService.provisionAgentsForOrganization(
        organizationId,
        organization.toObject()
      );

      res.json({
        success: result.success,
        message: result.success 
          ? `Successfully provisioned ${result.agentsCreated} agents for organization`
          : 'Agent provisioning completed with some errors',
        data: result
      });
    } catch (error) {
      logger.error('Error provisioning agents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to provision agents',
        error: error.message
      });
    }
  },

  // Remove all agents for organization
  removeAgents: async (req, res) => {
    try {
      const { organizationId } = req.user;
      
      const result = await agentProvisioningService.removeAgentsForOrganization(organizationId);

      res.json({
        success: true,
        message: `Successfully removed ${result.agentsRemoved} agents from organization`,
        data: result
      });
    } catch (error) {
      logger.error('Error removing agents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove agents',
        error: error.message
      });
    }
  },

  // Update agent configuration
  updateAgentConfiguration: async (req, res) => {
    try {
      const { agentId } = req.params;
      const { organizationId } = req.user;
      const updates = req.body;

      const agent = await AIAgent.findOne({
        _id: agentId,
        'organizationSpecific.organizationId': organizationId
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Update allowed fields
      const allowedUpdates = [
        'configuration.temperature',
        'configuration.maxTokens',
        'configuration.customInstructions',
        'configuration.tools',
        'workflow.schedule.enabled',
        'workflow.schedule.cronExpression',
        'workflow.timeout',
        'priority',
        'isEnabled'
      ];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          const keys = key.split('.');
          let current = agent;
          for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        }
      }

      agent.lastActivity = new Date();
      await agent.save();

      res.json({
        success: true,
        message: 'Agent configuration updated successfully',
        data: {
          id: agent._id,
          name: agent.name,
          type: agent.type,
          configuration: agent.configuration,
          workflow: agent.workflow,
          priority: agent.priority,
          isEnabled: agent.isEnabled,
          lastActivity: agent.lastActivity
        }
      });
    } catch (error) {
      logger.error('Error updating agent configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update agent configuration',
        error: error.message
      });
    }
  },

  // Toggle agent status
  toggleAgentStatus: async (req, res) => {
    try {
      const { agentId } = req.params;
      const { organizationId } = req.user;
      const { isEnabled } = req.body;

      const agent = await AIAgent.findOne({
        _id: agentId,
        'organizationSpecific.organizationId': organizationId
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      agent.isEnabled = isEnabled;
      agent.lastActivity = new Date();
      await agent.save();

      res.json({
        success: true,
        message: `Agent ${isEnabled ? 'enabled' : 'disabled'} successfully`,
        data: {
          id: agent._id,
          name: agent.name,
          type: agent.type,
          isEnabled: agent.isEnabled,
          lastActivity: agent.lastActivity
        }
      });
    } catch (error) {
      logger.error('Error toggling agent status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle agent status',
        error: error.message
      });
    }
  },

  // Get agent performance metrics
  getAgentPerformance: async (req, res) => {
    try {
      const { agentId } = req.params;
      const { organizationId } = req.user;
      const { timeframe = '7d' } = req.query;

      const agent = await AIAgent.findOne({
        _id: agentId,
        'organizationSpecific.organizationId': organizationId
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Calculate performance metrics based on timeframe
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      res.json({
        success: true,
        data: {
          agentId: agent._id,
          agentName: agent.name,
          agentType: agent.type,
          timeframe,
          metrics: {
            totalTasks: agent.performance.totalTasks,
            completedTasks: agent.performance.completedTasks,
            failedTasks: agent.performance.failedTasks,
            successRate: agent.performance.successRate,
            averageExecutionTime: agent.performance.averageExecutionTime,
            averageQualityScore: agent.performance.averageQualityScore,
            totalTokensUsed: agent.performance.totalTokensUsed,
            totalCost: agent.performance.totalCost,
            lastExecutionTime: agent.performance.lastExecutionTime
          },
          health: {
            status: agent.health.status,
            uptime: agent.health.uptime,
            responseTime: agent.health.responseTime,
            errorRate: agent.health.errorRate,
            lastHealthCheck: agent.health.lastHealthCheck
          },
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error fetching agent performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agent performance',
        error: error.message
      });
    }
  }
};

module.exports = agentManagementController;




