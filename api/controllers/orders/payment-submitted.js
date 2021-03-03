module.exports = {
  friendlyName: 'Payment submitted',
  description: 'Called by the frontend when the payment has been made.',
  inputs: {
    orderId: {
      type: 'number',
      description: 'The ID of the order that has been paid for.',
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
    client.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50QWRkcmVzcyI6IjB4NzU1QzY2MTcxNDkzMUIxQWM5MDRhOGVjYkRENzYxMDY4OUQ4MTJBYyIsImlzQ29tbXVuaXR5QWRtaW4iOnRydWUsImFwcE5hbWUiOiJSb29zdCIsImlhdCI6MTYwNTc5NzExNX0.ozqwhxFjTYUUoexnkBOY_TsW4sL_574gWZHqzHhD8Pk';

    function makeQuery(iteration = 0){
      setTimeout(() => {
        console.log('Checking transaction id: ' + inputs.jobId + ' Attempt#: ' + iteration);
        client.get('jobs/' + inputs.jobId)
        .then((result) => {
          var paymentInfo = result.body.data.data.transactionBody;

          var paymentTotal = paymentInfo.value/(10**16); // in pence
          var paymentSenderWallet = paymentInfo.from;
          var paymentRecipientWallet = paymentInfo.to;
          var paymentTokenAddress = paymentInfo.tokenAddress;
          var paymentStatus = paymentInfo.status;
          var transactionType = paymentInfo.type;

          if(iteration >= 29){
            // Timeout if taken longer than 30 seconds
            return;
          }

          if(paymentStatus == 'pending'){
            return makeQuery(iteration+1);
          }

          Order.findOne(inputs.orderId)
          .populate('items.product.vendor')
          .then(async (order) => {
            var error = '';

            if(!order){
              return exits.error();
            }else {
              if(paymentRecipientWallet != order.items[0].product.vendor.walletId) {
                error = 'Recipient doesn\'t match!';
                sails.sockets.broadcast('order' + order.id, 'error', {orderId: order.id, message: error});
                return exits.error({message: error});
              }
              if(paymentTokenAddress.toUpperCase() != '0x40AFCD9421577407ABB0d82E2fF25Fd2Ef4c68BD'.toUpperCase()) {//GBPX token address
                error = 'Incorrect token sent.';
                sails.sockets.broadcast('order' + order.id, 'error', {orderId: order.id, message: error});
                return exits.error({message: error});
              }
              if (paymentSenderWallet != order.customer){
                error = 'Transaction sender is not customer.';
                sails.sockets.broadcast('order' + order.id, 'error', {orderId: order.id, message: error});
                return exits.error({message: error});
              }
              if(paymentTotal != order.total){
                error =  'Transaction amount doesn\'t match order total.';
                sails.sockets.broadcast('order' + order.id, 'error', {orderId: order.id, message: error});
                return exits.error({message: error});
              }
              if(paymentStatus != 'confirmed'){
                error = 'Transaction failed. Check wallet balance.';
                sails.sockets.broadcast('order' + order.id, 'error', {orderId: order.id, message: error});
                return exits.error({message: error});
              }
              if (transactionType != 'SEND'){
                error = 'Incorrect transaction type.';
                sails.sockets.broadcast('order' + order.id, 'error', {orderId: order.id, message: error});
                return exits.error({message: error});
              }

              var existingOrdersWithJobId = await Order.findOne({paymentJobId: inputs.jobId});
              if(existingOrdersWithJobId){
                error = 'Transaction has already been used for another order.';
                sails.sockets.broadcast('order' + order.id, 'error', {orderId: order.id, message: error});
                return exits.error({message: error});
              }

              var unixtime = Date.now();
              Order.updateOne(inputs.orderId)
              .set({
                paymentJobId: inputs.jobId,
                paidDateTime: unixtime
              }).then((success) => {
                // Notify client of successful transaction
                sails.sockets.broadcast('order' + order.id, 'paid', {orderId: order.id, paidDateTime: unixtime});

                // TODO: remove redundant query
                Order.findOne(inputs.orderId)
                .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue&vendor')
                .then(async (fullOrder) => {
                  await sails.helpers.sendTemplateEmail.with({
                    template: 'email-order-confirmation',
                    templateData: {fullOrder},
                    to: fullOrder.deliveryEmail,
                    subject: 'Peepl Eat Order Confirmed - #' + fullOrder.id ,
                    layout: false,
                  });
                });

                // Issue PPL token reward
                var rewardAmount = order.total; // 10 PPL tokens = £0.01, reward is 10% of spend

                var data = {
                  tokenAddress: '0xa2C7CdB72d177f6259cD12a9A06Fdfd9625419D4',
                  networkType: 'fuse',
                  amount: rewardAmount.toString(),
                  from: '0x29249e06e8D3e4933cc403AB73136e698a08c38b',
                  to: order.customer
                };

                client.post('admin/tokens/transfer', data)
                .then((result) => {
                  return exits.success(result.body);
                });
              });
            }
          });

        })
        .catch((err) => {
          console.log(err);
        });
      }, 1000);
    }

    makeQuery();
  }
};
