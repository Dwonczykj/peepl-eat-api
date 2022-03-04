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
  amazonSesAccessKeyId: '',
  amazonSesAccessKeySecret: '',
  amazonSesRegion: 'eu-west-1',
  mailchimpAPIKey: '53745999cd9909b57e46c059db39c947',
  fuseStudioBaseUrl: 'https://studio.fuse.io/api/v2/',
  slackOrdersWebhook: 'https://hooks.slack.com/services/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',
  coopcycleUrl: 'https://agile-delivery.coopcycle.org',
  peeplPayUrl: 'http://pay.itsaboutpeepl.com/api/v1',
  peeplAPIKey: 'OlFGQVJYWVktMkRSNE0xMy1QM0ZUQ1BULTQ0TVQ1UTI=',
  peeplWebhookAddress: 'http://app.itaboutpeepl.com/api/v1/orders/peepl-pay-webhook'
};
