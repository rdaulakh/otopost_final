const request = require('supertest');
const app = require('../../../backend-api/server');
const Notification = require('../../../backend-api/src/models/Notification');
const User = require('../../../backend-api/src/models/User');
const Organization = require('../../../backend-api/src/models/Organization');

describe('Notification Service', () => {
  let authToken;
  let userId;
  let organizationId;

  beforeAll(async () => {
    // Create test organization
    const organization = new Organization({
      name: 'Test Organization',
      description: 'Test organization for notification tests',
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
      .post('/api/v1/auth/customer/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!'
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up
    await Notification.deleteMany({});
    await User.deleteMany({});
    await Organization.deleteMany({});
  });

  beforeEach(async () => {
    // Clear notifications before each test
    await Notification.deleteMany({});
  });

  describe('GET /api/v1/notifications', () => {
    it('should get user notifications', async () => {
      // Create test notifications
      const notifications = [
        {
          user: userId,
          organization: organizationId,
          type: 'content_approved',
          title: 'Content Approved',
          message: 'Your content has been approved',
          priority: 'medium'
        },
        {
          user: userId,
          organization: organizationId,
          type: 'content_rejected',
          title: 'Content Rejected',
          message: 'Your content has been rejected',
          priority: 'high'
        }
      ];

      await Notification.insertMany(notifications);

      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('message');
      expect(response.body.data[0]).toHaveProperty('type');
    });

    it('should filter notifications by status', async () => {
      // Create test notifications with different statuses
      const notifications = [
        {
          user: userId,
          organization: organizationId,
          type: 'content_approved',
          title: 'Content Approved',
          message: 'Your content has been approved',
          status: 'unread'
        },
        {
          user: userId,
          organization: organizationId,
          type: 'content_rejected',
          title: 'Content Rejected',
          message: 'Your content has been rejected',
          status: 'read'
        }
      ];

      await Notification.insertMany(notifications);

      const response = await request(app)
        .get('/api/v1/notifications?status=unread')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('unread');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/notifications')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  describe('POST /api/v1/notifications/custom', () => {
    it('should create custom notification (admin only)', async () => {
      const notificationData = {
        userId: userId,
        organizationId: organizationId,
        type: 'custom',
        title: 'Custom Notification',
        message: 'This is a custom notification',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/v1/notifications/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'Custom Notification');
      expect(response.body.data).toHaveProperty('message', 'This is a custom notification');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('PUT /api/v1/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      // Create test notification
      const notification = new Notification({
        user: userId,
        organization: organizationId,
        type: 'content_approved',
        title: 'Content Approved',
        message: 'Your content has been approved',
        status: 'unread'
      });
      await notification.save();

      const response = await request(app)
        .put(`/api/v1/notifications/${notification._id}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('read');
      expect(response.body.data.readAt).toBeDefined();
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/v1/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/v1/notifications/mark-all-read', () => {
    it('should mark all notifications as read', async () => {
      // Create test notifications
      const notifications = [
        {
          user: userId,
          organization: organizationId,
          type: 'content_approved',
          title: 'Content Approved 1',
          message: 'Your content has been approved',
          status: 'unread'
        },
        {
          user: userId,
          organization: organizationId,
          type: 'content_approved',
          title: 'Content Approved 2',
          message: 'Your content has been approved',
          status: 'unread'
        }
      ];

      await Notification.insertMany(notifications);

      const response = await request(app)
        .put('/api/v1/notifications/mark-all-read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('marked as read');

      // Verify all notifications are marked as read
      const updatedNotifications = await Notification.find({ user: userId });
      updatedNotifications.forEach(notification => {
        expect(notification.status).toBe('read');
        expect(notification.readAt).toBeDefined();
      });
    });
  });

  describe('GET /api/v1/notifications/stats', () => {
    it('should get notification statistics', async () => {
      // Create test notifications with different statuses
      const notifications = [
        {
          user: userId,
          organization: organizationId,
          type: 'content_approved',
          title: 'Content Approved',
          message: 'Your content has been approved',
          status: 'unread'
        },
        {
          user: userId,
          organization: organizationId,
          type: 'content_rejected',
          title: 'Content Rejected',
          message: 'Your content has been rejected',
          status: 'read'
        },
        {
          user: userId,
          organization: organizationId,
          type: 'content_published',
          title: 'Content Published',
          message: 'Your content has been published',
          status: 'archived'
        }
      ];

      await Notification.insertMany(notifications);

      const response = await request(app)
        .get('/api/v1/notifications/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('unread', 1);
      expect(response.body.data).toHaveProperty('read', 1);
      expect(response.body.data).toHaveProperty('archived', 1);
      expect(response.body.data).toHaveProperty('total', 3);
    });
  });

  describe('PUT /api/v1/notifications/preferences', () => {
    it('should update notification preferences', async () => {
      const preferences = {
        email: true,
        push: false,
        inApp: true,
        types: {
          content_approved: true,
          content_rejected: true,
          system_alert: false
        }
      };

      const response = await request(app)
        .put('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ preferences })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(preferences);
    });
  });
});

