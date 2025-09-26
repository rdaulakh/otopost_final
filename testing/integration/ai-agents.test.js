const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend-api/server');
const User = require('../../backend-api/src/models/User');
const Organization = require('../../backend-api/src/models/Organization');
const AIAgent = require('../../backend-api/src/models/AIAgent');
const { logger } = require('../../backend-api/src/utils/logger');

describe('AI Agents Integration Tests', () => {
  let authToken;
  let testUser;
  let testOrganization;
  let testAgent;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_ai_social_platform');
    
    // Create test organization
    testOrganization = new Organization({
      name: 'Test AI Organization',
      description: 'Test organization for AI agents',
      industry: 'Technology',
      contactEmail: 'test@ai-org.com'
    });
    await testOrganization.save();

    // Create test user
    testUser = new User({
      username: 'testaiuser',
      email: 'testai@example.com',
      password: 'TestPassword123!',
      organization: testOrganization._id,
      role: 'admin',
      isActive: true
    });
    await testUser.save();

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testai@example.com',
        password: 'TestPassword123!'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'testai@example.com' });
    await Organization.deleteMany({ name: 'Test AI Organization' });
    await AIAgent.deleteMany({ name: 'Test AI Agent' });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test AI agent
    testAgent = new AIAgent({
      name: 'Test AI Agent',
      description: 'Test agent for integration testing',
      agentType: 'content',
      organizationId: testOrganization._id,
      config: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000
      },
      isActive: true
    });
    await testAgent.save();
  });

  afterEach(async () => {
    // Clean up test agent
    await AIAgent.deleteMany({ name: 'Test AI Agent' });
  });

  describe('AI Agent Management', () => {
    test('should create a new AI agent', async () => {
      const agentData = {
        name: 'New Test Agent',
        description: 'A new test agent',
        agentType: 'strategy',
        config: {
          model: 'gpt-4',
          temperature: 0.5,
          maxTokens: 2000
        }
      };

      const response = await request(app)
        .post('/api/ai-agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(agentData.name);
      expect(response.body.data.agentType).toBe(agentData.agentType);
      expect(response.body.data.organizationId).toBe(testOrganization._id.toString());

      // Clean up
      await AIAgent.findByIdAndDelete(response.body.data._id);
    });

    test('should get all AI agents for organization', async () => {
      const response = await request(app)
        .get('/api/ai-agents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should get specific AI agent by ID', async () => {
      const response = await request(app)
        .get(`/api/ai-agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testAgent._id.toString());
      expect(response.body.data.name).toBe(testAgent.name);
    });

    test('should update AI agent', async () => {
      const updateData = {
        name: 'Updated Test Agent',
        description: 'Updated description',
        config: {
          model: 'gpt-4',
          temperature: 0.8,
          maxTokens: 1500
        }
      };

      const response = await request(app)
        .put(`/api/ai-agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    test('should delete AI agent', async () => {
      const response = await request(app)
        .delete(`/api/ai-agents/${testAgent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify agent is deleted
      const deletedAgent = await AIAgent.findById(testAgent._id);
      expect(deletedAgent).toBeNull();
    });
  });

  describe('AI Agent Execution', () => {
    test('should execute AI agent task', async () => {
      const taskData = {
        taskType: 'content_generation',
        input: {
          topic: 'AI in social media',
          platform: 'twitter',
          tone: 'professional'
        }
      };

      const response = await request(app)
        .post(`/api/ai-agents/${testAgent._id}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.taskId).toBeDefined();
      expect(response.body.data.status).toBe('pending');
    });

    test('should get AI agent task status', async () => {
      // First create a task
      const taskData = {
        taskType: 'content_generation',
        input: {
          topic: 'AI in social media',
          platform: 'twitter',
          tone: 'professional'
        }
      };

      const createResponse = await request(app)
        .post(`/api/ai-agents/${testAgent._id}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      const taskId = createResponse.body.data.taskId;

      // Then check status
      const response = await request(app)
        .get(`/api/ai-agents/${testAgent._id}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.taskId).toBe(taskId);
    });

    test('should get AI agent execution history', async () => {
      const response = await request(app)
        .get(`/api/ai-agents/${testAgent._id}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('AI Agent Analytics', () => {
    test('should get AI agent performance metrics', async () => {
      const response = await request(app)
        .get(`/api/ai-agents/${testAgent._id}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agentId).toBe(testAgent._id.toString());
      expect(response.body.data.metrics).toBeDefined();
    });

    test('should get AI agent usage statistics', async () => {
      const response = await request(app)
        .get(`/api/ai-agents/${testAgent._id}/usage`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agentId).toBe(testAgent._id.toString());
      expect(response.body.data.usage).toBeDefined();
    });
  });

  describe('AI Agent Configuration', () => {
    test('should update AI agent configuration', async () => {
      const configData = {
        model: 'gpt-4',
        temperature: 0.9,
        maxTokens: 3000,
        systemPrompt: 'You are a helpful AI assistant for social media content creation.'
      };

      const response = await request(app)
        .put(`/api/ai-agents/${testAgent._id}/config`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(configData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.config.model).toBe(configData.model);
      expect(response.body.data.config.temperature).toBe(configData.temperature);
    });

    test('should get AI agent configuration', async () => {
      const response = await request(app)
        .get(`/api/ai-agents/${testAgent._id}/config`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.config).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent AI agent', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/ai-agents/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should return 400 for invalid AI agent data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        agentType: 'invalid_type' // Invalid: unknown type
      };

      const response = await request(app)
        .post('/api/ai-agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should return 401 for unauthorized access', async () => {
      const response = await request(app)
        .get('/api/ai-agents')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('AI Agent Tools Integration', () => {
    test('should execute sentiment analysis tool', async () => {
      const toolData = {
        toolName: 'sentiment_analyzer',
        input: {
          text: 'I love this new AI feature! It\'s amazing!',
          context: {
            platform: 'twitter',
            userId: testUser._id.toString()
          }
        }
      };

      const response = await request(app)
        .post(`/api/ai-agents/${testAgent._id}/tools/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(toolData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toolName).toBe(toolData.toolName);
      expect(response.body.data.result).toBeDefined();
      expect(response.body.data.result.sentiment_score).toBeDefined();
    });

    test('should execute competitor monitoring tool', async () => {
      const toolData = {
        toolName: 'competitor_monitor',
        input: {
          competitors: ['@competitor1', '@competitor2'],
          platforms: ['twitter', 'instagram'],
          days: 7
        }
      };

      const response = await request(app)
        .post(`/api/ai-agents/${testAgent._id}/tools/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(toolData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toolName).toBe(toolData.toolName);
      expect(response.body.data.result).toBeDefined();
    });

    test('should execute trend analysis tool', async () => {
      const toolData = {
        toolName: 'trend_analyzer',
        input: {
          keywords: ['AI', 'social media', 'marketing'],
          platform: 'twitter',
          timeRange: '7d'
        }
      };

      const response = await request(app)
        .post(`/api/ai-agents/${testAgent._id}/tools/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(toolData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.toolName).toBe(toolData.toolName);
      expect(response.body.data.result).toBeDefined();
    });
  });

  describe('AI Agent Performance Monitoring', () => {
    test('should get AI agent performance dashboard', async () => {
      const response = await request(app)
        .get('/api/ai-agents/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.agents).toBeDefined();
      expect(response.body.data.metrics).toBeDefined();
    });

    test('should get AI agent cost analysis', async () => {
      const response = await request(app)
        .get('/api/ai-agents/costs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCost).toBeDefined();
      expect(response.body.data.costByAgent).toBeDefined();
      expect(response.body.data.costByTaskType).toBeDefined();
    });
  });
});

