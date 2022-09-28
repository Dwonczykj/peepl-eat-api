module.exports = {
  apps : [{
    name: 'vegi Backend',
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
      host : '54.80.225.99',
      key : '~/.ssh/vegi-server-keyvaluepair.pem',
      repo : 'https://github.com/Dwonczykj/peepl-eat-api.git',
      ref  : 'origin/main',
      path : '/home/ubuntu/peepl-eat-api',
      'pre-deploy-local': 'sails run rebuild-cloud-sdk.js',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'env'  : {
        'NODE_ENV': 'production'
      }
    }
  }
};
