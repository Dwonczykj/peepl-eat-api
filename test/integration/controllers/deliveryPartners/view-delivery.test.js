/* eslint-disable no-console */
// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const _ = require("lodash");
// var util = require("util");
const moment = require("moment/moment");
require("ts-node/register");
const {
  HttpAuthTestSender,
  ExpectResponse,
} = require("../../../httpTestSender");
const {fixtures} = require('../../../../scripts/build_db');

class ExpectResponseDeliveryPartner extends ExpectResponse {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PATH = "",
    ACTION_NAME = "",
    sendData = {},
    expectResponse = {},
  }) {
    super({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      sendData,
      expectResponse,
    });
  }

  customChecks({ responseBody, expectedResponse }) {
    // expect(responseBody.orderedDateTime).closeTo(
    //   expectedResponse.orderedDateTime,
    //   100,
    //   "OrderedDateTime should be within 100s of test."
    // );
    // ~ https://devenum.com/delete-property-from-objects-array-in-javascript/#:~:text=Delete%20property%20from%20objects%20Array%20in%20Javascript%20%286,to%20Delete%20property%20from%20objects%20array%20in%20Javascript
    // delete expectedResponse.orderedDateTime;
    
    // delete expectedResponse.publicId;
    return expectedResponse;
  }
}

class HttpAuthTestSenderDeliveryPartner extends HttpAuthTestSender {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PATH = "",
    ACTION_NAME = "",
    useAccount = "TEST_SERVICE",
    sendData = {},
    expectResponse = {},
  }) {
    super({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      useAccount,
      sendData,
      expectResponse,
      ExpectResponseDeliveryPartner,
    });
  }
}

const VIEW_DELIVERIES = {
  useAccount: "TEST_DELIVERY_PARTNER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "view-delivery",
  sendData: {
    deliveryPartnerId: 1, //AGILE
  },
  expectResponse: fixtures.orders.where(
    (order) => order.deliveryPartner.id === 1 && order.completedFlag === ''
  ),
};
const CANCEL_DELIVERY = {
  useAccount: "TEST_DELIVERY_PARTNER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "cancel-delivery",
  sendData: {
    vegiOrderId: null, // populate in test
    deliveryId: "", // populate in test
  },
  expectResponse: {},
};
const CANCEL_DELIVERY_NOT_ALLOWED_BY_USER = {
  useAccount: "TEST_USER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "cancel-delivery",
  sendData: {
    vegiOrderId: null, // populate in test
    deliveryId: "", // populate in test
  },
  expectResponse: {},
};
const ACCEPT_DELIVERY_CONFIRMATION_AS_ADMIN = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "accept-reject-delivery-confirmation",
  sendData: {
    deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_1",
    deliveryPartnerConfirmed: true,
  },
  expectResponse: {},
};
const ACCEPT_DELIVERY_CONFIRMATION_AS_USER_NOT_ALLOWED = {
  useAccount: "TEST_USER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "accept-reject-delivery-confirmation",
  sendData: {
    deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_2",
    deliveryPartnerConfirmed: true,
  },
  expectResponse: {},
};
const ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER = {
  useAccount: "TEST_DELIVERY_PARTNER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "accept-reject-delivery-confirmation",
  sendData: {
    deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3",
    deliveryPartnerConfirmed: true,
  },
  expectResponse: {},
};
const ADD_DELIVERY_DELIVERY_AVAILABILITY = {
  useAccount: "TEST_DELIVERY_PARTNER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "add-delivery-availability-for-order",
  sendData: {
    deliveryPartnerAccepted: true,
    vegiOrderId: null, // populate in test
    deliveryId: "", // populate in test
  },
  expectResponse: {},
};
const ADD_DELIVERY_DELIVERY_AVAILABILITY_AS_USER_NOT_ALLOWED = {
  useAccount: "TEST_USER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "add-delivery-availability-for-order",
  sendData: {
    deliveryPartnerAccepted: true,
    vegiOrderId: null, // populate in test
    deliveryId: "", // populate in test
  },
  expectResponse: {},
};

const CREATE_ORDER = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "create-order",
  sendData: {
    items: [
      {
        id: 1,
        options: {
          1: 1,
          2: 5,
          3: 10,
        },
      },
    ],
    total: 2105,
    tipAmount: 0,
    marketingOptIn: false,
    vendor: "1",
    walletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    address: {
      name: "Adam Galloway",
      email: "adam@itsaboutpeepl.com",
      phoneNumber: "07495995614",
      lineOne: "17 Teck Street",
      lineTwo: "",
      postCode: "L1 0AR",
      deliveryInstructions: "Leave it behind the bin",
    },
    fulfilmentMethod: 1,
    fulfilmentSlotFrom: "2022-10-07 11:00:00",
    fulfilmentSlotTo: "2022-10-07 12:00:00",
    discountCode: "DELI10",
  },
  expectResponse: {
    items: [
      {
        id: 1,
        options: {
          1: 1,
          2: 5,
          3: 10,
        },
      },
    ],
    total: 2105,
    tipAmount: 0,
    marketingOptIn: false,
    vendor: "1",
    customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    orderedDateTime: moment.utc(),
    paidDateTime: null, // TODO: Check set when order paid for
    refundDateTime: null, // TODO: Check set when order cancelled
    address: {
      name: "Adam Galloway",
      email: "adam@itsaboutpeepl.com",
      phoneNumber: "07495995614",
      lineOne: "17 Teck Street",
      lineTwo: "",
      postCode: "L1 0AR",
      deliveryInstructions: "Leave it behind the bin",
    },
    publicId: "",
    fulfilmentMethod: 1,
    fulfilmentSlotFrom: "2022-10-07 11:00:00",
    fulfilmentSlotTo: "2022-10-07 12:00:00",
    discount: 1,
    paymentStatus: "unpaid",
    paymentIntentId: "",
    deliveryId: "",
    deliveryPartnerAccepted: false, //TODO Check can update
    deliveryPartnerConfirmed: false, //TODO Check can update,
    rewardsIssued: 0, //TODO Check can update,
    sentToDeliveryPartner: false, //TODO Check can update,
    completedFlag: false,
    completedOrderFeedback: null,
    deliveryPunctuality: null,
    orderCondition: null,
    unfulfilledItems: [], //Check using partial orders
    deliveryPartner: null, // TODO Check can set after order creation when the courier is subsequently confirmed
    parentOrder: null,
  },
};

describe(`DeliveryPartner Model Integration Tests`, () => {
  describe(`${VIEW_DELIVERIES.ACTION_NAME}()`, () => {
    it(`${VIEW_DELIVERIES.ACTION_NAME} gets all orders but not completed orders`, async () => {
      try {
        
        const hats = new HttpAuthTestSenderDeliveryPartner(VIEW_DELIVERIES);
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${CANCEL_DELIVERY.ACTION_NAME}()`, () => {
    it(`DeliveryPartners can cancel delivery for an order`, async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_6",
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(CANCEL_DELIVERY);
        const response = await hats.makeAuthCallWith({
          vegiOrderId: parentOrder.body.id,
          deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_6"
        }, []);

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`Non-DeliveryPartners cannot cancel delivery for an order`, async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_6",
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          CANCEL_DELIVERY_NOT_ALLOWED_BY_USER
        );
        const response = await hats.makeAuthCallWith({
          vegiOrderId: parentOrder.body.id,
          deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_6"
        }, []);

        expect(response.statusCode).to.equal(401);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${ACCEPT_DELIVERY_CONFIRMATION_AS_ADMIN.ACTION_NAME}()`, () => {
    it(`${ACCEPT_DELIVERY_CONFIRMATION_AS_ADMIN.ACTION_NAME} returns 401 when already confirmed`, async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3",
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER
        );
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(401);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${ACCEPT_DELIVERY_CONFIRMATION_AS_ADMIN.ACTION_NAME} returns 401 when user is not a delivery partner`, async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_2",
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_USER_NOT_ALLOWED
        );
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(401);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${ACCEPT_DELIVERY_CONFIRMATION_AS_ADMIN.ACTION_NAME} returns 401 when order has a delivery partner registered to another delivery partner`, async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_OTHER_TEST_DELIVERY_PARTNER_4",
            deliveryPartner: 2,
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_USER_NOT_ALLOWED
        );
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(401);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Admin can successfully accept a delivery job for an order", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_1",
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_ADMIN
        );
        const response = await hats.makeAuthCallWith(
          {},
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Admin can successfully accept a delivery job for an order", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3",
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER
        );
        const response = await hats.makeAuthCallWith(
          {},
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Admin can successfully accept a delivery job for an order", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_2",
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_USER_NOT_ALLOWED
        );
        const response = await hats.makeAuthCallWith(
          {},
          []
        );

        expect(response.statusCode).to.equal(401);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${ADD_DELIVERY_DELIVERY_AVAILABILITY.ACTION_NAME}()`, () => {
    it(`${ADD_DELIVERY_DELIVERY_AVAILABILITY.ACTION_NAME} returns 200 as Delivery Partner for the order`, async () => {
      try {
        const deliveryId = "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_10";
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: deliveryId,
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: false,
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY
        );
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Order.findOne({
          publicId: parentOrder.body.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryPartnerAccepted).to.equal(true);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(false);
        expect(newOrder.deliveryId).to.equal(deliveryId);
        expect(newOrder.deliveryPartner).to.equal(
          1,
          "Should be logged in as AGILE Delivery Partner Test Account, this should set the delivery partner on the order to the id of the AGILE delivery partner"
        ); //AGILE
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${ADD_DELIVERY_DELIVERY_AVAILABILITY.ACTION_NAME} returns 200 as Delivery Partner for the order`, async () => {
      try {
        const deliveryId = "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_11";
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: deliveryId,
            deliveryPartnerAccepted: false,
            deliveryPartnerConfirmed: false,
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY
        );
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Order.findOne({
          publicId: parentOrder.body.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryPartnerAccepted).to.equal(false);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(false);
        expect(newOrder.deliveryId).to.equal("");
        expect(newOrder.deliveryPartner).to.equal(null);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${ADD_DELIVERY_DELIVERY_AVAILABILITY.ACTION_NAME} returns 401 if Order has already been ACCEPTED || CONFIRMED by ANY delivery partner`, async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3",
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY
        );
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(401);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Order.findOne({
          publicId: parentOrder.body.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryPartnerAccepted).to.equal(false);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(false);
        expect(newOrder.deliveryId).to.equal("");
        expect(newOrder.deliveryPartner).to.equal(null);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${ADD_DELIVERY_DELIVERY_AVAILABILITY_AS_USER_NOT_ALLOWED.ACTION_NAME} returns 401 when not a delivery partner`, async () => {
      try {
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_12",
            deliveryPartnerAccepted: false,
            deliveryPartnerConfirmed: false,
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY_AS_USER_NOT_ALLOWED
        );
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(401);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Order.findOne({
          publicId: parentOrder.body.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryPartnerAccepted).to.equal(false);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(false);
        expect(newOrder.deliveryId).to.equal("");
        expect(newOrder.deliveryPartner).to.equal(null);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${ADD_DELIVERY_DELIVERY_AVAILABILITY.ACTION_NAME} returns 404 when no overlapping fulfliment slots between Vendor and Delivery Partner`, async () => {
      // This should not be possible in the UI anyway, but needs protection on the backend anyway as elgible delivery slots should be the intersection of vendor and dp slots anyway.
      try {
        const deliveryStart = "11:00";
        const deliveryEnd = "13:00";
        // create an order with the fulfilment slot set to one that works for DeliveryPartner

        const deliveryPartner = await DeliveryPartner.create({
          name: "Test helpers getAvailableDeliveryPartnerFromPool Delivery Partner",
          email: "getAvailableDeliveryPartnerFromPool@sailshelpers.com",
          phoneNumber: "0123456123",
          status: "active",
          deliversToPostCodes: ["L1"],
          walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
          imageUrl:
            "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
          rating: 5,
        });
        // Generate collection/delivery blank opening hours
        var openingHoursDel = [];
        var openingHoursDelVen = [];
        var weekdays = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];
        const delvDp = await FulfilmentMethod.create({
          deliveryPartner: deliveryPartner,
          methodType: "delivery",
        }).fetch();
        const vendor = await Vendor.create({
          createdAt: 1650878843365,
          updatedAt: 1651529215649,
          name: "Test action view-delivery",
          type: "restaurant",
          description: "Some test vendor",
          walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
          imageUrl:
            "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
          status: "active",
          phoneNumber: "+447495865614",
          pickupAddressLineOne: null,
          pickupAddressLineTwo: null,
          pickupAddressCity: null,
          pickupAddressPostCode: null,
          costLevel: null,
          rating: 5,
          isVegan: false,
          minimumOrderAmount: 0,
          platformFee: 0,
          collectionFulfilmentMethod: 8,
          deliveryFulfilmentMethod: null,
          deliveryPartner: deliveryPartner.id, // Agile
          products: [],
          vendorCategories: [1], // Cafes
          productCategories: [],
          fulfilmentPostalDistricts: [1, 2], // L1, L2
          users: [],
        }).fetch();
        const delvVendor = await FulfilmentMethod.create({
          vendor: vendor.id,
          methodType: "delivery",
        }).fetch();
        // Create blank opening hours for each day
        weekdays.forEach((weekday) => {
          // Delivery hours
          openingHoursDel.push({
            dayOfWeek: weekday,
            isOpen: true,
            openTime: deliveryStart,
            closeTime: deliveryEnd,
            fulfilmentMethod: delvDp.id,
          });
          // openingHoursDel.push({
          //   dayOfWeek: weekday,
          //   isOpen: true,
          //   openTime: "15:00",
          //   closeTime: "17:00",
          //   fulfilmentMethod: delvDp.id,
          // });

          //vendor
          // openingHoursDelVen.push({
          //   dayOfWeek: weekday,
          //   isOpen: true,
          //   openTime: deliveryStart,
          //   closeTime: deliveryEnd,
          //   fulfilmentMethod: delvVendor.id,
          // });
          openingHoursDelVen.push({
            dayOfWeek: weekday,
            isOpen: true,
            openTime: "15:00",
            closeTime: "17:00",
            fulfilmentMethod: delvVendor.id,
          });
        });

        // Add the opening hours to the database
        const newHoursDel = await OpeningHours.createEach(
          openingHoursDel
        ).fetch();
        const newHoursIDsDel = newHoursDel.map(({ id }) => id);
        const fmDp =await FulfilmentMethod.addToCollection(delvDp.id, "openingHours").members(
          newHoursIDsDel
        );
        const newHoursDelVen = await OpeningHours.createEach(
          openingHoursDelVen
        ).fetch();
        const newHoursIDsDelVen = newHoursDelVen.map(({ id }) => id);
        const fmVen = await FulfilmentMethod.addToCollection(
          delvVendor.id,
          "openingHours"
        ).members(newHoursIDsDelVen);
        
        const parentOrder = await HttpAuthTestSenderDeliveryPartner(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_14",
            fulfilmentMethod: fmVen, // mobile app only requests fulfilment methods for vendor at the moment
            fulfilmentSlotFrom: moment("15:00", "hh:mm:ss").toDate(), //fmVen.openingHours.openTime -> closeTime
            fulfilmentSlotTo: moment("17:00", "hh:mm:ss").toDate(),
          },
          []
        );
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY
        );
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(404); // because DeliveryPartner available slots are 11 -> 1
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Order.findOne({
          publicId: parentOrder.body.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryPartnerAccepted).to.equal(false);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(false);
        expect(newOrder.deliveryId).to.equal("");
        expect(newOrder.deliveryPartner).to.equal(null);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
});
