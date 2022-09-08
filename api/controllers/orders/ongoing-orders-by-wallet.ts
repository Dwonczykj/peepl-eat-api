import { Exits, OngoingOrdersByWallet } from '../../interfaces';
module.exports = {
  friendlyName: 'Ongoing Orders by Wallet',
  description: 'Fetch all ongoing orders from a wallet address',
  // inputs: sails.helpers.generateSchema('orders/iOngoingOrdersByWallet', 'OngoingOrdersByWallet'),
  inputs: {
    walletAddress: {
      type: 'string',
      required: true
    }
  },
  exits: {
    error: {
      message: 'Error!'
    },
    success: {
      data: null,
      message: 'success!'
    }
  },
  fn: async function (inputs: OngoingOrdersByWallet, exits: Exits) {
    const orders = await Order.find({
      customerWalletAddress: inputs.walletAddress,
      completedFlag: ''
    });
    exits.success({ data: orders });
  }
};
