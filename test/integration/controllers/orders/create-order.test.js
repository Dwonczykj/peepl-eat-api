// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
// const _ = require('lodash');
var util = require("util");
const moment = require("moment/moment");
require("ts-node/register");
const { fixtures } = require("../../../../scripts/build_db");
const { getNextWeekday } = require("../../../utils");
const {
  HttpAuthTestSender,
  ExpectResponse,
} = require("../../../httpTestSender");

const { v4: uuidv4 } = require("uuid");
/* Check if string is valid UUID */
function checkIfValidUUID(str) {
  // Regular expression to check if string is a valid UUID
  // ~ https://melvingeorge.me/blog/check-if-string-valid-uuid-regex-javascript
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
}

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
      ExpectResponseOrder,
      expectResponseCb,
      expectStatusCode,
    });
  }
}

const CREATE_ORDER = (fixtures) => {
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
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "orders",
    ACTION_NAME: "create-order",
    sendData: {
      vendor: vendor.id,
      items: fixtures.products
        .filter((product) => product.vendor === vendor.id)
        .map((product) => ({
          // id: 6,
          // order: 4,
          product: product.id,
          unfulfilled: false,
          unfulfilledOnOrderId: null,
          options: fixtures.productOptions
            .filter((po) => po.product === product.id)
            .map((po) => {
              const x = fixtures.productOptionValues.filter(
                (pov) => pov.option === po.id
              );
              const y = {};
              if (x) {
                y[po.id] = x[0].id;
              }
              return y;
            })
            .reduce((prev, cur) => ({ ...prev, ...cur }), {}),
        })),
      total: 2375,
      tipAmount: 0,
      marketingOptIn: false,
      walletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
      address: {
        name: "Adam Galloway",
        email: "adam@itsaboutpeepl.com",
        phoneNumber: "07495995614",
        lineOne: "17 Teck Street",
        lineTwo: "",
        city: "Liverpool",
        postCode: "L1 0AR",
        deliveryInstructions: "Leave it behind the bin",
      },
      fulfilmentMethod: fulfilmentMethodVendor.id,
      fulfilmentSlotFrom:
        getNextWeekday(openAtHours.dayOfWeek) +
        " " +
        openAtHours.openTime +
        ":00", // "2022-10-07 11:00:00"
      fulfilmentSlotTo:
        getNextWeekday(openAtHours.dayOfWeek) +
        " " +
        moment(openAtHours.openTime, "HH:mm")
          .add(fulfilmentMethodVendor.slotLength, "minutes")
          .format("HH:mm") +
        ":00", // "2022-10-07 11:00:00"
      discountCode: fixtures.discountCodes[0].code,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("orderID");
      expect(response.body).to.have.property("paymentIntentID");
      // await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne({
        id: response.body.orderID,
      }).populate("items");
      expect(newOrder).to.have.property("items");
      assert.isArray(newOrder.items);
      expect(newOrder.items).to.have.lengthOf(requestPayload.items.length);
      return;
    },
  };
};
const GET_ORDER = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "get",
    ACTION_PATH: "orders",
    ACTION_NAME: "get-order-details",
    sendData: {
      orderId: fixtures.orders[0].id,
    },
    expectResponse: fixtures.orders[0],
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("order");
      expect(response.body.order).to.have.property("publicId");
      const order = await Order.findOne(response.body.order.id).populate(
        "items"
      );
      expect(order).to.have.property("items");
      assert.isArray(order.items);
      expect(order.items.length).to.be.greaterThan(
        0,
        util.inspect(order, { depth: null })
      );
      return;
    },
  };
};
const GET_ORDERS_BY_WALLETADDRESS = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("orders");
      return;
    },
  };
};

const VIEW_ORDER = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "get",
    ACTION_PREFIX: "",
    ACTION_PATH: "admin",
    ACTION_NAME: "order/:orderId",
    sendData: {
      orderId: fixtures.orders[0].publicId,
    },
    expectResponse: null,
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("order");
      expect(response.body.order).to.have.property("publicId");
      const order = await Order.findOne(response.body.order.id).populate(
        "items"
      );
      expect(order).to.have.property("items");
      assert.isArray(order.items);
      expect(order.items.length).to.be.greaterThan(
        0,
        util.inspect(order, { depth: null })
      );
      return;
    },
  };
};

const VIEW_APPROVE_ORDER = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "get",
    ACTION_PREFIX: "",
    ACTION_PATH: "admin",
    ACTION_NAME: "approve-order/:orderId",
    sendData: {
      orderId: fixtures.orders[0].publicId,
    },
    expectResponse: null,
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("order");
      return;
    },
  };
};

const APPROVE_OR_DECLINE_ORDER_ACCEPT = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal("accepted");
      expect(order.rewardsIssued).to.be.greaterThan(0);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_REJECT = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal("rejected");
      expect(order.rewardsIssued).to.equal(0);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_FAILS_IF_ALREADY_ACCEPTED = (fixtures) => {
  return {
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
    expectStatusCode: 400,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal("rejected");
      expect(order.rewardsIssued).to.equal(0);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_FAILS_IF_NOT_PAID_FOR = (fixtures) => {
  return {
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
    expectStatusCode: 400,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal("rejected");
      expect(order.rewardsIssued).to.equal(0);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_PARTIAL = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "approve-or-decline-order",
    sendData: {
      orderId: null,
      orderFulfilled: "partial", //['accept', 'reject', 'partial'],
      retainItems: [1, 2, 3, 6],
      removeItems: [8],
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal("partially fulfilled");
      expect(order.completedFlag).to.equal("void");
      expect(order.rewardsIssued).to.equal(0);
      const childOrder = await Order.findOne({
        parentOrder: order.id,
      }).populate("items");
      assert.exists(
        childOrder,
        `Unable to locate parentOrder with id: ${order.id}`
      );
      expect(childOrder).to.have.property('items');
      expect(
        childOrder.items.filter((item) => item.unfulfilled !== true)
      ).to.have.lengthOf(requestPayload.retainItems.length);
      expect(
        childOrder.items.filter((item) => item.unfulfilled === true)
      ).to.have.lengthOf(requestPayload.removeItems.length);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_PARTIAL_FAIL_INCOMPLETE_ITEMS = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "approve-or-decline-order",
    sendData: {
      orderId: null,
      orderFulfilled: "partial", //['accept', 'reject', 'partial'],
      retainItems: [1, 6],
      removeItems: [8],
    },
    expectResponse: {},
    expectStatusCode: 400,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal("pending");
      expect(order.completedFlag).to.equal("");
      expect(order.rewardsIssued).to.equal(0);
      const childOrder = await Order.findOne({
        parentOrder: order.id,
      }).populate("items");
      assert.notExists(childOrder);
      return;
    },
  };
};

const USER_UPDATE_PAID_ORDER_SUCCESS = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const UPDATE_PAID_ORDER_FAILED = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_UPDATE_PAID_ORDER = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_CANCEL_ORDER = (fixtures) => {
  return {
    useAccount: "TEST_USER",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "customer-cancel-order",
    sendData: {
      orderId: null, //TODO: Local DB updated by other tests, so replace this with a new create-order on each test
      customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_GOOD = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_POOR_CONDITION = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_NOT_RECEIVED = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_LATE_DELIVERY = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_BAD_INPUT_ORDER_COND = (fixtures) => {
  return {
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
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_BAD_INPUT_DELV_PUNCT = (fixtures) => {
  return {
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
};

describe(`Order Model Integration Tests`, () => {
  describe(`${
    CREATE_ORDER(fixtures).ACTION_NAME
  }() returns a 200 with json when authenticated`, () => {
    it("Returns a new order", async () => {
      try {
        const sendOrder = CREATE_ORDER(fixtures);
        const hats = new HttpAuthTestSenderOrder(sendOrder);
        const response = await hats.makeAuthCallWith({}, []);
        expect(response.statusCode).to.equal(
          200,
          `[${response.body.code}] -> response.body: ${util.inspect(
            response.body,
            {
              depth: null,
            }
          )} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
        );
        expect(response.body).to.have.property("orderID");
        expect(response.body).to.have.property("paymentIntentID");
        // await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
          id: response.body.orderID,
        }).populate("items");
        expect(newOrder).to.have.property("items");
        assert.isArray(newOrder.items);
        expect(newOrder.items).to.have.lengthOf(
          sendOrder.sendData.items.length
        );
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Returns a new order with deliveryPostCode set", async () => {
      try {
        const sendOrder = CREATE_ORDER(fixtures);
        const hats = new HttpAuthTestSenderOrder(sendOrder);
        const response = await hats.makeAuthCallWith(
          {
            address: {
              ...sendOrder.sendData.address,
              ...{ postCode: "L1 0AR" },
            },
          },
          []
        );
        expect(response.statusCode).to.equal(
          200,
          `[${response.body.code}] -> response.body: ${util.inspect(
            response.body,
            {
              depth: null,
            }
          )} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
        );
        expect(response.body).to.have.property("orderID");
        const newOrder = await Order.findOne(response.body.orderID);
        expect(newOrder).to.have.property("deliveryAddressPostCode");
        expect(newOrder.deliveryAddressPostCode).to.equal("L1 0AR");
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Create-order fails with badly formatted deliveryPostCode set to 'L1'", async () => {
      try {
        const sendOrder = CREATE_ORDER(fixtures);
        const hats = new HttpAuthTestSenderOrder(sendOrder);
        const response = await hats.makeAuthCallWith(
          {
            address: {
              ...sendOrder.sendData.address,
              ...{ postCode: "L1" },
            },
          },
          []
        );
        expect(response.statusCode).to.equal(
          400,
          `[${response.body.code}] -> response.body: ${util.inspect(
            response.body,
            {
              depth: null,
            }
          )} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
        );
        expect(response.body).not.to.have.property("orderID");
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Create-order fails with badly formatted deliveryPostCode set to 'bs postcode'", async () => {
      try {
        const sendOrder = CREATE_ORDER(fixtures);
        const hats = new HttpAuthTestSenderOrder(sendOrder);
        const response = await hats.makeAuthCallWith(
          {
            address: {
              ...sendOrder.sendData.address,
              ...{ postCode: "bs postcode" },
            },
          },
          []
        );
        expect(response.statusCode).not.to.equal(200);
        expect(response.body).not.to.have.property("orderID");
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Create-order with deliveryInstructions", async () => {
      try {
        const sendOrder = CREATE_ORDER(fixtures);
        const hats = new HttpAuthTestSenderOrder(sendOrder);
        const response = await hats.makeAuthCallWith(
          {
            address: {
              ...sendOrder.sendData.address,
              ...{ deliveryInstructions: "Leave it by the door" },
            },
          },
          []
        );
        expect(response.statusCode).to.equal(
          200,
          `[${response.body.code}] -> response.body: ${util.inspect(
            response.body,
            {
              depth: null,
            }
          )} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
        );
        expect(response.body).to.have.property("orderID");
        const newOrder = await Order.findOne(response.body.orderID);
        expect(newOrder).to.have.property("deliveryAddressInstructions");
        expect(newOrder.deliveryAddressInstructions).to.equal(
          "Leave it by the door"
        );
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Create-order with a fulfilmentMethod of type collection set works", async () => {
      try {
        const sendOrder = CREATE_ORDER(fixtures);
        const fulfilmentMethodVendor = fixtures.fulfilmentMethods.filter(
          (fm) =>
            fm.vendor === fixtures.vendors[0].id &&
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
        const hats = new HttpAuthTestSenderOrder(sendOrder);
        const response = await hats.makeAuthCallWith(
          {
            fulfilmentMethod: fulfilmentMethodVendor.id,
            fulfilmentSlotFrom:
              getNextWeekday(openAtHours.dayOfWeek) +
              " " +
              openAtHours.openTime +
              ":00", // "2022-10-07 11:00:00"
            fulfilmentSlotTo:
              getNextWeekday(openAtHours.dayOfWeek) +
              " " +
              moment(openAtHours.openTime, "HH:mm")
                .add(fulfilmentMethodVendor.slotLength, "minutes")
                .format("HH:mm") +
              ":00",
          },
          []
        );
        expect(response.statusCode).to.equal(
          200,
          `[${response.body.code}] -> response.body: ${util.inspect(
            response.body,
            {
              depth: null,
            }
          )} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
        );
        expect(response.body).to.have.property("orderID");
        const newOrder = await Order.findOne(response.body.orderID).populate(
          "items"
        );
        expect(newOrder).to.have.property("items");
        assert.isArray(newOrder.items);
        expect(newOrder.items).to.have.lengthOf(
          sendOrder.sendData.items.length
        );
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("Create-order succeeds when opening hours apply to a delivery fulfilment and order fulfilment id is for collection, but no delivery partner is set as none can service the order", async () => {
      try {
        const sendOrder = CREATE_ORDER(fixtures);
        const fulfilmentMethodVendor = fixtures.fulfilmentMethods.filter(
          (fm) =>
            fm.vendor === fixtures.vendors[0].id &&
            fm.methodType === "collection" &&
            fixtures.openingHours.filter(
              (oh) => oh.fulfilmentMethod === fm.id && oh.isOpen === true
            )
        )[0];
        // const openAtHours = fixtures.openingHours.filter(
        //   (openHrs) =>
        //     openHrs.isOpen === true &&
        //     openHrs.fulfilmentMethod === fulfilmentMethodVendor.id
        // )[0];
        const hats = new HttpAuthTestSenderOrder(sendOrder);
        const response = await hats.makeAuthCallWith(
          {
            fulfilmentMethod: fulfilmentMethodVendor.id,
          },
          []
        );
        expect(response.statusCode).to.equal(
          200,
          `[${response.body.code}] -> response.body: ${util.inspect(
            response.body,
            {
              depth: null,
            }
          )} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
        );
        expect(response.body).to.have.property("orderID");
        const newOrder = await Order.findOne(response.body.orderID).populate(
          "items"
        );
        expect(newOrder).to.have.property("items");
        assert.isArray(newOrder.items);
        expect(newOrder.items).to.have.lengthOf(
          sendOrder.sendData.items.length
        );
        expect(newOrder).to.have.property("deliveryPartnerAccepted");
        assert.isFalse(newOrder.deliveryPartnerAccepted);
        assert.isNull(newOrder.deliveryPartner);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });

  describe(`${
    GET_ORDER(fixtures).ACTION_NAME
  }() successfully gets order with id`, () => {
    it("Can GET Order", async () => {
      try {
        const hats = new HttpAuthTestSenderOrder(GET_ORDER(fixtures));
        const response = await hats.makeAuthCallWith({}, []);
        expect(response.statusCode).to.equal(
          200,
          `[${response.body.code}] -> response.body: ${util.inspect(
            response.body,
            {
              depth: null,
            }
          )} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });

  describe(`${
    VIEW_ORDER(fixtures).ACTION_NAME
  }() successfully gets single order`, () => {
    it("Can View Single Order", async () => {
      try {
        const hats = new HttpAuthTestSenderOrder(VIEW_ORDER(fixtures));
        const response = await hats.makeAuthCallWith({}, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });

  describe(`${
    GET_ORDERS_BY_WALLETADDRESS(fixtures).ACTION_NAME
  }() successfully gets orders for walletaddress`, () => {
    it("Can GET 2 Orders by wallet address", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {})
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          GET_ORDERS_BY_WALLETADDRESS(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            walletAddress: parentOrder.customerWalletAddress,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        expect(response.body).to.have.property("orders");
        assert.isArray(response.body.orders);
        assert.isNotEmpty(
          response.body.orders.filter((order) => order.id === parentOrder.id)
        );
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("GETs Empty Array when no orders for wallet address", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            customerWalletAddress: "0xb98AEa2159e4855c8C703A19f57912ACAdCa3625",
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          GET_ORDERS_BY_WALLETADDRESS(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            walletAddress: "randomxwalletzaddress",
          },
          []
        );

        assert.isArray(response.body.orders);
        expect(response.body.orders).to.have.lengthOf(0);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });

  describe(`${VIEW_APPROVE_ORDER(fixtures).ACTION_NAME}()`, () => {
    it("successfully view approve-order screen for order from publicId", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(VIEW_APPROVE_ORDER(fixtures));
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
          },
          []
        );
        hats.expectedResponse.checkResponse(response.body, parentOrder);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${APPROVE_OR_DECLINE_ORDER_ACCEPT(fixtures).ACTION_NAME}()`, () => {
    it("vendors can successfully accept an order from approve-or-decline-order action", async () => {
      try {
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
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            restaurantAcceptanceStatus: "pending",
            paymentStatus: "paid",
            paymentIntentId: "dummy_payment_intent_id_" + uuidv4(),
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
            fulfilmentMethod: fulfilmentMethodVendor.id,
            fulfilmentSlotFrom:
              getNextWeekday(openAtHours.dayOfWeek) + " 11:00:00",
            fulfilmentSlotTo:
              getNextWeekday(openAtHours.dayOfWeek) + " 12:00:00",
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          APPROVE_OR_DECLINE_ORDER_ACCEPT(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("vendors can successfully reject an order from approve-or-decline-order action", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            restaurantAcceptanceStatus: "pending",
            paymentStatus: "paid",
            paymentIntentId: "dummy_payment_intent_id_" + uuidv4(),
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          APPROVE_OR_DECLINE_ORDER_REJECT(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("vendors cannot accept an order that has already been accepted from approve-or-decline-order action", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            restaurantAcceptanceStatus: "accepted",
            paymentStatus: "paid",
            paymentIntentId: "dummy_payment_intent_id_" + uuidv4(),
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          APPROVE_OR_DECLINE_ORDER_FAILS_IF_ALREADY_ACCEPTED(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
          },
          []
        );
        // await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("vendors cannot accept an order that has not been paid for from approve-or-decline-order action", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            restaurantAcceptanceStatus: "accepted",
            paymentStatus: "unpaid",
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          APPROVE_OR_DECLINE_ORDER_FAILS_IF_NOT_PAID_FOR(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
          },
          []
        );
        // await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("vendors can partially accept an order from approve-or-decline-order action", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            restaurantAcceptanceStatus: "pending",
            paymentStatus: "paid",
            paymentIntentId: "dummy_payment_intent_id_" + uuidv4(),
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          APPROVE_OR_DECLINE_ORDER_PARTIAL(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
            orderFulfilled: "partial", //['accept', 'reject', 'partial'],
            retainItems: [1, 2, 3, 6],
            removeItems: [8],
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("vendors can partially accept an order from approve-or-decline-order action with items missing from the union of retain and remove orders payload", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            restaurantAcceptanceStatus: "pending",
            paymentStatus: "paid",
            paymentIntentId: "dummy_payment_intent_id_" + uuidv4(),
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          APPROVE_OR_DECLINE_ORDER_PARTIAL_FAIL_INCOMPLETE_ITEMS(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
            orderFulfilled: "partial", //['accept', 'reject', 'partial'],
            retainItems: [1, 6],
            removeItems: [8],
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

  describe(`${CUSTOMER_UPDATE_PAID_ORDER(fixtures).ACTION_NAME}()`, () => {
    it("users can successfully UPDATE ITEMS on an order after getting a partial fulfillment back from a vendor", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          CUSTOMER_UPDATE_PAID_ORDER(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
            retainItems: [1, 2, 3],
            removeItems: [6, 8],
            refundRequestGBPx: 5300, //TODO what wasnt in the refundRequestPPL
            refundRequestPPL: 0, //TODO order.total before flat fees and stuff added, pull adam changes, * 5% (coln/delv)
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        expect(response.body).to.have.property("orderId");
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("users can successfully CANCEL an order after getting a partial fulfillment back from a vendor", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          CUSTOMER_CANCEL_ORDER(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
          publicId: parentOrder.body.publicId,
        });
        expect(newOrder.completedFlag).to.not.equal("cancelled");
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${CUSTOMER_RECEIVED_ORDER_GOOD(fixtures).ACTION_NAME}()`, () => {
    it("users can successfully confirm order was received in good condition", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          CUSTOMER_RECEIVED_ORDER_GOOD(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
            orderReceived: true,
            orderCondition: 4,
            deliveryPunctuality: 5,
            feedback: "punctual and good condition",
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
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
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          CUSTOMER_RECEIVED_ORDER_POOR_CONDITION(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
            orderCondition: 0,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
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
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          CUSTOMER_RECEIVED_ORDER_LATE_DELIVERY(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
            orderCondition: 4,
            deliveryPunctuality: 0,
            feedback: "delivery late and good condition",
          },
          []
        );

        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
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
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          CUSTOMER_RECEIVED_ORDER_NOT_RECEIVED(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
            orderReceived: false,
            orderCondition: 0,
            deliveryPunctuality: 0,
            feedback: "Order not received. Why?",
          },
          []
        );

        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
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
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          CUSTOMER_RECEIVED_ORDER_BAD_INPUT_DELV_PUNCT(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
            deliveryPunctuality: 6,
          },
          []
        );

        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
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
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          CUSTOMER_RECEIVED_ORDER_BAD_INPUT_ORDER_COND(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
            orderCondition: -1,
          },
          []
        );

        await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
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

  describe(`${USER_UPDATE_PAID_ORDER_SUCCESS(fixtures).ACTION_NAME}()`, () => {
    it("PeeplPay Service can successfully send notifications when a payment succeeds for an order", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          USER_UPDATE_PAID_ORDER_SUCCESS(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
          },
          []
        );

        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it("PeeplPay Service can successfully send notifications when a payment fails for an order", async () => {
      try {
        const parentOrder = await Order.create(
          DEFAULT_NEW_ORDER_OBJECT(fixtures, {
            parentOrder: null,
            items: [1, 2, 3, 6, 8],
            total: 5300,
          })
        ).fetch();
        const hats = new HttpAuthTestSenderOrder(
          UPDATE_PAID_ORDER_FAILED(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            orderId: parentOrder.publicId,
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
});
