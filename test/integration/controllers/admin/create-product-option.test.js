const { expect, assert } = require('chai'); // ~ https://www.chaijs.com/api/bdd/
const { fixtures } = require('../../../../scripts/build_db');

const { v4: uuidv4 } = require('uuid');

const {
  DEFAULT_NEW_PRODUCT_OPTION_OBJECT,
  ExpectResponseProduct,
  HttpAuthTestSenderProduct,
} = require('./defaultProduct');

const CAN_CREATE_PRODUCTS = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'create-product-option',
    sendData: {},
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property('id');
      return Promise.resolve();
    },
  };
};

describe(`${CAN_CREATE_PRODUCTS(fixtures).ACTION_NAME}`, () => {
  it('Returns a newly created product option', async () => {
    try {
      // const imgName = "roast-back";
      // const testImage = process.cwd() + `/test/assets/images/${imgName}.jpg`;
      // const imgStream = fs.createReadStream(testImage);
      let productionOptionPost = DEFAULT_NEW_PRODUCT_OPTION_OBJECT(fixtures, {
        name: `TEST_${CAN_CREATE_PRODUCTS(fixtures).ACTION_NAME}`,
        // image: imgStream,
      });
      delete productionOptionPost.imageUrl;

      const hats = new HttpAuthTestSenderProduct(CAN_CREATE_PRODUCTS(fixtures));
      // const response = await hats.makeAuthCallWith(
      //   vendorCall,
      //   ["imageUrl"],
      //   {},
      //   {
      //     [imgName]: testImage,
      //   }
      // );
      const response = await hats.makeAuthCallWith(
        productionOptionPost,
        []
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
