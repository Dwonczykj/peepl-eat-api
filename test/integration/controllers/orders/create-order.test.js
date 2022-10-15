// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
// const _ = require('lodash');
var util = require("util");
const moment = require("moment/moment");
require("ts-node/register");
const { fixtures } = require("../../../../scripts/build_db");
const { getNextWeekday } = require("../../../utils");

// const { v4: uuidv4 } = require("uuid");

const {
  DEFAULT_NEW_ORDER_OBJECT,
  ExpectResponseOrder,
  HttpAuthTestSenderOrder,
} = require("./defaultOrder");

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
      expect(response.body).to.have.property("orderId");
      expect(response.body).to.have.property("paymentIntentID");
      // await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne({
        id: response.body.orderId,
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
      return;
    },
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
        expect(response.body).to.have.property("orderId");
        expect(response.body).to.have.property("paymentIntentID");
        // await hats.expectedResponse.checkResponse(response);
        const newOrder = await Order.findOne({
          id: response.body.orderId,
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
        expect(response.body).to.have.property("orderId");
        const newOrder = await Order.findOne(response.body.orderId);
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
        expect(response.body).not.to.have.property("orderId");
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
        expect(response.body).not.to.have.property("orderId");
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
        expect(response.body).to.have.property("orderId");
        const newOrder = await Order.findOne(response.body.orderId);
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
        expect(response.body).to.have.property("orderId");
        const newOrder = await Order.findOne(response.body.orderId).populate(
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
        expect(response.body).to.have.property("orderId");
        const newOrder = await Order.findOne(response.body.orderId).populate(
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
});
