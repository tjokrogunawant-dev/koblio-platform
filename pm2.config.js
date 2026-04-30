module.exports = {
  apps: [
    {
      name: 'koblio-api',
      script: 'apps/api/dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'koblio-web',
      // Next.js standalone server — static files copied here by deploy.sh
      script: 'apps/web/.next/standalone/apps/web/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
