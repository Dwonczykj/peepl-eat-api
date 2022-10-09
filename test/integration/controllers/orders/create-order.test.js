/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
const _ = require('lodash');
// var util = require("util");
const moment = require("moment/moment");
require("ts-node/register");
const { HttpAuthTestSender, ExpectResponse } = require('../../../httpTestSender');

// const { v4: uuidv4 } = require('uuid');
/* Check if string is valid UUID */
function checkIfValidUUID(str) {
  // Regular expression to check if string is a valid UUID
  // ~ https://melvingeorge.me/blog/check-if-string-valid-uuid-regex-javascript
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
}

class ExpectResponseOrder extends ExpectResponse {
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
    expect(responseBody.orderedDateTime).closeTo(
      expectedResponse.orderedDateTime,
      100,
      "OrderedDateTime should be within 100s of test."
    );
    // ~ https://devenum.com/delete-property-from-objects-array-in-javascript/#:~:text=Delete%20property%20from%20objects%20Array%20in%20Javascript%20%286,to%20Delete%20property%20from%20objects%20array%20in%20Javascript
    delete expectedResponse.orderedDateTime;
    expect(checkIfValidUUID(responseBody.publicId)).to.equal(true);
    delete expectedResponse.publicId;
    return expectedResponse;
  }
}

class HttpAuthTestSenderOrder extends HttpAuthTestSender {
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
      ExpectResponseOrder,
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
  }
};
const GET_ORDER = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "orders",
  ACTION_NAME: "get-order-details",
  sendData: {
    orderId: 1,
  },
  expectResponse: fixtures.orders.where((order) => order.id === 1)[0],
};
const GET_ORDER_STATUS = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "orders",
  ACTION_NAME: "get-order-status",
  sendData: {
    orderId: 1,
  },
  expectResponse: {
    paymentStatus: "unpaid",
    restaurantAcceptanceStatus: "pending",
  },
};
const GET_ORDER_BY_WALLETADDRESS = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "orders",
  ACTION_NAME: "ongoing-orders-by-wallet",
  sendData: {
    walletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
  },
  expectResponse: [
    {
      items: [
        {
          id: 1,
          options: {
            1: 1,
            2: 5,
            3: 10,
          },
        },
        {
          id: 2,
          options: {
            1: 1,
            2: 5,
            3: 10,
          },
        },
        {
          id: 3,
          options: {
            1: 1,
            2: 5,
            3: 10,
          },
        },
      ],
      total: 1500,
      tipAmount: 0,
      marketingOptIn: false,
      vendor: "1",
      customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
      paidDateTime: null,
      refundDateTime: null,
      address: {
        name: "Test Runner 1",
        email: "adam@itsaboutpeepl.com",
        phoneNumber: "07905532512",
        lineOne: "11 Feck Street",
        lineTwo: "",
        postCode: "L1 0AB",
        deliveryInstructions: "Leave it behind the bin",
      },
      publicId: "",
      fulfilmentMethod: 1,
      fulfilmentSlotFrom: "2022-10-12 11:00:00",
      fulfilmentSlotTo: "2022-10-12 12:00:00",
      discount: 1,
      paymentStatus: "unpaid",
      paymentIntentId: "",
      deliveryId: "",
      deliveryPartnerAccepted: false,
      deliveryPartnerConfirmed: false,
      rewardsIssued: 0,
      sentToDeliveryPartner: false,
      completedFlag: false,
      completedOrderFeedback: null,
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //Check using partial orders
      deliveryPartner: null,
      parentOrder: null,
    },
  ],
};
const MARK_ORDER_AS_PAID = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "peepl-pay-webhook",
  sendData: {
    publicId: null,
    status: "paid",
  },
  expectResponse: {},
};
const MARK_ORDER_AS_PAYMENT_FAILED = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "peepl-pay-webhook",
  sendData: {
    publicId: null,
    status: "failed",
  },
  expectResponse: {},
};
const MARK_ORDER_AS_REFUNDED_SUCCESS = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "peepl-pay-refund-webhook",
  sendData: {
    publicId: null,
    status: "success",
  },
  expectResponse: {},
};
const MARK_ORDER_AS_REFUNDED_FAILED = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "peepl-pay-refund-webhook",
  sendData: {
    publicId: null,
    status: "failure",
  },
  expectResponse: {},
};
const VIEW_ALL_ORDERS_ACCEPTED = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    acceptanceStatus: "accepted", //['accepted', 'rejected', 'pending']
    timePeriod: "all", //['upcoming', 'past', 'all']
  },
  expectResponse: fixtures.orders.where((order) => order.id === 2)[0],
};
const VIEW_ALL_ORDERS_REJECTED = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    acceptanceStatus: "rejected", //['accepted', 'rejected', 'pending']
    timePeriod: "all", //['upcoming', 'past', 'all']
  },
  expectResponse: fixtures.orders.where((order) => order.id === 3)[0],
};
const VIEW_ALL_ORDERS_PENDING = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    acceptanceStatus: "pending", //['accepted', 'rejected', 'pending']
    timePeriod: "all", //['upcoming', 'past', 'all']
  },
  expectResponse: fixtures.orders.where((order) => order.id === 1)[0], //TODO: call to create or setup in fixtures
};
const VIEW_ALL_ORDERS_DEFAULT = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    timePeriod: "all", //['upcoming', 'past', 'all']
  },
  expectResponse: fixtures.orders,
};
const VIEW_ALL_ORDERS_UPCOMING = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    timePeriod: "upcoming", //['upcoming', 'past', 'all']
  },
  expectResponse: fixtures.orders.where((order) => {
    return moment.utc(order.fulfilmentSlotFrom).isAfter(moment.utc());
  }),
};
const VIEW_ALL_ORDERS_PAST = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    timePeriod: "past", //['upcoming', 'past', 'all']
  },
  expectResponse: fixtures.orders.where((order) => {
    return moment.utc(order.fulfilmentSlotFrom).isBefore(moment.utc());
  }),
};
const VIEW_ALL_ORDERS_NON_ADMIN = {
  useAccount: "TEST_VENDOR",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    acceptanceStatus: "accepted", //['accepted', 'rejected', 'pending']
    timePeriod: "all", //['upcoming', 'past', 'all']
  },
  expectResponse: null,
};
const VIEW_APPROVE_ORDER = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-approve-order",
  sendData: {
    orderId: null, // populate from parent order
  },
  expectResponse: null, // populate from parent order
};
const APPROVE_OR_DECLINE_ORDER_ACCEPT = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "approve-or-decline-order",
  sendData: {
    orderId: null, // populate from parentOrder
    orderFulfilled: "accept", //['accept', 'reject', 'partial'],
    retainItems: [],
    removeItems: [],
  },
  expectResponse: {},
};
const APPROVE_OR_DECLINE_ORDER_REJECT = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "approve-or-decline-order",
  sendData: {
    orderId: null,
    orderFulfilled: "reject", //['accept', 'reject', 'partial'],
    retainItems: [],
    removeItems: [],
  },
  expectResponse: {},
};
const APPROVE_OR_DECLINE_ORDER_PARTIAL = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "approve-or-decline-order",
  sendData: {
    orderId: null,
    orderFulfilled: "partial", //['accept', 'reject', 'partial'],
    retainItems: [1, 2, 3],
    removeItems: [8],
  },
  expectResponse: {},
};
const UPDATE_PAID_ORDER_SUCCESS = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "peepl-pay-update-paid-order-webhook",
  sendData: {
    publicId: null,
    metadata: {
      orderId: 1,
      paymentIntentId: "",
      customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    },
    status: "success",
  },
  expectResponse: {},
};
const UPDATE_PAID_ORDER_FAILED = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "peepl-pay-update-paid-order-webhook",
  sendData: {
    publicId: null,
    metadata: {
      orderId: 1,
      paymentIntentId: "",
      customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    },
    status: "failed",
  },
  expectResponse: {},
};
const CUSTOMER_UPDATE_PAID_ORDER = {
  useAccount: "TEST_USER",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-update-paid-order",
  sendData: {
    orderId: null,
    customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    refundRequestGBPx: 5100, //TODO what wasnt in the refundRequestPPL
    refundRequestPPL: 0, //TODO order.total before flat fees and stuff added, pull adam changes, * 5% (coln/delv)
  },
  expectResponse: {
    orderId: null, //newOrderId
  },
};
const CUSTOMER_CANCEL_ORDER = {
  useAccount: "TEST_USER",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-cancel-order",
  sendData: {
    orderId: null, //TODO: Local DB updated by other tests, so replace this with a new create-order on each test
    customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
  },
  expectResponse: {},
};
const CUSTOMER_RECEIVED_ORDER_GOOD = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: null,
    orderReceived: true,
    orderCondition: 4,
    deliveryPunctuality: 5,
    feedback: "punctual and good condition",
  },
  expectResponse: {},
};
const CUSTOMER_RECEIVED_ORDER_POOR_CONDITION = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: null,
    orderReceived: true,
    orderCondition: 0,
    deliveryPunctuality: 5,
    feedback: "punctual and good condition",
  },
  expectResponse: {},
};
const CUSTOMER_RECEIVED_ORDER_NOT_RECEIVED = {
  useAccount: "TEST_USER",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: null,
    orderReceived: false,
    orderCondition: 0,
    deliveryPunctuality: 0,
    feedback: "Order not received. Why?",
  },
  expectResponse: {},
};
const CUSTOMER_RECEIVED_ORDER_LATE_DELIVERY = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: null,
    orderReceived: true,
    orderCondition: 4,
    deliveryPunctuality: 0,
    feedback: "delivery late and good condition",
  },
  expectResponse: {},
};
const CUSTOMER_RECEIVED_ORDER_BAD_INPUT_ORDER_COND = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: null,
    orderReceived: true,
    orderCondition: -1,
    deliveryPunctuality: 5,
    feedback: "some feedback",
  },
  expectResponse: {},
};
const CUSTOMER_RECEIVED_ORDER_BAD_INPUT_DELV_PUNCT = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: null,
    orderReceived: true,
    orderCondition: 4,
    deliveryPunctuality: 6,
    feedback: "some feedback",
  },
  expectResponse: {},
};

describe(`Order Model Integration Tests`, () => {
  describe(`${CREATE_ORDER.ACTION_NAME}() returns a 200 with json when authenticated`, () => {
    it("Returns a new order", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(CREATE_ORDER);
        const response = await hats.makeAuthCallWith({}, []);
        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Returns a new order with deliveryPostCode set", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(CREATE_ORDER);
        const response = await hats.makeAuthCallWith(
          {
            address: {
              ...hats.expectedResponseObjectWithUpdates.address,
              ...{postCode: "L1 0AR"}
            },
          },
          []
        );
        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Create-order fails with badly formatted deliveryPostCode set to 'L1'", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(CREATE_ORDER);
        const response = await hats.makeAuthCallWith(
          {
            address: {
              ...hats.expectedResponseObjectWithUpdates.address,
              ...{postCode: "L1"}
            },
          },
          []
        );
        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Create-order fails with badly formatted deliveryPostCode set to 'bs postcode'", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(CREATE_ORDER);
        const response = await hats.makeAuthCallWith(
          {
            address: {
              ...hats.expectedResponseObjectWithUpdates.address,
              ...{postCode: "bs postcode"}
            },
          },
          []
        );
        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Create-order with deliveryInstructions", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(CREATE_ORDER);
        const response = await hats.makeAuthCallWith(
          {
            address: {
              ...hats.expectedResponseObjectWithUpdates.address,
              ...{ deliveryInstructions: "Leave it by the door" },
            },
          },
          []
        );
        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });

  describe(`${GET_ORDER.ACTION_NAME}() successfully gets order with id 1`, () => {
    it("Can GET Orders by wallet address", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(GET_ORDER);
        const response = await hats.makeAuthCallWith(
          {},
          []
        );
        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${GET_ORDER_BY_WALLETADDRESS.ACTION_NAME}() successfully gets orders for walletaddress`, () => {
    it("Can GET Orders by wallet address", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            customerWalletAddress: "0xb98AEa2159e4855c8C703A19f57912ACAdCa3625"
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(
          GET_ORDER_BY_WALLETADDRESS
        );
        const response = await hats.makeAuthCallWith(
          {
            walletAddress:"0xb98AEa2159e4855c8C703A19f57912ACAdCa3625"
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        assert.isArray(response.body);
        hats.expectedResponse.checkResponse(response.body);
        expect(response.body[0]).to.deep.equal(parentOrder.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${MARK_ORDER_AS_PAID.ACTION_NAME} successfully flag order as paid`, () => {
    it("flags order as paid", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {},
          []
        );
        const hats = HttpAuthTestSenderOrder(
          MARK_ORDER_AS_PAID
        );
        const response = await hats.makeAuthCallWith(
          {
            publicId: parentOrder.body.publicId
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        const newOrder = await Orders.findOne({publicId: parentOrder.body.publicId});
        expect(newOrder.paymentStatus).to.equal("paid");
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("can flag order as payment failed", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {},
          []
        );
        const hats = HttpAuthTestSenderOrder(
          MARK_ORDER_AS_PAYMENT_FAILED
        );
        const response = await hats.makeAuthCallWith(
          {
            publicId: parentOrder.body.publicId
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        const newOrder = await Orders.findOne({publicId: parentOrder.body.publicId});
        expect(newOrder.paymentStatus).to.equal("failed");
        
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("can flag order as refund succeeded and notifies users, vendors and vegisupport", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith({}, []);
        const hats = HttpAuthTestSenderOrder(MARK_ORDER_AS_REFUNDED_SUCCESS);
        const response = await hats.makeAuthCallWith(
          {
            publicId: parentOrder.body.publicId,
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        const newOrder = await Orders.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.completedFlag).to.equal("refunded");
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("can notify users, vendors and vegisupport when a refund fails", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith({}, []);
        const hats = HttpAuthTestSenderOrder(MARK_ORDER_AS_REFUNDED_FAILED);
        const response = await hats.makeAuthCallWith(
          {
            publicId: parentOrder.body.publicId,
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        const newOrder = await Orders.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.completedFlag).to.not.equal("refunded");
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${GET_ORDER_STATUS.ACTION_NAME}() successfully gets order status`, () => {
    it("Order status correct", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(
          GET_ORDER_STATUS
        );
        const response = await hats.makeAuthCallWith(
          {},
          []
        );

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${VIEW_ALL_ORDERS_ACCEPTED.ACTION_NAME}()`, () => {
    it("successfully gets all accepted orders", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(VIEW_ALL_ORDERS_ACCEPTED);
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${VIEW_ALL_ORDERS_REJECTED.ACTION_NAME}()`, () => {
    it("successfully gets all rejected orders", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(VIEW_ALL_ORDERS_REJECTED);
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${VIEW_ALL_ORDERS_PENDING.ACTION_NAME}()`, () => {
    it("successfully gets all pending orders", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(VIEW_ALL_ORDERS_PENDING);
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${VIEW_ALL_ORDERS_DEFAULT.ACTION_NAME}()`, () => {
    it("successfully gets all orders with no status parameter set", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(VIEW_ALL_ORDERS_DEFAULT);
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${VIEW_ALL_ORDERS_UPCOMING.ACTION_NAME}()`, () => {
    it("successfully gets all upcoming orders with no status parameter set", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(VIEW_ALL_ORDERS_UPCOMING);
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${VIEW_ALL_ORDERS_PAST.ACTION_NAME}()`, () => {
    it("successfully gets all past orders with no status parameter set", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(VIEW_ALL_ORDERS_PAST);
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${VIEW_ALL_ORDERS_NON_ADMIN.ACTION_NAME}()`, () => {
    it("successfully gets all orders when logged in as admin", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(VIEW_ALL_ORDERS_NON_ADMIN);
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("fails to get any orders when logged in as non-admin", async () => {
      try {
        const hats = HttpAuthTestSenderOrder(VIEW_ALL_ORDERS_NON_ADMIN);
        const response = await hats.makeAuthCallWith({}, []);

        expect(response.statusCode).to.equal(401);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });

  describe(`${VIEW_APPROVE_ORDER.ACTION_NAME}()`, () => {
    it("successfully view approve-order screen for order from publicId", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(VIEW_APPROVE_ORDER);
        const response = await hats.makeAuthCallWith({
          orderId: parentOrder.body.publicId
        }, []);

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body, parentOrder);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${APPROVE_OR_DECLINE_ORDER_ACCEPT.ACTION_NAME}()`, () => {
    it("vendors can successfully accept an order from approve-or-decline-order action", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(APPROVE_OR_DECLINE_ORDER_ACCEPT);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("vendors can successfully reject an order from approve-or-decline-order action", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(APPROVE_OR_DECLINE_ORDER_REJECT);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("vendors can successfully partially accept an order from approve-or-decline-order action", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(APPROVE_OR_DECLINE_ORDER_PARTIAL);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${CUSTOMER_UPDATE_PAID_ORDER.ACTION_NAME}()`, () => {
    it("users can successfully UPDATE ITEMS on an order after getting a partial fulfillment back from a vendor", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(CUSTOMER_UPDATE_PAID_ORDER);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
            retailItems: [1, 2, 3],
            removeItems: [6, 8],
            refundRequestGBPx: 5300, //TODO what wasnt in the refundRequestPPL
            refundRequestPPL: 0, //TODO order.total before flat fees and stuff added, pull adam changes, * 5% (coln/delv)
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
        expect(response.body).to.have.property('orderId');
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("users can successfully CANCEL an order after getting a partial fulfillment back from a vendor", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(CUSTOMER_CANCEL_ORDER);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Orders.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.completedFlag).to.not.equal("cancelled");
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${CUSTOMER_RECEIVED_ORDER_GOOD.ACTION_NAME}()`, () => {
    it("users can successfully confirm order was received in good condition", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(CUSTOMER_RECEIVED_ORDER_GOOD);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
            orderReceived: true,
            orderCondition: 4,
            deliveryPunctuality: 5,
            feedback: "punctual and good condition",
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Orders.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.completedFlag).to.equal("completed");
        expect(newOrder.completedOrderFeedback).to.equal(
          "punctual and good condition"
        );
        expect(newOrder.orderCondition).to.equal(4);
        expect(newOrder.deliveryPunctuality).to.equal(5);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("users can successfully confirm order was received in POOR condition", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(CUSTOMER_RECEIVED_ORDER_POOR_CONDITION);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
            orderCondition: 0,
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Orders.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.orderCondition).to.equal(0);
        expect(newOrder.completedFlag).to.equal("completed");
        expect(newOrder.completedOrderFeedback).to.equal(
          "punctual and good condition"
        );
        expect(newOrder.deliveryPunctuality).to.equal(5);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("users can successfully confirm order was received LATE", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(CUSTOMER_RECEIVED_ORDER_LATE_DELIVERY);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
            orderCondition: 4,
            deliveryPunctuality: 0,
            feedback: "delivery late and good condition",
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Orders.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.deliveryPunctuality).to.equal(0);
        expect(newOrder.orderCondition).to.equal(4);
        expect(newOrder.completedFlag).to.equal("completed");
        expect(newOrder.completedOrderFeedback).to.equal(
          "delivery late and good condition"
        );
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("users can successfully confirm order was NOT RECEIVED", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(CUSTOMER_RECEIVED_ORDER_NOT_RECEIVED);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
            orderReceived: false,
            orderCondition: 0,
            deliveryPunctuality: 0,
            feedback: "Order not received. Why?",
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Orders.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.completedFlag).to.equal("");
        expect(newOrder.deliveryPunctuality).to.be.null();
        expect(newOrder.orderCondition).to.be.null();
        expect(newOrder.completedOrderFeedback).to.be.null();
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("API will not accept bad delivery punctuality input", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(CUSTOMER_RECEIVED_ORDER_BAD_INPUT_DELV_PUNCT);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
            deliveryPunctuality: 6,
          },
          []
        );

        expect(response.statusCode).to.equal(400);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Orders.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.completedFlag).to.equal("");
        expect(newOrder.deliveryPunctuality).to.be.null();
        expect(newOrder.orderCondition).to.be.null();
        expect(newOrder.completedOrderFeedback).to.be.null();
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("API will not accept bad order condition input", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(CUSTOMER_RECEIVED_ORDER_BAD_INPUT_ORDER_COND);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
            orderCondition: -1,
          },
          []
        );

        expect(response.statusCode).to.equal(400);
        // hats.expectedResponse.checkResponse(response.body);
        const newOrder = await Orders.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.completedFlag).to.equal("");
        expect(newOrder.deliveryPunctuality).to.be.null();
        expect(newOrder.orderCondition).to.be.null();
        expect(newOrder.completedOrderFeedback).to.be.null();
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });

  describe(`${UPDATE_PAID_ORDER_SUCCESS.ACTION_NAME}()`, () => {
    it("PeeplPay Service can successfully send notifications when a payment succeeds for an order", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(UPDATE_PAID_ORDER_SUCCESS);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("PeeplPay Service can successfully send notifications when a payment fails for an order", async () => {
      try {
        const parentOrder = await HttpAuthTestSenderOrder(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
            items: [
              {
                id: 1,
                options: {
                  1: 1, // productOption : productOptionValue
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 2,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 3,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 6,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
              {
                id: 8,
                options: {
                  1: 1,
                  2: 5,
                  3: 10,
                },
              },
            ],
            total: 5300,
          },
          []
        );
        const hats = HttpAuthTestSenderOrder(UPDATE_PAID_ORDER_FAILED);
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.body.id,
          },
          []
        );

        expect(response.statusCode).to.equal(200);
        // hats.expectedResponse.checkResponse(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
});
