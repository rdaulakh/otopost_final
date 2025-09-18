const express = require('express');
const { checkDatabaseHealth } = require('../backend-api/config/database');
const redisClient = require('../backend-api/config/redis');

const app = express();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const redisHealth = await redisClient.exists('health-check');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        redis: redisHealth ? 'connected' : 'disconnected',
        api: 'running'
      }
    };
    
    const isHealthy = dbHealth.mongodb === 'connected' && redisHealth;
    health.status = isHealthy ? 'healthy' : 'unhealthy';
    
    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.MONITORING_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Monitoring service running on port ${PORT}`);
});

module.exports = app;
