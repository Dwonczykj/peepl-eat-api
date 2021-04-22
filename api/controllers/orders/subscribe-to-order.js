module.exports = {


  friendlyName: 'Subscribe to order',


  description: '',


  inputs: {
    orderId: {
      type: 'number',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    if (!this.req.isSocket) {
      throw {badRequest: 'Only a client socket can subscribe.  But you look like an HTTP request to me.'};
    }

    // Subscribe calling websocket to order room
    sails.sockets.join(this.req, 'order' + inputs.orderId, (err) => {
      if(err) {
        return exits.error();
      }
    });

    // All done.
    return;

  }


};
