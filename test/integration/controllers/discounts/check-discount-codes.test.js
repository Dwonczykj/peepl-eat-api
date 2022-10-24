const { expect } = require('chai'); // ~ https://www.chaijs.com/api/bdd/
const util = require('util');

const { fixtures } = require('../../../../scripts/build_db');

const { v4: uuidv4 } = require('uuid');

const {
  DEFAULT_NEW_DISCOUNTCODE_OBJECT,
  ExpectResponseDiscountCode,
  HttpAuthTestSenderDiscountCode,
} = require('./defaultDiscounts');

const CAN_GET_DISCOUNTCODES = (fixtures) => {
  const discountCode = fixtures.discountCodes[0];
  return {
    useAccount: 'TEST_VENDOR',
    HTTP_TYPE: 'get',
    ACTION_PATH: 'discounts',
    ACTION_NAME: 'check-discount-code/:discountCode',
    sendData: {
      discountCode: discountCode.code,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property('discount');
      expect(response.body.discount).to.include({
        code: discountCode.code,
        percentage: discountCode.percentage,
        expiryDateTime: discountCode.expiryDateTime,
        timesUsed: discountCode.timesUsed,
        maxUses: discountCode.maxUses,
        isEnabled: discountCode.isEnabled,
      });
      return;
    },
  };
};
const CAN_NOT_VIEW_DISCOUNTCODES_WHEN_UNAUTH = (fixtures) => {
  const discountCode = fixtures.discountCodes[0];
  return {
    useAccount: 'TEST_UNAUTHENTICATED',
    HTTP_TYPE: 'get',
    ACTION_PATH: 'discounts',
    ACTION_NAME: 'check-discount-code/:discountCode',
    sendData: {
      discountCode: discountCode.code,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property('discount');
      expect(response.body.discount).to.include({
        code: discountCode.code,
        percentage: discountCode.percentage,
        expiryDateTime: discountCode.expiryDateTime,
        timesUsed: discountCode.timesUsed,
        maxUses: discountCode.maxUses,
        isEnabled: discountCode.isEnabled,
      });
      return;
    },
  };
};

describe('Fetch DiscountCodes Controller Tests', () => {
  describe(`${
    CAN_GET_DISCOUNTCODES(fixtures).ACTION_NAME
  }`, () => {
    it('Returns a single discount code', async () => {
      try {
        const hats = new HttpAuthTestSenderDiscountCode(
          CAN_GET_DISCOUNTCODES(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {},
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${
    CAN_NOT_VIEW_DISCOUNTCODES_WHEN_UNAUTH(fixtures).ACTION_NAME
  }`, () => {
    it('Returns a single discount code', async () => {
      try {
        const hats = new HttpAuthTestSenderDiscountCode(
          CAN_NOT_VIEW_DISCOUNTCODES_WHEN_UNAUTH(fixtures)
        );
        const response = await hats.makeAuthCallWith({}, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
});
