import { Currency } from './currency';
import axios from 'axios';
import _ from 'lodash';

declare interface iConvertCurrency {
    getAmountInCurrency: (amount:number, fromCurrency: Currency, toCurrency: Currency) => number;
}

let config = {
  currencyconverterapiKey: '',
};
if (process.env['local'] || process.env['local.js']) {
  // eslint-disable-next-line no-console
  console.log(`Loading config from local env vars for config/currencyConverter.ts`);
  const localConfigFromDotEnv = JSON.parse(
    Buffer.from(process.env['local'] || process.env['local.js'], 'base64').toString()
  );
  config = localConfigFromDotEnv.config.custom;
}

/**
 * Description placeholder
 * @date 25/05/2023 - 09:15:53
 *
 * @type {0.01}
 * 
 * @value of 1 GBT in GBP
 */
const GBTPoundPegValue = 0.01;

/**
 * Description placeholder
 * @date 25/05/2023 - 09:15:53
 *
 * @type {0.01}
 * 
 * @value of 1 GBPx in GBP
 */
const GBPxPoundPegValue = 0.01;

/**
 * Description placeholder
 * @date 25/05/2023 - 09:15:53
 *
 * @type {0.01}
 * 
 * @value of 1 PPL in GBP
 */
const PPLPoundPegValue = 0.1;

/**
 *  Gives an amount of 1[fromCurrency] in [toCurrency]
 * 
 * @returns {Promise<number>}
 * */ 
export const getCurrencyConversionRate = async (fromCurrency: Currency, toCurrency: Currency) => {
  if(fromCurrency === toCurrency){
    return 1;
  }
  if(!fromCurrency || !toCurrency){
    throw new Error(`Unable to convert from currency:[${fromCurrency}] to currency:[${toCurrency}].`);
  }
  if (fromCurrency === Currency.GBP) {
    if (toCurrency === Currency.GBPx) {
      return 1.0 / GBPxPoundPegValue;
    } else if (toCurrency === Currency.GBT) {
      return 1.0 / GBTPoundPegValue;
    } else if (toCurrency === Currency.PPL) {
      return 1.0 / PPLPoundPegValue;
    } else if (toCurrency === Currency.USD || toCurrency === Currency.EUR) {
      const liveRateJson = await axios.get(`http://free.currencyconverterapi.com/api/v5/convert?q=${fromCurrency}_${toCurrency}&compact=y&apikey=${config.currencyconverterapiKey}`);
      if(!liveRateJson){
        throw new Error(
          `Currency converter webservice failed to request live currency rates from currency:[${fromCurrency}] to currency:[${toCurrency}] with no status.`
        );
      }
      if(liveRateJson.status !== 200){
        throw new Error(
          `Currency converter webservice failed to request live currency rates from currency:[${fromCurrency}] to currency:[${toCurrency}] with status: ${liveRateJson.status} and reason: ${liveRateJson.statusText}`
        );
      }
      return liveRateJson.data ? (liveRateJson.data.rate as number) : 0.0;
    } else {
      throw new Error(
        `Need a webservice call using axios for live currency rates from currency:[${fromCurrency}] to currency:[${toCurrency}].`
      );
    }
  } else if (toCurrency === Currency.GBP) {
    return 1.0 / getCurrencyConversionRate(toCurrency, fromCurrency);
  } else {
    return (
      getCurrencyConversionRate(fromCurrency, Currency.GBP) *
      getCurrencyConversionRate(Currency.GBP, toCurrency)
    );
  }
};


/**
 * Description placeholder
 * @date 25/05/2023 - 10:08:05
 *
 * @async
 * @param {number} amount
 * @param {Currency} fromCurrency
 * @param {Currency} toCurrency
 * @returns {Promise<number>}
 */
export const convertCurrency = async (amount:number, fromCurrency: Currency, toCurrency: Currency) => {
  return amount * getCurrencyConversionRate(fromCurrency,toCurrency);
};

export { iConvertCurrency as iConvertCurrency };
