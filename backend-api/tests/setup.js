// Test setup file
const mongoose = require('mongoose');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.MONGO_URI_TEST = 'mongodb://localhost:27017/otopost_test';
process.env.OPENAI_API_KEY = 'test_openai_key';

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Suppress console.log during tests unless explicitly needed
  if (!process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

// Global test cleanup
afterAll(async () => {
  // Close any open database connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Mock external services
jest.mock('openai', () => {
  return {
    Configuration: jest.fn(),
    OpenAIApi: jest.fn().mockImplementation(() => ({
      createChatCompletion: jest.fn().mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                success: true,
                data: 'Mock AI response'
              })
            }
          }]
        }
      }))
    }))
  };
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Helper functions for tests
global.testHelpers = {
  createMockUser: () => ({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword'
  }),
  
  createMockBusiness: (userId) => ({
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    businessName: 'Test Business',
    industry: 'Technology',
    targetAudience: 'Tech professionals'
  }),
  
  createMockWorkflow: (userId, businessId) => ({
    workflowId: `test_${Date.now()}`,
    user: userId,
    business: businessId,
    type: 'content_generation',
    status: 'completed',
    input: { test: 'data' },
    result: { posts: [] }
  })
};
