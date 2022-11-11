import util from 'util';
import { assert, expect } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
import { v4 as uuidv4 } from 'uuid';
import { SailsModelType } from '../../../../api/interfaces/iSails';
import {
  PostalDistrictType,
  UserType,
  VendorType,
} from '../../../../scripts/utils';

const { fixtures } = require('../../../../scripts/build_db');

declare var Vendor: SailsModelType<VendorType>;
declare var User: SailsModelType<UserType>;
declare var PostalDistrict: SailsModelType<PostalDistrictType>;

const {
  DEFAULT_NEW_VENDOR_OBJECT,
  ExpectResponseVendor,
  HttpAuthTestSenderVendor,
} = require('./defaultVendor');

const CAN_GET_VENDORS = (fixtures) => {
  return {
    useAccount: 'TEST_VENDOR',
    HTTP_TYPE: 'get',
    ACTION_PATH: 'vendors',
    ACTION_NAME: '',
    sendData: {
      outcode: fixtures.postalDistricts[0].outcode,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property('vendors');
      assert.isArray(response.body.vendors);
      assert.isNotEmpty(response.body.vendors);
      expect(response.body.vendors[0]).to.have.property('name');
      expect(response.body.vendors[0]).to.have.property('status');
      expect(response.body.vendors[0]).to.have.property(
        'fulfilmentPostalDistricts'
      );
      return;
    },
  };
};
const CAN_NOT_VIEW_VENDORS_WHEN_UNAUTH = (fixtures) => {
  return {
    useAccount: 'TEST_UNAUTHENTICATED',
    HTTP_TYPE: 'get',
    ACTION_PATH: 'vendors',
    ACTION_NAME: '',
    sendData: {
      outcode: fixtures.postalDistricts[0].outcode,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CAN_VIEW_SINGLE_VENDOR = (fixtures) => {
  const vendor = fixtures.vendors[0];
  return {
    useAccount: 'TEST_UNAUTHENTICATED',
    HTTP_TYPE: 'get',
    ACTION_PATH: 'vendors',
    ACTION_NAME: ':vendorId',
    sendData: {
      vendorId: vendor.id,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property('vendor');
      expect(response.body.vendor).to.have.property('name');
      expect(response.body.vendor).to.have.property('status');
      expect(response.body.vendor).to.have.property(
        'fulfilmentPostalDistricts'
      );
      expect(response.body.vendor).to.include({
        name: vendor.name,
        type: vendor.type,
        description: vendor.description,
      });
      return;
    },
  };
};
const CAN_GET_VENDORS_POSTALDISTRICTS = (fixtures) => {
  return {
    useAccount: 'TEST_VENDOR',
    HTTP_TYPE: 'get',
    ACTION_PATH: 'vendors',
    ACTION_NAME: 'get-postal-districts',
    sendData: {
      vendor: null,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CAN_GET_ALL_POSTALDISTRICTS = (fixtures) => {
  return {
    useAccount: 'TEST_USER',
    HTTP_TYPE: 'get',
    ACTION_PATH: 'postal-districts',
    ACTION_NAME: 'get-all-postal-districts',
    sendData: {},
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property('postalDistricts');
      assert.isArray(response.body.postalDistricts);
      assert.isNotEmpty(response.body.postalDistricts);
      expect(response.body.postalDistricts[0]).to.have.property('outcode');
      return;
    },
  };
};
const CAN_EDIT_VENDORS_POSTALDISTRICTS = (fixtures) => {
  return {
    useAccount: 'TEST_VENDOR',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'edit-vendor-postal-districts',
    sendData: {
      vendorId: null,
      districts: [],
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CANNOT_EDIT_VENDORS_POSTALDISTRICTS_IF_NOT_AUTH_FOR_VENDOR = (
  fixtures
) => {
  return {
    useAccount: 'TEST_USER',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'edit-vendor-postal-districts',
    sendData: {
      vendorId: null,
      districts: [],
    },
    expectResponse: {},
    expectStatusCode: 401,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};

describe('Fetch Vendors Controller Tests', () => {
  describe(`${
    CAN_GET_VENDORS(fixtures).ACTION_PATH
  }/:outcode (view-all-vendors) returns a 200 with json when authenticated`, () => {
    it('Returns All Vendors', async () => {
      try {
        // let vendor = await Vendor.create(
        //   DEFAULT_NEW_VENDOR_OBJECT(fixtures, {})
        // ).fetch();
        const currentUser = await User.findOne({
          name: CAN_GET_VENDORS(fixtures).useAccount,
        }).populate('vendor');
        const vendor = currentUser.vendor;
        const postalDistrict = await PostalDistrict.create({
          outcode: 'L5',
        }).fetch();
        await Vendor.addToCollection(
          vendor.id,
          'fulfilmentPostalDistricts'
        ).members([postalDistrict.id]);
        const hats = new HttpAuthTestSenderVendor(CAN_GET_VENDORS(fixtures));
        const response = await hats.makeAuthCallWith(
          {
            outCode: postalDistrict.outcode,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${CAN_GET_VENDORS_POSTALDISTRICTS(fixtures).ACTION_NAME}`, () => {
    it('returns a list of postal districts for a vendor', async () => {
      try {
        let vendor = await Vendor.create(
          DEFAULT_NEW_VENDOR_OBJECT(fixtures, {})
        ).fetch();
        const postalDistricts = await PostalDistrict.createEach([
          {
            outcode: 'M1',
          },
          {
            outcode: 'M2',
          },
          {
            outcode: 'M3',
          },
        ]).fetch();
        await Vendor.addToCollection(
          vendor.id,
          'fulfilmentPostalDistricts'
        ).members(postalDistricts.map((pd) => pd.id));
        const hats = new HttpAuthTestSenderVendor(
          CAN_GET_VENDORS_POSTALDISTRICTS(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            vendor: vendor.id,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${CAN_EDIT_VENDORS_POSTALDISTRICTS(fixtures).ACTION_NAME}`, () => {
    it('returns a list of updated postal districts for a vendor', async () => {
      try {
        const currentUser = await User.findOne({
          name: CAN_EDIT_VENDORS_POSTALDISTRICTS(fixtures).useAccount,
        }).populate('vendor');
        const vendor = currentUser.vendor;
        const postalDistricts = await PostalDistrict.createEach([
          {
            outcode: 'S1',
          },
          {
            outcode: 'S2',
          },
          {
            outcode: 'S3',
          },
        ]).fetch();
        await Vendor.addToCollection(
          vendor.id,
          'fulfilmentPostalDistricts'
        ).members(postalDistricts.map((pd) => pd.id));
        const postalDistrictsUpdated = await PostalDistrict.createEach([
          {
            outcode: 'S4',
          },
          {
            outcode: 'S5',
          },
          {
            outcode: 'S6',
          },
        ]).fetch();
        const hats = new HttpAuthTestSenderVendor(
          CAN_EDIT_VENDORS_POSTALDISTRICTS(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            vendorId: vendor.id,
            districts: postalDistrictsUpdated.map((pd) => pd.id),
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        assert.isNotEmpty(response.body);
        expect(response.body).to.have.property('name');
        assert.isDefined(response.body.fulfilmentPostalDistricts);
        assert.isArray(response.body.fulfilmentPostalDistricts);
        expect(
          response.body.fulfilmentPostalDistricts.map((pd) => pd.outcode)
        ).to.deep.equal(postalDistrictsUpdated.map((pd) => pd.outcode));
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
    it('returns a 401 when user is not authorized to edit a vendor', async () => {
      try {
        const currentUser = await User.findOne({
          name: 'TEST_VENDOR',
        }).populate('vendor');
        const vendor = currentUser.vendor;
        const postalDistrictsUpdated = await PostalDistrict.createEach([
          {
            outcode: 'S7',
          },
          {
            outcode: 'S8',
          },
        ]).fetch();
        const hats = new HttpAuthTestSenderVendor(
          CANNOT_EDIT_VENDORS_POSTALDISTRICTS_IF_NOT_AUTH_FOR_VENDOR(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            vendorId: vendor.id,
            districts: postalDistrictsUpdated.map((pd) => pd.id),
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
        assert.isEmpty(response.body);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${CAN_GET_ALL_POSTALDISTRICTS(fixtures).ACTION_NAME}`, () => {
    it('returns a list of all postal districts', async () => {
      try {
        const hats = new HttpAuthTestSenderVendor(
          CAN_GET_ALL_POSTALDISTRICTS(fixtures)
        );
        const response = await hats.makeAuthCallWith({}, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${CAN_VIEW_SINGLE_VENDOR(fixtures).ACTION_PATH}/:vendor`, () => {
    it('returns a single vendor', async () => {
      try {
        const hats = new HttpAuthTestSenderVendor(
          CAN_VIEW_SINGLE_VENDOR(fixtures)
        );
        const response = await hats.makeAuthCallWith({}, []);
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${
    CAN_NOT_VIEW_VENDORS_WHEN_UNAUTH(fixtures).ACTION_PATH
  }/:outcode (view-all-vendors) returns a ${
    CAN_NOT_VIEW_VENDORS_WHEN_UNAUTH(fixtures).expectStatusCode
  } with a view when unAuthenticated`, () => {
    it(`GET return ${
      CAN_NOT_VIEW_VENDORS_WHEN_UNAUTH(fixtures).expectStatusCode
    }`, async () => {
      try {
        const hats = new HttpAuthTestSenderVendor(
          CAN_NOT_VIEW_VENDORS_WHEN_UNAUTH(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {
            outCode: fixtures.postalDistricts[0].outcode,
          },
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
});
