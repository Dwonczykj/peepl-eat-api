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
        NODE_OPTIONS: '--max-old-space-size=1024',
      },
      env_development: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=1024',
      },
    },
  ]
};
