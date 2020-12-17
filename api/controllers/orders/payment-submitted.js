module.exports = {


  friendlyName: 'Payment submitted',


  description: '',


  inputs: {
    orderId: {
      type: 'number',
      description: 'The ID of the order that has been paid.'
    },
    jobId: {
      type: 'string',
      description: 'The job ID of the payment.'
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    var request = require('request');
    
    sails.sockets.join(this.req, inputs.orderId, function(err){
      if(err) {
        return exits.serverError();
      }
    })

    var options = {
      'method': 'GET',
      'url': 'https://studio.fuse.io/api/v2/jobs/5fc90b4c3b48f70019cd68e8',
      'headers': {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50QWRkcmVzcyI6IjB4NzU1QzY2MTcxNDkzMUIxQWM5MDRhOGVjYkRENzYxMDY4OUQ4MTJBYyIsImlzQ29tbXVuaXR5QWRtaW4iOnRydWUsImFwcE5hbWUiOiJSb29zdCIsImlhdCI6MTYwNTc5NzExNX0.ozqwhxFjTYUUoexnkBOY_TsW4sL_574gWZHqzHhD8Pk',
        'Content-Type': 'application/json'
      }
    };
    request(options, function (error, response) { 
      if (error) return exits.serverError();
      console.log(response.body.data.data);
      return exits.success(response.body);
    });

  }


};
