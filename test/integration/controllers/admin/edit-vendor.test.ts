const { expect, assert } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
const util = require("util");
const fs = require("fs");
declare var Vendor: any;

const { fixtures } = require("../../../../scripts/build_db");

import { v4 as uuidv4 } from "uuid";

const {
  DEFAULT_NEW_VENDOR_OBJECT,
  ExpectResponseVendor,
  HttpAuthTestSenderVendor
} = require('../vendors/defaultVendor.js');

const CAN_EDIT_VENDORS = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "edit-vendor",
    sendData: {
      
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("id");
      return Promise.resolve();
    },
  };
};

describe(`${CAN_EDIT_VENDORS(fixtures).ACTION_NAME}`, () => {
  it("Returns an edited vendor", async () => {
    try {
      const imgName = "roast-back";
      const testImage = process.cwd() + `/test/assets/images/${imgName}.jpg`;
      // const imgStream = fs.editReadStream(testImage);

      const existingObj = await Vendor.create(
        DEFAULT_NEW_VENDOR_OBJECT(fixtures, {
          name: `TEST_${uuidv4()}`,
        })
      ).fetch();
      assert.isDefined(existingObj);

      const newName = `Custom-${uuidv4()}`;

      let vendorCall = DEFAULT_NEW_VENDOR_OBJECT(fixtures, {
        name: newName,
        // image: imgStream,
        id: existingObj.id,
      });
      delete vendorCall.imageUrl;
      
      const hats = new HttpAuthTestSenderVendor(CAN_EDIT_VENDORS(fixtures));
      // const response = await hats.makeAuthCallWith(
      //   vendorCall,
      //   ["imageUrl"],
      //   {},
      //   {
      //     [imgName]: testImage,
      //   }
      // );
      const response = await hats.makeAuthCallWith(
        vendorCall,
        ["imageUrl"],
        // {},
        // {
        //   [imgName]: testImage,
        // }
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
