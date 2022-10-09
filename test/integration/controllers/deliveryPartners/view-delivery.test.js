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

var fixtures = {};
const fs = require("fs");

_.each(fs.readdirSync(process.cwd() + "/test/fixtures/"), (file) => {
  fixtures[file.replace(/\.js$/, "")] = require(process.cwd() +
    "/test/fixtures/" +
    file);
});


//TODO: do couriers/add-delivery-availability-for-order which should default to the fulfilment slots of that deliverypartner for now and not contact the delvery partner
//TODO: do couriers/cancel-delivery
//TODO: do couriers/view-delivery


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
        const hats = HttpAuthTestSenderDeliveryPartner(
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
        const hats = HttpAuthTestSenderDeliveryPartner(
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
        const hats = HttpAuthTestSenderDeliveryPartner(
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
        const hats = HttpAuthTestSenderDeliveryPartner(
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
        const hats = HttpAuthTestSenderDeliveryPartner(
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
        const hats = HttpAuthTestSenderDeliveryPartner(
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
});