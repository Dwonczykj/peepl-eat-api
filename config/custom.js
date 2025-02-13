/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

const { config } = require('dotenv');

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.STAGE_ENV === 'QA'
      ? 'https://qa-vegi.vegiapp.co.uk'
      : 'https://vegi.vegiapp.co.uk'
    : `http://localhost:${process.env.PORT || 1337}`;

console.log(`Loading custom.js in NODE_ENV: "${process.env.NODE_ENV}"`);

config(); // load config from local .env if exists into process.env

let custom = {
  /***************************************************************************
   *                                                                          *
   * Any other custom config this Sails app should use during development.    *
   *                                                                          *
   ***************************************************************************/
  dbName: 'postgres',
  internalEmailAddress: 'support@vegiapp.co.uk',
  internalPhoneNumber: '+1 000 0000000', // For support requests
  vegiWebSite: 'https://vegiapp.co.uk',
  vegiWebSiteJoinUs: 'https://vegiapp.co.uk/#join-vegi',
  AppUriGooglePlayStore:
    'https://play.google.com/store/apps/details?id=com.vegi.vegiapp&gl=GB',
  AppUriAppleStore: 'https://apps.apple.com/app/id1608208174',
  buildNumber: 1,
  baseUrl: BASE_URL,
  peeplWebhookAddress: `${BASE_URL}/api/v1/orders/stripe-event-webhook`,
  peeplPayRefundWebhookAddress: `${BASE_URL}/api/v1/orders/peepl-pay-refund-webhook`,
  peeplWebhookAddressCustomerUpdatePaidOrder: `${BASE_URL}/api/v1/orders/peepl-pay-update-paid-order-webhook`,
  fuseStudioBaseUrl: 'https://api.chargeweb3.com/api/v0/',
  pplTokenAddress: '0xa2C7CdB72d177f6259cD12a9A06Fdfd9625419D4',
  pplRewardsPoolAddress: '0x29249e06e8D3e4933cc403AB73136e698a08c38b',
  vegiWalletAddress: '0x6ad1D130d8B4F6f2D133E172799484B653c9fb40',
  coopcycleUrl: 'https://agile-delivery.coopcycle.org',
  fuseApiV2Url: 'https://studio.fuse.io/api/v2', // ~
  fuseApiJwt: 'jwt', // TODO: Popupulate in local.js and re-encode to server
  vegiScoreApi: 'https://vegi-esc-server.herokuapp.com/',
  sustainedScoreApi: 'https://api.sustained.com/choice/v1',
  placesApiKey: '', //*in local.js
  googleApiBaseUrl: 'https://maps.googleapis.com/maps/api/',
  placesApiRelUrlFindPlace: 'place/findplacefromtext/json', // ~ https://googlemaps.github.io/google-maps-services-js/modules/_places_findplacefromtext_.html#:~:text=Const-,defaultUrl,-defaultUrl%3A
  distancesApiRelUrlGetDistance: 'distancematrix/json', // ~ https://googlemaps.github.io/google-maps-services-js/modules/_distance_.html#:~:text=Const-,defaultUrl,-defaultUrl%3A
  amazonS3MaxUploadSizeBytes: 500 * 1024,
  vegiEatsRewardPcnt: 0.05,
  vegiPayRewardPcnt: 0.005, // TODO v2.0: To be 0 <= x <= 0.01 based on ESC measure value
  PPLTokenValueInPence: 10, // TODO: GET this value from the PeeplPay API @TheAdamGalloway
  vegiGreenPointsTicker: 'PPL',
  vegiDigitalStableCurrencyTicker: 'GBPX',
  requestDeliveryAvailability: false, // * This if true, checks if there is a courier available before asking vendor to fulfil. Only works when vendors have automated fulfilment processes.
  ignoreSpecialDatesMoreThanXMonthsAway: 12,
  ongoingOrdersHoursCutoff: 5,
  escRatingsTTLDays: 14,
  storageDomainsRegExps: [],

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

if (process.env['local'] || process.env['local.js']) {
  // eslint-disable-next-line no-console
  console.log(`Loading config from local env vars for ${__dirname}${__filename}`);
  const _ = require(`lodash`);
  const localConfigFromDotEnv = JSON.parse(
    Buffer.from(process.env['local'] || process.env['local.js'], 'base64')
  );
  custom = _.merge({}, custom, localConfigFromDotEnv.config.custom);
}

module.exports.custom = custom;
