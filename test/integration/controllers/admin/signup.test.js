/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/Vendors/view-all-vendors.test.js
const { expect, assert } = require('chai'); // ~ https://www.chaijs.com/api/bdd/
var supertest = require('supertest');
var util = require('util');
const {
  HttpAuthTestSenderAdmin
} = require('./defaultAdmin');
const { fixtures } = require('../../../../scripts/build_db');


const genUserName = (id, busType) => `Can Signup Password ${busType} User${id}`;
const genUserEmail = (id, busType) => `User${id}@example.com`;
const genUserPhoneNoCountry = (id, busType) => Number.parseInt(`${id}790553251200000`.substring(0, 11));

const VIEW_SIGNUP_PAGE = (fixtures) => {
  return {
    useAccount: 'TEST_UNAUTHENTICATED',
    HTTP_TYPE: 'get',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'signup',
    sendData: {},
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response) => {
      expect(response.text).to.have.string(
        '<div id="signup" class="admin" v-cloak>'
      );
      return;
    },
  };
};
const REGISTER_USER_PHONE = (fixtures) => {
  const vendor = fixtures.vendors[0];
  const userName = genUserName(1, 'vendor');
  const userEmail = genUserEmail(1, 'vendor');
  const userPhone = genUserPhoneNoCountry(1, 'vendor');
  return {
    useAccount: 'TEST_UNAUTHENTICATED',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'signup',
    sendData: {
      phoneNoCountry: userPhone,
      phoneCountryCode: 1,
      email: userEmail,
      name: userName,
      vendor: vendor.id,
      deliveryPartner: null,
      role: 'vendor',
      vendorRole: 'inventoryManager',
      deliveryPartnerRole: 'none',
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response) => {
      expect(response.body).to.have.property('data');
      expect(response.body['data']).to.deep.include({
        // firebaseSessionToken: "REGISTERING_USER", * These are hid from JSON remember
        name: userName,
      });
      return;
    },
  };
};
const REGISTER_USER_PHONE_THROWS_IF_USER_EXISTS = (fixtures) => {
  return {
    useAccount: 'TEST_UNAUTHENTICATED',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'signup',
    sendData: {
      phoneNoCountry: '',
      phoneCountryCode: 1,
      email: 'userEmail',
      name: 'userName',
      vendor: 1,
      deliveryPartner: null,
      role: 'vendor',
      vendorRole: 'inventoryManager',
      deliveryPartnerRole: 'none',
    },
    expectResponse: {},
    expectStatusCode: 401,
    expectResponseCb: async (response) => {
      return;
    },
  };
};

describe('Signup Tests', () => {
  describe('Can get signup view', () => {
    it('returns 200', async () => {
      supertest(sails.hooks.http.app)
        .get('/admin/signup')
        .set('Cookie', '')
        .set('Accept', 'text/html')
        .expect(200)
        .then((response) => {
          expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
          );
          expect(response.text).to.have.string(
            '<div id="signup" class="admin" v-cloak>'
          );
          return response;
        })
        .catch((errs) => {
          console.warn(errs);
          throw errs;
        });
    });
  });
  describe('Can Register User', () => {
    // it("Can Register Vendor User using Email & Password", (done) => {
    //   supertest(sails.hooks.http.app) //TODO: Convert the mock firebase using the Firebase Emulator Sweet for Web Apps
    //     .post("/api/v1/admin/signup-with-password")
    //     .send({
    //       phoneNoCountry: 44,
    //       phoneCountryCode: 7905511111,
    //       email: "user@example.com",
    //       password: "DummyPass123",
    //       name: "Can Signup Password Vendor User",
    //       vendor: 1,
    //       deliveryPartner: null,
    //       role: "vendor",
    //       vendorRole: "inventoryManager",
    //       deliveryPartnerRole: "none",
    //     })
    //     .expect(200)
    //     .then((response) => {
    //       // must be then, not a callback
    //       // console.log(response.res.session);
    //       // console.log(response.res);
    //       // console.log(response._body);
    //       // console.log(Object.keys(response));
    //       expect(response.statusCode).to.equal(200,
    //   `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
    //     depth: null,
    //   })} with trace: ${util.inspect(response.body.traceRef, {
    //     depth: null,
    //   })}`
    // );
    //       expect(response.body).to.have.property("data");
    //       expect(response.body["data"]).to.have.property("fbUid");
    //       done();
    //       return response;
    //     })
    //     .catch((errs) => {
    //       console.warn(errs);
    //       done(errs);
    //       return errs;
    //     });
    // });
    it('Can Register Vendor User using Phone (no firebase)', async () => {
      try {
        const hats = new HttpAuthTestSenderAdmin(
          REGISTER_USER_PHONE(fixtures)
        );
        const response = await hats.makeAuthCallWith(
          {},
          []
        );
        await hats.expectedResponse.checkResponse(response);
      } catch (error) {
        console.warn(error);
        throw error;
      }
    });
    it('Registration using Phone throws userExists if user already exists', async () => {
      try {
	      const user = await User.findOne({
	        phoneNoCountry: 7905532512,
	        phoneCountryCode: 44,
	      }).populate('deliveryPartner&vendor');

	      const hats = new HttpAuthTestSenderAdmin(REGISTER_USER_PHONE_THROWS_IF_USER_EXISTS(fixtures));
	      const response = await hats.makeAuthCallWith(
          {
            phoneNoCountry: user.phoneNoCountry,
            phoneCountryCode: user.phoneCountryCode,
            email: user.email,
            name: user.name,
            vendor: user.vendor && user.vendor.id,
            deliveryPartner: user.deliveryPartner && user.deliveryPartner.id,
            role: user.role,
            vendorRole: user.vendorRole,
            deliveryPartnerRole: user.deliveryPartnerRole,
          },
          []
        );
	      await hats.expectedResponse.checkResponse(response);
      } catch (error) {
        console.warn(error);
        throw error;
      }
    });
    it('Registration using Email and Password throws userExists if user already exists', async () => {
      console.warn('BLANK TEST!!!!!!!!! PLEASE IMPLEMENT.');
    });
  });
});
