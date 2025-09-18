module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend-api',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        MONGODB_URI: 'mongodb://digiaeon:Digiaeon@123@127.0.0.1:27017/digital_marketing?authSource=digital_marketing',
        REDIS_URL: 'redis://localhost:6379'
      }
    },
    {
      name: 'customer-frontend',
      cwd: './customer-frontend',
      script: 'npm',
      args: 'run preview',
      env: {
        VITE_API_BASE_URL: 'http://posts.digiaeon.com/api/v1'
      }
    },
    {
      name: 'admin-panel',
      cwd: './admin-panel',
      script: 'npm',
      args: 'run preview',
      env: {
        VITE_API_BASE_URL: 'http://posts.digiaeon.com/api/v1'
      }
    }
  ]
};
