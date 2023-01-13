import { sailsVegi } from "../../../api/interfaces/iSails";

declare var sails: sailsVegi;

export const AppUriGooglePlayStore: 'https://play.google.com/store/apps/details?id=com.vegi.vegiapp&gl=GB' =
  sails.config.custom.AppUriGooglePlayStore;
export const AppUriAppleStore: 'https://apps.apple.com/app/id1608208174' =
  sails.config.custom.AppUriAppleStore;


export const IsMobileDevice = (r: { headers: { 'user-agent': string } }) => {
  const userAgent: string = r.headers['user-agent'];
  const appleDeviceName = /iPhone|iPad|iPod/;
  const macDeviceName = /Mac\s*OS/;
  const androidDeviceName = /Android|webOS|BlackBerry|IEMobile|Opera Mini/;
  return userAgent.match(androidDeviceName)
    ? 'android'
    : userAgent.match(appleDeviceName)
    ? 'apple'
    : userAgent.match(macDeviceName)
    ? 'web'
    : 'web';
};

export type DeviceTypeLiteral = ReturnType<typeof IsMobileDevice>;

export const DeviceTypesLiteral: DeviceTypeLiteral[] = [
  'apple',
  'android',
  'web',
];

export type RedirectToAppStoreInput = {
  forDevice: DeviceTypeLiteral | '';
};

export type RedirectToAppStoreResult = {
  appUri:
    | `https://play.google.com/store/apps/${string}`
    | `https://apps.apple.com/app/${string}`;
};

export const getAppStoreUriFromDeviceType = (device: DeviceTypeLiteral) => {
  return device === 'android'
    ? AppUriGooglePlayStore
    : device === 'apple'
    ? AppUriAppleStore
    : AppUriGooglePlayStore;
};

export const getAppStoreUriFromRequest = (r: { headers: { 'user-agent': string } }) => {
  const device = IsMobileDevice(r);
  return getAppStoreUriFromDeviceType(device);
};

module.exports = {
  friendlyName: 'vegi app link',

  description: 'Redirect to the vegi app link',

  inputs: {
    forDevice: {
      type: 'string',
      required: false,
      defaultsTo: '',
    }
  },

  exits: {
    success: {
      statusCode: 200,
    },
  },

  fn: async function (
    inputs: RedirectToAppStoreInput,
    exits: {
      // success: (unusedArg: RedirectToAppStoreResult) => void;
    }
  ) {
    const request = this.req;
    const device = inputs.forDevice.toLowerCase() as DeviceTypeLiteral | "";

    if (device !== '' && DeviceTypesLiteral.includes(device)) {
      const appUri = getAppStoreUriFromDeviceType(device);
      return this.res.redirect(appUri);
    }

    const appUri = getAppStoreUriFromRequest(request);

    return this.res.redirect(appUri);
        
    // return exits.success({ appUri });
  },
};
