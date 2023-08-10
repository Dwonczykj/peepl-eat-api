import fs from 'fs';
// import {Stripe} from 'stripe';
import Stripe from 'stripe';
import { SailsModelType } from '../api/interfaces';
import { StripeAccountType } from '../api/interfaces/payments/stripe/iStripeAccount';
import { StripeCustomerType } from '../api/interfaces/payments/stripe/iStripeCustomer';
import { UserType } from './utils';
declare const User: SailsModelType<UserType>;

const kebabize = (str, forceJoinerStr = '-') =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? forceJoinerStr || '-' : '') + $.toLowerCase()
  );

function strToEnvKey(str) {
  return kebabize(str.replace(/\.[^/.]+$/, '')).replace(/-/g, '_');
}

const fdir = '../config';

const fpath = 'stripe.json';
const ftestpath = 'test_stripe.json';

function stripeKeysForPath(path: string) {
  let _stripeKeys: any;
  if(path === fpath){
    sails.log.info('STRIPE LOADED IN PRODUCTION MODE WITH LIVE KEYS');
  } else {
    sails.log.info(`STRIPE LOADED IN DEVELOPMENT [${process.env.STAGE_ENV}] MODE WITH TEST KEYS`);
  }
  if (!fs.existsSync(`${fdir}/${path}`)) {
    if (process.env[strToEnvKey(path)] || process.env[path]) {
      _stripeKeys = JSON.parse(
        Buffer.from(
          process.env[strToEnvKey(path)] || process.env[path],
          'base64'
        ).toString()
      );
    } else {
      const envVariables = JSON.stringify(Object.keys(process.env).sort());
      throw Error(
        `No env variable is set for "stripe" in "${process.env.NODE_ENV}" NODE_ENV. process.env="${envVariables}"`
      );
    }
  } else {
    _stripeKeys = require(`${fdir}/${path}`);
  }
  return _stripeKeys;
}

let stripeKeys = {};
const stripeTestKeys = stripeKeysForPath(ftestpath);
if (process.env.STAGE_ENV === 'production'){
  // * PRODUCTION
  stripeKeys = stripeKeysForPath(fpath);
} else if (process.env.STAGE_ENV === 'qa') {
  // * QA
  stripeKeys = stripeTestKeys;
} else {
  // * DEVELOPMENT / TEST
  stripeKeys = stripeTestKeys;
}

type iStripeApi = {
  customers: {
    create: () => StripeCustomerType;
    retrieve: (id: string) => StripeCustomerType;
    delete: (id: string) => void;
  };
  accounts: {
    create: (accountTypeConfig:{type:'standard'}) => StripeAccountType;
    retrieve: (id: string) => StripeAccountType;
    delete: (id: string) => void;
  };
  ephemeralKeys: {
    create: (customerObj: any, apiVersionObj: any) => { secret: string };
  };
  paymentIntents: {
    create: (paymentIntentInput: any) => { client_secret: string };
  };
};


/**
 * The function `stripeFactory` creates a new instance of the Stripe API client with the appropriate
 * secret key based on the user's test mode preference.
 * @param {number | undefined | null} userId - The `userId` parameter is a number that represents the
 * ID of a user. It can also be `undefined` or `null` if there is no user associated with the request.
 * @returns The function `stripeFactory` returns an instance of the `Stripe` class from the Stripe API.
 */
export const stripeFactory = async (userId: number | undefined | null) => {
  let forceTestMode = false;
  try {
    if (userId){
      const users = await User.find({
        id: userId,
      });
      if (users && users.length === 1){
        const user = users[0];
        forceTestMode = user.isTester;
        if(forceTestMode){
          sails.log.verbose(`Using a testUser to access stripe so loading in test environment`);
        }
      }
    }
  } catch (error) {
    sails.log.error(`failed to load user details from cached session userId: [${userId}] with error: ${error}`);
  }
  return new Stripe((forceTestMode ? stripeTestKeys : stripeKeys)['secretKey'] as string, {
    apiVersion: '2022-11-15',
    typescript: true,
  });
};
// const stripe:Stripe = require('stripe')(stripeKeys['secretKey']);
// const stripe: Stripe = stripeFactory(false);

if (
  process.env.NODE_ENV !== 'production' &&
  stripeKeys['secretKey'].startsWith('sk_live_')
){
  throw Error(
    `Running load_stripe in environment: "${process.env.NODE_ENV}" and using live stripe keys. This is not allowed in "${process.env.NODE_ENV}"!`
  );
}
// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.
// ~ https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#setup-server-side

export class StripeKeys {
  static readonly publishableKey: string = stripeKeys['publishableKey'];
  // readonly secretKey: string = stripeKeys['secretKey'];
}

export default stripeFactory;
