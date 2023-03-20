/* eslint-disable camelcase */
module.exports = {
  // ~ https://pm2.keymetrics.io/docs/usage/application-declaration/#:~:text=Acting%20on%20Configuration%20File
  apps: [
    {
      name: 'vegi server',
      script: 'app.js',
      watch: false,
      args: '--hookTimeout 160000 --verbose',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=2048',
      },
    },
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: '54.80.225.99',
      key: '~/.ssh/vegi-server-keyvaluepair.pem',
      repo: 'https://github.com/Dwonczykj/peepl-eat-api.git',
      ref: 'origin/main',
      path: '/home/ubuntu/peepl-eat-api',
      'pre-deploy-local': 'sails run rebuild-cloud-sdk.js',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=2048',
      },
    },
    QA: {
      user: 'ubuntu',
      host: '3.95.65.212',
      key: '~/.ssh/vegi-server-keyvaluepair.pem',
      repo: 'https://github.com/Dwonczykj/peepl-eat-api.git',
      ref: 'origin/QA',
      path: '/home/ubuntu/peepl-eat-api',
      'pre-deploy-local': 'sails run rebuild-cloud-sdk.js',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=2048',
      },
    },
  },
};
