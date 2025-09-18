const request = require('supertest');
const app = require('../../../backend-api/server');
const mongoose = require('mongoose');
const User = require('../../../backend-api/src/models/User');
const Content = require('../../../backend-api/src/models/Content');
const Organization = require('../../../backend-api/src/models/Organization');

describe('API Integration Tests', () => {
  let authToken;
  let userId;
  let organizationId;
  let contentId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_db');
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
    await Content.deleteMany({});
    await Organization.deleteMany({});

    // Create test organization
    const organization = new Organization({
      name: 'Test Organization',
      description: 'Test organization for integration tests',
      industry: 'Technology',
      contactEmail: 'test@organization.com'
    });
    await organization.save();
    organizationId = organization._id;

    // Create test user
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: '$2b$10$hashedPassword', // Pre-hashed password
      firstName: 'Test',
      lastName: 'User',
      organization: organizationId,
      role: 'admin',
      isActive: true
    });
    await user.save();
    userId = user._id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!'
      });

    authToken = loginResponse.body.data.token;
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // 1. Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
          firstName: 'New',
          lastName: 'User',
          organization: organizationId
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);

      // 2. Login with new user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'NewPassword123!'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();

      // 3. Access protected route
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${loginResponse.body.data.token}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.success).toBe(true);

      // 4. Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${loginResponse.body.data.token}`);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
    });
  });

  describe('Content Management Flow', () => {
    it('should complete full content management flow', async () => {
      // 1. Create content
      const createResponse = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Integration Test Post',
          content: 'This is a test post for integration testing',
          type: 'text',
          platforms: ['facebook', 'twitter'],
          hashtags: ['#test', '#integration'],
          scheduledDate: new Date(Date.now() + 3600000).toISOString()
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      contentId = createResponse.body.data._id;

      // 2. Get content by ID
      const getResponse = await request(app)
        .get(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.title).toBe('Integration Test Post');

      // 3. Update content
      const updateResponse = await request(app)
        .put(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Integration Test Post',
          content: 'Updated content for integration testing'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.title).toBe('Updated Integration Test Post');

      // 4. Schedule content
      const scheduleResponse = await request(app)
        .post(`/api/content/${contentId}/schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scheduledDate: new Date(Date.now() + 7200000).toISOString(),
          platforms: ['facebook', 'twitter', 'linkedin']
        });

      expect(scheduleResponse.status).toBe(200);
      expect(scheduleResponse.body.success).toBe(true);
      expect(scheduleResponse.body.data.status).toBe('scheduled');

      // 5. Get content list
      const listResponse = await request(app)
        .get('/api/content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data).toHaveLength(1);

      // 6. Publish content
      const publishResponse = await request(app)
        .post(`/api/content/${contentId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(publishResponse.status).toBe(200);
      expect(publishResponse.body.success).toBe(true);
      expect(publishResponse.body.data.status).toBe('published');

      // 7. Delete content
      const deleteResponse = await request(app)
        .delete(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('Analytics Flow', () => {
    it('should complete analytics flow', async () => {
      // 1. Create content
      const createResponse = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Analytics Test Post',
          content: 'This is a test post for analytics',
          type: 'text',
          platforms: ['facebook'],
          status: 'published'
        });

      expect(createResponse.status).toBe(201);
      contentId = createResponse.body.data._id;

      // 2. Create analytics data
      const analyticsResponse = await request(app)
        .post('/api/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentId: contentId,
          platform: 'facebook',
          metrics: {
            likes: 100,
            comments: 20,
            shares: 15,
            reach: 1000,
            impressions: 1500,
            clicks: 50
          },
          date: new Date().toISOString()
        });

      expect(analyticsResponse.status).toBe(201);
      expect(analyticsResponse.body.success).toBe(true);

      // 3. Get analytics for content
      const getAnalyticsResponse = await request(app)
        .get(`/api/analytics/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getAnalyticsResponse.status).toBe(200);
      expect(getAnalyticsResponse.body.success).toBe(true);
      expect(getAnalyticsResponse.body.data).toHaveLength(1);

      // 4. Get analytics summary
      const summaryResponse = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dateTo: new Date().toISOString()
        });

      expect(summaryResponse.status).toBe(200);
      expect(summaryResponse.body.success).toBe(true);
      expect(summaryResponse.body.data.totalPosts).toBe(1);
    });
  });

  describe('Campaign Management Flow', () => {
    it('should complete campaign management flow', async () => {
      // 1. Create campaign
      const createCampaignResponse = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Integration Test Campaign',
          description: 'Test campaign for integration testing',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 1000,
          platforms: ['facebook', 'twitter', 'instagram'],
          status: 'active'
        });

      expect(createCampaignResponse.status).toBe(201);
      expect(createCampaignResponse.body.success).toBe(true);
      const campaignId = createCampaignResponse.body.data._id;

      // 2. Create content for campaign
      const createContentResponse = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Campaign Test Post',
          content: 'This is a test post for the campaign',
          type: 'text',
          platforms: ['facebook', 'twitter'],
          campaign: campaignId
        });

      expect(createContentResponse.status).toBe(201);
      contentId = createContentResponse.body.data._id;

      // 3. Get campaign content
      const getCampaignContentResponse = await request(app)
        .get(`/api/campaigns/${campaignId}/content`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getCampaignContentResponse.status).toBe(200);
      expect(getCampaignContentResponse.body.success).toBe(true);
      expect(getCampaignContentResponse.body.data).toHaveLength(1);

      // 4. Update campaign
      const updateCampaignResponse = await request(app)
        .put(`/api/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Integration Test Campaign',
          budget: 1500
        });

      expect(updateCampaignResponse.status).toBe(200);
      expect(updateCampaignResponse.body.success).toBe(true);
      expect(updateCampaignResponse.body.data.budget).toBe(1500);

      // 5. Get campaign analytics
      const getCampaignAnalyticsResponse = await request(app)
        .get(`/api/campaigns/${campaignId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getCampaignAnalyticsResponse.status).toBe(200);
      expect(getCampaignAnalyticsResponse.body.success).toBe(true);
    });
  });

  describe('User Management Flow', () => {
    it('should complete user management flow', async () => {
      // 1. Get user profile
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.email).toBe('test@example.com');

      // 2. Update user profile
      const updateProfileResponse = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'User',
          phone: '+1234567890'
        });

      expect(updateProfileResponse.status).toBe(200);
      expect(updateProfileResponse.body.success).toBe(true);
      expect(updateProfileResponse.body.data.firstName).toBe('Updated');

      // 3. Change password
      const changePasswordResponse = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewPassword123!',
          confirmNewPassword: 'NewPassword123!'
        });

      expect(changePasswordResponse.status).toBe(200);
      expect(changePasswordResponse.body.success).toBe(true);

      // 4. Get users list (admin only)
      const usersListResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(usersListResponse.status).toBe(200);
      expect(usersListResponse.body.success).toBe(true);
      expect(usersListResponse.body.data).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors properly', async () => {
      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Empty title should fail validation
          content: 'Test content',
          type: 'invalid-type', // Invalid type should fail validation
          platforms: [] // Empty platforms should fail validation
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should handle unauthorized access properly', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle not found errors properly', async () => {
      const response = await request(app)
        .get('/api/content/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle server errors properly', async () => {
      // Mock a server error by corrupting the database connection
      const originalFind = Content.findById;
      Content.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get('/api/content/507f1f77bcf86cd799439013')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);

      // Restore original function
      Content.findById = originalFind;
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on auth endpoints', async () => {
      const promises = [];
      
      // Make multiple requests to trigger rate limiting
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});

