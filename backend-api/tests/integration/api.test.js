const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../src/models/User');
const Organization = require('../../src/models/Organization');
const Content = require('../../src/models/Content');
const Analytics = require('../../src/models/Analytics');

describe('API Integration Tests', () => {
  let authToken;
  let testUser;
  let testOrganization;
  let testContent;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_db');
    
    // Clean up test data
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Content.deleteMany({});
    await Analytics.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Content.deleteMany({});
    await Analytics.deleteMany({});
    
    // Close database connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test organization
    testOrganization = new Organization({
      name: 'Test Organization',
      description: 'A test organization',
      industry: 'Technology',
      contactEmail: 'test@example.com'
    });
    await testOrganization.save();

    // Create test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      organization: testOrganization._id,
      role: 'admin',
      isActive: true
    });
    await testUser.save();

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Content.deleteMany({});
    await Analytics.deleteMany({});
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          organization: testOrganization._id
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.token).toBeDefined();
      });

      it('should return error for duplicate email', async () => {
        const userData = {
          username: 'duplicate',
          email: 'test@example.com', // Already exists
          password: 'password123',
          firstName: 'Duplicate',
          lastName: 'User',
          organization: testOrganization._id
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });

      it('should return error for invalid data', async () => {
        const userData = {
          username: 'invalid',
          email: 'invalid-email', // Invalid email
          password: '123', // Too short
          firstName: 'Invalid',
          lastName: 'User',
          organization: testOrganization._id
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe(loginData.email);
      });

      it('should return error for invalid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid credentials');
      });

      it('should return error for non-existent user', async () => {
        const loginData = {
          email: 'nonexistent@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid credentials');
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout successfully', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('logged out');
      });

      it('should return error without token', async () => {
        const response = await request(app)
          .post('/api/auth/logout');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('User Management Endpoints', () => {
    describe('GET /api/users', () => {
      it('should get all users for organization', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.users).toBeDefined();
        expect(response.body.users.length).toBeGreaterThan(0);
      });

      it('should return error without authentication', async () => {
        const response = await request(app)
          .get('/api/users');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/users/:id', () => {
      it('should get user by ID', async () => {
        const response = await request(app)
          .get(`/api/users/${testUser._id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user._id).toBe(testUser._id.toString());
      });

      it('should return error for non-existent user', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/users/${fakeId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/users/:id', () => {
      it('should update user successfully', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name'
        };

        const response = await request(app)
          .put(`/api/users/${testUser._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user.firstName).toBe(updateData.firstName);
        expect(response.body.user.lastName).toBe(updateData.lastName);
      });

      it('should return error for invalid update data', async () => {
        const updateData = {
          email: 'invalid-email' // Invalid email format
        };

        const response = await request(app)
          .put(`/api/users/${testUser._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Content Management Endpoints', () => {
    beforeEach(async () => {
      // Create test content
      testContent = new Content({
        title: 'Test Content',
        description: 'A test content item',
        content: 'This is test content',
        type: 'post',
        platform: 'instagram',
        status: 'draft',
        user: testUser._id,
        organization: testOrganization._id
      });
      await testContent.save();
    });

    describe('GET /api/content', () => {
      it('should get all content for organization', async () => {
        const response = await request(app)
          .get('/api/content')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.content).toBeDefined();
        expect(response.body.content.length).toBeGreaterThan(0);
      });

      it('should filter content by status', async () => {
        const response = await request(app)
          .get('/api/content?status=draft')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.content.every(item => item.status === 'draft')).toBe(true);
      });
    });

    describe('POST /api/content', () => {
      it('should create new content successfully', async () => {
        const contentData = {
          title: 'New Content',
          description: 'A new content item',
          content: 'This is new content',
          type: 'post',
          platform: 'facebook',
          status: 'draft'
        };

        const response = await request(app)
          .post('/api/content')
          .set('Authorization', `Bearer ${authToken}`)
          .send(contentData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.content.title).toBe(contentData.title);
      });

      it('should return error for invalid content data', async () => {
        const contentData = {
          title: '', // Empty title
          type: 'invalid-type' // Invalid type
        };

        const response = await request(app)
          .post('/api/content')
          .set('Authorization', `Bearer ${authToken}`)
          .send(contentData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/content/:id', () => {
      it('should update content successfully', async () => {
        const updateData = {
          title: 'Updated Content',
          status: 'published'
        };

        const response = await request(app)
          .put(`/api/content/${testContent._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.content.title).toBe(updateData.title);
        expect(response.body.content.status).toBe(updateData.status);
      });
    });

    describe('DELETE /api/content/:id', () => {
      it('should delete content successfully', async () => {
        const response = await request(app)
          .delete(`/api/content/${testContent._id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('deleted');
      });
    });
  });

  describe('Analytics Endpoints', () => {
    beforeEach(async () => {
      // Create test analytics data
      const analyticsData = new Analytics({
        contentId: testContent._id,
        platform: 'instagram',
        metrics: {
          impressions: 1000,
          reach: 800,
          engagement: 50,
          likes: 30,
          comments: 10,
          shares: 5
        },
        date: new Date(),
        organization: testOrganization._id
      });
      await analyticsData.save();
    });

    describe('GET /api/analytics', () => {
      it('should get analytics data', async () => {
        const response = await request(app)
          .get('/api/analytics')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.analytics).toBeDefined();
      });

      it('should filter analytics by date range', async () => {
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const endDate = new Date();
        
        const response = await request(app)
          .get(`/api/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle 500 errors gracefully', async () => {
      // This would require mocking a service to throw an error
      // For now, we'll test the error handling structure
      const response = await request(app)
        .get('/api/error-test')
        .set('Authorization', `Bearer ${authToken}`);

      // This endpoint doesn't exist, so it should return 404
      expect(response.status).toBe(404);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const promises = [];
      
      // Make multiple requests quickly to trigger rate limiting
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one request should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/users')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Authorization');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});

