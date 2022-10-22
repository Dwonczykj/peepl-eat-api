import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { fixtures } = require("../../../../scripts/build_db");
declare var CategoryGroup:any;

import { v4 as uuidv4 } from "uuid";

const {
  HttpAuthTestSenderProduct,
} = require("./defaultProduct");

import { DEFAULT_NEW_CATEGORY_GROUP_OBJECT } from "./defaultCategoryGroup";

const CAN_EDIT_CATEGORY_GROUPS = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "edit-category-group",
    sendData: {
      id: null,
      name: "TEST-NEW-CATEGORYGROUP",
      forRestaurantItem: false,
      image: null,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("categoryGroup");
      return Promise.resolve();
    },
  };
};

describe(`${CAN_EDIT_CATEGORY_GROUPS(fixtures).ACTION_NAME}`, () => {
  it("Can EDIT_CATEGORY_GROUPS", async () => {
    try {
      // const imgName = "roast-back";
      // const testImage = process.cwd() + `/test/assets/images/${imgName}.jpg`;
      // const imgStream = fs.editReadStream(testImage);

      const existingObj = await CategoryGroup.create(DEFAULT_NEW_CATEGORY_GROUP_OBJECT(fixtures, {
        name: `TEST_${CAN_EDIT_CATEGORY_GROUPS(fixtures).ACTION_NAME}`,
      })).fetch();
      assert.isDefined(existingObj);

      const newName = `Custom-${uuidv4()}`;

      let editPostData = DEFAULT_NEW_CATEGORY_GROUP_OBJECT(fixtures, {
        name: newName,
        id: existingObj.id
      });
      delete editPostData.imageUrl;

      const hats = new HttpAuthTestSenderProduct(
        CAN_EDIT_CATEGORY_GROUPS(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        editPostData,
        ["imageUrl"]
      );
      await hats.expectedResponse.checkResponse(response);
      const updatedObj = await CategoryGroup.findOne(existingObj.id);
      assert.isDefined(updatedObj);
      expect(updatedObj.name).to.equal(newName);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
