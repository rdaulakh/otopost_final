module.exports = {
  apps: [
    {
      name: 'customer-frontend-prod',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/ubuntu/ai-social-media-platform/customer-frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/ubuntu/.pm2/logs/customer-frontend-prod-error.log',
      out_file: '/home/ubuntu/.pm2/logs/customer-frontend-prod-out.log',
      log_file: '/home/ubuntu/.pm2/logs/customer-frontend-prod.log',
      time: true
    }
  ]
};
