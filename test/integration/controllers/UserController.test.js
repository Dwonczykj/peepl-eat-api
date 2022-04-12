/* eslint-disable no-undef */
// test/integration/controllers/UserController.test.js
var supertest = require('supertest');
// var sails = require('sails');

describe('UserController.login', () => {
  describe('#login()', () => {
    it('should return success', (done) => {
      supertest(sails.hooks.http.app)
      .post('/admin/login')
      .send({ emailAddress: 'adam@itsaboutpeepl.com', password: 'Testing123!' })
      .expect(200, done);
    });
  });
});
