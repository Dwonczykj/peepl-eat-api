module.exports = {
  friendlyName: 'Payment submitted',
  description: '',
  inputs: {
    orderId: {
      type: 'number',
      description: 'The ID of the order that has been paid.',
      required: true
    },
    jobId: {
      type: 'string',
      description: 'The job ID of the payment.',
      required: true
    }
  },
  exits: {
  },
  fn: async function (inputs, exits) {
    var request = require('request-json');
    var client = request.createClient('https://studio.fuse.io/api/v2/');

    // var options = {
    //   'method': 'GET',
    //   'url': 'https://studio.fuse.io/api/v2/jobs/' + inputs.jobId,
    //   'headers': {
    //     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50QWRkcmVzcyI6IjB4NzU1QzY2MTcxNDkzMUIxQWM5MDRhOGVjYkRENzYxMDY4OUQ4MTJBYyIsImlzQ29tbXVuaXR5QWRtaW4iOnRydWUsImFwcE5hbWUiOiJSb29zdCIsImlhdCI6MTYwNTc5NzExNX0.ozqwhxFjTYUUoexnkBOY_TsW4sL_574gWZHqzHhD8Pk',
    //     'Content-Type': 'application/json'
    //   }
    // };

    client.headers['Authorization'] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50QWRkcmVzcyI6IjB4NzU1QzY2MTcxNDkzMUIxQWM5MDRhOGVjYkRENzYxMDY4OUQ4MTJBYyIsImlzQ29tbXVuaXR5QWRtaW4iOnRydWUsImFwcE5hbWUiOiJSb29zdCIsImlhdCI6MTYwNTc5NzExNX0.ozqwhxFjTYUUoexnkBOY_TsW4sL_574gWZHqzHhD8Pk";

    client.get('jobs/' + inputs.jobId)
    .then(function(result){
      var paymentTotal = result.body.data.data.transactionBody.value/(10**16); // in pence
      var paymentSenderWallet = result.body.data.data.transactionBody.from;

      Order.findOne(inputs.orderId)
      .then(function(order){
        if(!order){
          return exits.Error();
        }else {
          // TODO: check transaction using GBPx token and check to address
          if (order.total == paymentTotal /*&& order.customerWallet == paymentSenderWallet && !order.paidDateTime*/) {
            var unixtime = new Date().getTime();
            Order.updateOne(inputs.orderId)
            .set({
              paymentJobId: inputs.jobId,
              paidDateTime: unixtime
            }).then(function(success){
              sails.sockets.broadcast('order' + order.id, 'paid', {orderId: order.id, paidDateTime: unixtime});
              //https://studio.fuse.io/api/v2/admin/tokens/transfer

              var rewardAmount = order.total * 10;

              var data = {
                tokenAddress: "0xa2C7CdB72d177f6259cD12a9A06Fdfd9625419D4",
                networkType: "fuse",
                amount: rewardAmount.toString(),
                from: "0x29249e06e8D3e4933cc403AB73136e698a08c38b",
                to: order.customer
              }

              client.post('admin/tokens/transfer', data)
              .then(function(res){
                console.log(res);
                return exits.success(result.body);
              })
            }) //TODO: error handling
          }
          else {
            return exits.error();
          }
        }
      });

    })
    .catch(function(err){
      console.log(err);
    });

  }


};
