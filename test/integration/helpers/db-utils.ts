import { v4 as uuidv4 } from "uuid";
import { DEFAULT_NEW_VENDOR_OBJECT } from "../controllers/vendors/defaultVendor";
import { DEFAULT_NEW_DELIVERY_PARTNER_OBJECT } from "../controllers/deliveryPartners/defaultDeliveryPartner";
import { DEFAULT_NEW_ORDER_OBJECT } from "../controllers/orders/defaultOrder.js";
import {
  getNextWeekday,
  timeStrFormat,
  getTodayDayName,
  dateStrFormat,
  timeStrTzFormat,
  VendorType,
  FulfilmentMethodType,
  OpeningHoursType,
  DeliveryPartnerType,
  OrderType,
  DateString,
} from "../../../scripts/utils";
import {
  TimeWindow,
} from "../../../api/interfaces/vendors/slot";
import { DaysOfWeek } from "../../../scripts/DaysOfWeek";

declare var Order: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;

export const createOpeningHoursForFulfilmentMethod = async (
  fixtures,
  fulfilmentMethodId: number,
  openingHoursWindows: TimeWindow[],
  days: 'all' | Array<DaysOfWeek> = [],
  dayOffsets: Array<number> = [],
  specialDates: Array<{ [dt: DateString]: TimeWindow[] }> = []
) => {
  if (!fulfilmentMethodId) {
    throw new Error(
      'No FUlfilment Method passed to function: createOpeningHoursForFulfilmentMethod'
    );
  }

  if ((!days || days.length < 1) && (!dayOffsets || dayOffsets.length < 1)) {
    days = 'all';
  }
  const usedWeekdays =
    days === 'all'
      ? [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]
      : days && days.length > 0
      ? days
      : dayOffsets.map((offset) => getTodayDayName(offset));

  const openingHoursDelVen = usedWeekdays
    .map((weekday) =>
      openingHoursWindows.map((timeWindow) => {
        return {
          dayOfWeek: weekday,
          isOpen: true,
          timezone: 0, // could take from moment.format("Z")
          openTime: timeWindow.startTime.format(timeStrFormat),
          closeTime: timeWindow.endTime.format(timeStrFormat),
          fulfilmentMethod: fulfilmentMethodId,
        };
      })
    )
    .flat(1);

  // Add the opening hours to the database
  const vendorsDeliveryOpeningHours: Array<OpeningHoursType> =
    await OpeningHours.createEach(openingHoursDelVen).fetch();

  if (specialDates && specialDates.length > 0) {
    for (const specialDate of Object.keys(specialDates)) {
      if (specialDate.match(/^[12][0-9]{3}-[01][0-9]-[0-9]{2}$/g)) {
        //ignore if doesnt match
        await OpeningHours.createEach(
          specialDates[specialDate].map((timeWindow) => {
            return {
              specialDate: specialDate,
              isOpen: true,
              timezone: 0, // could take from moment.format("Z")
              openTime: timeWindow.startTime.format(timeStrFormat),
              closeTime: timeWindow.endTime.format(timeStrFormat),
              fulfilmentMethod: fulfilmentMethodId,
            };
          })
        );
      }
    }
  }

  await FulfilmentMethod.addToCollection(
    fulfilmentMethodId,
    'openingHours'
  ).members(vendorsDeliveryOpeningHours.map(({ id }) => id));

  return {
    vendorsDeliveryOpeningHours,
    usedWeekdays,
  };
};

export const createVendorWithOpeningHours = async (
  fixtures,
  openingHoursWindows: TimeWindow[],
  days: 'all' | Array<DaysOfWeek> = [],
  dayOffsets: Array<number> = [],
  withDeliveryPartnerId: number = null,
  specialDates: Array<{ [dt: DateString]: TimeWindow[] }> = []
) => {
  const vendor: VendorType = await Vendor.create(
    DEFAULT_NEW_VENDOR_OBJECT(fixtures, {
      name: 'TEST_VENDOR_' + uuidv4(),
      deliveryPartner: withDeliveryPartnerId,
    })
  );
  let vendorsDelvFulfMethod: FulfilmentMethodType =
    await FulfilmentMethod.findOne({
      vendor: vendor.id,
      methodType: 'delivery',
    });

  if (!vendorsDelvFulfMethod) {
    throw new Error(
      `Delivery FulfilmentMethod for vendor: ${vendor.name} not found`
    );
  }

  let vendorsColnFulfMethod: FulfilmentMethodType =
    await FulfilmentMethod.findOne({
      vendor: vendor.id,
      methodType: 'collection',
    });

  if (!vendorsColnFulfMethod) {
    throw new Error(
      `Collection FulfilmentMethod for vendor: ${vendor.name} not found`
    );
  }

  const {
    vendorsDeliveryOpeningHours,
    usedWeekdays: usedWeekdaysForVendorDelivery,
  } = await createOpeningHoursForFulfilmentMethod(
    fixtures,
    vendorsDelvFulfMethod.id,
    openingHoursWindows,
    days,
    dayOffsets
  );

  const {
    vendorsDeliveryOpeningHours: vendorsCollectionOpeningHours,
    usedWeekdays: usedWeekdaysVendorCollection,
  } = await createOpeningHoursForFulfilmentMethod(
    fixtures,
    vendorsColnFulfMethod.id,
    openingHoursWindows,
    days,
    dayOffsets
  );

  return {
    vendor,
    vendorsDelvFulfMethod,
    vendorsColnFulfMethod,
    vendorsDeliveryOpeningHours,
    vendorsCollectionOpeningHours,
    usedWeekdays: usedWeekdaysForVendorDelivery,
    usedWeekdaysForVendorDelivery,
    usedWeekdaysVendorCollection,
  };
};
export const createDeliveryPartnerWithOpeningHours = async (
  fixtures,
  openingHoursWindows: TimeWindow[],
  days: 'all' | Array<DaysOfWeek> = [],
  dayOffsets: Array<number> = [],
  specialDates: Array<{[dt:DateString]: TimeWindow[]}> = []
) => {
  const _dp: DeliveryPartnerType = await DeliveryPartner.create(
    DEFAULT_NEW_DELIVERY_PARTNER_OBJECT(fixtures, {
      name: 'TEST_DP_' + uuidv4(),
    })
  ).fetch();
  const deliveryPartner: DeliveryPartnerType = await DeliveryPartner.findOne(
    _dp.id
  );
  let deliveryPartnersDelvFulfMethod: FulfilmentMethodType =
    await FulfilmentMethod.findOne({
      deliveryPartner: deliveryPartner.id,
      methodType: 'delivery',
    }); //TODO: Add fm overrides for priceModifier here

  if (!deliveryPartnersDelvFulfMethod) {
    throw new Error(
      `DeliveryPartner FulfilmentMethod for deliveryPartner: ${deliveryPartner.name} not found`
    );
  }

  const { vendorsDeliveryOpeningHours, usedWeekdays } =
    await createOpeningHoursForFulfilmentMethod(
      fixtures,
      deliveryPartnersDelvFulfMethod.id,
      openingHoursWindows,
      days,
      dayOffsets
    );
  const deliveryPartnerDeliveryOpeningHours = vendorsDeliveryOpeningHours;
  const usedWeekdaysForDeliveryPartner = usedWeekdays;

  return {
    deliveryPartner,
    deliveryPartnersDelvFulfMethod,
    deliveryPartnerDeliveryOpeningHours,
    usedWeekdaysForDeliveryPartner,
  };
};

export const createOrdersForSlot = async (
  fixtures,
  slot: TimeWindow,
  fulfilmentMethodId: number,
  numberOfOrders: number = 1,
  overrides:{[k:string]:any} = {}
) => {
  numberOfOrders = Math.max(1, numberOfOrders);

  const _orderObjs = new Array(numberOfOrders)
    .fill(null)
    .map((unusedNull, unusedInd) =>
      DEFAULT_NEW_ORDER_OBJECT(fixtures, {
        ...{
          deliveryPartnerAccepted: false,
          deliveryPartnerConfirmed: false,
          deliveryPartner: null,
          paymentStatus: "paid",
          deliveryId: "TEST_DELIVERY_ID_" + uuidv4(),
          fulfilmentMethod: fulfilmentMethodId,
          fulfilmentSlotFrom: slot.startTime.toDate(),
          fulfilmentSlotTo: slot.endTime.toDate(),
        },
        ...overrides
      })
    );

  const orders: Array<OrderType> = await Order.createEach(_orderObjs).fetch();

  return {
    orders,
  };
};


