const request = require('supertest');
const app = require('../../../backend-api/server');
const Template = require('../../../backend-api/src/models/Template');
const User = require('../../../backend-api/src/models/User');
const Organization = require('../../../backend-api/src/models/Organization');

describe('Templates API', () => {
  let authToken;
  let userId;
  let organizationId;

  beforeAll(async () => {
    // Create test organization
    const organization = new Organization({
      name: 'Test Organization',
      description: 'Test organization for template tests',
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
    await Template.deleteMany({});
    await User.deleteMany({});
    await Organization.deleteMany({});
  });

  beforeEach(async () => {
    // Clear templates before each test
    await Template.deleteMany({});
  });

  describe('GET /api/v1/templates', () => {
    it('should get user templates', async () => {
      // Create test templates
      const templates = [
        {
          user: userId,
          organization: organizationId,
          name: 'Test Template 1',
          description: 'First test template',
          category: 'promotional',
          platforms: ['instagram', 'facebook'],
          content: {
            text: 'This is a test post #test #promotion',
            hashtags: ['#test', '#promotion'],
            callToAction: 'Learn more'
          },
          isActive: true
        },
        {
          user: userId,
          organization: organizationId,
          name: 'Test Template 2',
          description: 'Second test template',
          category: 'educational',
          platforms: ['twitter', 'linkedin'],
          content: {
            text: 'Educational content about technology',
            hashtags: ['#education', '#tech'],
            callToAction: 'Read more'
          },
          isActive: true
        }
      ];

      await Template.insertMany(templates);

      const response = await request(app)
        .get('/api/v1/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter templates by category', async () => {
      // Create test templates with different categories
      const templates = [
        {
          user: userId,
          organization: organizationId,
          name: 'Promotional Template',
          category: 'promotional',
          platforms: ['instagram'],
          content: { text: 'Promotional content' },
          isActive: true
        },
        {
          user: userId,
          organization: organizationId,
          name: 'Educational Template',
          category: 'educational',
          platforms: ['twitter'],
          content: { text: 'Educational content' },
          isActive: true
        }
      ];

      await Template.insertMany(templates);

      const response = await request(app)
        .get('/api/v1/templates?category=promotional')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('promotional');
    });

    it('should search templates by name', async () => {
      // Create test templates
      const templates = [
        {
          user: userId,
          organization: organizationId,
          name: 'Instagram Marketing Template',
          category: 'promotional',
          platforms: ['instagram'],
          content: { text: 'Instagram content' },
          isActive: true
        },
        {
          user: userId,
          organization: organizationId,
          name: 'Facebook Ad Template',
          category: 'promotional',
          platforms: ['facebook'],
          content: { text: 'Facebook content' },
          isActive: true
        }
      ];

      await Template.insertMany(templates);

      const response = await request(app)
        .get('/api/v1/templates?search=Instagram')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('Instagram');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/templates')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  describe('GET /api/v1/templates/public', () => {
    it('should get public templates', async () => {
      // Create public and private templates
      const templates = [
        {
          user: userId,
          organization: organizationId,
          name: 'Public Template',
          category: 'promotional',
          platforms: ['instagram'],
          content: { text: 'Public content' },
          isPublic: true,
          isActive: true
        },
        {
          user: userId,
          organization: organizationId,
          name: 'Private Template',
          category: 'promotional',
          platforms: ['instagram'],
          content: { text: 'Private content' },
          isPublic: false,
          isActive: true
        }
      ];

      await Template.insertMany(templates);

      const response = await request(app)
        .get('/api/v1/templates/public')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isPublic).toBe(true);
    });
  });

  describe('POST /api/v1/templates', () => {
    it('should create a new template', async () => {
      const templateData = {
        name: 'New Template',
        description: 'A new test template',
        category: 'promotional',
        platforms: ['instagram', 'facebook'],
        content: {
          text: 'This is a new template #new #template',
          hashtags: ['#new', '#template'],
          callToAction: 'Click here'
        },
        tags: ['marketing', 'social'],
        isPublic: false
      };

      const response = await request(app)
        .post('/api/v1/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'New Template');
      expect(response.body.data).toHaveProperty('category', 'promotional');
      expect(response.body.data).toHaveProperty('platforms', ['instagram', 'facebook']);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should validate content text length', async () => {
      const templateData = {
        name: 'Test Template',
        category: 'promotional',
        platforms: ['instagram'],
        content: {
          text: 'a'.repeat(2001) // Too long
        }
      };

      const response = await request(app)
        .post('/api/v1/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('2000 characters');
    });
  });

  describe('GET /api/v1/templates/:id', () => {
    it('should get template by ID', async () => {
      // Create test template
      const template = new Template({
        user: userId,
        organization: organizationId,
        name: 'Test Template',
        category: 'promotional',
        platforms: ['instagram'],
        content: { text: 'Test content' },
        isActive: true
      });
      await template.save();

      const response = await request(app)
        .get(`/api/v1/templates/${template._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Test Template');
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/templates/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/v1/templates/:id', () => {
    it('should update template', async () => {
      // Create test template
      const template = new Template({
        user: userId,
        organization: organizationId,
        name: 'Original Template',
        category: 'promotional',
        platforms: ['instagram'],
        content: { text: 'Original content' },
        isActive: true
      });
      await template.save();

      const updateData = {
        name: 'Updated Template',
        description: 'Updated description',
        content: {
          text: 'Updated content #updated',
          hashtags: ['#updated']
        }
      };

      const response = await request(app)
        .put(`/api/v1/templates/${template._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Template');
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/v1/templates/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/v1/templates/:id', () => {
    it('should delete template', async () => {
      // Create test template
      const template = new Template({
        user: userId,
        organization: organizationId,
        name: 'Template to Delete',
        category: 'promotional',
        platforms: ['instagram'],
        content: { text: 'Content to delete' },
        isActive: true
      });
      await template.save();

      const response = await request(app)
        .delete(`/api/v1/templates/${template._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify template is deleted
      const deletedTemplate = await Template.findById(template._id);
      expect(deletedTemplate).toBeNull();
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/v1/templates/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/v1/templates/:id/duplicate', () => {
    it('should duplicate template', async () => {
      // Create test template
      const template = new Template({
        user: userId,
        organization: organizationId,
        name: 'Original Template',
        category: 'promotional',
        platforms: ['instagram'],
        content: { text: 'Original content' },
        isActive: true
      });
      await template.save();

      const response = await request(app)
        .post(`/api/v1/templates/${template._id}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Original Template (Copy)');
      expect(response.body.data.isPublic).toBe(false);
    });
  });

  describe('POST /api/v1/templates/:id/use', () => {
    it('should use template with variables', async () => {
      // Create test template with variables
      const template = new Template({
        user: userId,
        organization: organizationId,
        name: 'Template with Variables',
        category: 'promotional',
        platforms: ['instagram'],
        content: {
          text: 'Hello {name}, check out our {product}!',
          hashtags: ['#{product}', '#promotion']
        },
        variables: [
          { name: 'name', type: 'text', required: true },
          { name: 'product', type: 'text', required: true }
        ],
        isActive: true
      });
      await template.save();

      const variables = {
        name: 'John',
        product: 'iPhone'
      };

      const response = await request(app)
        .post(`/api/v1/templates/${template._id}/use`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ variables })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.generatedContent.text).toBe('Hello John, check out our iPhone!');
      expect(response.body.data.generatedContent.hashtags).toContain('#iPhone');
    });
  });

  describe('GET /api/v1/templates/stats', () => {
    it('should get template statistics', async () => {
      // Create test templates
      const templates = [
        {
          user: userId,
          organization: organizationId,
          name: 'Template 1',
          category: 'promotional',
          platforms: ['instagram'],
          content: { text: 'Content 1' },
          isActive: true,
          isPublic: false,
          performance: { usageCount: 5, avgEngagement: 0.05 }
        },
        {
          user: userId,
          organization: organizationId,
          name: 'Template 2',
          category: 'educational',
          platforms: ['twitter'],
          content: { text: 'Content 2' },
          isActive: true,
          isPublic: true,
          performance: { usageCount: 10, avgEngagement: 0.08 }
        }
      ];

      await Template.insertMany(templates);

      const response = await request(app)
        .get('/api/v1/templates/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview.totalTemplates).toBe(2);
      expect(response.body.data.overview.activeTemplates).toBe(2);
      expect(response.body.data.overview.publicTemplates).toBe(1);
      expect(response.body.data.overview.totalUsage).toBe(15);
    });
  });
});

