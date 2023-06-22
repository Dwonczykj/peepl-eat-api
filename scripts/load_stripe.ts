import { StripeAccountType } from '../api/interfaces/payments/stripe/iStripeAccount';
import { StripeCustomerType } from '../api/interfaces/payments/stripe/iStripeCustomer';
import fs from 'fs';
// import {Stripe} from 'stripe';
import Stripe from 'stripe';

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
let stripeKeys = {};
if (process.env.NODE_ENV !== 'production'){
  stripeKeys = require(`${fdir}/${ftestpath}`);
} else if (!fs.existsSync(`${fdir}/${fpath}`)) {
  if (process.env[strToEnvKey(fpath)] || process.env[fpath]) {
    stripeKeys = JSON.parse(
      Buffer.from(
        process.env[strToEnvKey(fpath)] || process.env[fpath],
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
  stripeKeys = require(`${fdir}/${fpath}`);
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
// const stripe:Stripe = require('stripe')(stripeKeys['secretKey']);
const stripe: Stripe = new Stripe(stripeKeys['secretKey'] as string, {
  apiVersion: '2022-11-15',
  typescript: true,
});

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

export default stripe;
