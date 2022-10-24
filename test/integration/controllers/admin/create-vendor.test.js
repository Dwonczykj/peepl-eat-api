const { expect, assert } = require('chai'); // ~ https://www.chaijs.com/api/bdd/
const util = require('util');
const fs = require('fs');

const { fixtures } = require('../../../../scripts/build_db');

const { v4: uuidv4 } = require('uuid');

const {
  DEFAULT_NEW_VENDOR_OBJECT,
  ExpectResponseVendor,
  HttpAuthTestSenderVendor
} = require('../vendors/defaultVendor');

const CAN_CREATE_VENDORS = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'create-vendor',
    sendData: {

    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property('id');
      return Promise.resolve();
    },
  };
};

describe(`${CAN_CREATE_VENDORS(fixtures).ACTION_NAME}`, () => {
  it('Returns a newly created vendor', async () => {
    try {
      const imgName = 'roast-back';
      const testImage = process.cwd() + `/test/assets/images/${imgName}.jpg`;
      const imgStream = fs.createReadStream(testImage);
      let vendorCall = DEFAULT_NEW_VENDOR_OBJECT(fixtures, {
        name: 'TEST CAN_CREATE_VENDORS TEST VENDOR',
        image: imgStream,
      });
      delete vendorCall.imageUrl;

      const hats = new HttpAuthTestSenderVendor(CAN_CREATE_VENDORS(fixtures));
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
        ['imageUrl'],
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
