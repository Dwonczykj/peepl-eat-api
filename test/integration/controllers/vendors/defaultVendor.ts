import {
  HttpAuthTestSender,
  ExpectResponse,
} from '../../../httpTestSender';
import { assert, expect } from 'chai'; // ~ https://www.chaijs.com/api/bdd/

export const DEFAULT_NEW_ADDRESS_OBJECT = (fixtures, overrides = {}) => {
  return {
    label: 'test',
    addressLineOne: 'Random Street',
    addressLineTwo: 'Baltic',
    addressTownCity: 'Liverpool',
    addressPostCode: 'L1 0FT',
    latitude: 0.0,
    longitude: 0.0,
  };
};

export const DEFAULT_NEW_VENDOR_OBJECT = (fixtures, overrides = {}) => {
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
  return {
    ...{
      name: 'Purple Carrot Test Vendor',
      description: 'This is a test.',
      type: 'restaurant',
      walletAddress: '0x6ad1D130d8B4F6f2D133E172799484B653c9fb40',
      phoneNumber: '+447123456789',
      imageUrl:
        'https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png',
      status: 'active',
      vendorCategories: fixtures.vendorCategories[0].id,
      productCategories: [],
      fulfilmentPostalDistricts: fixtures.postalDistricts.map(pd => pd.id),
      fulfilmentMethod: fulfilmentMethodVendor.id,
      deliveryPartner: fixtures.deliveryPartners[0].id,
      pickupAddress: null,
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

export class ExpectResponseVendor extends ExpectResponse {
  constructor({
    HTTP_TYPE = 'get',
    ACTION_PATH = '',
    ACTION_NAME = '',
    sendData = {},
    expectResponse = {},
    expectResponseCb = async (response, requestPayload) => {},
    expectStatusCode = 200,
  }) {
    super({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      sendData,
      expectResponse,
      expectResponseCb,
      expectStatusCode,
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

export class HttpAuthTestSenderVendor extends HttpAuthTestSender {
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
      expectResponseChecker: ExpectResponseVendor,
      expectResponseCb,
      expectStatusCode,
    });
  }
}
