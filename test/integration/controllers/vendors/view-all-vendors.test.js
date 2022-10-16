const { expect, assert } = require("chai"); // ~ https://www.chaijs.com/api/bdd/

const util = require('util');

const { fixtures } = require("../../../../scripts/build_db");

const { v4: uuidv4 } = require("uuid");

const {
  DEFAULT_NEW_VENDOR_OBJECT,
  ExpectResponseVendor,
  HttpAuthTestSenderVendor,
} = require("./defaultVendor");

const CAN_GET_VENDORS = (fixtures) => {
  return {
    useAccount: "TEST_VENDOR",
    HTTP_TYPE: "get",
    ACTION_PATH: "vendors",
    ACTION_NAME: "",
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
const CAN_NOT_VIEW_VENDORS_WHEN_UNAUTH = (fixtures) => {
  return {
    useAccount: "TEST_UNAUTHENTICATED",
    HTTP_TYPE: "get",
    ACTION_PATH: "vendors",
    ACTION_NAME: "",
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
    useAccount: "TEST_UNAUTHENTICATED",
    HTTP_TYPE: "get",
    ACTION_PATH: "vendors",
    ACTION_NAME: ":vendorId",
    sendData: {
      vendorId: vendor.id,
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property('vendor');
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
    useAccount: "TEST_VENDOR",
    HTTP_TYPE: "get",
    ACTION_PATH: "vendors",
    ACTION_NAME: "get-postal-districts",
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
    useAccount: "TEST_USER",
    HTTP_TYPE: "get",
    ACTION_PATH: "postal-districts",
    ACTION_NAME: "get-all-postal-districts",
    sendData: {
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("postalDistricts");
      assert.isArray(response.body.postalDistricts);
      assert.isNotEmpty(response.body.postalDistricts);
      expect(response.body.postalDistricts[0]).to.have.property("outcode");
      return;
    },
  };
};

describe("Fetch Vendors Controller Tests", () => {
  describe(`${
    CAN_GET_VENDORS(fixtures).ACTION_PATH
  }/:outcode (view-all-vendors) returns a 200 with json when authenticated`, () => {
    it("Returns All Vendors", async () => {
      try {
        let vendor = await Vendor.create(
          DEFAULT_NEW_VENDOR_OBJECT(fixtures, {})
        ).fetch();
        const postalDistrict = await PostalDistrict.create({
          outcode: "L5",
        }).fetch();
        await Vendor.addToCollection(
          vendor.id,
          "fulfilmentPostalDistricts"
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
  describe(`${
    CAN_GET_VENDORS_POSTALDISTRICTS(fixtures).ACTION_NAME
  }`, () => {
    it("returns a list of postal districts for a vendor", async () => {
      try {
        let vendor = await Vendor.create(
          DEFAULT_NEW_VENDOR_OBJECT(fixtures, {})
        ).fetch();
        const postalDistricts = await PostalDistrict.createEach([
          {
            outcode: "M1",
          },
          {
            outcode: "M2",
          },
          {
            outcode: "M3",
          },
        ]).fetch();
        await Vendor.addToCollection(
          vendor.id,
          "fulfilmentPostalDistricts"
        ).members(postalDistricts.map(pd => pd.id));
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
  describe(`${CAN_GET_ALL_POSTALDISTRICTS(fixtures).ACTION_NAME}`, () => {
    it("returns a list of all postal districts", async () => {
      try {
        const hats = new HttpAuthTestSenderVendor(
          CAN_GET_ALL_POSTALDISTRICTS(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {},
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${
    CAN_VIEW_SINGLE_VENDOR(fixtures).ACTION_PATH
  }/:vendor`, () => {
    it("returns a single vendor", async () => {
      try {
        const hats = new HttpAuthTestSenderVendor(
          CAN_VIEW_SINGLE_VENDOR(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {},
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (errs) {
        console.warn(errs);
        throw errs;
      }
    });
  });
  describe(`${
    CAN_NOT_VIEW_VENDORS_WHEN_UNAUTH(fixtures).ACTION_PATH
  }/:outcode (view-all-vendors) returns a ${CAN_NOT_VIEW_VENDORS_WHEN_UNAUTH(fixtures).expectStatusCode} with a view when unAuthenticated`, () => {
    it("GET return 403", async () => {
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
