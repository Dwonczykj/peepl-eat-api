import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { fixtures } = require("../../../../scripts/build_db");

import { v4 as uuidv4 } from "uuid";

const { HttpAuthTestSenderProduct } = require("./defaultProduct");

import { DEFAULT_NEW_DISCOUNTCODE_OBJECT } from "../discounts/defaultDiscounts.js";

const CAN_CREATE_DISCOUNTCODE = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "create-discount",
    sendData: {
      code: "UNITTEST20",
      percentage: 20,
      isEnabled: true,
      expiryDateTime: 0,
      maxUses: 1000,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("id");
      return Promise.resolve();
    },
  };
};

describe(`${CAN_CREATE_DISCOUNTCODE(fixtures).ACTION_NAME}`, () => {
  it("Can CREATE_DISCOUNTCODE", async () => {
    try {
      let createPostData = DEFAULT_NEW_DISCOUNTCODE_OBJECT(fixtures, {});

      const hats = new HttpAuthTestSenderProduct(
        CAN_CREATE_DISCOUNTCODE(fixtures)
      );
      const response = await hats.makeAuthCallWith(createPostData, []);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
