/* eslint-disable no-undef */
/* eslint-disable no-console */
var sails = require('sails');
var _ = require('lodash');
var util = require('util');
// const {assert} = require('chai');
const { buildDb } = require('../scripts/build_db');

// async function asyncForEach(array, callback) {
//   for (let index = 0; index < array.length; index++) {
//     return callback(array[index], index, array);
//   }
// }

async function populateDbData(done) {
  let _fixtures;
  try {
    _fixtures = await buildDb(sails, true);
    console.info("Finished populating DB");
  } catch (error) {
    console.error(error);
    done(error);
    return {};
  }
  return _fixtures;
}

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
    console.log('Call sails.lift');
    sails.lift({
      ...rc('sails'), ...{
        models: {
          // connection: 'unitTestConnection',
          migrate: 'drop'
        },
        log: { level: 'info' },
      }
    }, async (err, sails) => {
      console.log('Lifting Sails');
      if (err) {
        console.warn('Sails setup blewup!');
        return done(err);
      }

      app = sails;

      // here you can load fixtures, etc.
      // (for example, you might want to create some records in the database)
      // console.log('Creating test users');
      // try {
      //   await createUsers();
      // } catch (dbErr) {
      //   console.warn('test db creation error in lifecycle hooks: ' + dbErr);
      //   return done(dbErr);
      // }

      try {
        await populateDbData(done);
      } catch (dbErr) {
        console.warn('test db creation error in lifecycle hooks: ' + dbErr);
        return done(dbErr);
      }

      var request = require('supertest');

      request(sails.hooks.http.app)
        .get('/csrfToken')
        .set('Accept', 'application/json')
        .then(response => {
          console.log(response.body);
          this._csrf = response.body._csrf;
          console.log('Sails lifted!');
        })
        .catch(done);
      done();
      return;
    });
  } catch (err) {
    done(err);
    return;
  }
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
