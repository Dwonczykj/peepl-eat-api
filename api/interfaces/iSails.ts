/* eslint-disable no-unused-vars */
import { UpdateItemsForOrderSuccess } from "../../api/helpers/update-items-for-order";
import { AvailableDateOpeningHours } from "../../api/helpers/get-available-dates";
import { NextAvailableDateHelperReturnType } from "../../api/helpers/next-available-date";
import { GetAvailableDeliveryPartnerFromPoolInputs } from "api/helpers/get-available-delivery-partner-from-pool";
import { CreateOrderInputs } from "../../api/controllers/orders/create-order";
import { iFulfilmentSlot, iSlot } from "./vendors/slot";
import { CreateProductCategoriesInput } from "../helpers/create-product-categories";
import { ProductCategoryType, walletAddressString } from '../../scripts/utils';
import { EditProductCategoriesInput } from "../helpers/edit-product-categories";

export type UploadImageInfoType = {
  fd: string;
}

export type OrderTypeEnumLiteral = 'vegiEats' | 'vegiPays'

// ~ https://stackoverflow.com/a/53809800
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
export type RequiredKeys<T> = Exclude<
  KeysOfType<T, Exclude<T[keyof T], undefined>>,
  undefined
>;
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

type ValueType = string | number | boolean;

type WaterlineQueryKeys<T> = {
  or: Array<{ [key in keyof T]?: T[key] }>;
  and: Array<{ [key in keyof T]?: T[key] }>;
};

type WaterlineValueComparisonKeys<T extends number | string | boolean> = T extends number ? {
  '>'?: T,
  '>='?: T,
  '<'?: T,
  '<='?: T,
  '=='?: T,
  '!='?: T,
} : {
  '=='?: T,
  '!='?: T,
}

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

type SailsFetchType<T> = {
  fetch: () => Promise<T>;
}

type SailsUpdateSetType<T> = {
  set: (unusedArg: {
    [key in Exclude<keyof T, 'id'>]?: T[key] | number | Array<number>;
  }) => Promise<void>;
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

type SailsFindPopulateType<T> = Promise<sailsModelKVP<T>[] | null> & {
  populate: (unusedArg: string) => Promise<T[] | null>;
};
type SailsFindOnePopulateType<T> = Promise<sailsModelKVP<T> | null> & {
  populate: (unusedArg: string) => Promise<T | null>;
};

export type SailsModelType<T> = {
  addToCollection: (
    id: number,
    attribute: keyof T
  ) => {
    members: (memberIds: Array<number>) => void;
  };
  find: (
    // ~ https://www.typescriptlang.org/docs/handbook/utility-types.html#extracttype-union
    unusedArg:
      | number
      | {
          [key in keyof T]?: T[key] extends ValueType
            ? T[key] | Array<T[key]> | WaterlineValueComparisonKeys<T[key]>
            : number | number[];
        }
      | WaterlineQueryKeys<T>
  ) => SailsFindPopulateType<T>;
  findOne: (
    unusedArg:
      | number
      | {
          [key in keyof T]?: T[key] extends ValueType
            ? T[key] | Array<T[key]>
            : number | number[];
        }
      | WaterlineQueryKeys<T>
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

export type sailsVegi = {
  getDatastore: () => any;
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

    validateOrder: {
      with: (
        unusedArgs: CreateOrderInputs
      ) => Promise<AvailableDateOpeningHours>;
    };
    calculateOrderTotal: {
      with: (unusedArg: { orderId: number }) => Promise<{
        finalAmount: number;
        withoutFees: number;
      }>;
    };

    calculatePplReward: {
      with: (unusedArgs: {
        amount: number;
        orderType: OrderTypeEnumLiteral;
      }) => Promise<{
        data: number;
      }>;
    } & ((unusedArgAmount: number, unusedArgOrderType: OrderTypeEnumLiteral) => Promise<{
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

    createPaymentIntent: (
      unusedFinalAmount: number,
      unusedWalletAddress: walletAddressString,
      unusedVendorName: string
    ) => Promise<NewPaymentIntent>;

    uploadOneS3: (image: any) => Promise<UploadImageInfoType>;
  };
  log: any;
  config: {
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
  };
};
