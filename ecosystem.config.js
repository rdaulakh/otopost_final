module.exports = {
  apps: [
    {
      name: 'mongodb',
      script: 'mongod',
      args: '--dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --bind_ip_all --fork',
      cwd: '/usr/bin',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'backend-api',
      script: 'server.js',
      cwd: '/home/ubuntu/ai-social-media-platform/backend-api',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        MONGODB_URI: 'mongodb://localhost:27017/ai-social-media-platform'
      }
    },
    {
      name: 'customer-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/ubuntu/ai-social-media-platform/customer-frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      }
    },
    {
      name: 'admin-panel',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/ubuntu/ai-social-media-platform/admin-panel',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5174
      }
    },
    {
      name: 'ai-agents',
      script: 'start.sh',
      cwd: '/home/ubuntu/ai-social-media-platform/ai-agents',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};