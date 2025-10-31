/**
 * PM2 Ecosystem Configuration
 * 
 * This file configures PM2 to run the Next.js application
 * in production mode with proper error handling and logging.
 */

module.exports = {
  apps: [
    {
      name: 'khyber-shawls',
      script: 'npm',
      args: 'start',
      cwd: '/home/deploy/khyber-shawls',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/home/deploy/.pm2/logs/khyber-shawls-error.log',
      out_file: '/home/deploy/.pm2/logs/khyber-shawls-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
};
