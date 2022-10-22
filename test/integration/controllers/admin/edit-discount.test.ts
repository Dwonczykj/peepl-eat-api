import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { fixtures } = require("../../../../scripts/build_db");
declare var Discount:any;

import { v4 as uuidv4 } from "uuid";

const { HttpAuthTestSenderProduct } = require("./defaultProduct");

import { DEFAULT_NEW_DISCOUNTCODE_OBJECT } from "../discounts/defaultDiscounts.js";

const CAN_EDIT_DISCOUNTCODE = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "edit-discount",
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

describe(`${CAN_EDIT_DISCOUNTCODE(fixtures).ACTION_NAME}`, () => {
  it("Can EDIT_DISCOUNTCODE", async () => {
    try {
      const existingObj = await Discount.create(
        DEFAULT_NEW_DISCOUNTCODE_OBJECT(fixtures, {
          code: "TEST35",
          percentage: 35,
        })
      ).fetch();
      assert.isDefined(existingObj);

      let editPostData = DEFAULT_NEW_DISCOUNTCODE_OBJECT(fixtures, {
        code: 'TEST45',
        percentage: 45,
        id: existingObj.id,
      });

      const hats = new HttpAuthTestSenderProduct(
        CAN_EDIT_DISCOUNTCODE(fixtures)
      );
      const response = await hats.makeAuthCallWith(editPostData, []);
      await hats.expectedResponse.checkResponse(response);
      const updatedObj = await Discount.findOne(existingObj.id);
      assert.isDefined(updatedObj);
      expect(updatedObj.code).to.equal('TEST45');
      expect(updatedObj.percentage).to.equal(45);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
