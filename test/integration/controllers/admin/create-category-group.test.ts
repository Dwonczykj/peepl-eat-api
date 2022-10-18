import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { fixtures } = require("../../../../scripts/build_db");

import { v4 as uuidv4 } from "uuid";

const {
  HttpAuthTestSenderProduct,
} = require("./defaultProduct");

import { DEFAULT_NEW_CATEGORY_GROUP_OBJECT } from "./defaultCategoryGroup";

const CAN_CREATE_CATEGORY_GROUPS = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "create-category-group",
    sendData: {
      name: "TEST-NEW-CATEGORYGROUP",
      forRestaurantItem: false,
      image: null,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("id");
      return Promise.resolve();
    },
  };
};

describe(`${CAN_CREATE_CATEGORY_GROUPS(fixtures).ACTION_NAME}`, () => {
  it("Can CREATE_CATEGORY_GROUPS", async () => {
    try {
      // const imgName = "roast-back";
      // const testImage = process.cwd() + `/test/assets/images/${imgName}.jpg`;
      // const imgStream = fs.createReadStream(testImage);
      let createPostData = DEFAULT_NEW_CATEGORY_GROUP_OBJECT(fixtures, {
        name: `TEST_${CAN_CREATE_CATEGORY_GROUPS(fixtures).ACTION_NAME}`,
      });
      delete createPostData.imageUrl;

      const hats = new HttpAuthTestSenderProduct(
        CAN_CREATE_CATEGORY_GROUPS(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        createPostData,
        ["imageUrl"]
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
