/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/UserController.test.js
// var util = require("util");
var supertest = require('supertest');

describe('Is Logged In', () => {
  describe('TestControllerAction()', () => {
    it('GET logged-in should return 200', async () => {
      try {
	      const response = await supertest(sails.hooks.http.app)
	        .get('/api/v1/admin/logged-in')
	        .expect(200);
      } catch (errs) {
        throw errs;
      }
    });
  });
  // describe('Test login-with-password Action()', () => {
  //   it('POST login-with-password EXPECT FAILURE AS NOT FIREBASE AND HAVE NOT REGISTERED', (done) => {
  //     supertest(sails.hooks.http.app)
  //       .post('/api/v1/admin/login-with-password') //This not will fail as expects to use firebase for this method, but this user details is not yet registered
  //       .send({ emailAddress: 'joey@vegiapp.co.uk', password: 'DUMMY_FIREBASE_TOKEN', rememberMe: false })
  //       .expect(200, (response) => {
  //         console.log(response);
  //         return done();
  //       });
  //   });
  // });
});
