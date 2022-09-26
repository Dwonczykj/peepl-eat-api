import { Currency } from './currency';

declare interface iPeeplPay {
    getAmountInCurrency: (amount:number, fromCurrency: Currency, toCurrency: Currency) => number;
}

export { iPeeplPay };
