import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { login } = require("../../utils");
import util from "util";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
const { fixtures } = require("../../../scripts/build_db.js");
import {
  DEFAULT_NEW_VENDOR_OBJECT,
} from "../controllers/vendors/defaultVendor";
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
import { iSlot, TimeWindow } from "../../../api/interfaces/vendors/slot";
import { DaysOfWeek } from "../../../scripts/DaysOfWeek";
import { createVendorWithOpeningHours, createDeliveryPartnerWithOpeningHours, createOrdersForSlot } from "./db-utils";
import { stringifySlots } from "../../../scripts/stringifySlot";

declare var Order: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;


describe("helpers.getAvailableSlots()", async () => {
  const todayName = getTodayDayName(0);
  const tomorrowName = getTodayDayName(1);
  const dayAfterTomorrowName = getTodayDayName(2);

  it(`can get available slots for this coming ${tomorrowName} for new vendor`, async () => {
    // const response = await login();
    // const user = await User.findOne({ name: response.body.name });
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

    const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
      date: getNextWeekday(tomorrowName),
      fulfilmentMethodId: vendorsDelvFulfMethod.id,
    });

    assert.isArray(availableSlots);

    expect(stringifySlots(availableSlots)).to.deep.equal([
      {
        startTime: "12:30",
        endTime: "13:30",
      },
      {
        startTime: "13:30",
        endTime: "14:30",
      },
      {
        startTime: "14:30",
        endTime: "15:30",
      },
      {
        startTime: "15:30",
        endTime: "16:30",
      },
    ]);
  });
  it(`it returns 4 30m slots for ${tomorrowName}`, async () => {
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

    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: 30,
      bufferLength: 30,
      maxOrders: 50,
    });

    const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
      date: getNextWeekday(tomorrowName),
      fulfilmentMethodId: vendorsDelvFulfMethod.id,
    });

    // Check returns all 4 slots
    assert.isArray(availableSlots);

    expect(stringifySlots(availableSlots)).to.deep.equal([
      {
        startTime: "12:30",
        endTime: "13:00",
      },
      {
        startTime: "13:00",
        endTime: "13:30",
      },
      {
        startTime: "13:30",
        endTime: "14:00",
      },
      {
        startTime: "14:00",
        endTime: "14:30",
      },
    ]);
  });
  it(`it doesn't return any slots for tomorrow's (${tomorrowName}) date when past cutoff`, async () => {
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

    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment.utc().add(-5, "minutes").format(timeStrFormat),
      slotLength: 30,
      bufferLength: 30,
      maxOrders: 50,
    });

    const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
      date: getNextWeekday(tomorrowName),
      fulfilmentMethodId: vendorsDelvFulfMethod.id,
    });

    // Check returns all 4 slots
    assert.isArray(
      availableSlots,
      "available slots should be an empty array but still of type array"
    );
    assert.isEmpty(availableSlots, "available slots should be empty array");
  });
  it("it doesn't return slots on date when slot has surpassed max order count", async () => {
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

    // create orders on a slot against the vendors fulfilment method
    const { orders } = await createOrdersForSlot(
      fixtures,
      _availableSlots.map(
        (slot) =>
          new TimeWindow({
            startTime: slot.startTime.format(timeStrFormat),
            endTime: slot.endTime.format(timeStrFormat),
            date: moment.utc(forDate, dateStrFormat),
          })
      )[0],
      vendorsDelvFulfMethod.id,
      MAX_ORDERS
    );
    assert.lengthOf(orders, 2);

    const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
      date: forDate,
      fulfilmentMethodId: vendorsDelvFulfMethod.id,
    });

    // Check returns only second slot as first slot already contains maxOrders
    assert.isArray(availableSlots);

    expect(stringifySlots(availableSlots)).to.deep.equal([
      {
        startTime: "13:30",
        endTime: "14:30",
      },
    ]);
  });
  it("it returns slots for today when no cutoff on day before", async () => {
    const { vendorsDelvFulfMethod, vendorsDeliveryOpeningHours, usedWeekdays } =
      await createVendorWithOpeningHours(
        fixtures,
        [
          new TimeWindow({
            startTime: moment.utc().add(15, "minutes"),
            endTime: moment.utc().add(75, "minutes"), // 2 slots
          }),
        ],
        [todayName]
      );

    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: null,
      slotLength: 30,
      bufferLength: 0,
      maxOrders: 50,
    });

    const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
      date: getNextWeekday(todayName),
      fulfilmentMethodId: vendorsDelvFulfMethod.id,
    });

    // Check returns all 2 slots
    assert.isArray(availableSlots);
    expect(availableSlots).to.have.lengthOf(2);
  });
  it("it doesn't return slots that start within next <bufferLength> minutes", async () => {
    const BUFFER = 20;
    const SLOT_LENGTH = 30;
    const { vendorsDelvFulfMethod, vendorsDeliveryOpeningHours, usedWeekdays } =
      await createVendorWithOpeningHours(
        fixtures,
        [
          new TimeWindow({
            startTime: moment.utc().add(BUFFER / 2, "minutes"),
            endTime: moment.utc().add(BUFFER / 2 + SLOT_LENGTH, "minutes"), // 1 slot past buffer
          }),
        ],
        [todayName]
      );

    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: null,
      slotLength: SLOT_LENGTH,
      bufferLength: BUFFER,
      maxOrders: 50,
    });

    const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
      date: getNextWeekday(todayName),
      fulfilmentMethodId: vendorsDelvFulfMethod.id,
    });

    // Check returns all 4 slots
    assert.isArray(
      availableSlots,
      "available slots should be an empty array but still of type array"
    );
    assert.isEmpty(availableSlots, "available slots should be empty array");
  });
  // TODO MOVE ALL THESE TESTS BELOW TO controllers/vendors/get-available-slots
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

    const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
      date: getNextWeekday(tomorrowName),
      fulfilmentMethodId: vendorsDelvFulfMethod.id,
    });

    // Check returns first overlapping slot only that works for deliverypartner too
    assert.isArray(availableSlots);

    expect(stringifySlots(availableSlots)).to.deep.equal([
      {
        startTime: "10:00",
        endTime: "11:00",
      },
      {
        startTime: "11:00",
        endTime: "12:00",
      },
    ]); //get-available-slots only takes one fulfilment id, so does not consider another if a deliveryPartner for example is attached to vendor
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

    const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
      date: getNextWeekday(tomorrowName),
      fulfilmentMethodId: vendorsDelvFulfMethod.id,
    });

    // Check returns first overlapping slot only that works for deliverypartner too
    assert.isArray(availableSlots);

    // * get-available-slots only takes one fulfilment id, so does not consider another if a deliveryPartner for example is attached to vendor
    expect(stringifySlots(availableSlots)).to.deep.equal([
      {
        startTime: "10:00",
        endTime: "10:30",
      },
      {
        startTime: "10:30",
        endTime: "11:00",
      },
      {
        startTime: "11:00",
        endTime: "11:30",
      },
      {
        startTime: "11:30",
        endTime: "12:00",
      },
    ]);
  });
  it("check that WHEN DP HAS MAX ORDERS SET, it doesnt affect outcome as orders are counted by vendors deliveryFulfilmentEmthdo not the courier's", async () => {
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
          `${forDate} 10:00 +00:00`,
          `${dateStrFormat} ${timeStrTzFormat}`
        ),
        endTime: moment.utc(
          `${forDate} 11:00 +00:00`,
          `${dateStrFormat} ${timeStrTzFormat}`
        ),
      }),
      vendorsDelvFulfMethod.id,
      MAX_ORDERS
    );

    const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
      date: getNextWeekday(tomorrowName),
      fulfilmentMethodId: vendorsDelvFulfMethod.id,
    });

    // Check returns first overlapping slot only that works for deliverypartner too
    assert.isArray(availableSlots);

    expect(stringifySlots(availableSlots)).to.deep.equal(
      [
        {
          startTime: "11:00",
          endTime: "12:00",
        },
      ],
      "Should return 1 slot regardless of deliverypartner allowing 1 order per slot and there already being an order during this slot as order is registered against vendors delivery fulfilment method which has a higher maxOrders count."
    );
  });
  // it("check intersecting slots (2) are returned when vendor's deliveryPartner's fulfilmentMethod's Opening hours for tomorrow only overlap an hour of the vendors opening hours", async () => {
  //   const {
  //     deliveryPartner,
  //     deliveryPartnersDelvFulfMethod,
  //     deliveryPartnerDeliveryOpeningHours,
  //     usedWeekdaysForDeliveryPartner,
  //   } = await createDeliveryPartnerWithOpeningHours(
  //     fixtures,
  //     [
  //       new TimeWindow({
  //         startTime: "10:00",
  //         endTime: "11:00",
  //         date: moment.utc(),
  //       }),
  //     ],
  //     [tomorrowName, dayAfterTomorrowName]
  //   );
  //   await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
  //     orderCutoff: moment
  //       .utc()
  //       .add(+5, "minutes")
  //       .format(timeStrFormat),
  //     slotLength: 60,
  //     bufferLength: 30,
  //     maxOrders: 50,
  //   });

  //   const {
  //     vendor,
  //     vendorsDelvFulfMethod,
  //     vendorsDeliveryOpeningHours,
  //     usedWeekdays,
  //   } = await createVendorWithOpeningHours(
  //     fixtures,
  //     [
  //       new TimeWindow({
  //         startTime: "10:00",
  //         endTime: "12:00",
  //         date: moment.utc(),
  //       }),
  //     ],
  //     [tomorrowName, dayAfterTomorrowName],
  //     [],
  //     deliveryPartner.id
  //   );
  //   await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
  //     orderCutoff: moment
  //       .utc()
  //       .add(+5, "minutes")
  //       .format(timeStrFormat),
  //     slotLength: 30,
  //     bufferLength: 30,
  //     maxOrders: 50,
  //   });

  //   const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
  //     date: getNextWeekday(tomorrowName),
  //     fulfilmentMethodId: vendorsDelvFulfMethod.id,
  //   });

  //   // Check returns first overlapping slot only that works for deliverypartner too
  //   assert.isArray(availableSlots);

  //   expect(availableSlots).to.deep.equal([
  //     {
  //       startTime: "10:00",
  //       endTime: "11:00",
  //     },
  //   ], "Expect slots to be 60m slots as wider of 2 fulfilmentMethods is 60m vs 30m set on the vendor.");
  // });
  // it("check no slots are returned when vendor & vendor's deliveryPartner opening hours do not overlap", async () => {
  //   const {
  //     deliveryPartner,
  //     deliveryPartnersDelvFulfMethod,
  //     deliveryPartnerDeliveryOpeningHours,
  //     usedWeekdaysForDeliveryPartner,
  //   } = await createDeliveryPartnerWithOpeningHours(
  //     fixtures,
  //     [
  //       new TimeWindow({
  //         startTime: "10:00",
  //         endTime: "11:00",
  //         date: moment.utc(),
  //       }),
  //     ],
  //     [tomorrowName, dayAfterTomorrowName]
  //   );
  //   await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
  //     orderCutoff: moment
  //       .utc()
  //       .add(+5, "minutes")
  //       .format(timeStrFormat),
  //     slotLength: 60,
  //     bufferLength: 30,
  //     maxOrders: 50,
  //   });

  //   const {
  //     vendor,
  //     vendorsDelvFulfMethod,
  //     vendorsDeliveryOpeningHours,
  //     usedWeekdays,
  //   } = await createVendorWithOpeningHours(
  //     fixtures,
  //     [
  //       new TimeWindow({
  //         startTime: "11:00",
  //         endTime: "12:00",
  //         date: moment.utc(),
  //       }),
  //     ],
  //     [tomorrowName, dayAfterTomorrowName],
  //     [],
  //     deliveryPartner.id
  //   );
  //   await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
  //     orderCutoff: moment
  //       .utc()
  //       .add(+5, "minutes")
  //       .format(timeStrFormat),
  //     slotLength: 60,
  //     bufferLength: 30,
  //     maxOrders: 50,
  //   });

  //   const availableSlots: iSlot[] = await sails.helpers.getAvailableSlots.with({
  //     date: getNextWeekday(tomorrowName),
  //     fulfilmentMethodId: vendorsDelvFulfMethod.id,
  //   });

  //   // Check returns first overlapping slot only that works for deliverypartner too
  //   assert.isArray(availableSlots);
  //   assert.isEmpty(availableSlots);
  // });
});
