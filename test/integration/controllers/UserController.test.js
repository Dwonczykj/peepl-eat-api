// test/integration/controllers/UserController.test.js
var request = require('supertest');
const assert = require('assert');
const dotenv = require('dotenv');//.load('./env'); // alias of .config()
// const envConfig = dotenv.load().parsed;
const envConfig = dotenv.config('./env').parsed;

describe('Login Controllers', () => {

    describe('login-with-secret', () => {
        it('/api/v1/admin/login-with-secret should return 200', function (done) {
            // console.log(sails);
            // ? Use CSRF?
            //   request(sails.hooks.http.app)
            //             .get('/csrfToken')
            //             .set('Accept', 'application/json')
            //             // .expect('Content-Type', /json/)
            //             .expect(200)
            //             .then(response => {
            //               this._csrf = response.body._csrf;
            //               request(sails.hooks.http.app)
            //                     .put('/api/v1/admin/login-with-secret')
            //                     // .set('X-CSRF-Token', response.body._csrf)
            //                     .send({
            //                       name: 'TEST_SERVICE',
            //                       secret: envConfig['test_secret'],
            //                       _csrf: response.body._csrf
            //                     })
            //                     .expect(302, done);
            //             })
            //             .catch(err => done(err));
            request(sails.hooks.http.app)
                .post('/api/v1/admin/login-with-secret')
                .send({
                    name: 'TEST_SERVICE',
                    secret: envConfig['test_secret'],
                })
                .expect(200, (response) => {
                    return done();
                });
                // .catch((err) => {
                //     if (err)
                //         return done(err);
                // })
        });
    });

});
