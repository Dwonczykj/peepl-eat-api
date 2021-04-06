module.exports = {
  apps : [{
    name: 'Peepl Wallet App Backend',
    script: 'app.js',
    watch: false,
    env: {
      'NODE_ENV': 'development'
    },
    // eslint-disable-next-line camelcase
    env_prod: {
      'NODE_ENV': 'production'
    }
  }],

  deploy : {
    production : {
      user : 'ubuntu',
      host : '52.48.132.138',
      key : 'C:/Users/Adam/.ssh/peepl-app.pem',
      ref  : 'origin/main',
      repo : 'https://github.com/itsaboutpeepl/peepl-app-sails.git',
      path : '/home/ubuntu/peepl-app-sails',
      'pre-deploy-local': 'sails run rebuild-cloud-sdk.js',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'env'  : {
        'NODE_ENV': 'production'
      }
    }
  }
};
