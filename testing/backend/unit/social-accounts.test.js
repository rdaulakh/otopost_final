const request = require('supertest');
const app = require('../../../backend-api/server');
const SocialAccount = require('../../../backend-api/src/models/SocialAccount');
const User = require('../../../backend-api/src/models/User');
const Organization = require('../../../backend-api/src/models/Organization');

describe('Social Accounts API', () => {
  let authToken;
  let userId;
  let organizationId;

  beforeAll(async () => {
    // Create test organization
    const organization = new Organization({
      name: 'Test Organization',
      description: 'Test organization for social account tests',
      industry: 'Technology',
      contactEmail: 'test@organization.com'
    });
    await organization.save();
    organizationId = organization._id;

    // Create test user
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: '$2b$10$hashedPassword',
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
      .post('/api/auth/customer/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!'
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up
    await SocialAccount.deleteMany({});
    await User.deleteMany({});
    await Organization.deleteMany({});
  });

  beforeEach(async () => {
    // Clear social accounts before each test
    await SocialAccount.deleteMany({});
  });

  describe('GET /api/v1/social-accounts', () => {
    it('should get user social accounts', async () => {
      // Create test social accounts
      const socialAccounts = [
        {
          user: userId,
          organization: organizationId,
          platform: 'instagram',
          accountId: 'instagram123',
          accountName: 'Test Instagram',
          accountUsername: 'test_instagram',
          accessToken: 'test_token_1',
          isActive: true,
          isConnected: true
        },
        {
          user: userId,
          organization: organizationId,
          platform: 'facebook',
          accountId: 'facebook123',
          accountName: 'Test Facebook',
          accountUsername: 'test_facebook',
          accessToken: 'test_token_2',
          isActive: true,
          isConnected: true
        }
      ];

      await SocialAccount.insertMany(socialAccounts);

      const response = await request(app)
        .get('/api/v1/social-accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should filter accounts by platform', async () => {
      // Create test social accounts
      const socialAccounts = [
        {
          user: userId,
          organization: organizationId,
          platform: 'instagram',
          accountId: 'instagram123',
          accountName: 'Test Instagram',
          accountUsername: 'test_instagram',
          accessToken: 'test_token_1',
          isActive: true,
          isConnected: true
        },
        {
          user: userId,
          organization: organizationId,
          platform: 'facebook',
          accountId: 'facebook123',
          accountName: 'Test Facebook',
          accountUsername: 'test_facebook',
          accessToken: 'test_token_2',
          isActive: true,
          isConnected: true
        }
      ];

      await SocialAccount.insertMany(socialAccounts);

      const response = await request(app)
        .get('/api/v1/social-accounts?platform=instagram')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].platform).toBe('instagram');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/social-accounts')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  describe('POST /api/v1/social-accounts/connect', () => {
    it('should connect a new social account', async () => {
      const accountData = {
        platform: 'instagram',
        accountId: 'instagram123',
        accountName: 'Test Instagram',
        accountUsername: 'test_instagram',
        accountUrl: 'https://instagram.com/test_instagram',
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        permissions: ['read_insights', 'publish_posts']
      };

      const response = await request(app)
        .post('/api/v1/social-accounts/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .send(accountData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('platform', 'instagram');
      expect(response.body.data).toHaveProperty('accountName', 'Test Instagram');
      expect(response.body.data).toHaveProperty('isConnected', true);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/social-accounts/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should prevent duplicate platform connections', async () => {
      // Create existing account
      const existingAccount = new SocialAccount({
        user: userId,
        organization: organizationId,
        platform: 'instagram',
        accountId: 'instagram123',
        accountName: 'Existing Instagram',
        accountUsername: 'existing_instagram',
        accessToken: 'existing_token',
        isActive: true,
        isConnected: true
      });
      await existingAccount.save();

      const accountData = {
        platform: 'instagram',
        accountId: 'instagram456',
        accountName: 'New Instagram',
        accountUsername: 'new_instagram',
        accessToken: 'new_token'
      };

      const response = await request(app)
        .post('/api/v1/social-accounts/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .send(accountData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already have');
    });
  });

  describe('PUT /api/v1/social-accounts/:id', () => {
    it('should update social account', async () => {
      // Create test account
      const socialAccount = new SocialAccount({
        user: userId,
        organization: organizationId,
        platform: 'instagram',
        accountId: 'instagram123',
        accountName: 'Test Instagram',
        accountUsername: 'test_instagram',
        accessToken: 'test_token',
        isActive: true,
        isConnected: true
      });
      await socialAccount.save();

      const updateData = {
        accountName: 'Updated Instagram',
        followersCount: 1000,
        isVerified: true
      };

      const response = await request(app)
        .put(`/api/v1/social-accounts/${socialAccount._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accountName).toBe('Updated Instagram');
      expect(response.body.data.followersCount).toBe(1000);
      expect(response.body.data.isVerified).toBe(true);
    });

    it('should return 404 for non-existent account', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/v1/social-accounts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ accountName: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/v1/social-accounts/:id', () => {
    it('should disconnect social account', async () => {
      // Create test account
      const socialAccount = new SocialAccount({
        user: userId,
        organization: organizationId,
        platform: 'instagram',
        accountId: 'instagram123',
        accountName: 'Test Instagram',
        accountUsername: 'test_instagram',
        accessToken: 'test_token',
        isActive: true,
        isConnected: true
      });
      await socialAccount.save();

      const response = await request(app)
        .delete(`/api/v1/social-accounts/${socialAccount._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isConnected).toBe(false);
      expect(response.body.data.isActive).toBe(false);
    });

    it('should return 404 for non-existent account', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/v1/social-accounts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/v1/social-accounts/:id/sync', () => {
    it('should initiate account sync', async () => {
      // Create test account
      const socialAccount = new SocialAccount({
        user: userId,
        organization: organizationId,
        platform: 'instagram',
        accountId: 'instagram123',
        accountName: 'Test Instagram',
        accountUsername: 'test_instagram',
        accessToken: 'test_token',
        isActive: true,
        isConnected: true
      });
      await socialAccount.save();

      const response = await request(app)
        .post(`/api/v1/social-accounts/${socialAccount._id}/sync`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('initiated');
    });

    it('should return 400 for disconnected account', async () => {
      // Create disconnected account
      const socialAccount = new SocialAccount({
        user: userId,
        organization: organizationId,
        platform: 'instagram',
        accountId: 'instagram123',
        accountName: 'Test Instagram',
        accountUsername: 'test_instagram',
        accessToken: 'test_token',
        isActive: false,
        isConnected: false
      });
      await socialAccount.save();

      const response = await request(app)
        .post(`/api/v1/social-accounts/${socialAccount._id}/sync`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not connected');
    });
  });

  describe('GET /api/v1/social-accounts/stats', () => {
    it('should get account statistics', async () => {
      // Create test accounts
      const socialAccounts = [
        {
          user: userId,
          organization: organizationId,
          platform: 'instagram',
          accountId: 'instagram123',
          accountName: 'Test Instagram',
          accountUsername: 'test_instagram',
          accessToken: 'test_token_1',
          followersCount: 1000,
          isActive: true,
          isConnected: true
        },
        {
          user: userId,
          organization: organizationId,
          platform: 'facebook',
          accountId: 'facebook123',
          accountName: 'Test Facebook',
          accountUsername: 'test_facebook',
          accessToken: 'test_token_2',
          followersCount: 2000,
          isActive: true,
          isConnected: true
        }
      ];

      await SocialAccount.insertMany(socialAccounts);

      const response = await request(app)
        .get('/api/v1/social-accounts/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalAccounts', 2);
      expect(response.body.data).toHaveProperty('connectedAccounts', 2);
      expect(response.body.data).toHaveProperty('connectionRate', 100);
    });
  });
});

