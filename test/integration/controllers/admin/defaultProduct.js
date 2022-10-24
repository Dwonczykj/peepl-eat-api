const {
  HttpAuthTestSender,
  ExpectResponse,
} = require('../../../httpTestSender');
const { assert, expect } = require('chai'); // ~ https://www.chaijs.com/api/bdd/

const DEFAULT_NEW_PRODUCT_OBJECT = (fixtures, overrides = {}) => {
  // const product = fixtures.products[0];
  return {
    ...{
      code: 'TEST20',
      percentage: 20,
      description: 'This is a test product',
      basePrice: 100,
      expiryDateTime: 0,
      timesUsed: 0,
      maxUses: 0,
      isEnabled: true,
      vendor: fixtures.productCategories[0].vendor,
      category: fixtures.productCategories[0].id,
    },
    ...overrides,
  };
};
const DEFAULT_NEW_PRODUCT_OPTION_OBJECT = (fixtures, overrides = {}) => {
  return {
    ...{
      name: 'Test product option',
      isRequired: false,
      values: [],
      product: fixtures.products[0].id,
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

class ExpectResponseProduct extends ExpectResponse {
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

class HttpAuthTestSenderProduct extends HttpAuthTestSender {
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
      ExpectResponseProduct: ExpectResponseProduct,
      expectResponseCb,
      expectStatusCode,
    });
  }
}

module.exports = {
  DEFAULT_NEW_PRODUCT_OBJECT: DEFAULT_NEW_PRODUCT_OBJECT,
  DEFAULT_NEW_PRODUCT_OPTION_OBJECT: DEFAULT_NEW_PRODUCT_OPTION_OBJECT,
  ExpectResponseProduct: ExpectResponseProduct,
  HttpAuthTestSenderProduct: HttpAuthTestSenderProduct,
};
