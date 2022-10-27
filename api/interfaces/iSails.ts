/* eslint-disable no-unused-vars */
import { UpdateItemsForOrderSuccess } from "../../api/helpers/update-items-for-order";
import { AvailableDateOpeningHours } from "../../api/helpers/get-available-dates";
import { NextAvailableDateHelperReturnType } from "api/helpers/next-available-date";
import { bool } from "aws-sdk/clients/signer";

export type sailsVegi = {
  helpers: {
    isSuperAdmin: {
      with: (unusedArgs: { userId: number }) => Promise<{ data: boolean }>;
    } & ((unusedArgs: number) => Promise<{ data: boolean }>);
    isAuthorisedForVendor: {
      with: (unusedArgs: {
        userId: number;
        vendorId: number;
      }) => Promise<boolean>;
    } & ((unusedUserId: number, unusedVendorId: number) => Promise<boolean>);
    isAuthorisedForDeliveryPartner: {
      with: (unusedArgs: {
        userId: number;
        deliveryPartnerId: number;
      }) => Promise<boolean>;
    } & ((unusedUserId: number, unusedDeliveryPartnerId: number) => Promise<boolean>);
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

type SailsFetchType<T> = {
  fetch: () => Promise<T>;
}

type SailsUpdateSetType<T> = {
  set: (unusedArg: { [key in keyof T]?: T[key] }) => Promise<void>;
};

export type SailsModelType<T> = {
  find: (unusedArg: number | { [key in keyof T]?: T[key] }) => Promise<Array<T>>;
  findOne: (
    unusedArg: number | { [key in keyof T]?: T[key] }
  ) => Promise<T | null>;
  update: (
    unusedArg: number | { [key in keyof T]?: T[key] }
  ) => SailsUpdateSetType<T>;
  updateOne: (unusedArg: number) => SailsUpdateSetType<T>;
  create: (unusedArg: { [key in keyof T]: T[key] }) =>
    | Promise<null>
    | SailsFetchType<T>;
  createEach: (
    unusedArg: Array<{ [key in keyof T]: T[key] }>
  ) => Promise<null> | SailsFetchType<Array<T>>; // ~ https://bobbyhadz.com/blog/typescript-index-signature-parameter-cannot-be-union-type#:~:text=The%20error%20%22An%20index%20signature%20parameter%20type%20cannot,type%20MyType%20%3D%20%7B%20%5Bkey%20in%20MyUnion%5D%3A%20string%3B%7D.
};
