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
  iSlot,
  TimeWindow,
} from "../../../../api/interfaces/vendors/slot";
import { DaysOfWeek } from "../../../../scripts/DaysOfWeek";
import {
  createVendorWithOpeningHours,
  createDeliveryPartnerWithOpeningHours,
  createOrdersForSlot,
} from "../../helpers/db-utils";
import {
  stringifySlots,
  stringifySlotWithTimes,
  stringifySlotWithDate,
  stringifySlotsWithDateHttpResponse,
  stringifySlotWithDateHttpResponse
} from "../../../../scripts/stringifySlot";

import { SailsModelType, sailsVegi } from "../../../../api/interfaces/iSails";
import { GetNextFulfilmentSlotSuccess } from '../../../../api/controllers/vendors/get-next-fulfilment-slot';

declare var sails: sailsVegi;
declare var FulfilmentMethod: SailsModelType<FulfilmentMethodType>;

type GetNextFulfilmentSlotSuccessHttp = GetNextFulfilmentSlotSuccess;

class CAN_GET_NEXT_AVAIL_SLOT_AS_USER {
  static readonly useAccount = 'TEST_USER';
  static readonly HTTP_TYPE = 'get';
  static readonly ACTION_PATH = 'vendors';
  static readonly ACTION_NAME = 'get-next-fulfilment-slot';
  static readonly ACTION_DESCRIPTION = 'get-next-fulfilment-slot';
  static readonly EXPECT_STATUS_CODE = 200;

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
    const DP_PRICE_MOD = 500;
    const VENDOR_PRICE_MOD = 250;
    const VENDOR_PRICE_MOD_COLN = 250 / 10;
    await FulfilmentMethod.update(deliveryPartnersDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
      priceModifier: DP_PRICE_MOD,
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
      priceModifier: VENDOR_PRICE_MOD,
    });
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
      priceModifier: VENDOR_PRICE_MOD_COLN,
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
      ACTION_DESCRIPTION: CAN_GET_NEXT_AVAIL_SLOT_AS_USER.ACTION_DESCRIPTION,
      sendData: {
        vendor: vendor.id,
      },
      expectResponse: {},
      expectStatusCode: CAN_GET_NEXT_AVAIL_SLOT_AS_USER.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: GetNextFulfilmentSlotSuccessHttp },
        requestPayload
      ) => {
        expect(response.body).to.be.an('object').that.includes.all.keys(['slot']);
        // expect(response.body.date)
        //   .to.be.an('object')
        //   .that.includes.all.keys(['collection', 'delivery']);
        expect(response.body.slot)
          .to.be.an('object')
          .that.includes.all.keys(['collection', 'delivery']);
        
        expect(response.body.slot.collection.fulfilmentMethod.methodType).to.equal(
          'collection'
        );
        expect(response.body.slot.delivery.fulfilmentMethod.methodType).to.equal(
          'delivery'
        );

        expect(
          response.body.slot.collection
        ).to.be.an('object').that.includes.all.keys(['startTime', 'endTime', 'fulfilmentMethod']);
        expect(
          response.body.slot.delivery
        ).to.be.an('object').that.includes.all.keys(['startTime', 'endTime', 'fulfilmentMethod']);
        expect(response.body.slot.delivery.startTime).to.match(
          /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z/g
        );
        
        expect(response.body.slot.delivery.fulfilmentMethod.id).to.equal(deliveryPartnersDelvFulfMethod.id);
        expect(response.body.slot.collection.fulfilmentMethod.id).to.equal(vendorsColnFulfMethod.id);

        expect(response.body.slot.delivery.fulfilmentMethod.priceModifier).to.not.equal(VENDOR_PRICE_MOD);
        expect(response.body.slot.delivery.fulfilmentMethod.priceModifier).to.equal(DP_PRICE_MOD);
        expect(response.body.slot.collection.fulfilmentMethod.priceModifier).to.equal(VENDOR_PRICE_MOD_COLN);

        const tomorrowsDate = getNextWeekday(tomorrowName);

        expect(
          stringifySlotWithDateHttpResponse(response.body.slot.delivery)
        ).to.deep.equal({
          startTime: `${tomorrowsDate} 09:00`,
          endTime: `${tomorrowsDate} 10:00`,
        });

        return;
      },
    };
  }
}
class CAN_GET_NEXT_AVAIL_SLOT_WITH_SPECIAL_DATE_AS_USER {
  static readonly useAccount = 'TEST_USER';
  static readonly HTTP_TYPE = 'get';
  static readonly ACTION_PATH = 'vendors';
  static readonly ACTION_NAME = 'get-next-fulfilment-slot';
  static readonly ACTION_DESCRIPTION = 'get-next-fulfilment-slot on a special date for dp tomorrow but normal date for vendor tomorrow';
  static readonly EXPECT_STATUS_CODE = 200;

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
      [dayAfterTomorrowName],
      undefined,
      [
        {
          [getNextWeekday(tomorrowName)]: [
            new TimeWindow({
              startTime: '15:00',
              endTime: '16:00',
              date: moment.utc(),
            }),
          ],
        },
      ]
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

    const DP_PRICE_MOD = 1500;
    const VENDOR_PRICE_MOD = 250;
    const VENDOR_PRICE_MOD_COLN = 250 / 10;
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
      deliveryPartner.id,
      []
    );
    
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
      priceModifier: VENDOR_PRICE_MOD,
    });
    await FulfilmentMethod.update(vendorsColnFulfMethod.id).set({
      orderCutoff: moment
        .utc()
        .add(+5, 'minutes')
        .format(timeStrFormat),
      slotLength: SLOT_LENGTH,
      bufferLength: 30,
      maxOrders: 50,
      priceModifier: VENDOR_PRICE_MOD_COLN,
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
      ACTION_DESCRIPTION: CAN_GET_NEXT_AVAIL_SLOT_AS_USER.ACTION_DESCRIPTION,
      sendData: {
        vendor: vendor.id,
      },
      expectResponse: {},
      expectStatusCode: CAN_GET_NEXT_AVAIL_SLOT_AS_USER.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: { body: GetNextFulfilmentSlotSuccessHttp },
        requestPayload
      ) => {
        expect(response.body).to.be.an('object').that.includes.all.keys(['slot']);
        expect(response.body.slot).to.be.an('object').that.includes.all.keys([
          'collection',
          'delivery',
        ]);

        expect(
          response.body.slot.collection.fulfilmentMethod.methodType
        ).to.equal('collection');
        expect(
          response.body.slot.delivery.fulfilmentMethod.methodType
        ).to.equal('delivery');

        expect(
          response.body.slot.collection
        ).to.be.an('object').that.includes.all.keys(['startTime', 'endTime', 'fulfilmentMethod']);
        expect(
          response.body.slot.delivery
        ).to.be.an('object').that.includes.all.keys(['startTime', 'endTime', 'fulfilmentMethod']);

        expect(response.body.slot.delivery.fulfilmentMethod.id).to.equal(
          deliveryPartnersDelvFulfMethod.id
        );
        expect(response.body.slot.collection.fulfilmentMethod.id).to.equal(
          vendorsColnFulfMethod.id
        );

        expect(
          response.body.slot.delivery.fulfilmentMethod.priceModifier
        ).to.not.equal(VENDOR_PRICE_MOD);
        expect(
          response.body.slot.delivery.fulfilmentMethod.priceModifier
        ).to.equal(DP_PRICE_MOD);
        expect(
          response.body.slot.collection.fulfilmentMethod.priceModifier
        ).to.equal(VENDOR_PRICE_MOD_COLN);

        const tomorrowsDate = getNextWeekday(tomorrowName);

        expect(
          stringifySlotWithDateHttpResponse(response.body.slot.delivery)
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
  CAN_GET_NEXT_AVAIL_SLOT_AS_USER.ACTION_DESCRIPTION
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
