/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/Vendors/get-fulfilment-slots.test.js
const { expect, assert } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { callAuthActionWithCookie, getNextWeekday } = require("../../../utils");
var util = require("util");

require("ts-node/register");
const { fixtures } = require("../../../../scripts/build_db");

const { v4: uuidv4 } = require("uuid");

const EXAMPLE_RESPONSE = {
  collectionMethod: {},
  deliveryMethod: {},
  collectionSlots: {},
  deliverySlots: {},
  eligibleCollectionDates: {},
  eligibleDeliveryDates: {},
};


const {
  DEFAULT_NEW_VENDOR_OBJECT,
  ExpectResponseVendor,
  HttpAuthTestSenderVendor,
} = require("./defaultVendor");


const CAN_GET_VENDORS_FULFILMENT_SLOTS = (fixtures) => {
  const dayOfWeek = "thursday";
  const methodType = "collection";
  const fulfilmentMethodVendor = fixtures.fulfilmentMethods.filter(
    (fm) =>
      // fm.vendor === vendor.id &&
      fm.methodType === methodType &&
      fixtures.openingHours.filter(
        (oh) =>
          oh.fulfilmentMethod === fm.id &&
          oh.isOpen === true &&
          oh.dayOfWeek === dayOfWeek
      )
  )[0];
  
  return {
    useAccount: "TEST_VENDOR",
    HTTP_TYPE: "get",
    ACTION_PATH: "vendors",
    ACTION_NAME: "get-fulfilment-slots",
    sendData: {
      vendor: fulfilmentMethodVendor.vendor,
      date: getNextWeekday(dayOfWeek),
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("collectionMethod");
      expect(response.body.collectionMethod).to.have.property("methodType");
      expect(response.body.collectionMethod.methodType).to.equal("collection");
      expect(response.body).to.have.property("deliveryMethod");
      expect(response.body.deliveryMethod).to.have.property("methodType");
      expect(response.body.deliveryMethod.methodType).to.equal("delivery");

      expect(response.body).to.have.property("collectionSlots");
      assert.isArray(response.body.collectionSlots);

      expect(response.body).to.have.property("deliverySlots");
      assert.isArray(response.body.deliverySlots);
      assert.isNotEmpty(response.body[`${methodType}Slots`]);

      expect(response.body).to.have.property("eligibleCollectionDates");
      expect(response.body).to.have.property("eligibleDeliveryDates");
      assert.isNotEmpty(response.body[`eligibleCollectionDates`]);
      assert.isNotEmpty(response.body[`eligibleDeliveryDates`]);
      
      assert.isArray(response.body.eligibleCollectionDates.availableDaysOfWeek);
      assert.isNotEmpty(response.body.eligibleCollectionDates.availableDaysOfWeek);
      assert.isArray(
        response.body.eligibleCollectionDates.availableSpecialDates
      );
      assert.isArray(response.body.eligibleDeliveryDates.availableDaysOfWeek);
      assert.isNotEmpty(
        response.body.eligibleDeliveryDates.availableDaysOfWeek
      );
      assert.isArray(response.body.eligibleDeliveryDates.availableSpecialDates);
      
      expect(response.body.eligibleCollectionDates).to.have.property(
        "availableDaysOfWeek"
      );
      expect(response.body.eligibleCollectionDates).to.have.property(
        "availableSpecialDates"
      );
      expect(response.body.eligibleDeliveryDates).to.have.property(
        "availableDaysOfWeek"
      );
      expect(response.body.eligibleDeliveryDates).to.have.property(
        "availableSpecialDates"
      );

      return;
    },
  };
};
const CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS = (fixtures) => {
  const dayOfWeek = "thursday";
  const methodType = "collection";
  return {
    useAccount: "TEST_VENDOR",
    HTTP_TYPE: "get",
    ACTION_PATH: "vendors",
    ACTION_NAME: "get-fulfilment-slots",
    sendData: {
      vendor: 99999,
      date: getNextWeekday(dayOfWeek),
    },
    expectResponse: {},
    expectStatusCode: 404,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES = (fixtures) => {
  const dayOfWeek = "thursday";
  const methodType = "collection";
  const fulfilmentMethodVendor = fixtures.fulfilmentMethods.filter(
    (fm) =>
      // fm.vendor === vendor.id &&
      fm.methodType === methodType &&
      fixtures.openingHours.filter(
        (oh) =>
          oh.fulfilmentMethod === fm.id &&
          oh.isOpen === true &&
          oh.dayOfWeek === dayOfWeek
      )
  )[0];
  return {
    useAccount: "TEST_VENDOR",
    HTTP_TYPE: "get",
    ACTION_PATH: "vendors",
    ACTION_NAME: "get-fulfilment-slots",
    sendData: {
      vendor: fulfilmentMethodVendor.vendor,
      date: '2022-10-06',
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("collectionMethod");
      expect(response.body.collectionMethod).to.have.property("methodType");
      expect(response.body.collectionMethod.methodType).to.equal("collection");
      expect(response.body).to.have.property("deliveryMethod");
      expect(response.body.deliveryMethod).to.have.property("methodType");
      expect(response.body.deliveryMethod.methodType).to.equal("delivery");

      expect(response.body).to.have.property("collectionSlots");
      assert.isArray(response.body.collectionSlots);
      assert.isEmpty(response.body.collectionSlots);

      expect(response.body).to.have.property("deliverySlots");
      assert.isArray(response.body.deliverySlots);
      assert.isEmpty(response.body.deliverySlots);

      expect(response.body).to.have.property("eligibleCollectionDates");
      expect(response.body).to.have.property("eligibleDeliveryDates");
      assert.isNotEmpty(response.body[`eligibleCollectionDates`]);
      assert.isNotEmpty(response.body[`eligibleDeliveryDates`]);

      assert.isArray(response.body.eligibleCollectionDates.availableDaysOfWeek);
      assert.isEmpty(response.body.eligibleCollectionDates.availableDaysOfWeek);
      assert.isArray(
        response.body.eligibleCollectionDates.availableSpecialDates
      );
      assert.isArray(response.body.eligibleDeliveryDates.availableDaysOfWeek);
      assert.isEmpty(
        response.body.eligibleDeliveryDates.availableDaysOfWeek
      );
      assert.isArray(response.body.eligibleDeliveryDates.availableSpecialDates);

      expect(response.body.eligibleCollectionDates).to.have.property(
        "availableDaysOfWeek"
      );
      expect(response.body.eligibleCollectionDates).to.have.property(
        "availableSpecialDates"
      );
      expect(response.body.eligibleDeliveryDates).to.have.property(
        "availableDaysOfWeek"
      );
      expect(response.body.eligibleDeliveryDates).to.have.property(
        "availableSpecialDates"
      );

      return;
    },
  };
};


describe(`${CAN_GET_VENDORS_FULFILMENT_SLOTS(fixtures).ACTION_NAME}() returns a 200 with json when authenticated`, () => {
  it("Returns All Fulfilment Slots for a given vendor", async () => {
    const cb = async (cookie) => {
      try {
        let vendor = await Vendor.create(
          DEFAULT_NEW_VENDOR_OBJECT(fixtures, {
            deliveryPartner: fixtures.deliveryPartners.find(dp => dp.name === 'Agile').id
          })
        ).fetch();
        const deliveryPartner = fixtures.deliveryPartners.find(dp => dp.name === 'Agile');
        const deliveryFulfilmentMethod = await FulfilmentMethod.create({
          // deliveryPartner: 1, //Agile
          methodType: "delivery",
          name: "Test delivery Fulfilment Slot",
          priceModifier: 150,
          vendor: vendor.id
        }).fetch();
        const collectionFulfilmentMethod = await FulfilmentMethod.create({
          methodType: "collection",
          name: "Test delivery Fulfilment Slot",
          priceModifier: 150,
          vendor: vendor.id,
        }).fetch();
        const deliveryFulfilmentMethodForDeliveryPartner =
          await FulfilmentMethod.create({
            deliveryPartner: deliveryPartner.id, //Agile
            methodType: "delivery",
            name: "Test delivery partner Fulfilment Slot",
            priceModifier: 20,
            // vendor: vendor.id,
          }).fetch();
        var weekdays = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];
        var openingHoursDel = [];
        var openingHoursDelP = [];
        var openingHoursCol = [];
        // Create blank opening hours for each day
        weekdays.forEach((weekday) => {
          // Delivery hours
          openingHoursDelP.push({
            dayOfWeek: weekday,
            isOpen: true,
            openTime: "09:00",
            closeTime: "17:00",
            fulfilmentMethod: deliveryFulfilmentMethodForDeliveryPartner.id,
          });

          // Delivery hours
          openingHoursDel.push({
            dayOfWeek: weekday,
            isOpen: true,
            openTime: "09:00",
            closeTime: "17:00",
            fulfilmentMethod: deliveryFulfilmentMethod.id,
          });

          // Collection hours
          openingHoursCol.push({
            dayOfWeek: weekday,
            isOpen: true,
            openTime: "09:00",
            closeTime: "17:00",
            fulfilmentMethod: collectionFulfilmentMethod.id,
          });
          
        });
        const newHoursDel = await OpeningHours.createEach(
          openingHoursDel
        ).fetch();
        const newHoursDelP = await OpeningHours.createEach(
          openingHoursDelP
        ).fetch();
        const newHoursIDsDel = newHoursDel.map(({ id }) => id);
        await FulfilmentMethod.addToCollection(
          deliveryFulfilmentMethod.id,
          "openingHours"
        ).members(newHoursIDsDel);
        await FulfilmentMethod.addToCollection(
          deliveryFulfilmentMethodForDeliveryPartner.id,
          "openingHours"
        ).members(newHoursDelP.map(({ id }) => id));

        const newHoursCol = await OpeningHours.createEach(
          openingHoursCol
        ).fetch();
        const newHoursIDsCol = newHoursCol.map(({ id }) => id);
        await FulfilmentMethod.addToCollection(
          collectionFulfilmentMethod.id,
          "openingHours"
        ).members(newHoursIDsCol);
        
        await DeliveryPartner.updateOne(deliveryPartner.id).set({
          fulfilmentMethod: deliveryFulfilmentMethodForDeliveryPartner.id, 
        });
        await Vendor.updateOne(vendor.id).set({
          deliveryPartner: deliveryPartner.id,
          deliveryFulfilmentMethod: deliveryFulfilmentMethod.id, 
          collectionFulfilmentMethod: collectionFulfilmentMethod.id
        });
        vendor = await Vendor.findOne(vendor.id).populate('deliveryPartner');

        // const dayOfWeek = "thursday";
        // const methodType = "collection";
        // const fulfilmentMethodVendor = fixtures.fulfilmentMethods.filter(
        //   (fm) =>
        //     // fm.vendor === vendor.id &&
        //     fm.methodType === methodType &&
        //     fixtures.openingHours.filter(
        //       (oh) =>
        //         oh.fulfilmentMethod === fm.id &&
        //         oh.isOpen === true &&
        //         oh.dayOfWeek === dayOfWeek
        //     )
        // )[0];
        
        // const vendorOpeningHours = await OpeningHours.update({
        //   fulfilmentMethod: [
        //     vendor.collectionFulfilmentMethod,
        //     vendor.deliveryFulfilmentMethod,
        //   ],
        // })
        //   .set({
        //     isOpen: true,
        //   })
        //   .fetch();
        // console.log(`${util.inspect(vendorOpeningHours, { depth: null })}`);
        // if(vendor.deliveryPartner){
        //   const deliveryPartner = await DeliveryPartner.findOne(
        //     vendor.deliveryPartner.id
        //   ).populate("deliveryFulfilmentMethod");
        //   const fms = FulfilmentMethod.find({
        //     deliveryPartner: deliveryPartner.id,
        //   });
        //   if(fms){
        //     const deliveryPartnerOpeningHours = await OpeningHours.update({
        //       fulfilmentMethod: fms.map(fm => fm.id),
        //     })
        //       .set({
        //         isOpen: true,
        //       })
        //       .fetch();
        //     console.log(`${util.inspect(deliveryPartnerOpeningHours, {depth: null})}`);
        //   }
        // }

        const hats = new HttpAuthTestSenderVendor(
          CAN_GET_VENDORS_FULFILMENT_SLOTS(fixtures)
        );
        const response = await hats.makeAuthCallWith({
          vendor: vendor.id
        }, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    };
    await callAuthActionWithCookie(cb);
  });
});
describe(`${
  CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS(fixtures).ACTION_NAME
}() returns nothing for unknown vendor id`, () => {
  it("Returns a 404", async () => {
    const cb = async (cookie) => {
      try {
        const vendor = await Vendor.create(
          DEFAULT_NEW_VENDOR_OBJECT(fixtures, {})
        ).fetch();

        const hats = new HttpAuthTestSenderVendor(
          CANNOT_GET_UNKNOWN_VENDORS_FULFILMENT_SLOTS(fixtures)
        );
        const response = await hats.makeAuthCallWith({}, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    };
    await callAuthActionWithCookie(cb);
  });
});
describe(`${
  NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES(fixtures).ACTION_NAME
}() returns a 200 with no available slots returned for past dates`, () => {
  it("Returns All Fulfilment Slots for a given vendor", async () => {
    const cb = async (cookie) => {
      try {
        const vendor = await Vendor.create(
          DEFAULT_NEW_VENDOR_OBJECT(fixtures, {})
        ).fetch();

        const hats = new HttpAuthTestSenderVendor(
          NO_SLOTS_ARE_RETURNED_FOR_PAST_DATES(fixtures)
        );
        const response = await hats.makeAuthCallWith({}, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    };
    await callAuthActionWithCookie(cb);
  });
});
