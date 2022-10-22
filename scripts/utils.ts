import { DaysOfWeek } from "api/interfaces/vendors/slot";
import moment from "moment";
declare var sails: any;

export function getTodayDayName(offset:number=0):DaysOfWeek {
  // const weekday:any = moment().format("dddd");
  const today = new Date();
  const day = today.getDay();
  
  const weekdays:Array<DaysOfWeek> = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const outDayInd = (day + offset) % weekdays.length;
  return weekdays[outDayInd];
  // if (!weekdays.includes(weekday)) {
  //   throw new Error(`Bad weekday found for getTodayDayName`);
  // }
  // const dayInd = weekdays.indexOf(weekday);
  
  // return weekdays[outDayInd];
}

export function getNextWeekday(weekday: DaysOfWeek, todayInWeek:boolean=false) {
  // ~ https://stackoverflow.com/a/25493271
  weekday = weekday.toLowerCase() as DaysOfWeek;
  if (
    ![
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ].includes(weekday)
  ) {
    throw new Error(`Bad weekday passed to getNextWeekday`);
  }
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayInd = weekdays.indexOf(weekday.toLowerCase());
  var today = new Date();
  var theDay;
  var day = today.getDay();
  if (day === dayInd) {
    if(todayInWeek){
      today = new Date(today.setDate(today.getDate() + 7));
    }
    return (
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    );
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

  return (
    closest.getFullYear() +
    "-" +
    (closest.getMonth() + 1) +
    "-" +
    closest.getDate()
  );
}

export const dateStrFormat = "YYYY-MM-DD";
export const timeStrFormat = "HH:mm";
export const datetimeStrFormat = "YYYY-MM-DD HH:mm";
export const datetimeStrTzFormat = "YYYY-MM-DD HH:mm Z";
export const timeStrTzFormat = "HH:mm Z";

type _VendorTypeHidden = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  // deliveryPartner?: DeliveryPartnerType;
  // deliveryFulfilmentMethod?: FulfilmentMethodType;
  // collectionFulfilmentMethod?: FulfilmentMethodType;
};

type _DeliveryPartnerTypeHidden = {
  id: number;
  name: string;
  status: "active" | "inactive";
  // deliveryFulfilmentMethod?: FulfilmentMethodType,
};

type _FulfilmentMethodTypeHidden = {
  id: number;
  methodType: string;
  slotLength: number;
  bufferLength: number;
  orderCutoff: string;
  maxOrders: number;
  // vendor?: VendorType;
  // deliveryPartner?: DeliveryPartnerType;
};

export type FulfilmentMethodType = _FulfilmentMethodTypeHidden & {
  vendor?: _VendorTypeHidden;
  deliveryPartner?: _DeliveryPartnerTypeHidden;
};

export type OpeningHoursType = {
  id: number;
  openTime: string;
  closeTime: string;
  timezone: number;
  specialDate: string;
  dayOfWeek: DaysOfWeek;
  isOpen: boolean;
  logicId: string;
  fulfilmentMethod?: FulfilmentMethodType;
};

export type DeliveryPartnerType = _DeliveryPartnerTypeHidden & {
  deliveryFulfilmentMethod?: _FulfilmentMethodTypeHidden,
}

export type VendorType = _VendorTypeHidden & {
  deliveryPartner?: _DeliveryPartnerTypeHidden;
  deliveryFulfilmentMethod?: _FulfilmentMethodTypeHidden;
  collectionFulfilmentMethod?: _FulfilmentMethodTypeHidden;
};

export type DiscountType = {
  id: number;
  outcode: string;
}

export type OrderType = {
  id: number;
  items: Array<any>;
  unfulfilledItems: Array<any>;
  vendor: VendorType;
  deliveryPartner?: DeliveryPartnerType;
  parentOrder?: OrderType;
  subtotal: number;
  total: number;
  orderedDateTime: number;
  paidDateTime: number;
  refundDateTime: number;
  paymentStatus: "paid" | "unpaid" | "failed";
  paymentIntentId: string;
  fulfilmentMethod: FulfilmentMethodType;
  fulfilmentSlotFrom: Date;
  fulfilmentSlotTo: Date;
  restaurantAcceptanceStatus:
    | "rejected"
    | "accepted"
    | "pending"
    | "partially fulfilled";
  deliveryName: string;
  deliveryEmail: string;
  deliveryPhoneNumber: string;
  deliveryAddressLineOne: string;
  deliveryAddressLineTwo: string;
  deliveryAddressLineCity: string;
  deliveryAddressLinePostCode: string;
  deliveryAddressInstructions: string;
  customerWalletAddress: string;
  deliveryId?: string;
  deliveryPartnerAccepted: boolean;
  deliveryPartnerConfirmed: boolean;
  publicId: string;
  tipAmount: number;
  rewardsIssued: number;
  sentToDeliveryPartner: boolean;
  completedFlag:
    | ""
    | "completed"
    | "cancelled"
    | "refunded"
    | "partially refunded"
    | "void";
  completedOrderFeedback: string;
  deliveryPunctuality: 0 | 1 | 2 | 3 | 4 | 5;
  orderCondition: 0 | 1 | 2 | 3 | 4 | 5;
  discount: DiscountType;
};

export const openingHoursToMoments = (openingHours:OpeningHoursType, withDate: moment.Moment) => {
  let openTime: moment.Moment;
  let closeTime: moment.Moment;
  const sign = openingHours.timezone < 0 ? "-" : "+";
  const leadingZero = Math.abs(openingHours.timezone) >= 10 ? "0" : "";

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
