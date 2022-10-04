/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/UserController.test.js
var supertest = require('supertest');

<<<<<<< HEAD

describe('Is Logged In', () => {
  describe('TestControllerAction()', () => {
    it('GET logged-in should return 200', (done) => {
      supertest(sails.hooks.http.app)
        .get('/api/v1/admin/logged-in')
=======
describe('Can Run Tests', () => {
  describe('TestControllerAction()', () => {
    it('should return success', (done) => {
      supertest(sails.hooks.http.app)
        .get('/admin/logged-in')
>>>>>>> upstream/main
        // .send({ emailAddress: 'adam@itsaboutpeepl.com', password: 'Testing123!' })
        .expect(200, (response) => {
          console.log(response);
          return done();
        });
    });
  });
<<<<<<< HEAD
  describe('Test login-with-password Action()', () => {
    it('POST login-with-password EXPECT FAILURE AS NOT FIREBASE AND HAVE NOT REGISTERED', (done) => {
      supertest(sails.hooks.http.app)
        .post('/api/v1/admin/login-with-password') //This not will fail as expects to use firebase for this method, but this user details is not yet registered
        .send({ emailAddress: 'joey@vegiapp.co.uk', password: 'DUMMY_FIREBASE_TOKEN', rememberMe: false })
        .expect(200, (response) => {
          console.log(response);
          return done();
        });
    });
  });
=======
>>>>>>> upstream/main
});
