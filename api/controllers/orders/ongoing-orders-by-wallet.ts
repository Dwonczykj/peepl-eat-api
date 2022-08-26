import { Exits, OngoingOrdersByWallet } from '../../interfaces';
module.exports = {
  friendlyName: 'Ongoing Orders by Wallet',
  description: 'Fetch all ongoing orders from a wallet address',
  inputs: sails.helpers.generateSchema('ongoingOrdersByWallet', 'OngoingOrdersByWallet'),
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
    
    exits.success({ data: inputs });
  }
};
