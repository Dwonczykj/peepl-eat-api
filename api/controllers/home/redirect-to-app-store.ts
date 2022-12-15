export type RedirectToAppStoreInput = {};

export type RedirectToAppStoreResult = {
  appUri:
    | `https://play.google.com/store/apps/${string}`
    | `https://apps.apple.com/app/${string}`;
};

export const AppUriGooglePlayStore =
  'https://play.google.com/store/apps/details?id=com.vegi.vegiapp&gl=GB';
export const AppUriAppleStore = 'https://apps.apple.com/app/id1608208174';

export const IsMobileDevice = (r: { headers: { 'User-Agent': string } }) => {
  const userAgent: string = r.headers['User-Agent'];
  const appleDeviceName = 'iPhone|iPad|iPod';
  const androidDeviceName = 'Android|webOS|BlackBerry|IEMobile|Opera Mini';
  return userAgent.match(androidDeviceName)
    ? 'android'
    : userAgent.match(appleDeviceName)
    ? 'apple'
    : 'web';
};

export const getAppStoreUri = (r: { headers: { 'User-Agent': string } }) => {
  const device = IsMobileDevice(r);
  return device === 'android'
    ? AppUriGooglePlayStore
    : device === 'apple'
    ? AppUriAppleStore
    : AppUriGooglePlayStore;
};

module.exports = {
  friendlyName: 'Post Like',

  description: 'Post a like of the vegi platform',

  inputs: {
    guid: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
  },

  exits: {
    success: {
      statusCode: 200,
    },
  },

  fn: async function (
    // inputs: RedirectToAppStoreInput,
    // exits: {
    //   success: (unusedArg: RedirectToAppStoreResult) => void;
    // }
  ) {
    const request = this.req;
    const appUri = getAppStoreUri(request);

    return this.res.redirect(appUri);
        
    // return exits.success({ appUri });
  },
};
