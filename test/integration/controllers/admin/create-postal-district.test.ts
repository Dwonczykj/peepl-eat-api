import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { fixtures } = require("../../../../scripts/build_db.js");

import { v4 as uuidv4 } from "uuid";

const { HttpAuthTestSenderProduct } = require("./defaultProduct");

import { DEFAULT_NEW_POSTAL_DISTRICT_OBJECT } from "./defaultPostalDistrict";

const CAN_CREATE_POSTAL_DISTRICT = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "create-postal-district",
    sendData: {
      outcode: null,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("postalDistrict");
      expect(response.body.postalDistrict).to.have.property("outcode");
      expect(response.body.postalDistrict.outcode).to.equal(
        requestPayload.outcode
      );
      return Promise.resolve();
    },
  };
};

describe(`${CAN_CREATE_POSTAL_DISTRICT(fixtures).ACTION_NAME}`, () => {
  it("Can CREATE_POSTAL_DISTRICT", async () => {
    try {
      const hats = new HttpAuthTestSenderProduct(
        CAN_CREATE_POSTAL_DISTRICT(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        DEFAULT_NEW_POSTAL_DISTRICT_OBJECT(fixtures, {}),
        []
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
