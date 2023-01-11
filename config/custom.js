/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://qa-vegi.vegiapp.co.uk'
    : 'http://localhost:1337';
module.exports.custom = {
  /***************************************************************************
   *                                                                          *
   * Any other custom config this Sails app should use during development.    *
   *                                                                          *
   ***************************************************************************/
  internalEmailAddress: 'support@vegiapp.co.uk',
  internalPhoneNumber: '+1 000 0000000', // For support requests
  vegiWebSite: 'https://vegiapp.co.uk',
  vegiWebSiteJoinUs: 'https://vegiapp.co.uk/#join-vegi',
  buildNumber: 1,
  baseUrl: BASE_URL,
  peeplWebhookAddress: `${BASE_URL}/api/v1/orders/peepl-pay-webhook`,
  peeplPayRefundWebhookAddress: `${BASE_URL}/api/v1/orders/peepl-pay-refund-webhook`,
  peeplWebhookAddressCustomerUpdatePaidOrder: `${BASE_URL}/api/v1/orders/peepl-pay-update-paid-order-webhook`,
  fuseStudioBaseUrl: 'https://api.chargeweb3.com/api/v0/',
  pplTokenAddress: '0xa2C7CdB72d177f6259cD12a9A06Fdfd9625419D4',
  pplRewardsPoolAddress: '0x29249e06e8D3e4933cc403AB73136e698a08c38b',
  coopcycleUrl: 'https://agile-delivery.coopcycle.org',
  peeplPayUrl: 'https://pay.itsaboutpeepl.com/api/v1',
  placesApiKey: '', //*in local.js
  googleApiBaseUrl: 'https://maps.googleapis.com/maps/api/',
  placesApiRelUrlFindPlace: 'place/findplacefromtext/json', // ~ https://googlemaps.github.io/google-maps-services-js/modules/_places_findplacefromtext_.html#:~:text=Const-,defaultUrl,-defaultUrl%3A
  distancesApiRelUrlGetDistance: 'distancematrix/json', // ~ https://googlemaps.github.io/google-maps-services-js/modules/_distance_.html#:~:text=Const-,defaultUrl,-defaultUrl%3A
  amazonS3BucketUrl: 'https://vegiapp-1.s3.us-east-1.amazonaws.com/',
  amazonS3Bucket: 'vegiapp-1',
  amazonS3MaxUploadSizeBytes: 30000000,
  vegiEatsRewardPcnt: 0.05,
  vegiPayRewardPcnt: 0.005, // TODO v2.0: To be 0 <= x <= 0.01 based on ESC measure value
  PPLTokenValueInPence: 10, // TODO: GET this value from the PeeplPay API @TheAdamGalloway
  vegiGreenPointsTicker: 'PPL',
  vegiDigitalStableCurrencyTicker: 'GBPX',
  requestDeliveryAvailability: false, // * This if true, checks if there is a courier available before asking vendor to fulfil. Only works when vendors have automated fulfilment processes.
  ignoreSpecialDatesMoreThanXMonthsAway: 12,
  ongoingOrdersHoursCutoff: 5,
  storageDomains: [],

  /**************************************************************************
   *                                                                         *
   * The TTL (time-to-live) for various sorts of tokens before they expire.  *
   *                                                                         *
   **************************************************************************/
  // passwordResetTokenTTL: 24*60*60*1000,// 24 hours
  // emailProofTokenTTL:    24*60*60*1000,// 24 hours

  /**************************************************************************
   *                                                                         *
   * The extended length that browsers should retain the session cookie      *
   * if "Remember Me" was checked while logging in.                          *
   *                                                                         *
   **************************************************************************/
  rememberMeCookieMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
