import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { fixtures } = require("../../../../scripts/build_db");

import { v4 as uuidv4 } from "uuid";

const { HttpAuthTestSenderProduct } = require("./defaultProduct");

import { DEFAULT_NEW_DELIVERY_PARTNER_OBJECT } from "../deliveryPartners/defaultDeliveryPartner";

declare var DeliveryPartner:any;

const CAN_EDIT_DELIVERY_PARTNER = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "edit-delivery-partner",
    sendData: {
      name: "TEST-UPDATE-DP",
      email: "dp-updated@vegi.co.uk",
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
      expect(response.body);
      expect(response.body).to.have.property("name");
      expect(response.body.name).to.equal(
        requestPayload.name
      );
      return Promise.resolve();
    },
  };
};

describe(`${CAN_EDIT_DELIVERY_PARTNER(fixtures).ACTION_NAME}`, () => {
  it("Can EDIT_DELIVERY_PARTNER", async () => {
    try {
      // const imgName = "roast-back";
      // const testImage = process.cwd() + `/test/assets/images/${imgName}.jpg`;
      // const imgStream = fs.createReadStream(testImage);
      const name = "New Agile DP " + uuidv4();
      const deliveryPartner = await DeliveryPartner.create(
        DEFAULT_NEW_DELIVERY_PARTNER_OBJECT(fixtures, {
          name: name,
        })).fetch();
      const nameUpdate = "Update Agile DP " + uuidv4();
      let createPostData = DEFAULT_NEW_DELIVERY_PARTNER_OBJECT(fixtures, {
        name: `Updated DP ` + uuidv4(),
        id: deliveryPartner.id
      });
      delete createPostData.imageUrl;

      const hats = new HttpAuthTestSenderProduct(
        CAN_EDIT_DELIVERY_PARTNER(fixtures)
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
