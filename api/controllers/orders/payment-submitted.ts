declare var Order: any;
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
    var axios = require('axios');

    var client = axios.create({
      baseURL: sails.config.custom.fuseStudioBaseUrl,
      timeout: 1000,
      headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50QWRkcmVzcyI6IjB4NzU1QzY2MTcxNDkzMUIxQWM5MDRhOGVjYkRENzYxMDY4OUQ4MTJBYyIsImlzQ29tbXVuaXR5QWRtaW4iOnRydWUsImFwcE5hbWUiOiJSb29zdCIsImlhdCI6MTYwNTc5NzExNX0.ozqwhxFjTYUUoexnkBOY_TsW4sL_574gWZHqzHhD8Pk'}
    });

    // Recursive function - runs every second until payment fails or succeeds (30s timeout)
    function makeQuery(iteration = 0){
      setTimeout(async () => {
        sails.log('Checking transaction id: ' + inputs.jobId + ' Attempt #: ' + iteration);

        // Make request to Fuse API to check payment status
        var jobDetails = await client.get('/jobs/' + inputs.jobId);

        var paymentInfo = jobDetails.data.data.data.transactionBody;

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

        if(paymentStatus === 'pending'){
          return makeQuery(iteration+1);
        }

        var orderDetails = await Order.findOne(inputs.orderId)
        .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue&vendor&discount');

        var error = '';

        if(!orderDetails){
          // Order doesn't exist
          return exits.error({message: 'Order doesn\'t exist!'});
        } else {
          // Validations
          // Incorrect Recipient
          if(paymentRecipientWallet !== orderDetails.items[0].product.vendor.walletId) {
            error = 'Recipient doesn\'t match!';
            sails.sockets.broadcast('order' + orderDetails.id, 'paymentError', {orderId: orderDetails.id, message: error});
            return exits.error({message: error});
          }
          // Incorrect Currency
          if(paymentTokenAddress.toUpperCase() !== '0x40AFCD9421577407ABB0d82E2fF25Fd2Ef4c68BD'.toUpperCase()) {//GBPX token address
            error = 'Incorrect token sent.';
            sails.sockets.broadcast('order' + orderDetails.id, 'paymentError', {orderId: orderDetails.id, message: error});
            return exits.error({message: error});
          }
          // Incorrect Sender
          if (paymentSenderWallet !== orderDetails.customer){
            error = 'Transaction sender is not customer.';
            sails.sockets.broadcast('order' + orderDetails.id, 'paymentError', {orderId: orderDetails.id, message: error});
            return exits.error({message: error});
          }
          // Incorrect Total
          if(paymentTotal !== orderDetails.total){
            error =  'Transaction amount doesn\'t match order total.';
            sails.sockets.broadcast('order' + orderDetails.id, 'paymentError', {orderId: orderDetails.id, message: error});
            return exits.error({message: error});
          }
          // Incorrect Status
          if(paymentStatus !== 'confirmed'){
            error = 'Transaction failed. Check wallet balance.';
            sails.sockets.broadcast('order' + orderDetails.id, 'paymentError', {orderId: orderDetails.id, message: error});
            return exits.error({message: error});
          }
          // Incorrect Transaction Type
          if (transactionType !== 'SEND'){
            error = 'Incorrect transaction type.';
            sails.sockets.broadcast('order' + orderDetails.id, 'paymentError', {orderId: orderDetails.id, message: error});
            return exits.error({message: error});
          }
          // Transaction already been used (replay attack)
          var existingOrdersWithJobId = await Order.findOne({paymentJobId: inputs.jobId});
          if(existingOrdersWithJobId){
            error = 'Transaction has already been used for another order.';
            sails.sockets.broadcast('order' + orderDetails.id, 'paymentError', {orderId: orderDetails.id, message: error});
            return exits.error({message: error});
          }

          var unixtime = Date.now();

          // Update order with payment ID and time
          await Order.updateOne(inputs.orderId)
          .set({
            paymentJobId: inputs.jobId,
            paidDateTime: unixtime
          });

          if(orderDetails.discount) {
            await Discount.updateOne(orderDetails.discount.id).set({timesUsed: orderDetails.discount.timesUsed + 1}); // TODO: Make this atomic
          }

          // Notify subscribed sockets of order status
          sails.sockets.broadcast('order' + orderDetails.id, 'paid', {orderId: orderDetails.id, paidDateTime: unixtime});

          if(sails.config.environment === 'production'){
            // Send slack notification to orders channel
            await axios.post(sails.config.custom.slackOrdersWebhook, {
              text: `New order created #${orderDetails.id} for £${orderDetails.total / 100}! Check it out: https://app.itsaboutpeepl.com/orders/${orderDetails.id}`,
            });

            // Issue PPL token reward
            var rewardAmount = orderDetails.total; // 10 PPL tokens = £0.01, reward is 10% of spend
            var data = {
              tokenAddress: '0xa2C7CdB72d177f6259cD12a9A06Fdfd9625419D4',
              networkType: 'fuse',
              amount: rewardAmount.toString(),
              from: '0x29249e06e8D3e4933cc403AB73136e698a08c38b',
              to: orderDetails.customer
            };
            await client.post('admin/tokens/transfer', data);

            // Send order confirmation email
            await sails.helpers.sendTemplateEmail.with({
              template: 'email-order-confirmation-new',
              templateData: {order: orderDetails},
              to: orderDetails.deliveryEmail,
              subject: 'Peepl Eat Order Confirmed - #' + orderDetails.id ,
              layout: false,
            });
          }

          return exits.success(jobDetails.body);
        }
      }, 1000);
    }

    makeQuery();
  }
};
