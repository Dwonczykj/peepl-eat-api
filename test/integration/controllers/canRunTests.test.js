/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/UserController.test.js
var supertest = require('supertest');

describe('Can Run Tests', () => {
  describe('TestControllerAction()', () => {
    it('GET logged-in should return 200', (done) => {
      supertest(sails.hooks.http.app)
        .get('/api/v1/admin/logged-in')
        // .send({ emailAddress: 'adam@itsaboutpeepl.com', password: 'Testing123!' })
        .expect(200, (response) => {
          // console.log(response);
          return done();
        });
    });
  });
});
