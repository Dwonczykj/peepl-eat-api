/* eslint-disable no-console */
const _ = require(`lodash`);
const fs = require(`fs`);
const path = require('path');

console.log(
  `Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]`
);

require('ts-node/register');

module.exports = {
  friendlyName: 'sync transactions',

  fn: async function () {
    sails.log.info(
      `Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]: ... (\`NODE_ENV=development sails run sync-transactions\`)`
    );

    const transactions = await sails.helpers.refreshStripeTransactions.with({
      transactionStatus: 'succeeded',
    });
    sails.log.info(`Synced ${transactions && transactions.length} with stripe API.`);

    //TODO: Sync fuse transactions...
  },
};
