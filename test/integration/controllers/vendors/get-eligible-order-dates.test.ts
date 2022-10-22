import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
// import util from "util";
import moment from "moment";
const { fixtures } = require("../../../../scripts/build_db.js");
import {
  HttpAuthTestSenderVendor,
} from "../../controllers/vendors/defaultVendor.js";
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
import { getEligibleOrderDatesSuccess } from "../../../../api/interfaces/vendors/iGetEligibleOrderUpdates";
import {
  createVendorWithOpeningHours,
  createDeliveryPartnerWithOpeningHours,
  createOrdersForSlot,
  stringifySlots,
  stringifySlot,
  stringifySlotWithDate,
} from "../../helpers/db-utils";

declare var Order: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;

class CAN_GET_ELIGIBLE_DATES_AS_USER {
  static useAccount: "TEST_USER" = "TEST_USER";
  static HTTP_TYPE: "get" = "get";
  static ACTION_PATH: "vendors" = "vendors";
  static ACTION_NAME: "get-eligible-order-dates" = "get-eligible-order-dates";
  static EXPECT_STATUS_CODE: 200 = 200;

  constructor() {}

  async init(fixtures) {
    const dayOfWeek = "thursday";
    const methodType = "delivery";
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
        expect(response.body).to.have.property("collectionMethod");
        expect(response.body.collectionMethod).to.have.property("methodType");
        expect(response.body.collectionMethod.methodType).to.equal(
          "collection"
        );
        expect(response.body).to.have.property("deliveryMethod");
        expect(response.body.deliveryMethod).to.have.property("methodType");
        expect(response.body.deliveryMethod.methodType).to.equal("delivery");

        expect(response.body).to.not.have.property("collectionSlots");
        expect(response.body).to.not.have.property("deliverySlots");

        expect(response.body).to.have.property("eligibleCollectionDates");
        assert.isNotEmpty(response.body.eligibleCollectionDates);
        assert.isObject(response.body.eligibleCollectionDates);
        expect(response.body).to.have.property("eligibleDeliveryDates");
        assert.isNotEmpty(response.body.eligibleDeliveryDates);
        assert.isObject(response.body.eligibleDeliveryDates);

        
        //Todo: TEST if we can handle special dates

        const availableDatesForDelivery = Object.keys(response.body.eligibleDeliveryDates);
        const availableDatesForCollection =
          Object.keys(response.body.eligibleCollectionDates);

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
