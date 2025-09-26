/**
 * Jest Configuration for AI Social Media Platform
 * Comprehensive testing setup for backend, frontend, and AI agents
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory for tests
  rootDir: '../',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/testing/**/*.test.js',
    '<rootDir>/backend-api/**/*.test.js',
    '<rootDir>/customer-frontend/src/**/*.test.js',
    '<rootDir>/admin-panel/src/**/*.test.js'
  ],
  
  // Test file patterns to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
    '<rootDir>/ai-agents/venv/',
    '<rootDir>/ai-agents/__pycache__/'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/testing/coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './backend-api/src/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './customer-frontend/src/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    },
    './admin-panel/src/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'backend-api/src/**/*.js',
    'customer-frontend/src/**/*.{js,jsx}',
    'admin-panel/src/**/*.{js,jsx}',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/testing/setup/jest.setup.js'
  ],
  
  // Module name mapping for absolute imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/customer-frontend/src/$1',
    '^@admin/(.*)$': '<rootDir>/admin-panel/src/$1',
    '^@backend/(.*)$': '<rootDir>/backend-api/src/$1',
    '^@testing/(.*)$': '<rootDir>/testing/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/testing/setup/global.setup.js',
  globalTeardown: '<rootDir>/testing/setup/global.teardown.js',
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3001'
  },
  
  // Module directories
  moduleDirectories: [
    'node_modules',
    '<rootDir>/backend-api/src',
    '<rootDir>/customer-frontend/src',
    '<rootDir>/admin-panel/src'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@testing-library|@babel|@jest|@types)/)'
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Projects for different test suites
  projects: [
    {
      displayName: 'backend',
      testMatch: [
        '<rootDir>/testing/backend/**/*.test.js',
        '<rootDir>/backend-api/**/*.test.js'
      ],
      testEnvironment: 'node',
      setupFilesAfterEnv: [
        '<rootDir>/testing/setup/backend.setup.js'
      ]
    },
    {
      displayName: 'frontend',
      testMatch: [
        '<rootDir>/testing/frontend/**/*.test.js',
        '<rootDir>/customer-frontend/src/**/*.test.js',
        '<rootDir>/admin-panel/src/**/*.test.js'
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: [
        '<rootDir>/testing/setup/frontend.setup.js'
      ]
    },
    {
      displayName: 'integration',
      testMatch: [
        '<rootDir>/testing/integration/**/*.test.js'
      ],
      testEnvironment: 'node',
      setupFilesAfterEnv: [
        '<rootDir>/testing/setup/integration.setup.js'
      ]
    },
    {
      displayName: 'e2e',
      testMatch: [
        '<rootDir>/testing/e2e/**/*.test.js'
      ],
      testEnvironment: 'node',
      setupFilesAfterEnv: [
        '<rootDir>/testing/setup/e2e.setup.js'
      ]
    }
  ],
  
  // Coverage path ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/testing/',
    '/scripts/',
    '/docs/',
    '/documentation/',
    '/.git/',
    '/.vscode/',
    '/.idea/'
  ],
  
  // Error on deprecated
  errorOnDeprecated: true,
  
  // Force exit
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Detect leaks
  detectLeaks: true,
  
  // Log heap usage
  logHeapUsage: true,
  
  // Max workers
  maxWorkers: '50%',
  
  // Worker idle memory limit
  workerIdleMemoryLimit: '512MB',
  
  // Cache directory
  cacheDirectory: '<rootDir>/testing/.jest-cache',
  
  // Clear cache
  clearCache: false,
  
  // Update snapshots
  updateSnapshot: false,
  
  // Watch mode
  watch: false,
  
  // Watch all
  watchAll: false,
  
  // Pass with no tests
  passWithNoTests: true,
  
  // Silent
  silent: false,
  
  // Use fake timers
  fakeTimers: {
    enableGlobally: false
  },
  
  // Test sequencer
  testSequencer: '<rootDir>/testing/setup/test.sequencer.js',
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './testing/reports',
        filename: 'jest-report.html',
        expand: true
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './testing/reports',
        outputName: 'junit.xml'
      }
    ]
  ],
  
  // Notify mode
  notify: false,
  
  // Notify mode
  notifyMode: 'failure-change',
  
  // Only changed
  onlyChanged: false,
  
  // Only failures
  onlyFailures: false,
  
  // Run in band
  runInBand: false,
  
  // Select projects
  selectProjects: [],
  
  // Shard
  shard: null,
  
  // Shard count
  shardCount: null,
  
  // Show seed
  showSeed: false,
  
  // Test name pattern
  testNamePattern: '',
  
  // Test path pattern
  testPathPattern: '',
  
  // Test timeout
  testTimeout: 30000,
  
  // Update snapshots
  updateSnapshot: false,
  
  // Use stderr
  useStderr: false,
  
  // Verbose
  verbose: true,
  
  // Watch
  watch: false,
  
  // Watch all
  watchAll: false,
  
  // Watchman
  watchman: true
};

