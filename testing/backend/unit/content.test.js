const request = require('supertest');
const app = require('../../../backend-api/server');
const Content = require('../../../backend-api/src/models/Content');
const User = require('../../../backend-api/src/models/User');
const jwt = require('jsonwebtoken');

describe('Content Unit Tests', () => {
  let authToken;
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      organization: '507f1f77bcf86cd799439012'
    };

    // Mock JWT verification
    authToken = 'valid-jwt-token';
    jwt.verify = jest.fn().mockReturnValue({ userId: mockUser._id });
  });

  describe('POST /api/content', () => {
    it('should create content successfully', async () => {
      const contentData = {
        title: 'Test Post',
        content: 'This is a test post content',
        type: 'text',
        platforms: ['facebook', 'twitter'],
        hashtags: ['#test', '#socialmedia'],
        scheduledDate: new Date(Date.now() + 3600000).toISOString()
      };

      const mockContent = {
        _id: '507f1f77bcf86cd799439013',
        ...contentData,
        organization: mockUser.organization,
        createdBy: mockUser._id,
        status: 'draft'
      };

      Content.prototype.save = jest.fn().mockResolvedValue(mockContent);
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(contentData.title);
    });

    it('should return error for invalid content type', async () => {
      const contentData = {
        title: 'Test Post',
        content: 'This is a test post content',
        type: 'invalid-type',
        platforms: ['facebook']
      };

      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid platform', async () => {
      const contentData = {
        title: 'Test Post',
        content: 'This is a test post content',
        type: 'text',
        platforms: ['invalid-platform']
      };

      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for missing required fields', async () => {
      const contentData = {
        title: 'Test Post'
        // Missing content, type, platforms
      };

      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for unauthorized access', async () => {
      const contentData = {
        title: 'Test Post',
        content: 'This is a test post content',
        type: 'text',
        platforms: ['facebook']
      };

      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer invalid-token`)
        .send(contentData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/content', () => {
    it('should get content list successfully', async () => {
      const mockContentList = [
        {
          _id: '507f1f77bcf86cd799439013',
          title: 'Test Post 1',
          content: 'Content 1',
          type: 'text',
          platforms: ['facebook'],
          status: 'draft',
          createdAt: new Date()
        },
        {
          _id: '507f1f77bcf86cd799439014',
          title: 'Test Post 2',
          content: 'Content 2',
          type: 'image',
          platforms: ['instagram'],
          status: 'published',
          createdAt: new Date()
        }
      ];

      Content.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockContentList)
            })
          })
        })
      });

      Content.countDocuments = jest.fn().mockResolvedValue(2);
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter content by status', async () => {
      const mockContentList = [
        {
          _id: '507f1f77bcf86cd799439013',
          title: 'Test Post 1',
          status: 'draft'
        }
      ];

      Content.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockContentList)
            })
          })
        })
      });

      Content.countDocuments = jest.fn().mockResolvedValue(1);
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/content?status=draft')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Content.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft' })
      );
    });

    it('should filter content by platform', async () => {
      const mockContentList = [];

      Content.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockContentList)
            })
          })
        })
      });

      Content.countDocuments = jest.fn().mockResolvedValue(0);
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/content?platform=facebook')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Content.find).toHaveBeenCalledWith(
        expect.objectContaining({ platforms: { $in: ['facebook'] } })
      );
    });
  });

  describe('GET /api/content/:id', () => {
    it('should get content by ID successfully', async () => {
      const contentId = '507f1f77bcf86cd799439013';
      const mockContent = {
        _id: contentId,
        title: 'Test Post',
        content: 'This is a test post content',
        type: 'text',
        platforms: ['facebook'],
        status: 'draft',
        organization: mockUser.organization,
        createdBy: mockUser._id
      };

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockContent)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(contentId);
    });

    it('should return error for non-existent content', async () => {
      const contentId = '507f1f77bcf86cd799439013';

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid content ID', async () => {
      const contentId = 'invalid-id';

      const response = await request(app)
        .get(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/content/:id', () => {
    it('should update content successfully', async () => {
      const contentId = '507f1f77bcf86cd799439013';
      const updateData = {
        title: 'Updated Post Title',
        content: 'Updated content'
      };

      const mockContent = {
        _id: contentId,
        title: 'Test Post',
        content: 'This is a test post content',
        type: 'text',
        platforms: ['facebook'],
        status: 'draft',
        organization: mockUser.organization,
        createdBy: mockUser._id,
        save: jest.fn().mockResolvedValue({
          ...mockContent,
          ...updateData
        })
      };

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockContent)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .put(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should return error for non-existent content', async () => {
      const contentId = '507f1f77bcf86cd799439013';
      const updateData = {
        title: 'Updated Post Title'
      };

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .put(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return error for unauthorized update', async () => {
      const contentId = '507f1f77bcf86cd799439013';
      const updateData = {
        title: 'Updated Post Title'
      };

      const mockContent = {
        _id: contentId,
        organization: 'different-organization',
        createdBy: 'different-user'
      };

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockContent)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .put(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/content/:id', () => {
    it('should delete content successfully', async () => {
      const contentId = '507f1f77bcf86cd799439013';

      const mockContent = {
        _id: contentId,
        organization: mockUser.organization,
        createdBy: mockUser._id,
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
      };

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockContent)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .delete(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return error for non-existent content', async () => {
      const contentId = '507f1f77bcf86cd799439013';

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .delete(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/content/:id/schedule', () => {
    it('should schedule content successfully', async () => {
      const contentId = '507f1f77bcf86cd799439013';
      const scheduleData = {
        scheduledDate: new Date(Date.now() + 3600000).toISOString(),
        platforms: ['facebook', 'twitter']
      };

      const mockContent = {
        _id: contentId,
        organization: mockUser.organization,
        createdBy: mockUser._id,
        save: jest.fn().mockResolvedValue({
          ...mockContent,
          scheduledDate: scheduleData.scheduledDate,
          status: 'scheduled'
        })
      };

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockContent)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post(`/api/content/${contentId}/schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('scheduled');
    });

    it('should return error for past scheduled date', async () => {
      const contentId = '507f1f77bcf86cd799439013';
      const scheduleData = {
        scheduledDate: new Date(Date.now() - 3600000).toISOString(), // Past date
        platforms: ['facebook']
      };

      const response = await request(app)
        .post(`/api/content/${contentId}/schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/content/:id/publish', () => {
    it('should publish content successfully', async () => {
      const contentId = '507f1f77bcf86cd799439013';

      const mockContent = {
        _id: contentId,
        organization: mockUser.organization,
        createdBy: mockUser._id,
        status: 'draft',
        save: jest.fn().mockResolvedValue({
          ...mockContent,
          status: 'published',
          publishedAt: new Date()
        })
      };

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockContent)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post(`/api/content/${contentId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('published');
    });

    it('should return error for already published content', async () => {
      const contentId = '507f1f77bcf86cd799439013';

      const mockContent = {
        _id: contentId,
        organization: mockUser.organization,
        createdBy: mockUser._id,
        status: 'published'
      };

      Content.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockContent)
      });

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post(`/api/content/${contentId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

