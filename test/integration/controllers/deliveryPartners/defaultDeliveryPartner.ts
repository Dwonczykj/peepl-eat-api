const {
  HttpAuthTestSender,
  ExpectResponse,
} = require("../../../httpTestSender");
import { assert, expect } from "chai"; // ~ https://www.chaijs.com/api/bdd/

export const DEFAULT_NEW_DELIVERY_PARTNER_OBJECT = (fixtures, overrides = {}) => {
  return {
    ...{
      name: "Test DP No FM SET",
      email: "dp@sailshelpers.com",
      phoneNumber: "012111123",
      status: "active",
      deliversToPostCodes: ["L1"],
      walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
      imageUrl:
        "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
      rating: 3,
      type: 'bike',
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

export class ExpectResponseDeliveryPartner extends ExpectResponse {
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

export class HttpAuthTestSenderDeliveryPartner extends HttpAuthTestSender {
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
      ExpectResponseDeliveryPartner: ExpectResponseDeliveryPartner,
      expectResponseCb,
      expectStatusCode,
    });
  }
}

module.exports = {
  DEFAULT_NEW_DELIVERY_PARTNER_OBJECT: DEFAULT_NEW_DELIVERY_PARTNER_OBJECT,
  ExpectResponseDeliveryPartner: ExpectResponseDeliveryPartner,
  HttpAuthTestSenderDeliveryPartner: HttpAuthTestSenderDeliveryPartner,
};
