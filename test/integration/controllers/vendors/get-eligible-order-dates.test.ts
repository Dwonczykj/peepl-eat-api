import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
// import util from "util";
import moment from "moment";
const { fixtures } = require("../../../../scripts/build_db.js");
import {
  HttpAuthTestSenderVendor,
} from "../../controllers/vendors/defaultVendor";
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
  iSlot,
  TimeWindow,
} from "../../../../api/interfaces/vendors/slot";
import { DaysOfWeek } from "../../../../scripts/DaysOfWeek";
import { getEligibleOrderDatesSuccess } from "../../../../api/controllers/vendors/get-eligible-order-dates";
import {
  createVendorWithOpeningHours,
  createDeliveryPartnerWithOpeningHours,
  createOrdersForSlot,
} from "../../helpers/db-utils";
import {
  stringifySlots,
  stringifySlotWithTimes,
  stringifySlotWithDate
} from "../../../../scripts/stringifySlot";

declare var Order: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;

class CAN_GET_ELIGIBLE_DATES_AS_USER {
  static readonly useAccount: 'TEST_USER' = 'TEST_USER';
  static readonly HTTP_TYPE: 'get' = 'get';
  static readonly ACTION_PATH: 'vendors' = 'vendors';
  static readonly ACTION_NAME: 'get-eligible-order-dates' =
    'get-eligible-order-dates';
  static readonly ACTION_DESCRIPTION = 'Can get eligible order dates for vendor';
  static readonly EXPECT_STATUS_CODE: 200 = 200;

  constructor() {}

  async init(fixtures) {
    const dayOfWeek = 'thursday';
    const methodType = 'delivery';
    const todayName = getTodayDayName(0);
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
          startTime: '09:00',
          endTime: '17:00',
          date: moment.utc(),
        }),
      ],
      [tomorrowName, dayAfterTomorrowName]
    );
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
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
          startTime: '09:00',
          endTime: '17:00',
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
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    const fulfilmentMethodVendor: FulfilmentMethodType =
      await FulfilmentMethod.findOne(vendorsDelvFulfMethod.id).populate(
        'deliveryPartner&vendor'
      );
    const fulfilmentMethodDeliveryPartner: FulfilmentMethodType =
      await FulfilmentMethod.findOne(
        deliveryPartnersDelvFulfMethod.id
      ).populate('deliveryPartner&vendor');

    assert.isDefined(fulfilmentMethodVendor);
    assert.isDefined(fulfilmentMethodDeliveryPartner);
    assert.isObject(fulfilmentMethodVendor);
    assert.isObject(fulfilmentMethodDeliveryPartner);
    expect(fulfilmentMethodVendor).to.have.property('vendor');
    expect(fulfilmentMethodDeliveryPartner).to.have.property('deliveryPartner');

    return {
      useAccount: CAN_GET_ELIGIBLE_DATES_AS_USER.useAccount,
      HTTP_TYPE: CAN_GET_ELIGIBLE_DATES_AS_USER.HTTP_TYPE,
      ACTION_PATH: CAN_GET_ELIGIBLE_DATES_AS_USER.ACTION_PATH,
      ACTION_NAME: CAN_GET_ELIGIBLE_DATES_AS_USER.ACTION_NAME,
      sendData: {
        vendor: fulfilmentMethodVendor.vendor.id,
        deliveryPartner: fulfilmentMethodDeliveryPartner.deliveryPartner.id,
      },
      expectResponse: {},
      expectStatusCode: CAN_GET_ELIGIBLE_DATES_AS_USER.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: getEligibleOrderDatesSuccess },
        requestPayload
      ) => {
        expect(response.body).to.be.an('object').that.includes.all.keys([
          'collection',
          'delivery',
        ]);

        const availableDatesForDelivery = Object.keys(response.body.delivery);
        const availableDatesForCollection = Object.keys(
          response.body.collection
        );

        const removeToday = moment.utc().format(dateStrFormat);
        const removeTomorrow = moment //* also remove for when past cutoff
          .utc()
          .add(1, 'days')
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

class ELIGIBLE_DATES_ARE_INTERSECTION_OF_VENDORS_AND_VENDORS_DP {
  static readonly useAccount = 'TEST_USER';
  static readonly HTTP_TYPE = 'get';
  static readonly ACTION_PATH = 'vendors';
  static readonly ACTION_NAME =
    'get-eligible-order-dates';
  static readonly ACTION_DESCRIPTION = 'Gets Dates that satisfy both deliveryPartner and vendors dellivery opening hours';
  static readonly EXPECT_STATUS_CODE = 200;

  constructor() {}

  async init(fixtures) {
    const dayOfWeek = 'thursday';
    const methodType = 'delivery';
    const todayName = getTodayDayName(0);
    const tomorrowName = getTodayDayName(1);
    const dayAfterTomorrowName = getTodayDayName(2);
    const nextThursdayDate = getNextWeekday('thursday', true);
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
          startTime: '15:00',
          endTime: '17:00',
          date: moment.utc(),
        }),
      ],
      ['thursday']
    );
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });
    if (moment.utc().format(dateStrFormat) !== moment.utc().add(+5, 'minutes').format(dateStrFormat)){
      throw new Error(`Test will fail due to being run within 5 minutes of midnight!`);
    }
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
          startTime: '09:00',
          endTime: '19:00',
          date: moment.utc(),
        }),
      ],
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      [],
      deliveryPartner.id
    );
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    assert.isDefined(vendor.deliveryPartner);
    assert.isObject(vendor.deliveryPartner);
    expect(vendor.deliveryPartner.id).to.equal(deliveryPartner.id);

    const fulfilmentMethodVendor: FulfilmentMethodType =
      await FulfilmentMethod.findOne(vendorsDelvFulfMethod.id).populate(
        'deliveryPartner&vendor'
      );
    const fulfilmentMethodDeliveryPartner: FulfilmentMethodType =
      await FulfilmentMethod.findOne(
        deliveryPartnersDelvFulfMethod.id
      ).populate('deliveryPartner&vendor');

    assert.isDefined(fulfilmentMethodVendor);
    assert.isDefined(fulfilmentMethodDeliveryPartner);
    assert.isObject(fulfilmentMethodVendor);
    assert.isObject(fulfilmentMethodDeliveryPartner);
    expect(fulfilmentMethodVendor).to.have.property('vendor');
    expect(fulfilmentMethodDeliveryPartner).to.have.property('deliveryPartner');

    return {
      useAccount:
        ELIGIBLE_DATES_ARE_INTERSECTION_OF_VENDORS_AND_VENDORS_DP.useAccount,
      HTTP_TYPE:
        ELIGIBLE_DATES_ARE_INTERSECTION_OF_VENDORS_AND_VENDORS_DP.HTTP_TYPE,
      ACTION_PATH:
        ELIGIBLE_DATES_ARE_INTERSECTION_OF_VENDORS_AND_VENDORS_DP.ACTION_PATH,
      ACTION_NAME:
        ELIGIBLE_DATES_ARE_INTERSECTION_OF_VENDORS_AND_VENDORS_DP.ACTION_NAME,
      sendData: {
        vendor: fulfilmentMethodVendor.vendor.id, //Dont send delivery partner as already assigned on vendor
      },
      expectResponse: {},
      expectStatusCode:
        ELIGIBLE_DATES_ARE_INTERSECTION_OF_VENDORS_AND_VENDORS_DP.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: getEligibleOrderDatesSuccess },
        requestPayload
      ) => {
        expect(response.body)
          .to.be.an('object')
          .that.includes.all.keys(['collection', 'delivery']);

        const availableDatesForDelivery = Object.keys(response.body.delivery);
        expect(response.body.delivery)
          .to.be.an('object')
          .that.includes.keys([nextThursdayDate]);
        assert.isArray(response.body.delivery[nextThursdayDate]);
        expect(
          response.body.delivery[nextThursdayDate].map((obj) => {
            return {
              openTime: obj.openTime,
              closeTime: obj.closeTime,
              dayOfWeek: obj.dayOfWeek,
              deliveryPartner: obj.fulfilmentMethod
                .deliveryPartner as unknown as number | null,
              vendor: obj.fulfilmentMethod.vendor as unknown as number | null,
            };
          })
        ).to.deep.include.members([
          {
            openTime: '15:00:00',
            closeTime: '17:00:00',
            dayOfWeek: 'thursday',
            deliveryPartner: deliveryPartner.id,
            vendor: null,
          },
          {
            openTime: '09:00:00',
            closeTime: '19:00:00',
            dayOfWeek: 'thursday',
            deliveryPartner: null,
            vendor: vendor.id,
          },
        ]);

        return;
      },
    };
  }
}
class BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP {
  static readonly useAccount = 'TEST_USER';
  static readonly HTTP_TYPE = 'get';
  static readonly ACTION_PATH = 'vendors';
  static readonly ACTION_NAME =
    'get-eligible-order-dates';
  static readonly ACTION_DESCRIPTION = 'Returns a 400 if the vendors dp !== deliveryPartner id requested';
  static readonly EXPECT_STATUS_CODE = 400;

  constructor() {}

  async init(fixtures) {
    const dayOfWeek = 'thursday';
    const methodType = 'delivery';
    const todayName = getTodayDayName(0);
    const tomorrowName = getTodayDayName(1);
    const dayAfterTomorrowName = getTodayDayName(2);
    const nextThursdayDate = getNextWeekday('thursday', true);
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
          startTime: '15:00',
          endTime: '17:00',
          date: moment.utc(),
        }),
      ],
      ['thursday']
    );
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });
    const altDelvPartnerResponse = await createDeliveryPartnerWithOpeningHours(
      fixtures,
      [
        new TimeWindow({
          startTime: '15:00',
          endTime: '17:00',
          date: moment.utc(),
        }),
      ],
      ['thursday']
    );
    await FulfilmentMethod.update(altDelvPartnerResponse.deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });
    if (moment.utc().format(dateStrFormat) !== moment.utc().add(+5, 'minutes').format(dateStrFormat)){
      throw new Error(`Test will fail due to being run within 5 minutes of midnight!`);
    }
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
          startTime: '09:00',
          endTime: '19:00',
          date: moment.utc(),
        }),
      ],
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      [],
      deliveryPartner.id
    );
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
    });

    assert.isDefined(vendor.deliveryPartner);
    assert.isObject(vendor.deliveryPartner);
    expect(vendor.deliveryPartner.id).to.equal(deliveryPartner.id);

    const fulfilmentMethodVendor: FulfilmentMethodType =
      await FulfilmentMethod.findOne(vendorsDelvFulfMethod.id).populate(
        'deliveryPartner&vendor'
      );
    const fulfilmentMethodDeliveryPartner: FulfilmentMethodType =
      await FulfilmentMethod.findOne(
        deliveryPartnersDelvFulfMethod.id
      ).populate('deliveryPartner&vendor');

    assert.isDefined(fulfilmentMethodVendor);
    assert.isDefined(fulfilmentMethodDeliveryPartner);
    assert.isObject(fulfilmentMethodVendor);
    assert.isObject(fulfilmentMethodDeliveryPartner);
    expect(fulfilmentMethodVendor).to.have.property('vendor');
    expect(fulfilmentMethodDeliveryPartner).to.have.property('deliveryPartner');

    return {
      useAccount: BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP.useAccount,
      HTTP_TYPE: BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP.HTTP_TYPE,
      ACTION_PATH: BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP.ACTION_PATH,
      ACTION_NAME: BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP.ACTION_NAME,
      sendData: {
        vendor: fulfilmentMethodVendor.vendor.id,
        deliveryPartner: altDelvPartnerResponse.deliveryPartner.id,
      },
      expectResponse: {},
      expectStatusCode:
        BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: getEligibleOrderDatesSuccess },
        requestPayload
      ) => {
        return;
      },
    };
  }
}

describe(`${
  CAN_GET_ELIGIBLE_DATES_AS_USER.ACTION_NAME
}() returns a 200 with json when authenticated`, () => {
  it("Returns All Eligible Dates for a given vendor", async () => {
    try {
      const _hatsInit = await new CAN_GET_ELIGIBLE_DATES_AS_USER().init(
        fixtures
      );
      const hats = new HttpAuthTestSenderVendor(_hatsInit);
      const response = await hats.makeAuthCallWith({},[]);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});

describe(`${ELIGIBLE_DATES_ARE_INTERSECTION_OF_VENDORS_AND_VENDORS_DP.ACTION_NAME}() returns a 200 with json when authenticated`, () => {
  it(ELIGIBLE_DATES_ARE_INTERSECTION_OF_VENDORS_AND_VENDORS_DP.ACTION_DESCRIPTION, async () => {
    try {
      const _hatsInit =
        await new ELIGIBLE_DATES_ARE_INTERSECTION_OF_VENDORS_AND_VENDORS_DP().init(
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

describe(`${BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP.ACTION_NAME}() returns a ${BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP.EXPECT_STATUS_CODE} with json when authenticated`, () => {
  it(BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP.ACTION_DESCRIPTION, async () => {
    try {
      const _hatsInit = await new BAD_REQUEST_IF_DP_NOT_MATCH_VENDORS_DP().init(
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
