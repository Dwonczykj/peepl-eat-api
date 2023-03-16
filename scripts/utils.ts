/* eslint-disable no-unused-vars */
import { DaysOfWeek } from "./DaysOfWeek";
import moment from 'moment';
import { NonValueKeys, OptionalValueKeys, RequiredValueKeys } from "../api/interfaces/iSails";
declare var sails: any;

export function getTodayDayName(offset: number = 0): DaysOfWeek {
  // const weekday:any = moment().format("dddd");
  const today = new Date();
  const day = today.getDay();

  const weekdays: Array<DaysOfWeek> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const outDayInd = (day + offset) % weekdays.length;
  return weekdays[outDayInd];
  // if (!weekdays.includes(weekday)) {
  //   throw new Error(`Bad weekday found for getTodayDayName`);
  // }
  // const dayInd = weekdays.indexOf(weekday);

  // return weekdays[outDayInd];
}

export type OmitId<T extends {id: number}> = Omit<T,'id'>;
export type OmitIdRecursive<T extends {id: number}> = (
  {
    [key in RequiredValueKeys<OmitId<T>>]: T[key] extends Array<any> ? Array<T[key][0]> : T[key];
  }
  &
  {
    [key in OptionalValueKeys<OmitId<T>>]?: T[key] extends Array<any> ? Array<T[key][0]> : T[key];
  }
  & 
  {
    [key in NonValueKeys<OmitId<T>>]?: T[key] extends Array<{id: number}> ? Array<OmitId<T[key][0]>> : T[key] extends {id: number} ? OmitId<T[key]> : T[key];
  } 
);

const prependLeadingZero = (val: number, prependIfValLessThan: number = 10) =>
  Math.abs(val) < Math.abs(prependIfValLessThan)
    ? `${Math.sign(val) === -1 ? '-' : ''}0${Math.abs(val)}`
    : `${Math.sign(val) === -1 ? '-' : ''}${Math.abs(val)}`;

export type walletAddressString = `0x${string}`;

export const dateStrFormat = 'YYYY-MM-DD';
export const timeStrFormat = 'HH:mm';
export const datetimeStrFormat = 'YYYY-MM-DD HH:mm';
export const datetimeStrFormatExact = 'YYYY-MM-DD HH:mm:ss';
export const datetimeStrTzFormat = 'YYYY-MM-DD HH:mm Z';
export const datetimeMomentUtcStrTzFormat = 'YYYY-MM-DDTHH:mm:ss.000Z';
export const timeStrTzFormat = 'HH:mm Z';
export type DateString = `${1 | 2}${number}${number}${number}-${
  | 0
  | 1}${number}-${0 | 1 | 2}${number}`; // 'YYYY-MM-DD' i.e. "2022-03-24"
export type TimeHourString = `${0 | 1}${number}:${
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5}${number}`; // 'HH:mm' i.e. "15:30"
export type TimeSecondString = `${0 | 1}${number}:${
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5}${number}:${0 | 1 | 2 | 3 | 4 | 5}${number}`; // 'YYYY-MM-DD HH:mm' i.e. "15:30:00"
export type DateTimeHourString = `${DateString} ${TimeHourString}`; // 'YYYY-MM-DD HH:mm' i.e. "2022-03-24 15:30"
export type DateTimeString = `${DateString} ${TimeSecondString}`; // 'YYYY-MM-DD HH:mm:ss' i.e. "2022-03-24 15:30:00"
export type momentUtcString =
  `${DateString}T${TimeSecondString}.${number}${number}${number}Z`; // "2022-11-10T15:00:00.000Z"
type MarkerTime = `${number | ''}${number}:${number}${number}`; //~https://thewebdev.info/2022/03/19/how-to-define-a-regex-matched-string-type-in-typescript/#:~:text=To%20define%20a%20regex-matched%20string%20type%20in%20TypeScript%2C,%7Bnumber%7D%3A%24%20%7Bnumber%7D%24%20%7Bnumber%7D%60%3B%20const%20t%3A%20MarkerTime%20%3D%20%2209%3A00%22%3B
const unusedTestDateString: DateString = '2022-10-12';
const unusedTestTimeString: TimeHourString = '09:00';
const unusedTestMarkerTime: MarkerTime = '09:00';

export function getNextWeekday(
  weekday: DaysOfWeek,
  inWeekIfToday: boolean = false
): DateString {
  // ~ https://stackoverflow.com/a/25493271
  weekday = weekday.toLowerCase() as DaysOfWeek;
  if (
    ![
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ].includes(weekday)
  ) {
    throw new Error(`Bad weekday passed to getNextWeekday`);
  }
  const weekdays = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const dayInd = weekdays.indexOf(weekday.toLowerCase());
  var today = new Date();
  var theDay;
  var day = today.getDay();
  if (day === dayInd) {
    if (inWeekIfToday) {
      today = new Date(today.setDate(today.getDate() + 7));
    }
    return `${today.getFullYear()}-${prependLeadingZero(
      today.getMonth() + 1
    )}-${prependLeadingZero(today.getDate())}` as DateString;
  } else {
    day = today.getDay();
    var dateOfFirstDayOfThisWeek = today.getDate() - day;
    var dateOfFirstDayOfNextWeek = dateOfFirstDayOfThisWeek + 7;
    if (today.getDay() < dayInd) {
      theDay = dateOfFirstDayOfThisWeek + dayInd;
    } else {
      theDay = dateOfFirstDayOfNextWeek + dayInd;
    }
  }
  let closest = new Date(today.setDate(theDay));

  return `${closest.getFullYear()}-${prependLeadingZero(
    closest.getMonth() + 1
  )}-${prependLeadingZero(closest.getDate())}` as DateString;
}

export type PostCodeString = `${string}${number} ${number}${string}`; // TODO: -> Convert to this`/^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/i,`;

export type UserRoleLiteral =
  | 'consumer'
  | 'admin'
  | 'vendor'
  | 'deliveryPartner';
export type UserVendorRoleLiteral =
  | 'admin'
  | 'owner'
  | 'inventoryManager'
  | 'salesManager'
  | 'none';
export type UserDeliveryPartnerRoleLiteral =
  | 'admin'
  | 'owner'
  | 'deliveryManager'
  | 'rider'
  | 'none';

type _UserTypeHidden = {
  id: number;
  email: string;
  phoneNoCountry: number;
  phoneCountryCode: number;
  name: string;
  isSuperAdmin: boolean;
  role: UserRoleLiteral;
  vendorRole?: UserVendorRoleLiteral;
  deliveryPartnerRole?: UserDeliveryPartnerRoleLiteral;
  roleConfirmedWithOwner: boolean;
  vendorConfirmed: boolean;
  fbUid?: string;
  firebaseSessionToken?: string;
  marketingEmailContactAllowed: boolean;
  marketingPhoneContactAllowed: boolean;
  marketingPushContactAllowed: boolean;
  marketingNotificationUtility: -1 | 0 | 1 | 2;
};

export type AccountType = {
  id: number;
  verified: boolean;
  walletAddress: walletAddressString | '';
};

export type VendorTypeLiteral = 'restaurant' | 'shop';
export type StatusLiteral = 'active' | 'inactive';
export type VendorStatusLiteral = StatusLiteral | 'draft';

type _VendorTypeHidden = {
  id: number;
  name: string;
  type: VendorTypeLiteral;
  phoneNumber: string;
  costLevel?: number;
  rating: number;
  isVegan: boolean;
  minimumOrderAmount: number;
  platformFee: number;
  status: VendorStatusLiteral;
  walletAddress: string;
  description: string;
  imageUrl: string;
};

export type _AddressTypeHidden = {
  id: number;
  label: string;
  addressLineOne: string;
  addressLineTwo: string;
  addressTownCity: string;
  addressPostCode: PostCodeString;
  addressCountryCode: string;
  latitude: number;
  longitude: number;
};

export type RatingType = 0 | 1 | 2 | 3 | 4 | 5;
export type CompletedFlagType =
  | ''
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'partially refunded'
  | 'void';

type PostalOutCode = string;

export type LikeType = {
  guid:string;
  headers:string;
}

type _DeliveryPartnerTypeHidden = {
  id: number;
  name: string;
  email: string;
  walletAddress: string;
  phoneNumber: string;
  type?: 'bike' | 'electric';
  imageUrl: string;
  status: StatusLiteral;
  deliversToPostCodes: Array<PostalOutCode>;
  rating: number;
  // deliveryFulfilmentMethod?: FulfilmentMethodType,
};


export type UserType = _UserTypeHidden & {
  vendor: _VendorTypeHidden;
  deliveryPartner: _DeliveryPartnerTypeHidden;
  secret?: string | null;
};

type _FulfilmentMethodTypeHidden = {
  id: number;
  methodType: 'delivery' | 'collection';
  slotLength: number;
  bufferLength: number;
  orderCutoff: string;
  maxOrders: number;
  maxDeliveryDistance?: number | null;
  priceModifier: number;
};

export type FulfilmentMethodMethodTypeLiteral = _FulfilmentMethodTypeHidden['methodType'];

export type _OpeningHoursTypeHidden = {
  id: number;
  openTime: TimeHourString;
  closeTime: TimeHourString;
  timezone: number;
  specialDate: string;
  dayOfWeek: DaysOfWeek;
  isOpen: boolean;
  logicId: string;
};

export type FulfilmentMethodType = _FulfilmentMethodTypeHidden & {
  vendor?: _VendorTypeHidden;
  deliveryPartner?: _DeliveryPartnerTypeHidden;
  openingHours?: _OpeningHoursTypeHidden;
  fulfilmentOrigin?: _AddressTypeHidden;
};

export type DeliveryPartnerFulfilmentMethodType = _FulfilmentMethodTypeHidden & {
  deliveryPartner: _DeliveryPartnerTypeHidden;
  openingHours?: _OpeningHoursTypeHidden;
};

export type VendorFulfilmentMethodType = _FulfilmentMethodTypeHidden & {
  vendor: _VendorTypeHidden;
  openingHours?: _OpeningHoursTypeHidden;
};

export function fulfilmentMethodOwnedByDP(
  fm:
    | VendorFulfilmentMethodType
    | DeliveryPartnerFulfilmentMethodType
    | FulfilmentMethodType
): fm is DeliveryPartnerFulfilmentMethodType {
  return fm && "deliveryPartner" in fm;
}

export function fulfilmentMethodOwnedByVendor( // ~ https://www.typescriptlang.org/play?ssl=69&ssc=36&pln=69&pc=3#code/PTAEBUE8AcFNQOIFcCGAnAJgSwHYHNQsBnUAFwAt5TY0BbUAd0rXkgHslCcAzAGyVg4AxlUqghbDLACwAKBCg+bBqBQ4UvSEWKgAblhTjJsAHQQYsAMpC0WaKVBIisErAAexUrgIApFLpRrW3s5BQAjWHJ-LDY0RnIsIXI9DSwMFGoSdiQ4tjCAK1ghUhIM0DQkHC9aKjYuPgFhGXkwCngJKUVeZTNwBNc3FFpoXngUIiIkGqyOAHJdeBYUDFB3IZHYAC4O2ABaJQY5ULBwOoqcMnI0DjxktudVweHRogAaRlhZ3l5xJepQIhsGriXjjZxvY6gZifUoArTUejcWJQtQYXjeLjUNA4WAOZHUUbQchsHGgWJSNBEExHWS4LHcFAiUAAeUwNFAAG85KBVBgMCwJpsAaRbPgANxyAC+cjpNAZTPAsEJxJxrIpj2oOAwJDV7K5sh5Qg0ozQADkphE0EKiCLvBLZNLaVU5Yz4ABJZ3Y3G6uLuTXallsuL6nmwWgoLC8a228VSmkKPqCVRkCzxRLJCRIXgrCJk0lsbiXKgMOo+gFIMKkCwkZGVKTcXCwDByKtwUAABTYEywYVGPpIAF4IErYESSbAywAfUAerE40hTxxa2ANnEYe2QgCCWuT3EqxRiFyY6fKuJyOFhne7vYnQbkUiEoJYin3XhJoDw3qDAAoAJRCq9tBvft7QkC8HGgLsgL7INQCHT8Fx-X8NxaUAAHV2jURwHjaUAACJcDwsk4DQDJ8TqJIigAa3iXFmGTaB0C8IQs3QSEqNgSBCBrC5cLyQpijIOp1DQa4VFwypDzMb8CJwIidEMPwAiCOxSEhNgSLIuIkTiTIvHwMkCiKBwOK0ExfxpLBCxksMI14eSLkg68YIpX9OW5IxwNAWgnFIAAhWBZxoecyyHJzoNvCl7UdSEAE0OHELCnFEeAlMCGxVPw3AbTUEQCyIjSaC0whC2ySEogWZNHzBNMkk8nTaBIUg6lw2U0HlLYaWqiZh2VccfQAYVBHqQ15fkXCIaNRTwe1DWNGhzVoS0prtONZBlazwp7Fz2Wy0hctgAtetHFVIpoIawTc0awJtbzfICxU+tVWCwqg7azrQaL4zAeLOCNC5kqLUA0pU+x8NbQ7uAKzTmt0thIREsTQGyOJJJJXp+jzTRGFiKiSAYLAKFAaBbFoQmsAWIhIWytJUv8dLggcb90Q44VpreQyBJKd4cAtGgiF-al1tpayIaOrbgJegchzwusV0bDA8KujybocetcEJpVIFNNhSG3Zl1Ve5yPq+4WFF+xKLmcMYX2+UB0Vu8W3pvFM4COgJ+BccqaC2KFSFIaBJpAKQFm6EiTFoNgAC9I1BExYjwYAMDYIQiGADCwmAEGMvsYAACUVx9ppgGZGHYjTsXuG+0AAFVtAM7PGeIorYZIf6sa4hDkYSwFFHQMw0MoHBIWyRg1AcZrxEoIQaJRskGAufjjNdlxu7+pLnEhCHiZYbAjX+PdhDfC8ha3Fed6bRIMngQ+D3fBSXyPw9aOfXCWFIc8t9TAtuH5+pYnDMfISQMdhdGUKodQmhtD4yHlvMQt8gHv3PE1Cophq51wxLhCWowyRBneAwTCAMcIlnPngVAmAqaoUng+J88Bjx1W3lg52O04jEE2DSBBz9iDbiCl6RCFJvzkhoABZhH0BZCiEawkgvCQqwVGkg7EuD1QADJlH4VspGBySiaCmzkJw++RBNyPROv1H8kiRHG37P+bRUjjpjmeuqeRZ5FGSNAKo-CRpvgLT5mgLRkjdGoR1ioAhltsIpQePoi8XASrCmvjUKoTVhLoDEpCZOC8gbb3ockbBH1uJcG0J0Vq3B2HCysqAb83CcAyK-AInJPpfzKwNJ5QEowTDdDwDJMsLARAUybHoAwqxwyRk2Hhd4dSgwmA0bwZCa0NrlO4cY+xH1vzjNco0w0JIWmmHaZ02C3TYC9JWPoQwSyRljNET6EwniTSLUtDMh01cLbtyWCsSOz53ygIOBAjQWgdDQhKSASEoBdiPHWKMbYxh9jdEOKhYFoLnhbAhrsMh6BtRApBWsBFmxsBEAymTdQ1BdgQ0oUAA
  fm:
    | VendorFulfilmentMethodType
    | DeliveryPartnerFulfilmentMethodType
    | FulfilmentMethodType
): fm is DeliveryPartnerFulfilmentMethodType {
  return fm && 'vendor' in fm;
}

export type OpeningHoursType = _OpeningHoursTypeHidden & {
  fulfilmentMethod?: FulfilmentMethodType;
};

export type AddressType = _AddressTypeHidden & {
  vendor?: _VendorTypeHidden;
  deliveryPartner?: _DeliveryPartnerTypeHidden;
  user?: _UserTypeHidden;
}

export type DeliveryPartnerType = _DeliveryPartnerTypeHidden & {
  deliveryFulfilmentMethod?: _FulfilmentMethodTypeHidden;
  users?: Array<_UserTypeHidden>;
};

export type DiscountType = {
  id: number;
  outcode: string;
};
export type _ProductTypeHidden = {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  imageUrl: string;
  isAvailable: boolean;
  priority: number;
  isFeatured: boolean;
  status: StatusLiteral;
  ingredients?: string | null;
};
export type testTYPE = {
  id: number;
  ingredients?: string;
};
export type _ProductCategoryTypeHidden = {
  id: number;
  name: string;
  imageUrl: string;
  products: Array<_ProductTypeHidden>;
};
export type _ProductOptionValueTypeHidden = {
  id: number;
  name: string;
  description: string;
  priceModifier: number;
  isAvailable: boolean;
  stockCount: number;
  stockUnitsPerProduct: number;
  sizeInnerUnitValue: number;
  sizeInnerUnitType: string;
  productBarCode: string;
  supplier: string;
  brandName: string;
  taxGroup: string;
};
export type _ProductOptionTypeHidden = {
  id: number;
  name: string;
  isRequired: boolean;
  product: _ProductTypeHidden;
};
export type ProductOptionValueType = _ProductOptionValueTypeHidden & {
  id: number;
  option: _ProductOptionTypeHidden;
};
export type ProductOptionType = {
  id: number;
  name: string;
  isRequired: boolean;
  product: _ProductTypeHidden & {vendor: number};
  values: Array<ProductOptionValueType>;
};
export type _OrderItemTypeHidden = {
  id: number;
  unfulfilled: boolean;
  unfulfilledOnOrderId: number;
};

export type OrderItemOptionValueType = {
  id: number;
  option: ProductOptionType;
  optionValue: ProductOptionValueType;
  orderItem: _OrderItemTypeHidden;
};
export type CategoryGroupType = {
  id: number;
  name: string;
  imageUrl: string;
  forRestaurantItem: boolean;
};
export type VendorCategoryType = {
  id: number;
  name: string;
  imageUrl: string;
  vendors: Array<_VendorTypeHidden>;
};

export type PostalDistrictType = {
  id: number;
  outcode: string;
  vendors: Array<_VendorTypeHidden>;
};

export type VendorType = _VendorTypeHidden & {
  /// Address of the vendor
  pickupAddress?: _AddressTypeHidden;

  /// vendor's preferred delivery partner if they have one
  deliveryPartner?: _DeliveryPartnerTypeHidden;

  /// fulfilment method config for deliveries from the vendor
  deliveryFulfilmentMethod?: _FulfilmentMethodTypeHidden;

  /// fulfilment method config for collections from the vendor
  collectionFulfilmentMethod?: _FulfilmentMethodTypeHidden;

  /// the list of products in the vendor's inventory
  products: Array<_ProductTypeHidden>;

  /// The categoric type of the vendor (i.e. a cafe).
  vendorCategories: Array<VendorCategoryType>; // Cafes

  /// vendor specific categories to assign each of their products into
  productCategories: Array<_ProductCategoryTypeHidden>;

  /// Postal Districts (Post Code Areas) that the vendor will allow customers from
  fulfilmentPostalDistricts: Array<PostalDistrictType>;

  /// users registered to the vendor's organisation
  users: [];
};
export type ProductCategoryType = _ProductCategoryTypeHidden & {
  vendor: VendorType;
  categoryGroup: CategoryGroupType;
};

export type ProductType = _ProductTypeHidden & {
  vendor: VendorType;
  options: Array<ProductOptionType>;
  category: ProductCategoryType;
};

type _ProductSuggestionTypeHidden = {
  id: number;
  name: string;
  store: string;
  additionalInformation: string;
  productProcessed: boolean;
  qrCode: string;
};

export type ProductSuggestionImageType = {
  id: number;
  imageUrl: string;
  publicUid: string;
  productSuggestion: _ProductSuggestionTypeHidden;
};

export type ProductSuggestionType = _ProductSuggestionTypeHidden & {
  imageUrls: Array<ProductSuggestionImageType>;
}

export type ESCRatingType = {
  id: number;
  createdAt: number;
  productPublicId: string;
  rating: number;
  evidence: object;
  calculatedOn:Date;
  product: ProductType;
};

export const SustainedGradeToRatingMap = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0.5,
  G: 0,
};

export type ESCExplanationType = {
  id: number;
  title: string;
  description: string;
  measure: number;
  escrating: ESCRatingType;
}

type SustainedAPIChoiceResponseType = {
  page: number;
  page_size: number;
  next_page_token: string;
  total_results: number;
  links: {
    self: string;
    next: string;
    first: string;
  };
};

export type SustainedAPIChoiceImpactType = {
  id: string;
  title: string;
  description: string;
  grade: string;
  svg_icon: string;
};

export type SustainedAPIChoiceProductType = {
  id: string;
  name: string;
  gtin: string;
  image: string;
  pack: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  points: {
    pef: number;
  };
  info_icons: string[];
  category: string;
  links: {
    product: string;
    category: string;
    impacts: string;
  };
};

export type SustainedAPIChoiceGetProductsResponseType = SustainedAPIChoiceResponseType & {
  products: SustainedAPIChoiceProductType[];
};

export type SustainedAPIChoiceGetImpactsResponseType = SustainedAPIChoiceResponseType & {
  impacts: SustainedAPIChoiceImpactType[];
};

export type RestaurantAcceptedStatusType =
  | 'rejected'
  | 'accepted'
  | 'pending'
  | 'partially fulfilled';

export type PaymentStatusType = 'paid' | 'unpaid' | 'failed';

export type _OrderTypeHidden = {
  id: number;
  vendor: VendorType;
  deliveryPartner?: DeliveryPartnerType;
  subtotal: number;
  total: number;
  orderedDateTime: number;
  paidDateTime: number;
  refundDateTime: number;
  paymentStatus: PaymentStatusType;
  paymentIntentId: string;
  fulfilmentMethod: FulfilmentMethodType;
  fulfilmentSlotFrom: Date;
  fulfilmentSlotTo: Date;
  restaurantAcceptanceStatus: RestaurantAcceptedStatusType;
  deliveryName: string;
  deliveryEmail: string;
  deliveryPhoneNumber: string;
  deliveryAddressLineOne: string;
  deliveryAddressLineTwo: string;
  deliveryAddressCity: string;
  deliveryAddressPostCode: string;
  deliveryAddressLatitude?: number | null;
  deliveryAddressLongitude?: number | null;
  deliveryAddressInstructions: string;
  customerWalletAddress: string;
  deliveryId?: string;
  deliveryPartnerAccepted: boolean;
  deliveryPartnerConfirmed: boolean;
  publicId: string;
  tipAmount: number;
  rewardsIssued: number;
  sentToDeliveryPartner: boolean;
  completedFlag: CompletedFlagType;
  completedOrderFeedback: string;
  deliveryPunctuality: RatingType;
  orderCondition: RatingType;
  discount: DiscountType;
};

export type NotificationType = {
  id: number;
  recipient: string;
  type: 'sms' | 'email' | 'push';
  sentAt: number;
  publicId: string;
  title: string;
  metadata: string;
  order: _OrderTypeHidden;
};

export type SurveyType = {
  id: number;
  email: string;
  question: string;
  answer: string | null;
};

export type WaitingListEntryType = {
  id: number;
  email: string;
  origin: 'mobile' | 'vegiapp.co.uk' | 'guide' | 'leaflet' | 'instagram' | '',
  userType: 'business' | 'unknown' | 'customer' | 'consumer',
};

export type OrderItemType = _OrderItemTypeHidden & {
  id: number;
  unfulfilled: boolean;
  unfulfilledOnOrderId: number;
  order: _OrderTypeHidden;
  product: ProductType;
  optionValues: Array<OrderItemOptionValueType>;
};

export type OrderType = _OrderTypeHidden & {
  parentOrder?: OrderType;
  items: Array<OrderItemType>;
  unfulfilledItems: Array<OrderItemType>;
};

export const openingHoursToMoments = (
  openingHours: OpeningHoursType,
  withDate: moment.Moment
) => {
  let openTime: moment.Moment;
  let closeTime: moment.Moment;
  const sign = openingHours.timezone < 0 ? '-' : '+';
  const leadingZero = Math.abs(openingHours.timezone) >= 10 ? '0' : '';

  const dateStr = withDate.format(dateStrFormat);
  try {
    openTime = moment.utc(
      `${dateStr} ${openingHours.openTime} ${sign}${leadingZero}${Math.abs(
        openingHours.timezone
      )}:00`,
      `${dateStrFormat} ${timeStrTzFormat}`
    );
    // .format("HH:mm Z");
  } catch (error) {
    sails.log.warn(
      `Unable to set timezone for opening hours openTime: ${openingHours.openTime} with timezone: ${openingHours.timezone}: ${error}`
    );
  }
  try {
    closeTime = moment.utc(
      `${dateStr} ${openingHours.closeTime} ${sign}${leadingZero}${Math.abs(
        openingHours.timezone
      )}:00`,
      `${dateStrFormat} ${timeStrTzFormat}`
    );
    // .format("HH:mm Z");
  } catch (error) {
    sails.log.warn(
      `Unable to set timezone for opening hours closeTime: ${openingHours.closeTime} with timezone: ${openingHours.timezone}: ${error}`
    );
  }
  return {
    openTime: openTime,
    closeTime: closeTime,
    originatingFulfilmentMethod: openingHours.fulfilmentMethod,
    originatingOpeningHours: openingHours,
  };
};

type _actionInputType = {
  type:'ref'|'string'|'number'|'boolean';
  required?: boolean;
  description?: string;
  allowNull?: boolean;
  defaultsTo?: any;
  min?: number;
  max?: number;
  isIn?: Array<any>;
};
export type ActionInputImageDefnType = _actionInputType & {
  type: 'ref';
};
export type ActionInputObjectDefnType = _actionInputType & {
  type: 'ref';
};
export type ActionInputArrayDefnType = _actionInputType & {
  type: 'ref';
};
export type ActionInputStringDefnType = _actionInputType & {
  type: 'string';
  defaultsTo?: any;
  isIn?: Array<any>;
  maxLength?: number;
  minLength?: number;
  isEmail?: boolean;
  unique?: boolean;
  protect?: boolean;
  example?: string;
  regex?: RegExp;
};
export type ActionInputNumberDefnType = _actionInputType & {
  type: 'number';
  defaultsTo?: any;
  min?: number;
  max?: number;
  unique?: boolean;
  required?: boolean;
};
export type ActionInputBooleanDefnType = _actionInputType & {
  type: 'boolean';
  defaultsTo?: any;
  required?: boolean;
};

type _actionPrimitiveDefnType =
  | ActionInputStringDefnType
  | ActionInputBooleanDefnType
  | ActionInputNumberDefnType;


export type ModelAttributeAssociationModlDefnType = {
  model: string;
  description?: string;
};
export type ModelAttributeAssociationColnDefnType = {
  collection: string;
  via: string;
  description?: string;
};
export type ModelAttributePrimitiveDefnType = _actionPrimitiveDefnType & {
  columnType?: 'INT' | 'TINYINT' | 'DATETIME' | 'LONGTEXT' | null;
};

export type ModelAttributeType =
  | ModelAttributePrimitiveDefnType
  | ModelAttributeAssociationModlDefnType
  | ModelAttributeAssociationColnDefnType;

export type ActionInputArgDerivedModelType<T> =
  T extends string
    ? ActionInputStringDefnType
    : T extends number
    ? ActionInputNumberDefnType
    : T extends boolean
    ? ActionInputBooleanDefnType
    : T extends Array<any>
    ? ActionInputArrayDefnType
    : ActionInputObjectDefnType;


export type ActionInputArgDefnType =
  | ActionInputImageDefnType
  | ActionInputObjectDefnType
  | ActionInputArrayDefnType
  | ActionInputStringDefnType
  | ActionInputNumberDefnType
  | ActionInputBooleanDefnType;

export type ActionInputsDefnType<T extends {}> = {
  [key in keyof T]: ActionInputArgDerivedModelType<T[key]>;
};

type ActionExitRequired<T extends any> = {
  success: (unusedArg:T) => T;
  successJSON?: (unusedArg:T) => T;
}

export type ActionExitsDefnType<TExits extends ActionExitRequired<any>> = {
  [k in keyof TExits]: (k extends 'success'
    ? {
        viewTemplatePath?: string;
        statusCode?: number;
      }
    : k extends 'successJSON'
    ? {
        statusCode: 200;
      }
    : k extends 'firebaseErrored'
    ? {
        statusCode?: 401;
        code?: null | number | string;
        responseType?: 'firebaseError';
      }
    : {
        statusCode?: number;
        responseType?:
          | 'notFound'
          | 'error'
          | 'success'
          | 'firebaseError'
          | 'unauthorised'
          | 'badRequest';
      }) & {
    description?: string;
    message?: string;
    error?: null | undefined | Error | string;
    exampleOutput?: any;
    outputDescription?: any;
    outputExample?: any;
    data?: any;
  };
};

export type ActionInputArgDerivedType<
  T extends ActionInputArgDefnType
> = {
  [key in keyof T]: T extends ActionInputStringDefnType
    ? string
    : T extends ActionInputNumberDefnType
    ? number
    : T extends ActionInputBooleanDefnType
    ? boolean
    : any;
};

export type ModelInputAttributeDerivedType<T extends ModelAttributeType> = {
  [key in keyof T]: T extends ActionInputStringDefnType
    ? string
    : T extends ActionInputNumberDefnType
    ? number
    : T extends ActionInputBooleanDefnType
    ? boolean
    : T extends ModelAttributePrimitiveDefnType
    ? string | boolean | number
    : T extends ModelAttributeAssociationColnDefnType
    ? Array<any>
    : T extends ModelAttributeAssociationModlDefnType
    ? any
    : any;
};

// ~ https://stackoverflow.com/a/57384629
export type valueOf<T> = T[keyof T];
export function nameOf<T, V extends T[keyof T]>(
  f: (x: T) => V
): valueOf<{ [K in keyof T]: T[K] extends V ? K : never }>;
export function nameOf(f: (x: any) => any): keyof any {
  var p = new Proxy(
    {},
    {
      get: (target, key) => key,
    }
  );
  return f(p);
}

export interface I_$<T> {
  nameOf<V extends T[keyof T]>(
    f: (x: T) => V
  ): valueOf<{ [K in keyof T]: T[K] extends V ? K : never }>;
}
export function _$<T>(obj: T) {
  return {
    nameOf: (f: (x: any) => any) => {
      return nameOf(f);
    },
  } as I_$<T>;
}

type xxx<T> = {
  hello: I_$<T>;
}

type HeyMan = {NiceOne: 1};

type yyy = xxx<HeyMan>;

export type SailsModelDefnType<T extends { id: number }> = {
  attributes: {
    [k in keyof Omit<T, 'id'>]: ModelAttributeType;
  };
  beforeCreate?: (valuesToSet: Omit<T, 'id'>, proceed: () => void) => void;
  afterCreate?: (newRecord: T, proceed: () => void) => void;
  customToJSON?: () => any;

};

export type SailsActionDefnType<
  TInputs extends any,
  TResponseSuccess extends any,
  TExits extends ActionExitRequired<TResponseSuccess>
> = ('image' extends keyof ActionInputsDefnType<TInputs>
  ? {
      files: Array<keyof TInputs & 'image'>;
    }
  : {}) & {
  inputs: ActionInputsDefnType<TInputs>;
  exits: ActionExitsDefnType<TExits>;
  fn: (inputs: TInputs, exits: TExits) => any;
  files?: Array<keyof TInputs>;
  friendlyName?: string;
  description?: string;
};
