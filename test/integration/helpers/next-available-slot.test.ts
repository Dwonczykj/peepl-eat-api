import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { login } = require("../../utils");
import util from "util";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
const { fixtures } = require("../../../scripts/build_db.js");
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
} from "../../../scripts/utils";
import {
  iSlot,
  TimeWindow,
} from "../../../api/interfaces/vendors/slot";
import { DaysOfWeek } from "../../../scripts/DaysOfWeek";
import {
  createVendorWithOpeningHours,
  createDeliveryPartnerWithOpeningHours,
  createOrdersForSlot,
} from "./db-utils";
import {
  stringifySlots,
  stringifySlotWithTimes,
  stringifySlotWithDate
} from "../../../scripts/stringifySlot";

declare var Order: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;

describe("helpers.nextAvailableSlot", async () => {
  const todayName = getTodayDayName(0);
  const tomorrowName = getTodayDayName(1);
  const dayAfterTomorrowName = getTodayDayName(2);
  it("can get next date's first slot as next slot for new test vendor", async () => {
    const { vendorsDelvFulfMethod, vendorsDeliveryOpeningHours, usedWeekdays } =
      await createVendorWithOpeningHours(
        fixtures,
        [
          new TimeWindow({
            startTime: "12:30",
            endTime: "16:30",
            date: moment.utc(),
          }),
        ],
        [tomorrowName, dayAfterTomorrowName]
      );

    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment.utc().add(5, "minutes").format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: 50,
    });
    
    const nextAvail: iSlot = await sails.helpers.nextAvailableSlot.with({
      fulfilmentMethodIds: [vendorsDelvFulfMethod.id],
    });

    expect(nextAvail).to.have.property("startTime");
    expect(nextAvail).to.have.property("endTime");


    expect(stringifySlotWithTimes(nextAvail)).to.deep.equal({
      startTime: "12:30",
      endTime: "13:30",
    });
  });
  it("gets the following date's first slot as next slot when past cutoff", async () => {
    const { vendorsDelvFulfMethod, vendorsDeliveryOpeningHours, usedWeekdays } =
      await createVendorWithOpeningHours(
        fixtures,
        [
          new TimeWindow({
            startTime: "12:30",
            endTime: "16:30",
            date: moment.utc(),
          }),
        ],
        [tomorrowName, dayAfterTomorrowName]
      );

    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment.utc().add(-5, "minutes").format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: 50,
    });

    const nextAvail: iSlot = await sails.helpers.nextAvailableSlot.with({
      fulfilmentMethodIds: [vendorsDelvFulfMethod.id],
    });

    const weekdayToDtStr = getNextWeekday(dayAfterTomorrowName);
    expect(nextAvail).to.have.property("startTime");
    expect(nextAvail).to.have.property("endTime");
    expect(stringifySlotWithDate(nextAvail)).to.deep.equal({
      startTime: `${weekdayToDtStr} 12:30`,
      endTime: `${weekdayToDtStr} 13:30`,
    });
  });
  it("gets the second hourly slot as next slot when first slot has ready orderMaxCount", async () => {
    const { vendorsDelvFulfMethod, vendorsDeliveryOpeningHours, usedWeekdays } =
      await createVendorWithOpeningHours(
        fixtures,
        [
          new TimeWindow({
            startTime: "12:30",
            endTime: "14:30",
            date: moment.utc(),
          }),
        ],
        [tomorrowName, dayAfterTomorrowName]
      );

    const MAX_ORDERS = 2;
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment.utc().add(5, "minutes").format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: MAX_ORDERS,
    });

    const forDate = getNextWeekday(tomorrowName);
    const _availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with(
      {
        date: forDate,
        fulfilmentMethodId: vendorsDelvFulfMethod.id,
      }
    );
    expect(_availableSlots).to.have.lengthOf(2);

    const firstAvailableSlot = _availableSlots.map(
      (slot) =>
        new TimeWindow({
          startTime: slot.startTime.format(timeStrFormat),
          endTime: slot.endTime.format(timeStrFormat),
          date: moment.utc(forDate, dateStrFormat),
        })
    )[0];

    // create orders on a slot against the vendors fulfilment method
    const { orders } = await createOrdersForSlot(
      fixtures,
      firstAvailableSlot,
      vendorsDelvFulfMethod.id,
      MAX_ORDERS,
      {
        restaurantAcceptanceStatus: "accepted",
      }
    );
    assert.lengthOf(orders, 2);

    const nextAvail: iSlot = await sails.helpers.nextAvailableSlot.with({
      fulfilmentMethodIds: [vendorsDelvFulfMethod.id],
    });

    const weekdayToDtStr = getNextWeekday(tomorrowName);
    expect(nextAvail).to.have.property("startTime");
    expect(nextAvail).to.have.property("endTime");
    expect(stringifySlotWithDate(nextAvail)).to.deep.equal({
      startTime: `${weekdayToDtStr} 13:30`,
      endTime: `${weekdayToDtStr} 14:30`,
    });
  });
  it("gets the first hourly slot on following available date as next slot when first slot has ready orderMaxCount", async () => {
    const { vendorsDelvFulfMethod, vendorsDeliveryOpeningHours, usedWeekdays } =
      await createVendorWithOpeningHours(
        fixtures,
        [
          new TimeWindow({
            startTime: "12:30",
            endTime: "14:30",
            date: moment.utc(),
          }),
        ],
        [tomorrowName, dayAfterTomorrowName]
      );

    const MAX_ORDERS = 1;
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment.utc().add(5, "minutes").format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: MAX_ORDERS,
    });

    const forDate = getNextWeekday(tomorrowName);
    const _availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with(
      {
        date: forDate,
        fulfilmentMethodId: vendorsDelvFulfMethod.id,
      }
    );
    expect(_availableSlots).to.have.lengthOf(2);

    const firstAvailableSlot = _availableSlots.map(
        (slot) =>
          new TimeWindow({
            startTime: slot.startTime.format(timeStrFormat),
            endTime: slot.endTime.format(timeStrFormat),
            date: moment.utc(forDate, dateStrFormat),
          })
    )[0];
    const secondAvailableSlot = _availableSlots.map(
        (slot) =>
          new TimeWindow({
            startTime: slot.startTime.format(timeStrFormat),
            endTime: slot.endTime.format(timeStrFormat),
            date: moment.utc(forDate, dateStrFormat),
          })
    )[1];

    // create orders on a slot against the vendors fulfilment method
    await createOrdersForSlot(
      fixtures,
      firstAvailableSlot,
      vendorsDelvFulfMethod.id,
      MAX_ORDERS + 1,
      {
        restaurantAcceptanceStatus: "accepted",
      }
    );
    await createOrdersForSlot(
      fixtures,
      secondAvailableSlot,
      vendorsDelvFulfMethod.id,
      MAX_ORDERS + 1,
      {
        restaurantAcceptanceStatus: "accepted",
      }
    );

    const nextAvail: iSlot = await sails.helpers.nextAvailableSlot.with({
      fulfilmentMethodIds: [vendorsDelvFulfMethod.id],
    });
    
    const weekdayToDtStr = getNextWeekday(tomorrowName);
    const nextWeekdayToDtStr = getNextWeekday(dayAfterTomorrowName);

    assert.isDefined(nextAvail, "Should be able to pull slots from day after, if first available date has all slots full of orders");
    assert.isNotNull(nextAvail, "Should be able to pull slots from day after, if first available date has all slots full of orders");
    expect(nextAvail).to.have.property("startTime");
    expect(nextAvail).to.have.property("endTime");
    expect(stringifySlotWithDate(nextAvail)).to.deep.equal({
      startTime: `${nextWeekdayToDtStr} 12:30`,
      endTime: `${nextWeekdayToDtStr} 13:30`,
    });
  });
  it("gets next availailable intersecting slot between vendor and their delivery partner", async () => {
    console.warn('IMPLEMENT THIS TEST');
  });
});

describe("Can process overlaps between vendors and their delivery partner's open hours correctly", () => {
  const todayName = getTodayDayName(0);
  const tomorrowName = getTodayDayName(1);
  const dayAfterTomorrowName = getTodayDayName(2);
  it("check intersecting slots are returned when vendor's deliveryPartner's fulfilmentMethod's Opening hours for tomorrow only overlap an hour of the vendors opening hours", async () => {
    const SLOT_LENGTH = 60;
    const {
      deliveryPartner,
      deliveryPartnersDelvFulfMethod,
      deliveryPartnerDeliveryOpeningHours,
      usedWeekdaysForDeliveryPartner,
    } = await createDeliveryPartnerWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "11:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName]
    );
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const {
      vendor,
      vendorsDelvFulfMethod,
      vendorsDeliveryOpeningHours,
      usedWeekdays,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "12:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName],
      [],
      deliveryPartner.id
    );
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const availableSlot: iSlot = await sails.helpers.nextAvailableSlot.with(
      {
        fulfilmentMethodIds: [
          vendorsDelvFulfMethod.id,
          deliveryPartnersDelvFulfMethod.id,
        ],
      }
    );

    // Check returns first overlapping slot only that works for deliverypartner too
    expect(availableSlot).to.have.property("startTime");
    expect(availableSlot).to.have.property("endTime");

    const expected = stringifySlotWithTimes(availableSlot);
    expect(expected).to.deep.equal({
      startTime: "10:00",
      endTime: "11:00",
    });
  });
  it("check intersecting slots (2) are returned when vendor's deliveryPartner's fulfilmentMethod's Opening hours for tomorrow only overlap an hour of the vendors opening hours", async () => {
    const SLOT_LENGTH = 30;
    const {
      deliveryPartner,
      deliveryPartnersDelvFulfMethod,
      deliveryPartnerDeliveryOpeningHours,
      usedWeekdaysForDeliveryPartner,
    } = await createDeliveryPartnerWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "11:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName]
    );
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const {
      vendor,
      vendorsDelvFulfMethod,
      vendorsDeliveryOpeningHours,
      usedWeekdays,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "12:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName],
      [],
      deliveryPartner.id
    );
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const availableSlot: iSlot = await sails.helpers.nextAvailableSlot.with(
      {
        fulfilmentMethodIds: [
          vendorsDelvFulfMethod.id,
          deliveryPartnersDelvFulfMethod.id,
        ],
      }
    );

    // Check returns first overlapping slot only that works for deliverypartner too
    expect(availableSlot).to.have.property("startTime");
    expect(availableSlot).to.have.property("endTime");

    const expected = stringifySlotWithTimes(availableSlot);
    expect(expected).to.deep.equal({
      startTime: "10:00",
      endTime: "10:30",
    });
  });
  it("check that WHEN DP HAS MAX ORDERS SET, it DOES remove that slot from available slots", async () => {
    const SLOT_LENGTH = 60;
    const {
      deliveryPartner,
      deliveryPartnersDelvFulfMethod,
      deliveryPartnerDeliveryOpeningHours,
      usedWeekdaysForDeliveryPartner,
    } = await createDeliveryPartnerWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "12:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName]
    );
    const MAX_ORDERS = 1;
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: MAX_ORDERS,
    });

    const {
      vendor,
      vendorsDelvFulfMethod,
      vendorsDeliveryOpeningHours,
      usedWeekdays,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "12:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName],
      [],
      deliveryPartner.id
    );
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const forDate = getNextWeekday(tomorrowName);
    const { orders } = await createOrdersForSlot(
      fixtures,
      new TimeWindow({
        startTime: moment.utc(
          `${forDate} 10:00`,
          `${dateStrFormat} ${timeStrFormat}`
        ),
        endTime: moment.utc(
          `${forDate} 11:00`,
          `${dateStrFormat} ${timeStrFormat}`
        ),
      }),
      deliveryPartnersDelvFulfMethod.id,
      MAX_ORDERS
    ); // * FYI - we should never be setting orders on the delivery partner anyway

    const availableSlot: iSlot = await sails.helpers.nextAvailableSlot.with({
      fulfilmentMethodIds: [
        vendorsDelvFulfMethod.id,
        deliveryPartnersDelvFulfMethod.id,
      ],
    });

    // Check returns first overlapping slot only that works for deliverypartner too
    expect(availableSlot).to.have.property("startTime");
    expect(availableSlot).to.have.property("endTime");

    const expectDate = getNextWeekday(tomorrowName);
    const expected = stringifySlotWithDate(availableSlot);
    expect(expected).to.deep.equal({
      startTime: `${expectDate} 11:00`,
      endTime: `${expectDate} 12:00`,
    });
  });
  it("check that WHEN DP has 10 -> 11, Vendor 10 -> 12 but also maxOrders on vendors 10->11 slot has been reached -> following day 10 -> 11,", async () => {
    const SLOT_LENGTH = 60;
    const {
      deliveryPartner,
      deliveryPartnersDelvFulfMethod,
      deliveryPartnerDeliveryOpeningHours,
      usedWeekdaysForDeliveryPartner,
    } = await createDeliveryPartnerWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "11:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName]
    );
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const {
      vendor,
      vendorsDelvFulfMethod,
      vendorsDeliveryOpeningHours,
      usedWeekdays,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "12:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName],
      [],
      deliveryPartner.id
    );

    //Add 1 order to slot for vendor, not deliveryPartner
    const MAX_ORDERS = 1;
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: MAX_ORDERS,
    });
    // create orders on a slot against the vendors fulfilment method
    const forDate = getNextWeekday(tomorrowName);
    const { orders } = await createOrdersForSlot(
      fixtures,
      new TimeWindow({
        startTime: moment.utc(
          `${forDate} 10:00`,
          `${dateStrFormat} ${timeStrFormat}`
        ),
        endTime: moment.utc(
          `${forDate} 11:00`,
          `${dateStrFormat} ${timeStrFormat}`
        ),
      }),
      vendorsDelvFulfMethod.id,
      MAX_ORDERS
    );

    const availableSlot: iSlot = await sails.helpers.nextAvailableSlot.with({
      fulfilmentMethodIds: [
        vendorsDelvFulfMethod.id,
        deliveryPartnersDelvFulfMethod.id,
      ],
    });

    // Check returns first overlapping slot only that works for deliverypartner too
    expect(availableSlot).to.have.property("startTime");
    expect(availableSlot).to.have.property("endTime");

    const expectDate = getNextWeekday(dayAfterTomorrowName);
    const expected = stringifySlotWithDate(availableSlot);
    expect(expected).to.deep.equal({
      startTime: `${expectDate} 10:00`,
      endTime: `${expectDate} 11:00`,
    });
  });
  it("check returned slots are atleast as narrow as the narrowest fulfilmentSlot to account for maxOrders reached on a slot", async () => {
    const {
      deliveryPartner,
      deliveryPartnersDelvFulfMethod,
      deliveryPartnerDeliveryOpeningHours,
      usedWeekdaysForDeliveryPartner,
    } = await createDeliveryPartnerWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "11:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName]
    );
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: 50,
    });

    const {
      vendor,
      vendorsDelvFulfMethod,
      vendorsDeliveryOpeningHours,
      usedWeekdays,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:15",
          endTime: "11:45",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName],
      [],
      deliveryPartner.id
    );
    const MAX_ORDERS_VENDOR = 2;
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: 30,
      bufferLength: 30,
      maxOrders: MAX_ORDERS_VENDOR,
    });

    const forDate = getNextWeekday(tomorrowName);
    const { orders } = await createOrdersForSlot(
      fixtures,
      new TimeWindow({
        startTime: moment.utc(
          `${forDate} 10:45`,
          `${dateStrFormat} ${timeStrFormat}`
        ),
        endTime: moment.utc(
          `${forDate} 11:15`,
          `${dateStrFormat} ${timeStrFormat}`
        ),
      }),
      vendorsDelvFulfMethod.id,
      MAX_ORDERS_VENDOR
    );

    const availableSlot: iSlot = await sails.helpers.nextAvailableSlot.with({
      fulfilmentMethodIds: [
        vendorsDelvFulfMethod.id,
        deliveryPartnersDelvFulfMethod.id,
      ],
    });

    // Check returns first overlapping slot only that works for deliverypartner too
    expect(availableSlot).to.have.property("startTime");
    expect(availableSlot).to.have.property("endTime");

    const expectDate = getNextWeekday(tomorrowName);
    const expected = stringifySlotWithDate(availableSlot);
    expect(expected).to.deep.equal(
      {
        startTime: `${expectDate} 10:15`,
        endTime: `${expectDate} 10:45`,
      }
    );
  });
  it("check returned slots are atleast as narrow as narrower of delivery partner (30 minutes) and vendor slots (60 minutes)", async () => {
    const {
      deliveryPartner,
      deliveryPartnersDelvFulfMethod,
      deliveryPartnerDeliveryOpeningHours,
      usedWeekdaysForDeliveryPartner,
    } = await createDeliveryPartnerWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "11:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName]
    );
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: 50,
    });

    const {
      vendor,
      vendorsDelvFulfMethod,
      vendorsDeliveryOpeningHours,
      usedWeekdays,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "12:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName],
      [],
      deliveryPartner.id
    );
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: 30,
      bufferLength: 30,
      maxOrders: 50,
    });

    const availableSlot: iSlot = await sails.helpers.nextAvailableSlot.with({
      fulfilmentMethodIds: [
        vendorsDelvFulfMethod.id,
        deliveryPartnersDelvFulfMethod.id,
      ],
    });

    // Check returns first overlapping slot only that works for deliverypartner too
    expect(availableSlot).to.have.property("startTime");
    expect(availableSlot).to.have.property("endTime");

    const expectDate = getNextWeekday(tomorrowName);
    const expected = stringifySlotWithDate(availableSlot);
    expect(expected).to.deep.equal({
      startTime: `${expectDate} 10:00`,
      endTime: `${expectDate} 10:30`,
    });
  });
  it("check no slots are returned when vendor & vendor's deliveryPartner opening hours do not overlap", async () => {
    const {
      deliveryPartner,
      deliveryPartnersDelvFulfMethod,
      deliveryPartnerDeliveryOpeningHours,
      usedWeekdaysForDeliveryPartner,
    } = await createDeliveryPartnerWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "10:00",
          endTime: "11:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName]
    );
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: 50,
    });

    const {
      vendor,
      vendorsDelvFulfMethod,
      vendorsDeliveryOpeningHours,
      usedWeekdays,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "11:00",
          endTime: "12:00",
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName],
      [],
      deliveryPartner.id
    );
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: 50,
    });

    const availableSlot: iSlot = await sails.helpers.nextAvailableSlot.with({
      fulfilmentMethodIds: [
        vendorsDelvFulfMethod.id,
        deliveryPartnersDelvFulfMethod.id,
      ],
    });

    // Check returns first overlapping slot only that works for deliverypartner too
    assert.isUndefined(availableSlot);
    // assert.isObject(availableSlot);
    // assert.isEmpty(availableSlot);
  });
});
