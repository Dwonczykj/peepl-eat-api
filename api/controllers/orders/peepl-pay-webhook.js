module.exports = {


  friendlyName: 'Peepl pay webhook',


  description: '',


  inputs: {
    publicId: {
      type: 'string'
    },
    status: {
      type: 'string'
    }
  },


  exits: {

  },


  fn: async function (inputs) {

    // var unixtime = Date.now();

    // Update order with payment ID and time
    /* await Order.updateOne(inputs.orderId)
    .set({
      paymentJobId: inputs.jobId,
      paidDateTime: unixtime
    }); */

    console.log("ahhh");
    // All done.
    return;

  }


};
