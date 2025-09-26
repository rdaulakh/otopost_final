const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/userModel');
const Business = require('../models/businessModel');
const Workflow = require('../models/workflowModel');

// Mock OpenAI to avoid actual API calls during testing
jest.mock('openai', () => {
  return {
    Configuration: jest.fn(),
    OpenAIApi: jest.fn().mockImplementation(() => ({
      createChatCompletion: jest.fn().mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                trends: ['AI automation', 'Social commerce', 'Video content'],
                opportunities: ['Influencer partnerships', 'User-generated content'],
                challenges: ['Algorithm changes', 'Increased competition'],
                recommendations: ['Focus on video content', 'Engage with community']
              })
            }
          }]
        }
      }))
    }))
  };
});

describe('AI Agents System', () => {
  let authToken;
  let userId;
  let businessId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/otopost_test');
  });

  afterAll(async () => {
    // Clean up and close database connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up collections
    await User.deleteMany({});
    await Business.deleteMany({});
    await Workflow.deleteMany({});

    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;

    // Create test business
    const business = await Business.create({
      user: userId,
      businessName: 'Test Business',
      industry: 'Technology',
      targetAudience: 'Tech professionals',
      businessType: 'SaaS',
      location: 'San Francisco'
    });
    businessId = business._id;

    // Generate auth token
    authToken = user.generateToken();
  });

  describe('AI Agents Status', () => {
    test('GET /api/content/agents/status - should return agents status', async () => {
      const response = await request(app)
        .get('/api/content/agents/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('agents');
      expect(response.body.data.agents).toHaveProperty('intelligence');
      expect(response.body.data.agents).toHaveProperty('strategy');
      expect(response.body.data.agents).toHaveProperty('content');
      expect(response.body.data.agents).toHaveProperty('execution');
      expect(response.body.data.agents).toHaveProperty('learning');
      expect(response.body.data.agents).toHaveProperty('engagement');
      expect(response.body.data.agents).toHaveProperty('analytics');
    });

    test('GET /api/content/agents/status - should require authentication', async () => {
      await request(app)
        .get('/api/content/agents/status')
        .expect(401);
    });
  });

  describe('Content Generation', () => {
    test('POST /api/content/generate - should generate content successfully', async () => {
      const response = await request(app)
        .post('/api/content/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          options: {
            platforms: ['instagram'],
            contentTypes: ['carousel'],
            tone: 'professional'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('workflowId');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data.status).toBe('completed');
    });

    test('POST /api/content/generate - should handle missing business profile', async () => {
      // Delete the business profile
      await Business.deleteMany({});

      await request(app)
        .post('/api/content/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(404);
    });

    test('POST /api/content/generate - should respect rate limiting', async () => {
      // Make multiple requests quickly
      const promises = Array(6).fill().map(() =>
        request(app)
          .post('/api/content/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
      );

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Strategy Generation', () => {
    test('POST /api/content/strategy - should generate strategy successfully', async () => {
      const response = await request(app)
        .post('/api/content/strategy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          options: {
            timeframe: '30d',
            goals: ['brand_awareness'],
            platforms: ['instagram', 'linkedin']
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('workflowId');
      expect(response.body.data).toHaveProperty('result');
    });

    test('POST /api/content/strategy - should require authentication', async () => {
      await request(app)
        .post('/api/content/strategy')
        .send({})
        .expect(401);
    });
  });

  describe('Performance Analysis', () => {
    test('POST /api/content/analyze - should analyze performance successfully', async () => {
      const performanceData = {
        posts: [
          { id: 1, engagement: 150, reach: 1000, likes: 80 },
          { id: 2, engagement: 200, reach: 1500, likes: 120 }
        ],
        totalReach: 2500,
        totalEngagement: 350
      };

      const response = await request(app)
        .post('/api/content/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ performanceData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('workflowId');
    });

    test('POST /api/content/analyze - should require performanceData', async () => {
      const response = await request(app)
        .post('/api/content/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('performanceData');
    });
  });

  describe('Workflow Management', () => {
    let workflowId;

    beforeEach(async () => {
      // Create a test workflow
      const workflow = await Workflow.create({
        workflowId: 'test_workflow_123',
        user: userId,
        business: businessId,
        type: 'content_generation',
        status: 'completed',
        input: { test: 'data' },
        result: { posts: [] },
        summary: { postsGenerated: 3 }
      });
      workflowId = workflow.workflowId;
    });

    test('GET /api/content/workflows/history - should return workflow history', async () => {
      const response = await request(app)
        .get('/api/content/workflows/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/content/workflows/:workflowId/status - should return workflow status', async () => {
      const response = await request(app)
        .get(`/api/content/workflows/${workflowId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('workflowId');
      expect(response.body.data.workflowId).toBe(workflowId);
    });

    test('GET /api/content/user/stats - should return user statistics', async () => {
      const response = await request(app)
        .get('/api/content/user/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalWorkflows');
    });

    test('POST /api/content/workflows/:workflowId/cancel - should cancel workflow', async () => {
      // Create an in-progress workflow
      const inProgressWorkflow = await Workflow.create({
        workflowId: 'in_progress_workflow_123',
        user: userId,
        business: businessId,
        type: 'content_generation',
        status: 'in_progress',
        input: { test: 'data' }
      });

      const response = await request(app)
        .post(`/api/content/workflows/${inProgressWorkflow.workflowId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('Should handle OpenAI API errors gracefully', async () => {
      // Mock OpenAI to throw an error
      const { OpenAIApi } = require('openai');
      OpenAIApi.mockImplementationOnce(() => ({
        createChatCompletion: jest.fn().mockRejectedValue(new Error('OpenAI API Error'))
      }));

      const response = await request(app)
        .post('/api/content/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBeGreaterThanOrEqual(500);
      expect(response.body.success).toBe(false);
    });

    test('Should handle invalid workflow ID', async () => {
      const response = await request(app)
        .get('/api/content/workflows/invalid_id/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('Should handle database connection errors', async () => {
      // Temporarily close the database connection
      await mongoose.connection.close();

      const response = await request(app)
        .get('/api/content/agents/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBeGreaterThanOrEqual(500);

      // Reconnect for other tests
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/otopost_test');
    });
  });

  describe('Agent Integration', () => {
    test('All 7 agents should be properly initialized', async () => {
      const response = await request(app)
        .get('/api/content/agents/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const agents = response.body.data.agents;
      const expectedAgents = [
        'intelligence', 'strategy', 'content', 
        'execution', 'learning', 'engagement', 'analytics'
      ];

      expectedAgents.forEach(agentName => {
        expect(agents).toHaveProperty(agentName);
        expect(agents[agentName]).toHaveProperty('name');
        expect(agents[agentName]).toHaveProperty('status');
        expect(agents[agentName]).toHaveProperty('efficiency');
        expect(agents[agentName]).toHaveProperty('tasksCompleted');
      });
    });

    test('Content generation workflow should use multiple agents', async () => {
      const response = await request(app)
        .post('/api/content/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.body.success).toBe(true);
      
      // Check that the workflow result includes data from multiple agents
      const result = response.body.data.result;
      expect(result).toHaveProperty('marketInsights'); // Intelligence Agent
      expect(result).toHaveProperty('contentStrategy'); // Strategy Agent
      expect(result).toHaveProperty('generatedPosts'); // Content Agent
    });
  });
});

module.exports = {
  // Export for use in other test files
  createTestUser: async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    return { user, token: user.generateToken() };
  },
  
  createTestBusiness: async (userId) => {
    return await Business.create({
      user: userId,
      businessName: 'Test Business',
      industry: 'Technology',
      targetAudience: 'Tech professionals'
    });
  }
};
