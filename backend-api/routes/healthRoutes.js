const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const enhancedOrchestrator = require('../services/enhancedOrchestrator');

// Basic health check
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unknown',
        aiAgents: 'unknown',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        }
      }
    };

    // Check database connection
    try {
      if (mongoose.connection.readyState === 1) {
        health.services.database = 'connected';
      } else {
        health.services.database = 'disconnected';
        health.status = 'degraded';
      }
    } catch (error) {
      health.services.database = 'error';
      health.status = 'unhealthy';
    }

    // Check AI agents status
    try {
      const agentsStatus = enhancedOrchestrator.getAgentsStatus();
      health.services.aiAgents = 'operational';
      health.services.agentDetails = {
        totalAgents: Object.keys(agentsStatus.agents || {}).length,
        activeWorkflows: agentsStatus.activeWorkflows || 0,
        enhancedFeatures: agentsStatus.enhancedFeatures || {}
      };
    } catch (error) {
      health.services.aiAgents = 'error';
      health.status = 'degraded';
    }

    // Set appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed health check for monitoring systems
router.get('/detailed', async (req, res) => {
  try {
    const detailed = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'unknown', responseTime: 0 },
        aiAgents: { status: 'unknown', responseTime: 0 },
        openai: { status: 'unknown', responseTime: 0 },
        memory: { status: 'unknown', usage: 0 },
        disk: { status: 'unknown', usage: 0 }
      }
    };

    // Database health check with timing
    const dbStart = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
      detailed.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      };
    } catch (error) {
      detailed.checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStart,
        error: error.message
      };
      detailed.status = 'unhealthy';
    }

    // AI Agents health check with timing
    const agentsStart = Date.now();
    try {
      const agentsStatus = enhancedOrchestrator.getAgentsStatus();
      detailed.checks.aiAgents = {
        status: 'healthy',
        responseTime: Date.now() - agentsStart,
        agents: agentsStatus.agents,
        orchestrator: agentsStatus.orchestrator,
        activeWorkflows: agentsStatus.activeWorkflows
      };
    } catch (error) {
      detailed.checks.aiAgents = {
        status: 'unhealthy',
        responseTime: Date.now() - agentsStart,
        error: error.message
      };
      detailed.status = 'degraded';
    }

    // OpenAI API health check (basic)
    const openaiStart = Date.now();
    try {
      // Simple check - just verify the API key is configured
      if (process.env.OPENAI_API_KEY) {
        detailed.checks.openai = {
          status: 'configured',
          responseTime: Date.now() - openaiStart,
          configured: true
        };
      } else {
        detailed.checks.openai = {
          status: 'not_configured',
          responseTime: Date.now() - openaiStart,
          configured: false
        };
        detailed.status = 'degraded';
      }
    } catch (error) {
      detailed.checks.openai = {
        status: 'error',
        responseTime: Date.now() - openaiStart,
        error: error.message
      };
    }

    // Memory health check
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryUsagePercent = (memoryUsedMB / memoryTotalMB) * 100;

    detailed.checks.memory = {
      status: memoryUsagePercent > 90 ? 'critical' : 
              memoryUsagePercent > 75 ? 'warning' : 'healthy',
      usage: memoryUsagePercent,
      used: memoryUsedMB,
      total: memoryTotalMB,
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };

    if (detailed.checks.memory.status === 'critical') {
      detailed.status = 'degraded';
    }

    // Overall status determination
    const unhealthyChecks = Object.values(detailed.checks)
      .filter(check => check.status === 'unhealthy' || check.status === 'critical');
    
    if (unhealthyChecks.length > 0) {
      detailed.status = 'unhealthy';
    }

    const statusCode = detailed.status === 'healthy' ? 200 : 
                      detailed.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(detailed);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const isDbReady = mongoose.connection.readyState === 1;
    const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
    
    if (isDbReady && isOpenAIConfigured) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ready',
          openai: 'configured'
        }
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        services: {
          database: isDbReady ? 'ready' : 'not_ready',
          openai: isOpenAIConfigured ? 'configured' : 'not_configured'
        }
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
