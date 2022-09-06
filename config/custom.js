const dotenv = require('dotenv');//.load('./env'); // alias of .config()
// const envConfig = dotenv.load().parsed;
const envConfig = dotenv.config('./env').parsed;

/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

module.exports.custom = {
  /***************************************************************************
  *                                                                          *
  * Any other custom config this Sails app should use during development.    *
  *                                                                          *
  ***************************************************************************/
  baseUrl: 'https://vegi.itsaboutpeepl.com',
  internalEmailAddress: 'support@itsaboutpeepl.com',
  buildNumber: 1,
  peeplWebhookAddress: 'https://vegi.itsaboutpeepl.com/api/v1/orders/peepl-pay-webhook',
  fuseStudioBaseUrl: 'https://api.chargeweb3.com/api/v0/',
  pplTokenAddress: '0xa2C7CdB72d177f6259cD12a9A06Fdfd9625419D4',
  pplRewardsPoolAddress: '0x29249e06e8D3e4933cc403AB73136e698a08c38b',
  coopcycleUrl: 'https://agile-delivery.coopcycle.org',
  peeplPayUrl: 'https://pay.itsaboutpeepl.com/api/v1',
  amazonS3BucketUrl: 'https://vegiapp-1.s3.us-east-1.amazonaws.com/',
  amazonS3Bucket: 'vegiapp-1',
  passwordSaltRounds: 10,
};
