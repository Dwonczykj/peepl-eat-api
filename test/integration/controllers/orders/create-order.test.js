/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const _ = require('lodash');
const { callAuthActionWithCookie } = require("../../../utils");
// var util = require("util");
const moment = require("moment/moment");
require("ts-node/register");

// const { v4: uuidv4 } = require('uuid');
/* Check if string is valid UUID */
function checkIfValidUUID(str) {
  // Regular expression to check if string is a valid UUID
  // ~ https://melvingeorge.me/blog/check-if-string-valid-uuid-regex-javascript
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
}

const CREATE_ORDER = {
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
    discount: 1, //TODO: Check what the id of this should be for DELI10
    paymentStatus: "unpaid",
    paymentIntentId: "",
    deliveryId: "",
    deliveryPartnerAccepted: false, //TODO Check can update
    deliveryPartnerConfirmed: false, //TODO Check can update,
    rewardsIssued: 0, //TODO Check can update,
    sentToDeliveryPartner: false, //TODO Check can update,
    completedFlag: false, //TODO Check can update ["", "completed", "cancelled", "refunded", "void"]
    completedOrderFeedback: null, //TODO: Check can add feedback after order
    deliveryPunctuality: null, //TODO check can be set after and has to be an INT between 0 and 5 inclusive
    orderCondition: null, // TODO check can be set after and has to be an INT between 0 and 5 inclusive
    unfulfilledItems: [], //Check using partial orders
    deliveryPartner: null, // TODO Check can set after order creation when the courier is subsequently confirmed
    parentOrder: null,
  }
};
const VIEW_ORDER = {
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-order",
  sendData:{
    orderId: 1, //fixture
  },
  expectResponse: {
    items: [
      {
        id: 1,
        options: {
          1: 1,
          2: 5,
          3: 10,
        }
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
    deliveryPartnerAccepted: false, //TODO Check can update
    deliveryPartnerConfirmed: false, //TODO Check can update,
    rewardsIssued: 0, //TODO Check can update,
    sentToDeliveryPartner: false, //TODO Check can update,
    completedFlag: false, //TODO Check can update ["", "completed", "cancelled", "refunded", "void"]
    completedOrderFeedback: null, //TODO: Check can add feedback after order
    deliveryPunctuality: null, //TODO check can be set after and has to be an INT between 0 and 5 inclusive
    orderCondition: null, // TODO check can be set after and has to be an INT between 0 and 5 inclusive
    unfulfilledItems: [], //Check using partial orders
    deliveryPartner: null, // TODO Check can set after order creation when the courier is subsequently confirmed
    parentOrder: null,
  },
};
const GET_ORDER = {
  HTTP_TYPE: "get",
  ACTION_PATH: "orders",
  ACTION_NAME: "get-order-details",
  sendData: {
    orderId: 1,
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
    deliveryPartnerAccepted: false, //TODO Check can update
    deliveryPartnerConfirmed: false, //TODO Check can update,
    rewardsIssued: 0, //TODO Check can update,
    sentToDeliveryPartner: false, //TODO Check can update,
    completedFlag: false, //TODO Check can update ["", "completed", "cancelled", "refunded", "void"]
    completedOrderFeedback: null, //TODO: Check can add feedback after order
    deliveryPunctuality: null, //TODO check can be set after and has to be an INT between 0 and 5 inclusive
    orderCondition: null, // TODO check can be set after and has to be an INT between 0 and 5 inclusive
    unfulfilledItems: [], //Check using partial orders
    deliveryPartner: null, // TODO Check can set after order creation when the courier is subsequently confirmed
    parentOrder: null,
  },
};
const GET_ORDER_STATUS = {
  HTTP_TYPE: "get",
  ACTION_PATH: "orders",
  ACTION_NAME: "get-order-status",
  sendData: {
    orderId: 1,
  },
  expectResponse: {
    paymentStatus: "unpaid",
    restaurantAcceptanceStatus: "pending"
  }
};
const MARK_ORDER_AS_PAID = {
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "peepl-pay-webhook",
  sendData: {
    publicId: null,
    status: "paid"
  },
  expectResponse: {
    
  }
};
const MARK_ORDER_AS_PAYMENT_FAILED = {
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "peepl-pay-webhook",
  sendData: {
    publicId: null,
    status: "failed"
  },
  expectResponse: {
    
  }
};


const UPDATE_PAID_ORDER_SUCCESS = {
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

const MARK_ORDER_AS_REFUNDED_SUCCESS = {
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
  HTTP_TYPE: "post",
  ACTION_PATH: "orders",
  ACTION_NAME: "peepl-pay-refund-webhook",
  sendData: {
    publicId: null,
    status: "failure",
  },
  expectResponse: {},
};

//TODO: do couriers/accept-reject-delivery-confirmation
//TODO: do couriers/add-delivery-availability-for-order which should default to the fulfilment slots of that deliverypartner for now and not contact the delvery partner
//TODO: do couriers/cancel-delivery
//TODO: do couriers/view-delivery

const GET_ORDER_BY_WALLETADDRESS = {
  HTTP_TYPE: "get",
  ACTION_PATH: "orders",
  ACTION_NAME: "ongoing-orders-by-wallet",
  sendData: {
    walletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B"
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
      discount: 1, //TODO: Check what the id of this should be for DELI10
      paymentStatus: "unpaid", //TODO: CHeck can update to paid|failed after object creation
      paymentIntentId: "",
      deliveryId: "",
      deliveryPartnerAccepted: false, //TODO Check can update
      deliveryPartnerConfirmed: false, //TODO Check can update,
      rewardsIssued: 0, //TODO Check can update,
      sentToDeliveryPartner: false, //TODO Check can update,
      completedFlag: false, //TODO Check can update ["", "completed", "cancelled", "refunded", "void"]
      completedOrderFeedback: null, //TODO: Check can add feedback after order
      deliveryPunctuality: null, //TODO check can be set after and has to be an INT between 0 and 5 inclusive
      orderCondition: null, // TODO check can be set after and has to be an INT between 0 and 5 inclusive
      unfulfilledItems: [], //Check using partial orders
      deliveryPartner: null, // TODO Check can set after order creation when the courier is subsequently confirmed
      parentOrder: null,
    },
  ]
};

const VIEW_ALL_ORDERS_ACCEPTED = {
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    acceptanceStatus: 'accepted', //['accepted', 'rejected', 'pending']
    timePeriod: 'all', //['upcoming', 'past', 'all']
  },
  expectResponse: null, //TODO: call to create or setup in fixtures
};
const VIEW_ALL_ORDERS_REJECTED = {
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    acceptanceStatus: "rejected", //['accepted', 'rejected', 'pending']
    timePeriod: "all", //['upcoming', 'past', 'all']
  },
  expectResponse: null, //TODO: call to create or setup in fixtures
};
const VIEW_ALL_ORDERS_PENDING = {
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    acceptanceStatus: "pending", //['accepted', 'rejected', 'pending']
    timePeriod: "all", //['upcoming', 'past', 'all']
  },
  expectResponse: null, //TODO: call to create or setup in fixtures
};
const VIEW_ALL_ORDERS_DEFAULT = {
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    timePeriod: 'all', //['upcoming', 'past', 'all']
  },
  expectResponse: null, //TODO: call to create or setup in fixtures
};
const VIEW_ALL_ORDERS_UPCOMING = {
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    timePeriod: 'upcoming', //['upcoming', 'past', 'all']
  },
  expectResponse: null, //TODO: call to create or setup in fixtures
};
const VIEW_ALL_ORDERS_PAST = {
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    timePeriod: 'past', //['upcoming', 'past', 'all']
  },
  expectResponse: null, //TODO: call to create or setup in fixtures
};
const VIEW_ALL_ORDERS_NON_ADMIN = {
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-all-orders",
  sendData: {
    //TODO: Implement each of the below and add multiple orders for each in fixtures
    acceptanceStatus: 'accepted', //['accepted', 'rejected', 'pending']
    timePeriod: 'all', //['upcoming', 'past', 'all']
  },
  expectResponse: null, //TODO: call to create or setup in fixtures
};
const VIEW_APPROVE_ORDER = {
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "view-approve-order",
  sendData: {
    orderId: 1,
  },
  expectResponse: VIEW_ORDER.expectResponse
};

const APPROVE_OR_DECLINE_ORDER_ACCEPT = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "approve-or-decline-order",
  sendData: {
    orderId: 1,
    orderFulfilled: 'accept', //['accept', 'reject', 'partial'],
    retainItems: [],
    removeItems: [],
  },
  expectResponse: {}
};
const APPROVE_OR_DECLINE_ORDER_REJECT = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "approve-or-decline-order",
  sendData: {
    orderId: 1,
    orderFulfilled: 'reject', //['accept', 'reject', 'partial'],
    retainItems: [],
    removeItems: [],
  },
  expectResponse: {}
};
const APPROVE_OR_DECLINE_ORDER_PARTIAL = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "approve-or-decline-order",
  sendData: {
    orderId: 1,
    orderFulfilled: 'partial', //['accept', 'reject', 'partial'],
    retainItems: [
      13
    ],
    removeItems: [
      14
    ],
  },
  expectResponse: {}
};

const CUSTOMER_RECEIVED_ORDER_GOOD = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: 1,
    orderReceived: true,
    orderCondition: 4, 
    deliveryPunctuality: 5,
    feedback: "punctual and good condition"
  },
  expectResponse: {}
};
const CUSTOMER_RECEIVED_ORDER_POOR_CONDITION = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: 1,
    orderReceived: true,
    orderCondition: 4,
    deliveryPunctuality: 5,
    feedback: "punctual and good condition"
  },
  expectResponse: {}
};
const CUSTOMER_RECEIVED_ORDER_LATE_DELIVERY = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: 1,
    orderReceived: true,
    orderCondition: 4,
    deliveryPunctuality: 0,
    feedback: "delivery late and good condition"
  },
  expectResponse: {}
};
const CUSTOMER_RECEIVED_ORDER_BAD_INPUT_ORDER_COND = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: 1,
    orderReceived: true,
    orderCondition: -1,
    deliveryPunctuality: 5,
    feedback: "some feedback"
  },
  expectResponse: {}
};
const CUSTOMER_RECEIVED_ORDER_BAD_INPUT_DELV_PUNCT = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: 1,
    orderReceived: true,
    orderCondition: 4,
    deliveryPunctuality: 6,
    feedback: "some feedback"
  },
  expectResponse: {}
};
const CUSTOMER_RECEIVED_ORDER_NOT_RECEIVED = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-received-order",
  sendData: {
    orderId: 1,
    orderReceived: false,
    orderCondition: 0,
    deliveryPunctuality: 0,
    feedback: "Order not received. Why?"
  },
  expectResponse: {}
};

const CUSTOMER_UPDATE_PAID_ORDER = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-update-paid-order",
  sendData: {
    orderId: 1, //TODO: Local DB updated by other tests, so replace this with a new create-order on each test
    customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    retainItems: [
      13
    ],
    removeItems: [
      14
    ],
    refundRequestGBPx: 45, //TODO what wasnt in the refundRequestPPL
    refundRequestPPL: 100, //TODO order.total before flat fees and stuff added, pull adam changes, * 5% (coln/delv)
  },
  expectResponse: {
    orderId: null, //newOrderId
  }
};
const CUSTOMER_CANCEL_ORDER = {
  HTTP_TYPE: "post",
  ACTION_PATH: "admin",
  ACTION_NAME: "customer-cancel-order",
  sendData: {
    orderId: 1, //TODO: Local DB updated by other tests, so replace this with a new create-order on each test
    customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
  },
  expectResponse: {}
};

class ExpectResponse {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PATH = "",
    ACTION_NAME = "",
    sendData = {},
    expectResponse = {},
  }) {
    this._EXPECTED_RESPONSE = expectResponse;
    this._send = sendData;
    this._expectedResposeWithUpdates = _.cloneDeep(this._EXPECTED_RESPONSE);
  }

  get EXPECTED_RESPONSE() {
    // ~ https://code.tutsplus.com/articles/the-best-way-to-deep-copy-an-object-in-javascript--cms-39655
    return _.cloneDeep(this._EXPECTED_RESPONSE);
  }
  get expectedResposeWithUpdates() {
    return _.cloneDeep(this._expectedResposeWithUpdates);
  }
  get send() {
    return _.cloneDeep(this._send);
  }

  // ~ https://masteringjs.io/tutorials/fundamentals/parameters#:~:text=JavaScript%2C%20by%20default%2C%20does%20not%20support%20named%20parameters.,even%20if%20you%20have%20default%20values%20set%20up.
  // sendWith({ updatedPostDataWith = {}, updatedPostDataWithOutKeys = [] } = {}) {
  sendWith(updatedPostDataWith, updatedPostDataWithOutKeys = []) {
    assert.isObject(updatedPostDataWith, "updatedPostDataWith is an object");
    assert.isArray(
      updatedPostDataWithOutKeys,
      "updatedPostDataWithOutKeys is an array"
    );
    assert.containsAllKeys(
      this.EXPECTED_RESPONSE,
      Object.keys(updatedPostDataWith),
      ""
    );
    assert.containsAllKeys(
      this.EXPECTED_RESPONSE,
      Object.keys(updatedPostDataWithOutKeys),
      ""
    );
    let send = this.send;
    for (let k of updatedPostDataWithOutKeys) {
      delete send[k];
      delete this._expectedResposeWithUpdates[k];
    }
    this._expectedResposeWithUpdates = {
      ...this._expectedResposeWithUpdates,
      ...updatedPostDataWith,
    };
    return {
      ...send,
      ...updatedPostDataWith,
    };
  }

  checkResponse(responseBody) {
    let expectedResponse = this.expectedResposeWithUpdates;

    for (prop of Object.keys(expectedResponse)) {
      expect(response.body).to.have.property(prop);
    }

    expect(responseBody.orderedDateTime).closeTo(
      expectedResponse.orderedDateTime,
      100,
      "OrderedDateTime should be within 100s of test."
    );
    // ~ https://devenum.com/delete-property-from-objects-array-in-javascript/#:~:text=Delete%20property%20from%20objects%20Array%20in%20Javascript%20%286,to%20Delete%20property%20from%20objects%20array%20in%20Javascript
    delete expectedResponse.orderedDateTime;
    expect(checkIfValidUUID(responseBody.publicId)).to.equal(true);
    delete expectedResponse.publicId;

    expect(response.body).to.deep.equal(expectedResponse);
  }
}

class HttpTestSender {
  constructor({
    HTTP_TYPE="get",
    ACTION_PATH="",
    ACTION_NAME="",
    sendData={},
    expectResponse={},
  }) {
    const relUrl = `${ACTION_PATH_ORDERS}/${ACTION_NAME_CREATE_ORDER}`;
    const baseUrl = !relUrl
      ? `/api/v1/${ACTION_PATH_ORDERS}/${ACTION_NAME_CREATE_ORDER}`
      : `/api/v1/${relUrl}`;
    if (HTTP_TYPE.toLowerCase() === "get") {
      this.httpCall = async () =>
        await supertest(sails.hooks.http.app).get(baseUrl);
    } else if (HTTP_TYPE.toLowerCase() === "post") {
      this.httpCall = async () =>
        await supertest(sails.hooks.http.app).post(baseUrl);
    } else if (HTTP_TYPE.toLowerCase() === "all") {
      this.httpCall = async () =>
        await supertest(sails.hooks.http.app).get(baseUrl);
    } else {
      assert(false, `httpType of ${HTTP_TYPE} not implemented for tests.`);
    }
    this._expectedResponse = ExpectResponse({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      sendData,
      expectResponse,
    });
  }

  get expectedResponse() {
    return this._expectedResponse;
  }

  get expectedResponseObjectWithUpdates() {
    return this._expectedResponse.expectedResposeWithUpdates;
  }

  async makeCallWith(cookie) {
    return (updatedPostDataWith, updatedPostDataWithOutKeys = []) =>
      this.httpCall()
        .send(
          this.expectedResponse.sendWith(
            updatedPostDataWith,
            updatedPostDataWithOutKeys
          )
        )
        .set("Cookie", cookie)
        .set("Accept", "application/json");
  }
}

class HttpAuthTestSender extends HttpTestSender {
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
      expectResponse
    });
  }

  async makeAuthCallWith(updatedPostDataWith, updatedPostDataWithOutKeys = []) {
    return callAuthActionWithCookie((cookie) =>
      this.makeCallWith(cookie)(updatedPostDataWith, updatedPostDataWithOutKeys)
    );
  }
}

describe(`Order Model Integration Tests`, () => {
  describe(`${CREATE_ORDER.ACTION_NAME}() returns a 200 with json when authenticated`, () => {
    it("Returns a new order", async () => {
      try {
        const hats = HttpAuthTestSender(CREATE_ORDER);
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
        const hats = HttpAuthTestSender(CREATE_ORDER);
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
        const hats = HttpAuthTestSender(CREATE_ORDER);
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
        const hats = HttpAuthTestSender(CREATE_ORDER);
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
        const hats = HttpAuthTestSender(CREATE_ORDER);
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
  describe(`${GET_ORDER_BY_WALLETADDRESS.ACTION_NAME}() successfully gets orders for walletaddress`, () => {
    it("Can Orders by wallet address", async () => {
      try {
        const parentOrder = await HttpAuthTestSender(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            customerWalletAddress: "0xb98AEa2159e4855c8C703A19f57912ACAdCa3625"
          },
          []
        );
        const hats = HttpAuthTestSender(
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
        const parentOrder = await HttpAuthTestSender(
          CREATE_ORDER
        ).makeAuthCallWith(
          {},
          []
        );
        const hats = HttpAuthTestSender(
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
    it("flags order as payment failed", async () => {
      try {
        const parentOrder = await HttpAuthTestSender(
          CREATE_ORDER
        ).makeAuthCallWith(
          {},
          []
        );
        const hats = HttpAuthTestSender(
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
  });
  describe(`${GET_ORDER_STATUS.ACTION_NAME}() successfully gets order status`, () => {
    it("Order status correct", async () => {
      try {
        const hats = HttpAuthTestSender(
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

  describe(`${UPDATE_ORDER.ACTION_NAME}() successfully upserts a replacement order with udpated items`, () => {
    it("Can Set ParentOrder for Create-order for child order in refunds chain / after updated items by consumer", async () => {
      try {
        const parentOrder = await HttpAuthTestSender(
          CREATE_ORDER
        ).makeAuthCallWith(
          {
            parentOrder: null,
          },
          []
        );
        const hats = HttpAuthTestSender(
          UPDATE_ORDER
          `${ACTION_PATH_ORDERS}/${ACTION_NAME_UPDATE_ORDER_ITEMS}`
        );
        const response = await hats.makeAuthCallWith(
          {
            parentOrder: null,
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
});
