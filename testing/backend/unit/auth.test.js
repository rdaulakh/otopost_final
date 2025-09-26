const request = require('supertest');
const app = require('../../../backend-api/server');
const User = require('../../../backend-api/src/models/User');
const jwt = require('jsonwebtoken');

describe('Authentication Unit Tests', () => {
  beforeEach(() => {
    // Clear database before each test
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      // Mock User.findOne to return null (user doesn't exist)
      User.findOne = jest.fn().mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return error if user already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      // Mock User.findOne to return existing user
      User.findOne = jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        email: userData.email
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for weak password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error if passwords do not match', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'DifferentPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: '$2b$10$hashedPassword',
        isActive: true
      };

      // Mock User.findOne
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      
      // Mock bcrypt.compare
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: '$2b$10$hashedPassword',
        isActive: true
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return error for inactive user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: '$2b$10$hashedPassword',
        isActive: false
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        refreshTokens: [refreshToken]
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);
      User.prototype.save = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      User.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const token = 'valid-jwt-token';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        refreshTokens: ['refresh-token-1', 'refresh-token-2']
      };

      // Mock JWT verification
      jwt.verify = jest.fn().mockReturnValue({ userId: mockUser._id });
      User.findById = jest.fn().mockResolvedValue(mockUser);
      User.prototype.save = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return error for invalid token', async () => {
      const token = 'invalid-jwt-token';

      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email successfully', async () => {
      const email = 'test@example.com';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email,
        save: jest.fn().mockResolvedValue()
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return error for non-existent email', async () => {
      const email = 'nonexistent@example.com';

      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewPassword123!';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 3600000,
        save: jest.fn().mockResolvedValue()
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token,
          newPassword,
          confirmNewPassword: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return error for invalid token', async () => {
      const token = 'invalid-reset-token';
      const newPassword = 'NewPassword123!';

      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token,
          newPassword,
          confirmNewPassword: newPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for expired token', async () => {
      const token = 'expired-reset-token';
      const newPassword = 'NewPassword123!';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() - 3600000, // Expired
        save: jest.fn().mockResolvedValue()
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token,
          newPassword,
          confirmNewPassword: newPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

