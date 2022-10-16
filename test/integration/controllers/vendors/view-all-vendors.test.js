/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/Vendors/view-all-vendors.test.js
const { expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { logoutCbLogin, callAuthActionWithCookie } = require("../../../utils");
const util = require('util');

const { fixtures } = require("../../../../scripts/build_db");

const { v4: uuidv4 } = require("uuid");

const EXAMPLE_RESPONSE = {
  collectionMethod: {},
  deliveryMethod: {},
  collectionSlots: {},
  deliverySlots: {},
  eligibleCollectionDates: {},
  eligibleDeliveryDates: {},
};

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
