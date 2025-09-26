const AIAgent = require('../models/AIAgent');
const logger = require('../utils/logger');

const aiAgentsController = {
  // Get all AI agents for an organization
  getAIAgents: async (req, res) => {
    try {
      const { organizationId } = req.user;
      
      const agents = await AIAgent.find({ 
        'organizationSpecific.organizationId': organizationId,
        isEnabled: true 
      });

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
            performance: {
              completedTasks: agent.performance.completedTasks,
              successRate: agent.performance.successRate,
              averageQualityScore: agent.performance.averageQualityScore
            },
            health: {
              status: agent.health.status,
              lastHealthCheck: agent.health.lastHealthCheck
            }
          })),
          summary: {
            totalAgents,
            activeAgents,
            avgEfficiency,
            totalTasksCompleted: totalTasks,
            totalTasksInProgress: agents.reduce((sum, agent) => sum + (agent.taskQueue ? agent.taskQueue.filter(task => task.status === 'processing' || task.status === 'queued').length : 0), 0),
            systemStatus: avgEfficiency > 80 ? 'excellent' : avgEfficiency > 60 ? 'good' : 'needs_attention'
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching AI agents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch AI agents',
        error: error.message
      });
    }
  },

  // Get all AI agents for an organization (legacy method)
  getAgents: async (req, res) => {
    try {
      const { organizationId } = req.user;
      
      const agents = await AIAgent.find({ 
        'organizationSpecific.organizationId': organizationId,
        isEnabled: true 
      })
        .select('-taskQueue -memory -learnedPatterns')
        .sort({ createdAt: -1 });

      // Calculate summary statistics
      const totalAgents = agents.length;
      const activeAgents = agents.filter(agent => agent.status === 'active').length;
      const totalTasks = agents.reduce((sum, agent) => sum + agent.performanceMetrics.tasksCompleted, 0);
      const avgEfficiency = agents.length > 0 
        ? Math.round(agents.reduce((sum, agent) => sum + agent.performanceMetrics.efficiency, 0) / agents.length)
        : 0;

      res.json({
        success: true,
        data: {
          agents,
          summary: {
            totalAgents,
            activeAgents,
            avgEfficiency,
            totalTasks,
            systemStatus: avgEfficiency > 90 ? 'excellent' : avgEfficiency > 80 ? 'good' : 'warning'
          }
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'aiAgents.getAgents',
        userId: req.user._id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to fetch AI agents',
        code: 'AI_AGENTS_FETCH_ERROR'
      });
    }
  },

  // Get specific AI agent details
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
          message: 'AI agent not found',
          code: 'AI_AGENT_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: {
          agent
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'aiAgents.getAgentDetails',
        userId: req.user._id,
        agentId: req.params.agentId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to fetch AI agent details',
        code: 'AI_AGENT_DETAILS_ERROR'
      });
    }
  },

  // Restart AI agent
  restartAgent: async (req, res) => {
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
          message: 'AI agent not found',
          code: 'AI_AGENT_NOT_FOUND'
        });
      }

      // Update agent status
      agent.status = 'restarting';
      agent.health.status = 'checking';
      agent.health.lastCheck = new Date();
      await agent.save();

      // Log the restart action
      logger.logActivity(req.user._id, 'ai_agent_restart', 'ai_agent', agentId, {
        agentType: agent.agentType,
        previousStatus: 'active'
      });

      res.json({
        success: true,
        message: 'AI agent restart initiated',
        data: {
          agentId: agent._id,
          status: agent.status
        }
      });

    } catch (error) {
      logger.logError(error, {
        controller: 'aiAgents.restartAgent',
        userId: req.user._id,
        agentId: req.params.agentId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to restart AI agent',
        code: 'AI_AGENT_RESTART_ERROR'
      });
    }
  }
};

module.exports = aiAgentsController;
