import { expect, assert } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
// import util from "util";
import { v4 as uuidv4 } from 'uuid';
const { fixtures } = require('../../../../scripts/build_db.js');
import { HttpAuthTestSenderVendor } from '../vendors/defaultVendor';
import { AddressType, ProductCategoryType } from '../../../../scripts/utils';
import { SailsModelType } from '../../../../api/interfaces/iSails';
import { ViewNearestVendorResult } from '../../../../api/controllers/home/view-nearest-vendors';
declare var Address: SailsModelType<AddressType>;

class CAN_GET_NEAREST_VENDORS {
  static readonly useAccount = 'TEST_USER';
  static readonly HTTP_TYPE = 'get';
  static readonly ACTION_PATH = 'home';
  static readonly ACTION_NAME = 'nearest-vendors';
  static readonly ACTION_TEST_DESCRIPTION = 'Can get nearest vendors to a user in baltic, liverpool';
  static readonly EXPECT_STATUS_CODE = 200;

  constructor() {}

  async init(fixtures) {
    

    return {
      useAccount: CAN_GET_NEAREST_VENDORS.useAccount,
      HTTP_TYPE: CAN_GET_NEAREST_VENDORS.HTTP_TYPE,
      ACTION_PATH: CAN_GET_NEAREST_VENDORS.ACTION_PATH,
      ACTION_NAME: CAN_GET_NEAREST_VENDORS.ACTION_NAME,
      sendData: {
        location: {
          lat: 53.39530981565028,
          lng: -2.9806064586172267,
        },
        distance: 0.75,
      },
      expectResponse: {},
      expectStatusCode: CAN_GET_NEAREST_VENDORS.EXPECT_STATUS_CODE,
      expectResponseCb: async (
        response: {
          body: ViewNearestVendorResult;
        },
        requestPayload
      ) => {
        expect(response.body).to.have.property('addresses' as keyof typeof response.body);
        assert.isArray(response.body.addresses);
        expect(response.body.addresses).to.have.lengthOf(2);
        
        return;
      },
    };
  }
}

describe(`${CAN_GET_NEAREST_VENDORS.ACTION_NAME}() returns a ${CAN_GET_NEAREST_VENDORS.EXPECT_STATUS_CODE} with json when authenticated as ${CAN_GET_NEAREST_VENDORS.useAccount}`, () => {
  it(`${CAN_GET_NEAREST_VENDORS.ACTION_TEST_DESCRIPTION}`, async () => {
    try {
      const _hatsInit = await new CAN_GET_NEAREST_VENDORS().init(fixtures);
      const hats = new HttpAuthTestSenderVendor(_hatsInit);
      const response = await hats.makeAuthCallWith({}, []);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
