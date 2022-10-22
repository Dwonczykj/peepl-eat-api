import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
// import util from "util";
import moment from "moment";
const { fixtures } = require("../../../../scripts/build_db.js");
import { HttpAuthTestSenderVendor } from "../../controllers/vendors/defaultVendor.js";
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
} from "../../../../scripts/utils";
import {
  DaysOfWeek,
  iSlot,
  TimeWindow,
} from "../../../../api/interfaces/vendors/slot";
import { GetFulilmentSlotsSuccess } from "../../../../api/controllers/vendors/get-fulfilment-slots";
import {
  createVendorWithOpeningHours,
  createDeliveryPartnerWithOpeningHours,
  createOrdersForSlot,
  stringifySlotsHttpResponse,
  stringifySlot,
  stringifySlotWithDate,
} from "../../helpers/db-utils";
import { AvailableDateOpeningHours } from "../../../../api/helpers/get-available-dates.js";

declare var Order: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;

type GetFulilmentSlotsSuccessHttp = {
  collectionMethod: FulfilmentMethodType;
  deliveryMethod: FulfilmentMethodType;
  collectionSlots: { startTime: string; endTime: string }[];
  deliverySlots: { startTime: string; endTime: string }[];
  eligibleCollectionDates: AvailableDateOpeningHours;
  eligibleDeliveryDates: AvailableDateOpeningHours;
};

class CAN_GET_VENDORS_FULFILMENT_SLOTS {
  static readonly useAccount: "TEST_VENDOR" = "TEST_VENDOR";
  static readonly HTTP_TYPE: "get" = "get";
  static readonly ACTION_PATH: "vendors" = "vendors";
  static readonly ACTION_NAME: "get-fulfilment-slots" = "get-fulfilment-slots";
  static readonly EXPECT_STATUS_CODE: 200 = 200;

  constructor() {}

  async init(fixtures) {
    const dayOfWeek = "thursday";
    // const todayName = getTodayDayName(0);
    const tomorrowName = getTodayDayName(1);
    const dayAfterTomorrowName = getTodayDayName(2);
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
          startTime: "09:00",
          endTime: "17:00",
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
      vendorsColnFulfMethod,
      vendorsDeliveryOpeningHours,
      vendorsCollectionOpeningHours,
      usedWeekdays,
      usedWeekdaysForVendorDelivery,
      usedWeekdaysVendorCollection,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "09:00",
          endTime: "17:00",
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
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const fulfilmentMethodVendor: FulfilmentMethodType =
      await FulfilmentMethod.findOne(vendorsDelvFulfMethod.id).populate(
        "deliveryPartner&vendor"
      );
    const fulfilmentMethodDeliveryPartner: FulfilmentMethodType =
      await FulfilmentMethod.findOne(
        deliveryPartnersDelvFulfMethod.id
      ).populate("deliveryPartner&vendor");

    assert.isDefined(fulfilmentMethodVendor);
    assert.isDefined(fulfilmentMethodDeliveryPartner);
    assert.isObject(fulfilmentMethodVendor);
    assert.isObject(fulfilmentMethodDeliveryPartner);
    expect(fulfilmentMethodVendor).to.have.property("vendor");
    expect(fulfilmentMethodDeliveryPartner).to.have.property("deliveryPartner");

    return {
      useAccount: CAN_GET_VENDORS_FULFILMENT_SLOTS.useAccount,
      HTTP_TYPE: CAN_GET_VENDORS_FULFILMENT_SLOTS.HTTP_TYPE,
      ACTION_PATH: CAN_GET_VENDORS_FULFILMENT_SLOTS.ACTION_PATH,
      ACTION_NAME: CAN_GET_VENDORS_FULFILMENT_SLOTS.ACTION_NAME,
      sendData: {
        vendor: vendor.id,
        date: getNextWeekday(dayOfWeek),
      },
      expectResponse: {},
      expectStatusCode: CAN_GET_VENDORS_FULFILMENT_SLOTS.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: GetFulilmentSlotsSuccessHttp },
        requestPayload
      ) => {
        expect(response.body).to.have.property("collectionMethod");
        expect(response.body.collectionMethod).to.have.property("methodType");
        expect(response.body.collectionMethod.methodType).to.equal(
          "collection"
        );
        expect(response.body).to.have.property("deliveryMethod");
        expect(response.body.deliveryMethod).to.have.property("methodType");
        expect(response.body.deliveryMethod.methodType).to.equal("delivery");

        expect(response.body).to.have.property("collectionSlots");
        expect(response.body).to.have.property("deliverySlots");

        expect(response.body).to.have.property("eligibleCollectionDates");
        assert.isNotEmpty(response.body.eligibleCollectionDates);
        assert.isObject(response.body.eligibleCollectionDates);
        expect(response.body).to.have.property("eligibleDeliveryDates");
        assert.isNotEmpty(response.body.eligibleDeliveryDates);
        assert.isObject(response.body.eligibleDeliveryDates);

        //Todo: TEST if we can handle special dates

        const availableDatesForDelivery = Object.keys(
          response.body.eligibleDeliveryDates
        );
        const availableDatesForCollection = Object.keys(
          response.body.eligibleCollectionDates
        );

        const removeToday = moment.utc().format(dateStrFormat);
        const removeTomorrow = moment //* also remove for when past cutoff
          .utc()
          .add(1, "days")
          .format(dateStrFormat);
        const expectAvailDateStrsVendDelv = usedWeekdaysForVendorDelivery
          .map((wd) => getNextWeekday(wd as DaysOfWeek))
          .filter((dt) => dt !== removeToday);

        expect(availableDatesForDelivery).to.deep.equal(
          expectAvailDateStrsVendDelv
        );

        const expectAvailDateStrsVendColn = usedWeekdaysVendorCollection
          .map((wd) => getNextWeekday(wd as DaysOfWeek))
          .filter((dt) => dt !== removeToday);

        expect(availableDatesForCollection).to.deep.equal(
          expectAvailDateStrsVendColn
        );

        return;
      },
    };
  }
}
class CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS {
  static readonly useAccount: "TEST_VENDOR" = "TEST_VENDOR";
  static readonly HTTP_TYPE: "get" = "get";
  static readonly ACTION_PATH: "vendors" = "vendors";
  static readonly ACTION_NAME: "get-fulfilment-slots" = "get-fulfilment-slots";
  static readonly EXPECT_STATUS_CODE: 404 = 404;

  constructor() {}

  async init(fixtures) {
    const dayOfWeek = "thursday";
    // const todayName = getTodayDayName(0);
    const tomorrowName = getTodayDayName(1);
    const dayAfterTomorrowName = getTodayDayName(2);
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
          startTime: "09:00",
          endTime: "17:00",
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
      vendorsColnFulfMethod,
      vendorsDeliveryOpeningHours,
      vendorsCollectionOpeningHours,
      usedWeekdays,
      usedWeekdaysForVendorDelivery,
      usedWeekdaysVendorCollection,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "09:00",
          endTime: "17:00",
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
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const fulfilmentMethodVendor: FulfilmentMethodType =
      await FulfilmentMethod.findOne(vendorsDelvFulfMethod.id).populate(
        "deliveryPartner&vendor"
      );
    const fulfilmentMethodDeliveryPartner: FulfilmentMethodType =
      await FulfilmentMethod.findOne(
        deliveryPartnersDelvFulfMethod.id
      ).populate("deliveryPartner&vendor");

    assert.isDefined(fulfilmentMethodVendor);
    assert.isDefined(fulfilmentMethodDeliveryPartner);
    assert.isObject(fulfilmentMethodVendor);
    assert.isObject(fulfilmentMethodDeliveryPartner);
    expect(fulfilmentMethodVendor).to.have.property("vendor");
    expect(fulfilmentMethodDeliveryPartner).to.have.property("deliveryPartner");

    return {
      useAccount: CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS.useAccount,
      HTTP_TYPE: CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS.HTTP_TYPE,
      ACTION_PATH: CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS.ACTION_PATH,
      ACTION_NAME: CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS.ACTION_NAME,
      sendData: {
        vendor: 99999,
        date: getNextWeekday(dayOfWeek),
      },
      expectResponse: {},
      expectStatusCode:
        CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: GetFulilmentSlotsSuccessHttp },
        requestPayload
      ) => {
        // nothing expected as 404
        return;
      },
    };
  }
}
class NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES {
  static readonly useAccount: "TEST_VENDOR" = "TEST_VENDOR";
  static readonly HTTP_TYPE: "get" = "get";
  static readonly ACTION_PATH: "vendors" = "vendors";
  static readonly ACTION_NAME: "get-fulfilment-slots" = "get-fulfilment-slots";
  static readonly EXPECT_STATUS_CODE: 200 = 200;

  constructor() {}

  async init(fixtures) {
    const dayOfWeek = "thursday";
    // const todayName = getTodayDayName(0);
    const tomorrowName = getTodayDayName(1);
    const dayAfterTomorrowName = getTodayDayName(2);
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
          startTime: "09:00",
          endTime: "17:00",
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
      vendorsColnFulfMethod,
      vendorsDeliveryOpeningHours,
      vendorsCollectionOpeningHours,
      usedWeekdays,
      usedWeekdaysForVendorDelivery,
      usedWeekdaysVendorCollection,
    } = await createVendorWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: "09:00",
          endTime: "17:00",
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
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const fulfilmentMethodVendor: FulfilmentMethodType =
      await FulfilmentMethod.findOne(vendorsDelvFulfMethod.id).populate(
        "deliveryPartner&vendor"
      );
    const fulfilmentMethodDeliveryPartner: FulfilmentMethodType =
      await FulfilmentMethod.findOne(
        deliveryPartnersDelvFulfMethod.id
      ).populate("deliveryPartner&vendor");

    assert.isDefined(fulfilmentMethodVendor);
    assert.isDefined(fulfilmentMethodDeliveryPartner);
    assert.isObject(fulfilmentMethodVendor);
    assert.isObject(fulfilmentMethodDeliveryPartner);
    expect(fulfilmentMethodVendor).to.have.property("vendor");
    expect(fulfilmentMethodDeliveryPartner).to.have.property("deliveryPartner");

    return {
      useAccount: NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES.useAccount,
      HTTP_TYPE: NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES.HTTP_TYPE,
      ACTION_PATH: NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES.ACTION_PATH,
      ACTION_NAME: NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES.ACTION_NAME,
      sendData: {
        vendor: vendor.id,
        date: "2022-10-06",
      },
      expectResponse: {},
      expectStatusCode: NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: GetFulilmentSlotsSuccessHttp },
        requestPayload
      ) => {
        expect(response.body).to.have.property("collectionMethod");
        expect(response.body.collectionMethod).to.have.property("methodType");
        expect(response.body.collectionMethod.methodType).to.equal(
          "collection"
        );
        expect(response.body).to.have.property("deliveryMethod");
        expect(response.body.deliveryMethod).to.have.property("methodType");
        expect(response.body.deliveryMethod.methodType).to.equal("delivery");

        expect(response.body).to.have.property("collectionSlots");
        assert.isArray(response.body.collectionSlots);
        assert.isEmpty(response.body.collectionSlots);

        expect(response.body).to.have.property("deliverySlots");
        assert.isArray(response.body.deliverySlots);
        assert.isEmpty(response.body.deliverySlots);

        expect(response.body).to.have.property("eligibleDeliveryDates");
        // assert.isEmpty(response.body.eligibleDeliveryDates);

        expect(response.body).to.have.property("eligibleCollectionDates");
        // assert.isEmpty(response.body.eligibleCollectionDates);

        return;
      },
    };
  }
}
class NO_SLOTS_WHEN_VENDOR_AND_DP_DONT_OVERLAP {
  static readonly useAccount: "TEST_USER" = "TEST_USER";
  static readonly HTTP_TYPE: "get" = "get";
  static readonly ACTION_PATH: "vendors" = "vendors";
  static readonly ACTION_NAME: "get-fulfilment-slots" = "get-fulfilment-slots";
  static readonly EXPECT_STATUS_CODE: 200 = 200;

  constructor() {}

  async init(fixtures) {
    return {
      useAccount: NO_SLOTS_WHEN_VENDOR_AND_DP_DONT_OVERLAP.useAccount,
      HTTP_TYPE: NO_SLOTS_WHEN_VENDOR_AND_DP_DONT_OVERLAP.HTTP_TYPE,
      ACTION_PATH: NO_SLOTS_WHEN_VENDOR_AND_DP_DONT_OVERLAP.ACTION_PATH,
      ACTION_NAME: NO_SLOTS_WHEN_VENDOR_AND_DP_DONT_OVERLAP.ACTION_NAME,
      sendData: {
        vendor: null,
        date: null,
      },
      expectResponse: {},
      expectStatusCode:
        NO_SLOTS_WHEN_VENDOR_AND_DP_DONT_OVERLAP.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: GetFulilmentSlotsSuccessHttp },
        requestPayload
      ) => {
        return;
      },
    };
  }
}
class TEST_WHEN_VENDOR_AND_DP_OVERLAP {
  static readonly useAccount: "TEST_USER" = "TEST_USER";
  static readonly HTTP_TYPE: "get" = "get";
  static readonly ACTION_PATH: "vendors" = "vendors";
  static readonly ACTION_NAME: "get-fulfilment-slots" = "get-fulfilment-slots";
  static readonly EXPECT_STATUS_CODE: 200 = 200;

  constructor() {}

  async init(fixtures) {
    return {
      useAccount: TEST_WHEN_VENDOR_AND_DP_OVERLAP.useAccount,
      HTTP_TYPE: TEST_WHEN_VENDOR_AND_DP_OVERLAP.HTTP_TYPE,
      ACTION_PATH: TEST_WHEN_VENDOR_AND_DP_OVERLAP.ACTION_PATH,
      ACTION_NAME: TEST_WHEN_VENDOR_AND_DP_OVERLAP.ACTION_NAME,
      sendData: {
        vendor: null,
        date: null,
      },
      expectResponse: {},
      expectStatusCode: TEST_WHEN_VENDOR_AND_DP_OVERLAP.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: GetFulilmentSlotsSuccessHttp },
        requestPayload
      ) => {
        return;
      },
    };
  }
}


describe(`${
  CAN_GET_VENDORS_FULFILMENT_SLOTS.ACTION_NAME
}() returns a 200 with json when authenticated`, () => {
  it("Returns All Fulfilment Slots for a given vendor", async () => {
    try {
      const _hatsInit = await new CAN_GET_VENDORS_FULFILMENT_SLOTS().init(
        fixtures
      );
      const hats = new HttpAuthTestSenderVendor(_hatsInit);
      const response = await hats.makeAuthCallWith({}, []);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${
  CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS.ACTION_NAME
}() returns nothing for unknown vendor id`, () => {
  it("Returns a 404", async () => {
    try {
      const _hatsInit =
        await new CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS().init(fixtures);
      const hats = new HttpAuthTestSenderVendor(_hatsInit);
      const response = await hats.makeAuthCallWith({}, []);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${
  NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES.ACTION_NAME
}() returns a 200 with no available slots returned for past dates`, () => {
  it("Returns All Fulfilment Slots for a given vendor", async () => {
    try {
      const _hatsInit = await new NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES().init(
        fixtures
      );
      const hats = new HttpAuthTestSenderVendor(_hatsInit);
      const response = await hats.makeAuthCallWith({}, []);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});

describe("Can process overlaps between vendors and their delivery partner's open hours correctly", async () => {
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
      vendorsColnFulfMethod,
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
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const _hatsInit = await new TEST_WHEN_VENDOR_AND_DP_OVERLAP().init(
      fixtures
    );
    const hats = new HttpAuthTestSenderVendor(_hatsInit);
    const response: { body: GetFulilmentSlotsSuccessHttp } =
      await hats.makeAuthCallWith(
        {
          date: getNextWeekday(tomorrowName),
          vendor: vendor.id,
        },
        []
      );
    await hats.expectedResponse.checkResponse(response);

    // Check returns first overlapping slot only that works for deliverypartner too
    assert.isArray(response.body.deliverySlots);
    assert.isArray(response.body.collectionSlots);

    assert.isNotEmpty(response.body.deliverySlots);
    expect(response.body.deliverySlots[0]).to.have.property('startTime');
    expect(response.body.deliverySlots[0]).to.have.property('endTime');
    assert.isNotEmpty(response.body.collectionSlots);
    expect(response.body.collectionSlots[0]).to.have.property("startTime");
    expect(response.body.collectionSlots[0]).to.have.property("endTime");

    expect(
      stringifySlotsHttpResponse(response.body.deliverySlots)
    ).to.deep.equal([
      {
        startTime: "10:00",
        endTime: "11:00",
      },
    ]);
    expect(stringifySlotsHttpResponse(response.body.collectionSlots)).to.deep.equal([
      {
        startTime: "10:00",
        endTime: "11:00",
      },
      {
        startTime: "11:00",
        endTime: "12:00",
      },
    ]);
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
      vendorsColnFulfMethod,
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
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, "minutes")
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const _hatsInit = await new TEST_WHEN_VENDOR_AND_DP_OVERLAP().init(
      fixtures
    );
    const hats = new HttpAuthTestSenderVendor(_hatsInit);
    const response: { body: GetFulilmentSlotsSuccessHttp } =
      await hats.makeAuthCallWith(
        {
          date: getNextWeekday(tomorrowName),
          vendor: vendor.id,
        },
        []
      );
    await hats.expectedResponse.checkResponse(response);

    // Check returns first overlapping slot only that works for deliverypartner too
    assert.isArray(response.body.deliverySlots);
    assert.isArray(response.body.collectionSlots);

    expect(stringifySlotsHttpResponse(response.body.deliverySlots)).to.deep.equal([
      {
        startTime: "10:00",
        endTime: "10:30",
      },
      {
        startTime: "10:30",
        endTime: "11:00",
      },
    ]);
    expect(stringifySlotsHttpResponse(response.body.collectionSlots)).to.deep.equal([
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
});
