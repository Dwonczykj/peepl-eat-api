import { Exits, OngoingOrdersByWallet } from '../../interfaces';
module.exports = {
  friendlyName: 'Ongoing Orders by Wallet',
  description: 'Fetch all ongoing orders from a wallet address',
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
      message: 'success!'
    }
  },
  fn: async function (inputs: OngoingOrdersByWallet, exits: Exits) {
    const orders = await Order.find({
      customerWalletAddress: inputs.walletAddress,
      completedFlag: ''
    });
    return exits.success({ orders });
  }
};
