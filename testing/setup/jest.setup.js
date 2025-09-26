/**
 * Jest Setup Configuration
 * Global setup for all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/ai_social_media_platform_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.API_URL = 'http://localhost:3001/api';

// Mock console methods in test environment
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
    organizationId: 'test-org-id'
  }),
  
  createMockOrganization: () => ({
    id: 'test-org-id',
    name: 'Test Organization',
    domain: 'test.com'
  }),
  
  createMockContent: () => ({
    id: 'test-content-id',
    title: 'Test Content',
    content: 'This is test content',
    platforms: ['instagram', 'facebook'],
    status: 'draft'
  })
};

// Setup global mocks
jest.mock('../backend-api/src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Increase timeout for integration tests
jest.setTimeout(30000);

