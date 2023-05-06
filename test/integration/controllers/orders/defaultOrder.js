const {
  HttpAuthTestSender,
  ExpectResponse,
} = require('../../../httpTestSender');
const { assert, expect } = require('chai'); // ~ https://www.chaijs.com/api/bdd/

const DEFAULT_NEW_ORDER_OBJECT = (fixtures, overrides = {}) => {
  const vendor = fixtures.vendors[0];
  const fulfilmentMethodVendor = fixtures.fulfilmentMethods.filter(
    (fm) =>
      fm.vendor === vendor.id &&
      fm.methodType === 'delivery' &&
      fixtures.openingHours.filter(
        (oh) => oh.fulfilmentMethod === fm.id && oh.isOpen === true
      )
  )[0];
  const openAtHours = fixtures.openingHours.filter(
    (openHrs) =>
      openHrs.isOpen === true &&
      openHrs.fulfilmentMethod === fulfilmentMethodVendor.id
  )[0];
  if (
    Object.keys(overrides).includes('total') &&
    !Object.keys(overrides).includes('subtotal')
  ) {
    overrides['subtotal'] = overrides.total - 125;
    if(overrides.subtotal < 0){
      overrides.subtotal = 0;
    }
  }
  return {
    ...{
      customerWalletAddress: '0xb98AEa2159e4855c8C703A19f57912ACAdCa3625',
      items: [1, 6, 7],
      total: 2800,
      subtotal: 2800-125,
      tipAmount: 0,
      orderedDateTime: Date.now(),
      restaurantAcceptanceStatus: 'accepted',
      marketingOptIn: false,
      vendor: vendor.id,
      paidDateTime: null,
      refundDateTime: null,
      deliveryName: 'Test Runner 1',
      deliveryEmail: 'adam@itsaboutpeepl.com',
      deliveryPhoneNumber: '07901122212',
      deliveryAddressLineOne: '11 Feck Street',
      deliveryAddressLineTwo: 'Subburb',
      deliveryAddressCity: 'Liverpool',
      deliveryAddressPostCode: 'L1 0AB',
      deliveryAddressInstructions: 'Leave it behind the bin',
      fulfilmentMethod: fulfilmentMethodVendor.id,
      fulfilmentSlotFrom: '2023-10-12 11:00:00',
      fulfilmentSlotTo: '2023-10-12 12:00:00',
      discount: null,
      paymentStatus: 'unpaid',
      paymentIntentId: '',
      deliveryId: 'random_delivery_id',
      deliveryPartnerAccepted: true,
      deliveryPartnerConfirmed: true,
      deliveryPartner: fixtures.deliveryPartners[0].id,
      rewardsIssued: 0,
      sentToDeliveryPartner: false,
      completedFlag: 'none',
      completedOrderFeedback: null,
      deliveryPunctuality: null,
      orderCondition: null,
      unfulfilledItems: [], //Check using partial orders
      parentOrder: null,
    },
    ...overrides,
  };
};

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
    HTTP_TYPE = 'get',
    ACTION_PATH = '',
    ACTION_NAME = '',
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
      'OrderedDateTime should be within 100s of test.'
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
    HTTP_TYPE = 'get',
    ACTION_PREFIX = '/api/v1',
    ACTION_PATH = '',
    ACTION_NAME = '',
    useAccount = 'TEST_SERVICE',
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

module.exports = {
  DEFAULT_NEW_ORDER_OBJECT,
  ExpectResponseOrder,
  HttpAuthTestSenderOrder,
};
