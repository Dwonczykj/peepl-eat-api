/* eslint-disable no-console */

import { Slot } from "../../../../api/interfaces/vendors/slot";

// test/integration/controllers/admin/create-product.test.js
import { assert, expect } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const _ = require("lodash");
// var util = require("util");
import moment from 'moment';
import util from 'util';
require("ts-node/register");
const { v4: uuidv4 } = require("uuid");
const {
  HttpAuthTestSender,
  ExpectResponse,
} = require("../../../httpTestSender");
const {fixtures} = require('../../../../scripts/build_db');
const {getNextWeekday} = require('../../../utils');

declare var Order:any;
declare var User:any;
declare var OpeningHours:any;
declare var DeliveryPartner:any;
declare var FulfilmentMethod:any;
declare var Vendor:any;

const DEFAULT_NEW_ORDER_OBJECT = (fixtures, overrides = {}) => {
  const vendor = fixtures.vendors[0];
  const fulfilmentMethodVendor = fixtures.fulfilmentMethods.filter(
    (fm) =>
      fm.vendor === vendor.id &&
      fm.methodType === "delivery" &&
      fixtures.openingHours.filter(
        (oh) => oh.fulfilmentMethod === fm.id && oh.isOpen === true
      )
  )[0];
  const openAtHours = fixtures.openingHours.filter(
    (openHrs) =>
      openHrs.isOpen === true &&
      openHrs.fulfilmentMethod === fulfilmentMethodVendor.id
  )[0];
  return {
    ...{
      customerWalletAddress: "0xb98AEa2159e4855c8C703A19f57912ACAdCa3625",
      items: [1, 6, 7],
      total: 2800,
      tipAmount: 0,
      orderedDateTime: Date.now(),
      restaurantAcceptanceStatus: "accepted",
      marketingOptIn: false,
      vendor: vendor.id,
      paidDateTime: null,
      refundDateTime: null,
      deliveryName: "Test Runner 1",
      deliveryEmail: "adam@itsaboutpeepl.com",
      deliveryPhoneNumber: "07901122212",
      deliveryAddressLineOne: "11 Feck Street",
      deliveryAddressLineTwo: "Subburb",
      deliveryAddressCity: "Liverpool",
      deliveryAddressPostCode: "L1 0AB",
      deliveryAddressInstructions: "Leave it behind the bin",
      fulfilmentMethod: fulfilmentMethodVendor.id,
      fulfilmentSlotFrom: "2023-10-12 11:00:00",
      fulfilmentSlotTo: "2023-10-12 12:00:00",
      discount: null,
      paymentStatus: "unpaid",
      paymentIntentId: "",
      deliveryId: "random_delivery_id",
      deliveryPartnerAccepted: true,
      deliveryPartnerConfirmed: true,
      deliveryPartner: fixtures.deliveryPartners[0].id,
      rewardsIssued: 0,
      sentToDeliveryPartner: false,
      completedFlag: "",
      completedOrderFeedback: null,
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //Check using partial orders
      parentOrder: null,
    },
    ...overrides,
  };
};

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
    ACTION_PREFIX = "/api/v1",
    ACTION_PATH = "",
    ACTION_NAME = "",
    useAccount = "TEST_SERVICE",
    sendData = {},
    expectResponse = {},
    expectResponseCb = async (response, requestPayload) => {},
    expectStatusCode = 200,
  }) {
    super({
      HTTP_TYPE,
      ACTION_PREFIX,
      ACTION_PATH,
      ACTION_NAME,
      useAccount,
      sendData,
      expectResponse,
      ExpectResponseDeliveryPartner,      
      expectResponseCb,
      expectStatusCode,
    });
  }
}

const VIEW_DELIVERIES = (fixtures, deliveryPartner, orders) => { 
  return {
    useAccount: "TEST_DELIVERY_PARTNER",
    HTTP_TYPE: "get",
    ACTION_PREFIX: "",
    ACTION_PATH: "couriers",
    ACTION_NAME: "deliveries",
    sendData: {
      deliveryPartnerId: deliveryPartner.id,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response) => {
      assert.isNotEmpty(orders);
      return Promise.resolve();
    },
  };
};
const CANCEL_DELIVERY = (fixtures) => { 
  return {
    useAccount: "TEST_DELIVERY_PARTNER",
    HTTP_TYPE: "post",
    ACTION_PATH: "couriers",
    ACTION_NAME: "cancel-delivery",
    sendData: {
      vegiOrderId: null, // populate in test
      deliveryId: "", // populate in test
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response) => {
      return Promise.resolve();
    },
  };
};
const CANCEL_DELIVERY_CONFIRMED = (fixtures) => { 
  return {
    useAccount: "TEST_DELIVERY_PARTNER",
    HTTP_TYPE: "post",
    ACTION_PATH: "couriers",
    ACTION_NAME: "cancel-delivery",
    sendData: {
      vegiOrderId: null, // populate in test
      deliveryId: "", // populate in test
    },
    expectResponse: {},
    expectStatusCode: 401,
    expectResponseCb: async (response) => {
      return Promise.resolve();
    },
  };
};
const CANCEL_DELIVERY_NOT_ALLOWED_BY_USER = (fixtures) => { return {
  useAccount: "TEST_USER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "cancel-delivery",
  sendData: {
    vegiOrderId: null, // populate in test
    deliveryId: "", // populate in test
  },
  expectResponse: {},
  expectStatusCode: 401,
  expectResponseCb: async (response) => {
    return Promise.resolve();
  },
};};
const ACCEPT_DELIVERY_CONFIRMATION_AS_ADMIN = (fixtures) => { return {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "accept-reject-delivery-confirmation",
  sendData: {
    deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_1",
    deliveryPartnerConfirmed: true,
    deliveryPartnerId: null,
  },
  expectResponse: {},
  expectStatusCode: 200,
  expectResponseCb: async (response) => {
    return Promise.resolve();
  },
};};
const ACCEPT_DELIVERY_CONFIRMATION_AS_USER_NOT_ALLOWED = (fixtures) => { return {
  useAccount: "TEST_USER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "accept-reject-delivery-confirmation",
  sendData: {
    deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_2",
    deliveryPartnerConfirmed: true,
  },
  expectResponse: {},
  expectStatusCode: 401,
  expectResponseCb: async (response) => {
    return Promise.resolve();
  },
};};
const ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER = (fixtures) => { return {
  useAccount: "TEST_DELIVERY_PARTNER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "accept-reject-delivery-confirmation",
  sendData: {
    deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3",
    deliveryPartnerConfirmed: true,
  },
  expectResponse: {},
  expectStatusCode: 200,
  expectResponseCb: async (response) => {
    return Promise.resolve();
  },
};};
const ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER_FOR_ORDER_FOR_OTHER_DP = (fixtures) => { return {
  useAccount: "TEST_DELIVERY_PARTNER",
  HTTP_TYPE: "post",
  ACTION_PATH: "couriers",
  ACTION_NAME: "accept-reject-delivery-confirmation",
  sendData: {
    deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3",
    deliveryPartnerConfirmed: true,
  },
  expectResponse: {},
  expectStatusCode: 401,
  expectResponseCb: async (response) => {
    return Promise.resolve();
  },
};};
const ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER_ALREADY_CONFIRMED = (
  fixtures
) => {
  return {
    useAccount: "TEST_DELIVERY_PARTNER",
    HTTP_TYPE: "post",
    ACTION_PATH: "couriers",
    ACTION_NAME: "accept-reject-delivery-confirmation",
    sendData: {
      deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3",
      deliveryPartnerConfirmed: true,
    },
    expectResponse: {},
    expectStatusCode: 401,
    expectResponseCb: async (response) => {
      return Promise.resolve();
    },
  };
};
const ADD_DELIVERY_DELIVERY_AVAILABILITY = (fixtures) => { return {
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
  expectStatusCode: 200,
  expectResponseCb: async (response) => {
    return Promise.resolve();
  },
};};
const ADD_DELIVERY_DELIVERY_AVAILABILITY_FOR_ORDER_ALREADY_ACCEPTED = (
  fixtures
) => {
  return {
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
    expectStatusCode: 401,
    expectResponseCb: async (response) => {
      return Promise.resolve();
    },
  };
};
const ADD_DELIVERY_DELIVERY_AVAILABILITY_FOR_ORDER_ALREADY_CONFIRMED = (fixtures) => { return {
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
  expectStatusCode: 401,
  expectResponseCb: async (response) => {
    return Promise.resolve();
  },
};};
const ADD_DELIVERY_DELIVERY_AVAILABILITY_NO_OVERLAPPING_SLOTS = (fixtures) => {
  return {
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
    expectStatusCode: 404,
    expectResponseCb: async (response) => {
      return Promise.resolve();
    },
  };
};
const ADD_DELIVERY_DELIVERY_AVAILABILITY_AS_USER_NOT_ALLOWED = (fixtures) => { return {
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
  expectStatusCode: 401,
  expectResponseCb: async (response) => {
    return Promise.resolve();
  },
};};

const CREATE_ORDER = (fixtures) => { return {
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
  expectStatusCode: 200,
  expectResponseCb: async (response) => {
    return Promise.resolve();
  },
};};

describe(`DeliveryPartner Model Integration Tests`, () => {
  describe(`${VIEW_DELIVERIES(fixtures, {}, []).ACTION_NAME}()`, () => {
    it(`${
      VIEW_DELIVERIES(fixtures, {}, []).ACTION_NAME
    } gets all orders but not completed orders`, async () => {
      try {
        const deliveryPartner = fixtures.deliveryPartners[0];
        const newOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryPartner: deliveryPartner.id,
            completedFlag: "",
          })
        ).fetch();
        const orders = await Order.find({
          deliveryPartner: deliveryPartner.id,
          completedFlag: ""
        });
        const hats = new HttpAuthTestSenderDeliveryPartner(
          VIEW_DELIVERIES(fixtures, deliveryPartner, orders)
        );
        const response = await hats.makeAuthCallWith({}, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${CANCEL_DELIVERY(fixtures).ACTION_NAME}()`, () => {
    it(`DeliveryPartners can cancel delivery for an order`, async () => {
      try {
        const currentUser = await User.findOne({
          name: CANCEL_DELIVERY(fixtures).useAccount,
        }).populate("deliveryPartner");
        const deliveryPartner = currentUser.deliveryPartner;
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_6" + uuidv4();
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryPartner: deliveryPartner.id,
            deliveryId: delvId,
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: false,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(CANCEL_DELIVERY(fixtures));
        const response = await hats.makeAuthCallWith({
          vegiOrderId: parentOrder.publicId,
          deliveryId: delvId
        }, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`DeliveryPartners can not cancel delivery for a confirmed order`, async () => {
      try {
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_6" + uuidv4();
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: true,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          CANCEL_DELIVERY_CONFIRMED(fixtures)
        );
        const response = await hats.makeAuthCallWith({
          vegiOrderId: parentOrder.publicId,
          deliveryId: delvId
        }, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`Non-DeliveryPartners cannot cancel delivery for an order`, async () => {
      try {
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_6" + uuidv4();
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: true,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          CANCEL_DELIVERY_NOT_ALLOWED_BY_USER(fixtures)
        );
        const response = await hats.makeAuthCallWith({
          vegiOrderId: parentOrder.publicId,
          deliveryId: delvId
        }, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${
    ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER_ALREADY_CONFIRMED(fixtures)
      .ACTION_NAME
  }()`, () => {
    it(`${
      ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER_ALREADY_CONFIRMED(
        fixtures
      ).ACTION_NAME
    } returns ${
      ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER_ALREADY_CONFIRMED(
        fixtures
      ).expectStatusCode
    } when already confirmed`, async () => {
      try {
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3" + uuidv4();
        const currentUser = await User.findOne({
          name: ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER(fixtures)
            .useAccount,
        }).populate("deliveryPartner");
        const deliveryPartner = currentUser.deliveryPartner;
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: true,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER_ALREADY_CONFIRMED(
            fixtures
          )
        );
        const response = await hats.makeAuthCallWith(
          {
            deliveryId: delvId,
            deliveryPartnerId: deliveryPartner.id,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${
      ACCEPT_DELIVERY_CONFIRMATION_AS_USER_NOT_ALLOWED(fixtures).ACTION_NAME
    } returns 401 when user is not a delivery partner`, async () => {
      const delvId = "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_2_" + uuidv4();
      try {
        const currentUser = await User.findOne({
          name: "TEST_DELIVERY_PARTNER",
        }).populate("deliveryPartner");
        const deliveryPartner = currentUser.deliveryPartner;
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartner: deliveryPartner.id,
            deliveryPartnerAccepted: false,
            deliveryPartnerConfirmed: false,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_USER_NOT_ALLOWED(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            deliveryId: delvId,
            deliveryPartnerId: deliveryPartner.id,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${
      ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER_FOR_ORDER_FOR_OTHER_DP(
        fixtures
      ).ACTION_NAME
    } returns 401 when order has a delivery partner registered to another delivery partner`, async () => {
      try {
        const currentUser = await User.findOne({
          name: ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER_FOR_ORDER_FOR_OTHER_DP(
            fixtures
          ).useAccount,
        }).populate("deliveryPartner");
        const theirDeliveryPartner = currentUser.deliveryPartner;
        const deliveryPartner = fixtures.deliveryPartners.filter(
          (dp) => dp.id !== theirDeliveryPartner.id
        )[0];

        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_4_" + uuidv4();
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartner: deliveryPartner.id,
            deliveryPartnerAccepted: false,
            deliveryPartnerConfirmed: false,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER_FOR_ORDER_FOR_OTHER_DP(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            deliveryId: delvId,
            deliveryPartnerId: deliveryPartner.id,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Admin can successfully accept a delivery job for an order", async () => {
      try {
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_1_" + uuidv4();
        const deliveryPartner = fixtures.deliveryPartners[0];
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartner: deliveryPartner.id,
            deliveryPartnerAccepted: false,
            deliveryPartnerConfirmed: false,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_ADMIN(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            deliveryId: delvId,
            deliveryPartnerId: deliveryPartner.id,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("DeliveryPartner registered to order can successfully accept a delivery job for an order", async () => {
      try {
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_33_" + uuidv4();
        const currentUser = await User.findOne({
          name: ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER(fixtures)
            .useAccount,
        }).populate("deliveryPartner");
        const deliveryPartner = currentUser.deliveryPartner;
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartner: deliveryPartner.id,
            deliveryPartnerAccepted: false,
            deliveryPartnerConfirmed: false,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_DELIVERYPARTNER(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            deliveryId: delvId,
            deliveryPartnerId: deliveryPartner.id,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Admin can successfully accept a delivery job for an order", async () => {
      try {
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_22_" + uuidv4();
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ACCEPT_DELIVERY_CONFIRMATION_AS_USER_NOT_ALLOWED(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            deliveryId: delvId,
            deliveryPartnerId: fixtures.deliveryPartners[0].id,
            deliveryPartnerConfirmed: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${ADD_DELIVERY_DELIVERY_AVAILABILITY(fixtures).ACTION_NAME}()`, () => {
    it(`${
      ADD_DELIVERY_DELIVERY_AVAILABILITY(fixtures).ACTION_NAME
    } returns 200 as Delivery Partner for the order`, async () => {
      try {
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_10" + uuidv4();
        const currentUser = await User.findOne({
          name: ADD_DELIVERY_DELIVERY_AVAILABILITY(fixtures).useAccount,
        }).populate("deliveryPartner");
        const deliveryPartner = currentUser.deliveryPartner;
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartner: null,
            deliveryPartnerAccepted: false,
            deliveryPartnerConfirmed: false,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            vegiOrderId: parentOrder.publicId,
            deliveryId: delvId,
            deliveryPartnerId: deliveryPartner.id,
            deliveryPartnerAccepted: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
          publicId: parentOrder.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryPartnerAccepted).to.equal(true);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(false);
        expect(newOrder.deliveryId).to.equal(delvId);
        expect(newOrder.deliveryPartner.id).to.equal(
          deliveryPartner.id,
          "Should be logged in as AGILE Delivery Partner Test Account, this should set the delivery partner on the order to the id of the AGILE delivery partner"
        ); //AGILE
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${
      ADD_DELIVERY_DELIVERY_AVAILABILITY_FOR_ORDER_ALREADY_ACCEPTED(fixtures)
        .ACTION_NAME
    } returns 401 as Delivery Partner for the order if already accepted`, async () => {
      try {
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_11" + uuidv4();
        const currentUser = await User.findOne({
          name: ADD_DELIVERY_DELIVERY_AVAILABILITY_FOR_ORDER_ALREADY_ACCEPTED(
            fixtures
          ).useAccount,
        }).populate("deliveryPartner");
        const deliveryPartner = currentUser.deliveryPartner;
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartner: deliveryPartner.id,
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: false,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY_FOR_ORDER_ALREADY_ACCEPTED(
            fixtures
          )
        );
        const response = await hats.makeAuthCallWith(
          {
            vegiOrderId: parentOrder.publicId,
            deliveryId: delvId,
            deliveryPartnerId: deliveryPartner.id,
            deliveryPartnerAccepted: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
          publicId: parentOrder.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryPartnerAccepted).to.equal(true);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(false);        
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${ADD_DELIVERY_DELIVERY_AVAILABILITY_FOR_ORDER_ALREADY_CONFIRMED(fixtures).ACTION_NAME} returns 401 if Order has already been ACCEPTED || CONFIRMED by ANY delivery partner`, async () => {
      try {
        const delvId =  "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3" + uuidv4();
        const currentUser = await User.findOne({
          name: ADD_DELIVERY_DELIVERY_AVAILABILITY_FOR_ORDER_ALREADY_CONFIRMED(fixtures)
            .useAccount,
        }).populate("deliveryPartner");
        const deliveryPartner = currentUser.deliveryPartner;
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: delvId,
            deliveryPartner: deliveryPartner.id,
            deliveryPartnerAccepted: true,
            deliveryPartnerConfirmed: true,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY_FOR_ORDER_ALREADY_CONFIRMED(
            fixtures
          )
        );
        const response = await hats.makeAuthCallWith(
          {
            vegiOrderId: parentOrder.publicId,
            deliveryId: delvId,
            deliveryPartnerId: deliveryPartner.id,
            deliveryPartnerAccepted: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
          publicId: parentOrder.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryPartnerAccepted).to.equal(true);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(true);
        
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${ADD_DELIVERY_DELIVERY_AVAILABILITY_AS_USER_NOT_ALLOWED(fixtures).ACTION_NAME} returns 401 when not a delivery partner`, async () => {
      try {
        const delvId =  "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_3" + uuidv4();
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryId: "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_12",
            deliveryPartnerAccepted: false,
            deliveryPartnerConfirmed: false,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY_AS_USER_NOT_ALLOWED(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            vegiOrderId: parentOrder.publicId,
            deliveryId: delvId,
            deliveryPartnerId: fixtures.deliveryPartners[0].id,
            deliveryPartnerAccepted: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
          publicId: parentOrder.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryPartnerAccepted).to.equal(false);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(false);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it(`${ADD_DELIVERY_DELIVERY_AVAILABILITY_NO_OVERLAPPING_SLOTS(fixtures).ACTION_NAME} returns 404 when no overlapping fulfliment slots between Vendor and Delivery Partner`, async () => {
      // This should not be possible in the UI anyway, but needs protection on the backend anyway as elgible delivery slots should be the intersection of vendor and dp slots anyway.
      let parentOrder;
      try {
        const delvId =
          "A_DELIVERY_ID_SET_BY_TEST_DELIVERY_PARTNER_11" + uuidv4();
        const currentUser = await User.findOne({
          name: "TEST_DELIVERY_PARTNER",
        }).populate("deliveryPartner");
        const userDeliveryPartner = currentUser.deliveryPartner;
        assert.isDefined(userDeliveryPartner);
        const deliveryPartner = await DeliveryPartner.findOne(userDeliveryPartner.id).populate('deliveryFulfilmentMethod');
        
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
        // var openingHoursDel = [];
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
        const deliveryStartDP = "11:00";
        const deliveryEndDP = "13:00";
        const deliveryStartVen = "17:30";
        const deliveryEndVen = "18:30";
        weekdays.forEach((weekday) => {
          // Delivery hours
          // openingHoursDel.push({
          //   dayOfWeek: weekday,
          //   isOpen: true,
          //   openTime: deliveryStartDP,
          //   closeTime: deliveryEndDP,
          //   fulfilmentMethod: delvDp.id,
          // });
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
            openTime: deliveryStartVen,
            closeTime: deliveryEndVen,
            fulfilmentMethod: delvVendor.id,
          });
        });

        // Add the opening hours to the database
        await OpeningHours.update({
          dayOfWeek: weekdays,
          fulfilmentMethod: deliveryPartner.deliveryFulfilmentMethod.id
        }).set({
          isOpen: true,
          openTime: deliveryStartDP,
          closeTime: deliveryEndDP,
        });
        const newHoursDel = await OpeningHours.find({
          dayOfWeek: weekdays,
          fulfilmentMethod: deliveryPartner.deliveryFulfilmentMethod.id,
        });
        // await FulfilmentMethod.addToCollection(delvDp.id, "openingHours").members(
        //   newHoursDel.map(({ id }) => id)
        // );

        const newHoursDelVen = await OpeningHours.createEach(
          openingHoursDelVen
        ).fetch();
        await FulfilmentMethod.addToCollection(
          delvVendor.id,
          "openingHours"
        ).members(newHoursDelVen.map(({ id }) => id));

        parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            deliveryPartnerAccepted: false,
            deliveryPartnerConfirmed: false,
            deliveryPartner: null,
            deliveryId: delvId,
            fulfilmentMethod: delvVendor.id, // mobile app only requests fulfilment methods for vendor at the moment
            fulfilmentSlotFrom: moment
              .utc(
                getNextWeekday("thursday") + " " + deliveryStartVen,
                "YYYY-MM-DD HH:mm"
              )
              .toDate(), //fmVen.openingHours.openTime -> closeTime
            fulfilmentSlotTo: moment
              .utc(
                getNextWeekday("thursday") + " " + deliveryEndVen,
                "YYYY-MM-DD HH:mm"
              )
              .toDate(),
          })
        ).fetch();

        // const dPdeliverySlots: Slot[] = newHoursDel.map((openingHours) =>
        //   Slot.from({
        //     startTime: moment.utc(
        //       getNextWeekday(openingHours.dayOfWeek) +
        //         " " +
        //         openingHours.openTime,
        //       "YYYY-MM-DD HH:mm"
        //     ),
        //     endTime: moment.utc(
        //       getNextWeekday(openingHours.dayOfWeek) +
        //         " " +
        //         openingHours.closeTime,
        //       "YYYY-MM-DD HH:mm"
        //     ),
        //   })
        // );
        const orderDateDeliveryPartnerOpeningHourSlot = Slot.from({
          startTime: moment.utc(
            getNextWeekday("thursday") + " " + newHoursDel[0].openTime,
            "YYYY-MM-DD HH:mm"
          ),
          endTime: moment.utc(
            getNextWeekday("thursday") + " " + newHoursDel[0].closeTime,
            "YYYY-MM-DD HH:mm"
          ),
        });
        assert.isTrue(
          orderDateDeliveryPartnerOpeningHourSlot.startTime.isBefore(
            parentOrder.fulfilmentSlotFrom
          ),
          `expected ${orderDateDeliveryPartnerOpeningHourSlot.startTime} to be before or same as ${parentOrder.fulfilmentSlotFrom}.`
        );
        assert.isTrue(
          orderDateDeliveryPartnerOpeningHourSlot.endTime.isBefore(
            parentOrder.fulfilmentSlotTo
          ),
          `expected ${orderDateDeliveryPartnerOpeningHourSlot.endTime} not to be after or same as ${parentOrder.fulfilmentSlotTo}.`
        );
        
        // const vendorDeliverySlots: Slot[] = newHoursDelVen.map((openingHours) =>
        //   Slot.from({
        //     startTime: moment.utc(
        //       getNextWeekday(openingHours.dayOfWeek) +
        //         " " +
        //         openingHours.openTime,
        //       "YYYY-MM-DD HH:mm"
        //     ),
        //     endTime: moment.utc(
        //       getNextWeekday(openingHours.dayOfWeek) +
        //         " " +
        //         openingHours.closeTime,
        //       "YYYY-MM-DD HH:mm"
        //     ),
        //   })
        // );

        const orderDateVendorOpeningHourSlot = Slot.from({
          startTime: moment.utc(
            getNextWeekday("thursday") + " " + newHoursDelVen[0].openTime,
            "YYYY-MM-DD HH:mm"
          ),
          endTime: moment.utc(
            getNextWeekday("thursday") + " " + newHoursDelVen[0].closeTime,
            "YYYY-MM-DD HH:mm"
          ),
        });
        

        assert.isTrue(
          orderDateVendorOpeningHourSlot.startTime.isSameOrBefore(
            parentOrder.fulfilmentSlotFrom
          ),
          `expected ${orderDateVendorOpeningHourSlot.startTime} to be before or same as ${parentOrder.fulfilmentSlotTo}.`
        );
        assert.isTrue(
          orderDateVendorOpeningHourSlot.endTime.isSameOrAfter(
            parentOrder.fulfilmentSlotTo
          ),
          `expected ${orderDateVendorOpeningHourSlot.endTime} to be after or same as ${parentOrder.fulfilmentSlotTo}.`
        );

        const hats = new HttpAuthTestSenderDeliveryPartner(
          ADD_DELIVERY_DELIVERY_AVAILABILITY_NO_OVERLAPPING_SLOTS(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            vegiOrderId: parentOrder.publicId,
            deliveryId: delvId,
            deliveryPartnerId: fixtures.deliveryPartners[0].id,
            deliveryPartnerAccepted: true,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
          publicId: parentOrder.publicId,
        }).populate("deliveryPartner");
        expect(newOrder.deliveryId).to.equal(delvId);
        expect(newOrder.deliveryPartnerAccepted).to.equal(false);
        expect(newOrder.deliveryPartnerConfirmed).to.equal(false);
        expect(newOrder.deliveryPartner).to.equal(null);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
});
