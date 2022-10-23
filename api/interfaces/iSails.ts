/* eslint-disable no-unused-vars */
import { UpdateItemsForOrderSuccess } from "../../api/helpers/update-items-for-order";
import { AvailableDateOpeningHours } from "../../api/helpers/get-available-dates";
import { NextAvailableDateHelperReturnType } from "api/helpers/next-available-date";

export type sailsVegi = {
  helpers: {
    getAvailableDates: {
      with: (unusedArgs: {
        fulfilmentMethodIds?: Array<number>;
      }) => Promise<AvailableDateOpeningHours>;
    } & ((unusedArgs: Array<number>) => Promise<AvailableDateOpeningHours>);
    nextAvailableDate: {
      with: (unusedArgs: {
        fulfilmentMethodIds?: Array<number>;
      }) => Promise<NextAvailableDateHelperReturnType>;
    } & ((
      unusedArgs: Array<number>
    ) => Promise<NextAvailableDateHelperReturnType>);
    updateItemsForOrder: {
      with: (unusedArgs: {
        orderId: string;
        customerWalletAddress: string;
        retainItems: Array<number>;
        removeItems: Array<number>;
      }) => Promise<UpdateItemsForOrderSuccess>;
    } & ((
      unusedOrderId: string,
      customerWalletAddress: string,
      retainItems: number[],
      removeItems: Array<number>
    ) => Promise<AvailableDateOpeningHours>);
  };
  log: any;
  config: {
    custom: { [configKey: string]: any };
  };
};
