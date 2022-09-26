/* eslint-disable no-console */
var sails = require('sails');
const dotenv = require('dotenv');//.load('./env'); // alias of .config()
// const envConfig = dotenv.load().parsed;
const envConfig = dotenv.config('./env').parsed;

// require('ts-node/register');

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
// > Note: This is not required in order to lift, but it is a convenient default.
// process.chdir(__dirname);

// Before running any tests...
before(function (done) {

    // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
    this.timeout(80000);
    require('ts-node/register');
    let app;
    try {
        var rc = require('sails/accessible/rc');
        // sails.lift({
        //   // Your Sails app's configuration files will be loaded automatically,
        //   // but you can also specify any other special overrides here for testing purposes.

        //   // For example, we might want to skip the Grunt hook,
        //   // and disable all logs except errors and warnings:
        //   hooks: { grunt: false },
        //   log: { level: 'warn' },
        //   models: {
        //     // connection: 'unitTestConnection',
        //     migrate: 'drop'
        //   },
        //   datastores: {
        //     default: {
        //       adapter: 'sails-disk'
        //     }
        //   }

        // }, async (err, sails) => {
        sails.lift({
            ...rc('sails'), ...{
                models: {
                    // connection: 'unitTestConnection',
                    migrate: 'drop'
                },
                log: { level: 'info' },
            }
        }, async (err, sails) => {
            if (err) { return done(err); }

            app = sails;

            // here you can load fixtures, etc.
            // (for example, you might want to create some records in the database)
            console.log('Creating test users');
            try {
                await User.createEach([{
                    email: 'service.account@example.com',
                    phoneNoCountry: 9995557777,
                    phoneCountryCode: 1,
                    name: 'SERVICE 1',
                    isSuperAdmin: false,
                    role: 'courier',
                    courierRole: 'deliveryManager',
                    firebaseSessionToken: 'DUMMY_FIREBASE_TOKEN',
                }]);
                console.log('service.account@example.com Service Account User created');
                await User.create({
                    email: 'test.service@example.com',
                    phoneNoCountry: 9993137777,
                    phoneCountryCode: 44,
                    name: 'TEST_SERVICE',
                    isSuperAdmin: true,
                    role: 'admin',
                    firebaseSessionToken: envConfig['test_secret'],
                });
                console.log('test.service@example.com Test Account User created');

                console.log('Login with Test Account');

                const request = require('supertest');

                // request(sails.hooks.http.app)
                //     .get('/csrfToken')
                //     .set('Accept', 'application/json')
                //     .then(response => {
                //         console.log(response.body);
                //         this._csrf = response.body._csrf;
                //         console.log('Sails lifted!');
                //         return done();
                //     })
                //     .catch(err => done(err));

                request(sails.hooks.http.app)
                    .put('/api/v1/admin/login-with-secret')
                    .send({
                        name: 'TEST_SERVICE',
                        secret: envConfig['test_secret'],
                    });
            } catch (db_err) {
                return done(db_err);
            }


            var request = require('supertest');

            request(sails.hooks.http.app)
                .get('/csrfToken')
                .set('Accept', 'application/json')
                .then(response => {
                    console.log(response.body);
                    this._csrf = response.body._csrf;
                    console.log('Sails lifted!');
                    return done();
                })
                .catch(err => done(err));
        });
    } catch (err) {
        return done(err);
    }
    // return done();
});

// After all tests have finished...
after((done) => {

    // here you can clear fixtures, etc.
    // (e.g. you might want to destroy the records you created above)

    if (sails) {
        sails.lower(done);
    }
    console.log('Sails lowered!');

});

// Before running any tests...
// before(async function (done) {

//     // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
//     this.timeout(50000);

//     sails.lift({
//         // Your Sails app's configuration files will be loaded automatically,
//         // but you can also specify any other special overrides here for testing purposes.

//         // For example, we might want to skip the Grunt hook,
//         // and disable all logs except errors and warnings:
//         hooks: { grunt: false },
//         log: { level: 'warn' },

//     }, async (err) => {
//         if (err) { return done(err); }

//         // here you can load fixtures, etc.
//         // (for example, you might want to create some records in the database)

//         await User.createEach([
//             { emailAddress: 'admin@example.com', fullName: 'Ryan Dahl', isSuperAdmin: true, password: await sails.helpers.passwords.hashPassword('abc123') },
//             { emailAddress: 'user2@example.com', fullName: 'User 2', isSuperAdmin: false, password: await sails.helpers.passwords.hashPassword('abc1234') },
//             { emailAddress: 'user3@example.com', fullName: 'User 3', isSuperAdmin: false, password: await sails.helpers.passwords.hashPassword('abc1235') },
//         ]);

//         return done();
//     });
// });

// // After all tests have finished...
// after((done) => {

//     // here you can clear fixtures, etc.
//     // (e.g. you might want to destroy the records you created above)

//     sails.lower(done);

// });