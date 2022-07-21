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
  baseUrl: 'http://localhost:1337',
  passwordSaltRounds: 10,
  fuseStudioBaseUrl: 'https://studio.fuse.io/api/v2/',
  pplTokenAddress: '0xa2C7CdB72d177f6259cD12a9A06Fdfd9625419D4',
  pplRewardsPoolAddress: '0x29249e06e8D3e4933cc403AB73136e698a08c38b',
  coopcycleUrl: 'https://agile-delivery.coopcycle.org',
  peeplPayUrl: 'https://pay.itsaboutpeepl.com/api/v1',
  peeplWebhookAddress: 'http://localhost:1337/api/v1/orders/peepl-pay-webhook',
  amazonS3BucketUrl: 'https://vegiapp-1.s3.us-east-1.amazonaws.com/',
  amazonS3Secret: 'Ob+Z6nSxSLa95NSKheFAXPMT2OYzdKOMCuVmd52Q',
  amazonS3Bucket: 'vegiapp-1',
  amazonS3AccessKey: 'AKIA57YJIRDKCR42R7MU',
  mailchimpAPIKey: '',
  mailchimpListId: '',
  peeplAPIKey: 'Oko4WFgwUFEtVlI2NE01Ry1QTkVBMzFZLVlQVllRQ1o=',
  twilioSID: 'AC2bc72aa996c7a9f5b33771c1135e0261',
  twilioAuthToken: '496e6e1846ad69163857ea3d7fa347e4',
};
