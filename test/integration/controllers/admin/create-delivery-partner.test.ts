import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { fixtures } = require("../../../../scripts/build_db");

import { v4 as uuidv4 } from "uuid";

const { HttpAuthTestSenderProduct } = require("./defaultProduct");

import { DEFAULT_NEW_DELIVERY_PARTNER_OBJECT } from "../deliveryPartners/defaultDeliveryPartner";

const CAN_CREATE_DELIVERY_PARTNER = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "create-delivery-partner",
    sendData: {
      name: "TEST-NEW-DP",
      email: "dp@vegi.co.uk",
      phoneNumber: "",
      status: "active",
      deliversToPostCodes: ["L1"],
      walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
      imageUrl:
        "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
      rating: 3,
      type: "bike",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("newDeliveryPartner");
      expect(response.body.newDeliveryPartner).to.have.property("name");
      expect(response.body.newDeliveryPartner.name).to.equal(
        requestPayload.name
      );
      return Promise.resolve();
    },
  };
};

describe(`${CAN_CREATE_DELIVERY_PARTNER(fixtures).ACTION_NAME}`, () => {
  it("Can CREATE_DELIVERY_PARTNER", async () => {
    try {
      // const imgName = "roast-back";
      // const testImage = process.cwd() + `/test/assets/images/${imgName}.jpg`;
      // const imgStream = fs.createReadStream(testImage);
      let createPostData = DEFAULT_NEW_DELIVERY_PARTNER_OBJECT(fixtures, {
        name: `TEST_${CAN_CREATE_DELIVERY_PARTNER(fixtures).ACTION_NAME}`,
      });
      delete createPostData.imageUrl;

      const hats = new HttpAuthTestSenderProduct(
        CAN_CREATE_DELIVERY_PARTNER(fixtures)
      );
      const response = await hats.makeAuthCallWith(createPostData, [
        "imageUrl",
      ]);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
