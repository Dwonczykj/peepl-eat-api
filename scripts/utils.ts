import { DaysOfWeek } from 'api/interfaces/vendors/slot';
import moment from 'moment';
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

const prependLeadingZero = (val: number, prependIfValLessThan: number = 10) =>
  Math.abs(val) < Math.abs(prependIfValLessThan)
    ? `${Math.sign(val) === -1 ? '-' : ''}0${Math.abs(val)}`
    : `${Math.sign(val) === -1 ? '-' : ''}${Math.abs(val)}`;

export function getNextWeekday(
  weekday: DaysOfWeek,
  todayInWeek: boolean = false
) {
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
    if (todayInWeek) {
      today = new Date(today.setDate(today.getDate() + 7));
    }
    return `${today.getFullYear()}-${prependLeadingZero(
      today.getMonth() + 1
    )}-${prependLeadingZero(today.getDate())}`;
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
  )}-${prependLeadingZero(closest.getDate())}`;
}

export const dateStrFormat = 'YYYY-MM-DD';
export const timeStrFormat = 'HH:mm';
export const datetimeStrFormat = 'YYYY-MM-DD HH:mm';
export const datetimeStrFormatExact = 'YYYY-MM-DD HH:mm:ss';
export const datetimeStrTzFormat = 'YYYY-MM-DD HH:mm Z';
export const timeStrTzFormat = 'HH:mm Z';

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
};

export type VendorTypeLiteral = 'restaurant' | 'shop';
export type StatusLiteral = 'active' | 'inactive';
export type VendorStatusLiteral = StatusLiteral | 'draft';

type _VendorTypeHidden = {
  id: number;
  name: string;
  type: VendorTypeLiteral;
  phoneNumber: string;
  pickupAddressLineOne?: string;
  pickupAddressLineTwo?: string;
  pickupAddressCity?: string;
  pickupAddressPostCode?: string;
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

export type RatingType = 0 | 1 | 2 | 3 | 4 | 5;
export type CompletedFlagType =
  | ''
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'partially refunded'
  | 'void';

type PostalOutCode = string;

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
};

type _FulfilmentMethodTypeHidden = {
  id: number;
  methodType: 'delivery' | 'collection';
  slotLength: number;
  bufferLength: number;
  orderCutoff: string;
  maxOrders: number;
};

export type _OpeningHoursTypeHidden = {
  id: number;
  openTime: string;
  closeTime: string;
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
};

export type OpeningHoursType = _OpeningHoursTypeHidden & {
  fulfilmentMethod?: FulfilmentMethodType;
};

export type DeliveryPartnerType = _DeliveryPartnerTypeHidden & {
  deliveryFulfilmentMethod?: _FulfilmentMethodTypeHidden;
};

export type DiscountType = {
  id: number;
  outcode: string;
};
export type _ProductTypeHidden = {
  id: number;
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
};
export type _ProductOptionTypeHidden = {
  id: number;
  name: string;
  isRequired: boolean;
  product: _ProductTypeHidden;
};
export type ProductOptionValueType = {
  id: number;
  option: _ProductOptionTypeHidden;
};
export type ProductOptionType = {
  id: number;
  name: string;
  isRequired: boolean;
  product: _ProductTypeHidden;
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
  outcode: string;
  vendors: Array<_VendorTypeHidden>;
};

export type VendorType = _VendorTypeHidden & {
  deliveryPartner?: _DeliveryPartnerTypeHidden;
  deliveryFulfilmentMethod?: _FulfilmentMethodTypeHidden;
  collectionFulfilmentMethod?: _FulfilmentMethodTypeHidden;
  products: Array<_ProductTypeHidden>;
  vendorCategories: Array<VendorCategoryType>; // Cafes
  productCategories: Array<_ProductCategoryTypeHidden>;
  fulfilmentPostalDistricts: Array<PostalDistrictType>;
  users: [];
};
export type ProductCategoryType = _ProductCategoryTypeHidden & {
  vendor: VendorType;
  categoryGroup: CategoryGroupType;
};

export type ProductType = _ProductTypeHidden & {
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
  vendor: VendorType;
  options: Array<ProductOptionType>;
  category: ProductCategoryType;
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

export type OrderItemType = _OrderItemTypeHidden & {
  id: number;
  unfulfilled: boolean;
  unfulfilledOnOrderId: number;
  order: _OrderTypeHidden;
  product: ProductType;
  optionValues: OrderItemOptionValueType;
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
