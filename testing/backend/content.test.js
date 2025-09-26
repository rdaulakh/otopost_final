const request = require('supertest');
const app = require('../../backend-api/server');

describe('Content API', () => {
  let authToken;
  let contentId;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  describe('POST /api/content', () => {
    it('should create new content', async () => {
      const contentData = {
        title: 'Test Post',
        content: 'This is a test post content',
        platforms: ['facebook', 'instagram'],
        scheduledTime: new Date(Date.now() + 3600000).toISOString()
      };

      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content.title).toBe(contentData.title);
      contentId = response.body.data.content._id;
    });

    it('should not create content without required fields', async () => {
      const contentData = {
        title: 'Test Post'
        // Missing content field
      };

      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contentData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/content', () => {
    it('should get user content list', async () => {
      const response = await request(app)
        .get('/api/content')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.content)).toBe(true);
    });
  });

  describe('PUT /api/content/:id', () => {
    it('should update content', async () => {
      const updateData = {
        title: 'Updated Test Post',
        content: 'This is updated content'
      };

      const response = await request(app)
        .put(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content.title).toBe(updateData.title);
    });
  });

  describe('DELETE /api/content/:id', () => {
    it('should delete content', async () => {
      const response = await request(app)
        .delete(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
