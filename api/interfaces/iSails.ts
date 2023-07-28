/* eslint-disable no-unused-vars */
import { UpdateItemsForOrderSuccess } from "../../api/helpers/update-items-for-order";
import { AvailableDateOpeningHours } from "../../api/helpers/get-available-dates";
import { NextAvailableDateHelperReturnType } from "../../api/helpers/next-available-date";
import { GetAvailableDeliveryPartnerFromPoolInputs } from "../../api/helpers/get-available-delivery-partner-from-pool";
import { CreateOrderInputs, ValidateOrderResult } from "../../api/controllers/orders/create-order";
import { iFulfilmentSlot, iSlot } from "./vendors/slot";
import { CreateProductCategoriesInput } from "../helpers/create-product-categories";
import { DeliveryPartnerType, DiscountCodeType, NotificationType, OmitId, OrderType, ProductCategoryType, walletAddressString } from '../../scripts/utils';
import { EditProductCategoriesInput } from "../helpers/edit-product-categories";
import { InitialiseDeliveryMethodsInput, InitialiseDeliveryMethodsResult } from "../../api/helpers/initialise-delivery-methods";
import { GetCoordinatesForAddressInput, GetCoordinatesForAddressResult } from "../../api/helpers/get-coordinates-for-address";
import { CheckAddressIsValidInput, CheckAddressIsValidResult } from "../../api/helpers/check-address-is-valid";
import { FulfilmentMethodDeliversToAddressInput, FulfilmentMethodDeliversToAddressResult } from "../../api/helpers/fulfilment-method-delivers-to-address";
import { DistanceHaversineInputs, DistanceHaversineResult } from "../../api/helpers/distance-haversine";
import { DistanceViaBearingInputs, DistanceViaBearingResult } from "../../api/helpers/distance-via-bearing";
import {
  GetVendorsInSphereInputs,
  GetVendorsInSphereResult,
} from '../../api/helpers/get-vendors-in-sphere';
import { GetProductRatingInputs, GetProductRatingResult } from "../helpers/get-product-rating-by-barcodes";
import { SelectVendorProductsInputs, SelectVendorProductsResult } from "../../api/helpers/select-vendor-products";
import { ParseBarcodesUploadInputs, ParseBarcodesUploadResult } from "../../api/helpers/parse-barcodes-upload";
import { CreatePaymentIntentInternalInputs, CreatePaymentIntentInternalResult } from "../../api/helpers/create-payment-intent-internal";
import { TransactionsForAccountInputs, TransactionsForAccountResult } from "../../api/helpers/transactions-for-account";
import { GetOrdersInputs, GetOrdersResult } from "../../api/helpers/get-orders";
import { RefreshStripeTransactionsInputs, RefreshStripeTransactionsResult } from "../../api/helpers/refresh-stripe-transactions";
import { RefreshFuseTransactionsInputs, RefreshFuseTransactionsResult } from "../../api/helpers/refresh-fuse-transactions";
import { FormatOrdersInputs, FormatOrdersResult } from "../../api/helpers/format-orders";
import { ConvertCurrencyAmountInputs, ConvertCurrencyAmountResponse } from "../../api/helpers/convert-currency-amount";
import { CalculateCurrencyOperationInputs, CalculateCurrencyOperationResponse } from "../../api/helpers/calculate-currency-operation";
import { Currency } from "./peeplPay";
import { CheckDiscountCodeInputs, CheckDiscountCodeResponse } from "../../api/helpers/check-discount-code";
import { SendFirebaseNotificationInputs, SendFirebaseNotificationResult } from "../../api/helpers/send-firebase-notification";

export type SailsActionInput =
  | {
      type: 'string' | 'boolean' | 'ref' | 'json';
      description?: string;
      defaultsTo?: any;
      model?: string;
      isIn?: Array<string>;
      required?: boolean;
    }
  | {
      type: 'number';
      max?: number;
      min?: number;
      description?: string;
      defaultsTo?: any;
      isIn?: Array<number>;
      required?: boolean;
    };

export type SailsActionInputs<
  T extends { [unusedAttrName: string]: SailsActionInput }
> = {
  [key in keyof T]: T[key]['type'] extends 'string'
    ? string
    : T[key]['type'] extends 'number'
    ? number
    : T[key]['type'] extends 'boolean'
    ? boolean
    : any;
} & {
  // ... type overrides here
};

export type UploadImageInfoType = {
  fd: string;
}

export type OrderTypeEnumLiteral = 'vegiEats' | 'vegiPays'

// ~ https://stackoverflow.com/a/53809800
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
export type KeysNotOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? never: K;
}[keyof T];
export type RequiredKeys<T> = KeysNotOfType<T,undefined>;
type ValueType = Date | string | number | boolean;
// export type RequiredKeys<T> = Exclude<
//   KeysOfType<T, Exclude<T[keyof T], undefined>>,
//   undefined
// >;
export type RequiredObj<T> = {
  [K in RequiredKeys<T>]: T[K]
}
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
export type OptionalObj<T> = {
  [K in OptionalKeys<T>]: T[K]
}
export type ValueKeys<T> = KeysOfType<T,ValueType>;
export type RequiredValueKeys<T> = KeysOfType<RequiredObj<T>,ValueType>;
export type OptionalValueKeys<T> = KeysOfType<OptionalObj<T>,ValueType>;
export type NonValueKeys<T> = Exclude<keyof T, ValueKeys<T>>;

// type TT = {
//   id: number;
//   ingredients?: string & undefined;
// }
// type y = TT['ingredients'];
// type x = {
//   [K in keyof TT]: TT[K] extends undefined ? never: K;
// }[keyof TT];



type WaterlineValueComparisonKeys<T extends Date | number | string | boolean> =
  T extends Date
    ? {
        '>'?: string; // ~ https://sailsjs.com/documentation/concepts/models-and-orm/query-language#?criteria-modifiers
        '>='?: string;
        '<'?: string;
        '<='?: string;
        '=='?: string;
        '!='?: string;
      }
    : T extends number
    ? {
        '>'?: T; // ~ https://sailsjs.com/documentation/concepts/models-and-orm/query-language#?criteria-modifiers
        '>='?: T;
        '<'?: T;
        '<='?: T;
        '=='?: T;
        '!='?: T;
      }
    : T extends string
    ? {
        '=='?: T | T[]; // ~ https://sailsjs.com/documentation/concepts/models-and-orm/query-language#?notin-modifier
        '!='?: T | T[];
        nin?: T;
        in?: T | T[];
        contains?: T;
        startsWith?: T;
        endsWith?: T;
      }
    : T extends Array<ValueType>
    ? {
        nin?: T;
        in?: T;
        contains?: T;
      }
    : {
        '=='?: T;
        '!='?: T;
      };

type WaterlineQueryKeys<T> = {
  or?: Array<{
    [key in keyof T]?: T[key] extends ValueType
      ? T[key] | Array<T[key]>
      : number | number[];
  }>;
  and?: Array<{
    [key in keyof T]?: T[key] extends ValueType
      ?
          | T[key]
          | Array<T[key]>
          | {
              [qryComparitor in keyof WaterlineValueComparisonKeys<
                T[key]
              >]: T[key];
            }
      :
          | number
          | number[]
          | {
              [qryComparitor in keyof WaterlineValueComparisonKeys<
                number
              >]: number |number[] | null;
            };
  }>;
};

/**
 * Exclude SailsModel types from find queries
 */
type WaterlineQueryType<T> = T extends
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  ? T
  : number | number[];

type SailsUsingConnectionType<T> = {
  usingConnection: (unusedDb:any) => Promise<T>;
}

type InterceptErrCodeLiteral = 'E_UNIQUE';

type Interceptable<T> = {
  intercept: (
    errCode: InterceptErrCodeLiteral,
    returnErrCode: string
  ) => Promise<T>;
};

type _SailsFetchType<T> = {
  fetch: () => (Promise<T> & Interceptable<T>);
}
type SailsFetchType<T> = _SailsFetchType<T> &
  SailsUsingConnectionType<_SailsFetchType<T>>;

type SailsUpdateSetType<T> = {
  set: (unusedArg: {
    [key in Exclude<keyof T, 'id'>]?: T[key] | number | Array<number>;
  }) => Promise<T>;
};

// type SailsFindPopulateType<T> = Promise<
//   ({ [key in Exclude<keyof T, 'id'>]?: T[key] } & { id: number }) | null
// > & {
//   populate: (unusedArg: string) => Promise<T | null>;
// };
export type ShallowSailsModels<T> = {
  [key in RequiredKeys<T>]: T[key] extends ValueType | Array<ValueType>
    ? T[key]
    : T[key] extends Array<any>
    ? number[]
    : number;
} & {
  [key in OptionalKeys<T>]?: T[key] extends ValueType | Array<ValueType>
    ? T[key]
    : T[key] extends Array<any>
    ? number[]
    : number;
};

export type sailsModelKVP<T> = ({
      [key in RequiredKeys<T>]: T[key] extends
        | ValueType
        | Array<ValueType>
        ? T[key]
        : T[key] extends Array<any>
        ? number[]
        : number;
    }
  & {
      [key in OptionalKeys<T>]?: T[key] extends
        | ValueType
        | Array<ValueType>
        ? T[key]
        : T[key] extends Array<any>
        ? number[]
        : number;
    });

// type SailsFindPopulateType<T, A extends Array<T> | T = T> =
//   Promise<
//     (A extends Array<T>
//       ? _sailsModelKVP<T>[]
//       : _sailsModelKVP<T>) | null
//   > & {
//     populate: (unusedArg: string) => Promise<T | null>;
//   };

type SailsQueryType<T> = Promise<T | null>;

type _populateStr = `${string}.${string}`;

type _populated<T> = Promise<T | null> & {
  populate: <S extends string>(unusedArg: S) => Promise<T | null> & _populated<T>; // * This can be chained to populate multiple collections if non-deep population.
};
type SailsFindPopulateType<T> = Promise<sailsModelKVP<T>[] | null> & {
  populate: (
    unusedArg: keyof T | string
  ) => Promise<T[] | null> & _populated<T[]>;
  sort: (unusedArg: keyof T | string) => SailsFindPopulateType<T>;
};
type SailsFindOnePopulateType<T> = Promise<sailsModelKVP<T> | null> & {
  populate: (unusedArg: string) => Promise<T | null> & _populated<T>; // * This can be chained to populate multiple collections.
};

export type CreateSailsModelType<T extends { id: number }> = {
  [key in keyof OmitId<T>]: T[key] extends ValueType
    ? T[key]
    : T[key] extends Array<ValueType> 
    ? Array<T[key][0]>
    : T[key] extends Array<{ id: number }>
    ? number[]
    : number;
};
export type CreateSailsModelType2<T extends { id: number }> = ({
  [key in RequiredKeys<OmitId<T>>]: T[key] extends ValueType
    ? T[key]
    : T[key] extends Array<ValueType> 
    ? Array<T[key][0]>
    : T[key] extends Array<{ id: number }>
    ?
        // | Array<CreateSailsModelType3<T[key][0]>>
        | Array<CreateSailsModelType2<T[key][0]>>
    : T[key] extends { id: number }
    ? 
      // | CreateSailsModelType3<T[key]> 
      | CreateSailsModelType2<T[key]>
    : number;
} & {
  [key in OptionalKeys<OmitId<T>>]?: T[key] extends ValueType | null
    ? T[key]
    : T[key] extends Array<ValueType> 
    ? Array<T[key][0]>
    : T[key] extends Array<{ id: number }>
    ?
        // | Array<CreateSailsModelType3<T[key][0]>>
        | Array<CreateSailsModelType2<T[key][0]>>
    : T[key] extends { id: number }
    ? 
      // | CreateSailsModelType3<T[key]> 
      | CreateSailsModelType2<T[key]>
    : number;
});

export type CreateSailsModelType3<T extends { id: number }> = OmitId<T> & (
  {
    [key in RequiredValueKeys<OmitId<T>>]: T[key] extends Array<any> ? Array<T[key][0]> : T[key];
  }
  &
  {
    [key in OptionalValueKeys<OmitId<T>>]?: T[key] extends Array<any> ? Array<T[key][0]> : T[key];
  }
  & 
  {
    [key in NonValueKeys<OmitId<T>>]?: T[key] extends Array<any>
      ? number[]
      : number;
  } 
);

export type SailsQueryFindCriteria<T> =
  | number
  | {
      [key in keyof T]?: T[key] extends number | boolean | Date
        ? T[key] | Array<T[key]> | WaterlineValueComparisonKeys<T[key]>
        : T[key] extends string
        ? T[key] | Array<T[key]>
        : number | number[] | WaterlineValueComparisonKeys<number>;
    }
  | WaterlineQueryKeys<T>;

export type SailsModelType<T> = {
  addToCollection: (
    // ~ https://sailsjs.com/documentation/reference/waterline-orm/models/add-to-collection#-addtocollection-
    id: number,
    attribute: keyof T
  ) => {
    members: (memberIds: Array<number>) => void;
  };
  query: <V, S>(
    unusedMySqlStr: string,
    unusedQueryArgs: Array<any>,
    unusedCallback: (err: any, result: V) => S | void
  ) => Promise<Array<S>>;
  find: (
    // ~ https://www.typescriptlang.org/docs/handbook/utility-types.html#extracttype-union
    unusedArg?: SailsQueryFindCriteria<T>
  ) => SailsFindPopulateType<T>;
  count: (
    // ~ https://www.typescriptlang.org/docs/handbook/utility-types.html#extracttype-union
    unusedArg?: SailsQueryFindCriteria<T>
  ) => number;
  avg: (
    numericAttrName: string,
    // ~ https://www.typescriptlang.org/docs/handbook/utility-types.html#extracttype-union
    unusedArg?: SailsQueryFindCriteria<T>
  ) => number;
  sum: (
    numericAttrName: string,
    // ~ https://www.typescriptlang.org/docs/handbook/utility-types.html#extracttype-union
    unusedArg?: SailsQueryFindCriteria<T>
  ) => number;
  findOne: (
    unusedArg: SailsQueryFindCriteria<T>
  ) => SailsFindOnePopulateType<T>;
  update: (
    unusedArg:
      | number
      | { [key in keyof T]?: T[key] | number | Array<T[key] | number> }
      | WaterlineQueryKeys<T>
  ) => SailsUpdateSetType<T>;
  updateOne: (
    unusedArg:
      | number
      | { [key in keyof T]?: T[key] | number | Array<T[key] | number> }
      | WaterlineQueryKeys<T>
  ) => SailsUpdateSetType<T>;
  destroy: (
    unusedArg:
      | number
      | { [key in keyof T]?: T[key] | number | Array<T[key] | number> }
      | WaterlineQueryKeys<T>
  ) => SailsFetchType<T>;
  create: (
    unusedArg:
      | {
          [key in Exclude<RequiredKeys<T>, 'id'>]:
            | T[key]
            | number
            | Array<number>;
        }
      | {
          [key in Exclude<OptionalKeys<T>, 'id'>]?:
            | T[key]
            | number
            | Array<number>;
        }
  ) => SailsFetchType<T | null>;
  createEach: (
    unusedArg: Array<
      | {
          [key in Exclude<RequiredKeys<T>, 'id'>]:
            | T[key]
            | number
            | Array<number>;
        }
      | {
          [key in Exclude<OptionalKeys<T>, 'id'>]?:
            | T[key]
            | number
            | Array<number>;
        }
    > // ~ https://stackoverflow.com/a/54199731
  ) => SailsFetchType<Array<T> | null>; // ~ https://bobbyhadz.com/blog/typescript-index-signature-parameter-cannot-be-union-type#:~:text=The%20error%20%22An%20index%20signature%20parameter%20type%20cannot,type%20MyType%20%3D%20%7B%20%5Bkey%20in%20MyUnion%5D%3A%20string%3B%7D.
};

export type NewPaymentIntent = {
  paymentIntentId: string;
};

type _helperFunction<TIN,TOUT> = {
  with: (
    unusedArgs: TIN
  ) => Promise<TOUT> & ((arg: TIN extends ValueType ? TIN : TIN[keyof TIN][]) => Promise<TOUT>);
}

type NativeQueryField<T> = {
  catalog: 'def';
  charsetNr: 63;
  db: 'vegi';
  decimals: number;
  default: undefined;
  flags: number;
  length: number;
  name: keyof T;
  orgName: keyof T;
  orgTable: string; // nameof T;
  protocol41: true;
  table: string;
  type: number;
  zeroFill: false;
};

type NativeQueryRow<T> = {
  [k in keyof T]: T[k];
};

type NativeQueryResult<T> = {
  fields: Array<NativeQueryField<T>>;
  rows: Array<NativeQueryRow<T>>;
}

export type sailsVegi = {
  getDatastore: () => any;
  sendNativeQuery: <T extends any>(
    unused1,
    unused2
  ) => Promise<NativeQueryResult<T>>;
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
    } & ((
      unusedUserId: number,
      unusedDeliveryPartnerId: number
    ) => Promise<boolean>);
    getAvailableDeliveryPartnerFromPool: {
      with: (
        unusedArgs: GetAvailableDeliveryPartnerFromPoolInputs
      ) => Promise<AvailableDateOpeningHours>;
    };

    getCoordinatesForAddress: {
      with: (
        unusedArgs: GetCoordinatesForAddressInput
      ) => Promise<GetCoordinatesForAddressResult>;
    };
    checkAddressIsValid: {
      with: (
        unusedArgs: CheckAddressIsValidInput
      ) => Promise<CheckAddressIsValidResult>;
    };
    fulfilmentMethodDeliversToAddress: {
      with: (
        unusedArgs: FulfilmentMethodDeliversToAddressInput
      ) => Promise<FulfilmentMethodDeliversToAddressResult>;
    };
    initialiseDeliveryMethods: {
      with: (
        unusedArgs: InitialiseDeliveryMethodsInput
      ) => Promise<InitialiseDeliveryMethodsResult>;
    };
    distanceHaversine: _helperFunction<
      DistanceHaversineInputs,
      DistanceHaversineResult
    >;
    getOrders: _helperFunction<GetOrdersInputs, GetOrdersResult>;
    formatOrders: _helperFunction<FormatOrdersInputs, FormatOrdersResult>;
    calculateCurrencyOperation: _helperFunction<
      CalculateCurrencyOperationInputs,
      CalculateCurrencyOperationResponse
    >;
    convertCurrencyAmount: _helperFunction<
      ConvertCurrencyAmountInputs,
      ConvertCurrencyAmountResponse
    >;
    distanceViaBearing: _helperFunction<
      DistanceViaBearingInputs,
      DistanceViaBearingResult
    >;
    getVendorsInSphere: _helperFunction<
      GetVendorsInSphereInputs,
      GetVendorsInSphereResult
    >;

    getProductRatingByBarcodes: _helperFunction<
      GetProductRatingInputs,
      GetProductRatingResult
    >;

    selectVendorProducts: _helperFunction<
      SelectVendorProductsInputs,
      SelectVendorProductsResult
    >;

    parseBarcodesUpload: _helperFunction<
      ParseBarcodesUploadInputs,
      ParseBarcodesUploadResult
    >;

    validateOrder: {
      with: (unusedArgs: CreateOrderInputs) => Promise<ValidateOrderResult>;
    };
    calculateOrderTotal: {
      with: (unusedArg: { orderId: number; inCurrency: Currency }) => Promise<{
        finalAmount: number;
        withoutFees: number;
        currency: Currency;
      }>;
    };

    calculatePplReward: {
      with: (unusedArgs: {
        amount: number;
        orderType: OrderTypeEnumLiteral;
      }) => Promise<{
        data: number;
      }>;
    } & ((
      unusedArgAmount: number,
      unusedArgOrderType: OrderTypeEnumLiteral
    ) => Promise<{
      data: number;
    }>);

    getAvailableDates: {
      with: (unusedArgs: {
        fulfilmentMethodIds?: Array<number>;
      }) => Promise<AvailableDateOpeningHours>;
    } & ((unusedArgs: Array<number>) => Promise<AvailableDateOpeningHours>);
    getAvailableSlots: {
      with: (unusedArgs: {
        date: string;
        fulfilmentMethodId: number;
      }) => Promise<iFulfilmentSlot[]>;
    } & ((
      unusedArg1: string,
      unusedArg2: number
    ) => Promise<iFulfilmentSlot[]>);
    validateDeliverySlot: {
      with: (unusedArgs: {
        fulfilmentMethodId: number;
        fulfilmentSlotFrom: string;
        fulfilmentSlotTo: string;
      }) => Promise<boolean>;
    } & ((
      unusedArg3: number,
      unusedArg1: string,
      unusedArg2: string
    ) => Promise<boolean>);
    checkDiscountCode: _helperFunction<
      CheckDiscountCodeInputs,
      CheckDiscountCodeResponse
    >;

    nextAvailableDate: {
      with: (unusedArgs: {
        fulfilmentMethodIds?: Array<number>;
      }) => Promise<NextAvailableDateHelperReturnType>;
    } & ((
      unusedArgs: Array<number>
    ) => Promise<NextAvailableDateHelperReturnType>);
    nextAvailableSlot: {
      with: (unusedArgs: {
        fulfilmentMethodIds?: Array<number>;
      }) => Promise<iFulfilmentSlot>;
    } & ((unusedArgs: Array<number>) => Promise<iFulfilmentSlot>);

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

    createProductCategories: {
      with: (
        unusedArgs: CreateProductCategoriesInput
      ) => Promise<Array<ProductCategoryType | null>>;
    } & ((
      unusedOrunusedArg: CreateProductCategoriesInput
    ) => Promise<Array<ProductCategoryType | null>>);
    editProductCategories: {
      with: (
        unusedArgs: EditProductCategoriesInput
      ) => Promise<Array<sailsModelKVP<ProductCategoryType> | null>>;
    } & ((
      unusedOrunusedArg: EditProductCategoriesInput
    ) => Promise<Array<sailsModelKVP<ProductCategoryType> | null>>);

    transactionsForAccount: _helperFunction<
      TransactionsForAccountInputs,
      TransactionsForAccountResult
    >;

    refreshFuseTransactions: _helperFunction<
      RefreshFuseTransactionsInputs,
      RefreshFuseTransactionsResult
    >;
    refreshStripeTransactions: _helperFunction<
      RefreshStripeTransactionsInputs,
      RefreshStripeTransactionsResult
    >;

    createPeeplPaymentIntent: _helperFunction<
      {
        paymentAmount: number;
        currency: string;
        recipientWalletAddress: walletAddressString;
        recipientName: string;
        headers: any;
      },
      NewPaymentIntent
    >;
    createPaymentIntentInternal: _helperFunction<
      CreatePaymentIntentInternalInputs,
      CreatePaymentIntentInternalResult
    >;
    // createPaymentIntent: (
    //   unusedPaymentAmount: number,
    //   unusedCurrency: string,
    //   unusedRecipientWalletAddress: walletAddressString,
    //   unusedRecipientName: string,
    //   unusedHeaders: any,
    // ) => Promise<NewPaymentIntent>;

    uploadOneS3: (image: any) => Promise<UploadImageInfoType>;

    sendFirebaseNotification: _helperFunction<
      SendFirebaseNotificationInputs,
      SendFirebaseNotificationResult
    >;
    broadcastFirebaseNotificationForTopic: _helperFunction<
      {
        topic: string;
        title: string;
        body: string;
        data:
          | any
          | {
              orderId: string;
            };
      },
      {
        notification: NotificationType;
      }
    >;
    sendTemplateEmail: _helperFunction<
      {
        to: string;
        toName?: string;
        from?: string;
        fromName?: string;
        subject: string;
        layout: false | string;
      } & (
        | {
            template: 'email-logistics-notification';
            templateData: {
              orders: Array<OrderType>;
              deliveryPartner: DeliveryPartnerType;
            };
          }
        | {
            template:
              | 'email-request-courier-availability'
              | 'email-request-courier-confirmation'
              | 'email-request-courier-cancellation'
              | 'email-request-courier-delivery-update';
            templateData?: {
              vegiOrderId: string;
              pickup: any;
              dropoff: any;
            };
          }
        | {
            template: 'email-order-confirmation-new';
            templateData: {
              order: OrderType;
            };
          }
        | {
            template: 'email-support-request';
            templateData: {
              orderId: number;
              message: string;
            };
          }
        | {
            template: 'email-support-internal';
            templateData: {
              orderId?: number | null;
              message: string;
              additionalInfo?: string | null;
            };
          }
        | {
            template: 'email-registration-waiting-list';
            templateData: {
              message: string;
            };
          }
        | {
            template: 'email-account-deleted';
            templateData: {
              message: string;
            };
          }
      ),
      {
        loggedInsteadOfSending: boolean;
      }
    >;
    sendEmailToSupport: _helperFunction<
      {
        subject: string;
        message: string;
      },
      {
        loggedInsteadOfSending: boolean;
      }
    >;
    sendSmsNotification: _helperFunction<
      {
        body: string;
        to: string;
        data: any;
      },
      {
        notification: NotificationType;
      }
    >;
    sendSlackNotification: _helperFunction<
      {
        order: OrderType;
      },
      void
    >;
  };
  log: any;
  // ~ https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  uploadOne: (
    body: Buffer | Blob | string | ReadableStream,
    config: { [configKey: string]: any },
    errHandler: (err: Error, filesUploaded: any) => any
  ) => any;
  config: {
    appPath: string;
    environment: 'test' | 'production' | 'development' | 'qa';
    custom: { [configKey: string]: any };
    uploads: {
      adapter: any;
    };
    datastores: {
      [configKey: string]: {
        adapter: string;
        url: string;
        charset?: string;
        collation?: string;
        ssl?: boolean;
      };
    };
    port: 1337;
    http: {
      cache: number;
      trustProxy: boolean;
    };
    log: {
      level: 'debug' | '';
    };
    sockets: {
      onlyAllowOrigins: string[];
    };
    session: {
      //redis
      url: string;
      adapter: string;
      cookie: number;
    };
    security: {
      cors: {
        // allowOrigins: [
        //   'https://vegi.itsaboutpeepl.com',
        // ]
        allRoutes: boolean;
        allowOrigins: '*' | string | string[];
      };
    };
    models: {
      migrate: 'safe' | 'drop' | 'alter';
    };
    blueprints: {
      shortcuts: boolean;
    };
    hookTimeout: number;
  };
  hooks: {
    http: {
      app: any;
    };
    sockets: any;
  };
};


