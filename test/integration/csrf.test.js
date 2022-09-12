// // test/integration/csrf.test.js
// var request = require('supertest');
// const assert = require('assert');

// describe('CSRF Token', function () {

//     describe('GET CSRF Token', function () {
//         it('responds with an object containing _csrf key value', function (done) {
//             // console.log(sails);
//             request(sails.hooks.http.app)
//                 .get('/csrfToken')
//                 .set('Accept', 'application/json')
//                 // .expect('Content-Type', /json/)
//                 .expect(200)
//                 .then(response => {
//                     console.log(response.body);
//                     assert(response.body._csrf)
//                     done();
//                 })
//                 .catch(err => done(err));
//         });
//     });

//     describe('CSRF Token set in mocha context', function () {
//         it('can get csrf token', function (done) {
//             assert(this._csrf);
//             done();
//         });
//     });
// });