import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
// import util from "util";
import moment from "moment";
const { fixtures } = require("../../../../scripts/build_db.js");
import { HttpAuthTestSenderVendor } from "./defaultVendor.js";
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
import {
  createVendorWithOpeningHours,
  createDeliveryPartnerWithOpeningHours,
  createOrdersForSlot,
  stringifySlots,
  stringifySlot,
  stringifySlotWithDate,
  stringifySlotsWithDateHttpResponse,
  stringifySlotWithDateHttpResponse,
} from "../../helpers/db-utils";

import { sailsVegi } from "../../../../api/interfaces/iSails";
import { NextAvailableDateHelperReturnType } from "../../../../api/helpers/next-available-date.js";
declare var sails: sailsVegi;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;

type GetNextFulfilmentSlotSuccessHttp = {
  collectionMethod: FulfilmentMethodType;
  deliveryMethods: FulfilmentMethodType[];
  nextCollectionSlot: { startTime: string; endTime: string };
  nextDeliverySlot: { startTime: string; endTime: string };
  nextEligibleCollectionDate: NextAvailableDateHelperReturnType;
  nextEligibleDeliveryDate: NextAvailableDateHelperReturnType;
};

class CAN_GET_NEXT_AVAIL_SLOT_AS_USER {
  static readonly useAccount = 'TEST_USER';
  static readonly HTTP_TYPE = 'get';
  static readonly ACTION_PATH = 'vendors';
  static readonly ACTION_NAME = 'get-next-fulfilment-slot';
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
      useAccount: CAN_GET_NEXT_AVAIL_SLOT_AS_USER.useAccount,
      HTTP_TYPE: CAN_GET_NEXT_AVAIL_SLOT_AS_USER.HTTP_TYPE,
      ACTION_PATH: CAN_GET_NEXT_AVAIL_SLOT_AS_USER.ACTION_PATH,
      ACTION_NAME: CAN_GET_NEXT_AVAIL_SLOT_AS_USER.ACTION_NAME,
      sendData: {
        vendor: vendor.id,
      },
      expectResponse: {},
      expectStatusCode: CAN_GET_NEXT_AVAIL_SLOT_AS_USER.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: GetNextFulfilmentSlotSuccessHttp },
        requestPayload
      ) => {
        expect(response.body).to.have.property('collectionMethod');
        expect(response.body.collectionMethod).to.have.property('methodType');
        expect(response.body.collectionMethod.methodType).to.equal(
          'collection'
        );
        expect(response.body).to.have.property('deliveryMethods');
        assert.isArray(response.body.deliveryMethods);
        assert.isNotEmpty(response.body.deliveryMethods);
        expect(response.body.deliveryMethods[0]).to.have.property('methodType');
        expect(response.body.deliveryMethods[0].methodType).to.equal(
          'delivery'
        );

        expect(response.body).to.have.property('nextEligibleCollectionDate');
        assert.isNotEmpty(response.body.nextEligibleCollectionDate);
        assert.isObject(response.body.nextEligibleCollectionDate);
        expect(response.body).to.have.property('nextEligibleDeliveryDate');
        assert.isNotEmpty(response.body.nextEligibleDeliveryDate);
        assert.isObject(response.body.nextEligibleDeliveryDate);

        //Todo: TEST if we can handle special dates
        expect(response.body).to.have.property('nextCollectionSlot');
        expect(response.body).to.have.property('nextDeliverySlot');

        const tomorrowsDate = getNextWeekday(tomorrowName);

        expect(
          stringifySlotWithDateHttpResponse(response.body.nextDeliverySlot)
        ).to.deep.equal({
          startTime: `${tomorrowsDate} 09:00`,
          endTime: `${tomorrowsDate} 10:00`,
        });

        return;
      },
    };
  }
}

describe(`${
  CAN_GET_NEXT_AVAIL_SLOT_AS_USER.ACTION_NAME
}() returns a 200 with json when authenticated`, () => {
  it("Returns All Eligible Dates for a given vendor", async () => {
    try {
      const _hatsInit = await new CAN_GET_NEXT_AVAIL_SLOT_AS_USER().init(
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
