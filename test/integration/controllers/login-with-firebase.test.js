/* eslint-disable no-undef */

var sails = require('sails');
// var sinon = require('sinon'); // Mocking/stubbing/spying
var assert = require('chai').assert; // Assertions
var nock = require('nock'); // HTTP Request Mocking


// var constants = require('../constants/externalSystemsConstants');
// var Battlefield4Service = require('./battlefield4Service');

// describe('External Services', () => {

//   // create a variable to hold the instantiated sails server
//   var app, battlefield4Service;

//   // Global before hook
//   before(function (done) {

//     // Lift Sails and start the server
//     Sails.lift({

//       log: {
//         level: 'error'
//       }

//     }, function (err, sails) {
//       app = sails;
//       done(err, sails);
//     });
//   });

//   // Global after hook
//   after(function (done) {
//     app.lower(done);
//   });

//   describe('Battlefield 4 Service', function () {
//     var userName, platform, kills, skill, deaths, killAssists, shotsHit, shotsFired;

//     before(() => {

//       // Mock data points
//       userName = 'dummyUser';
//       platform = 'ps3';
//       kills = 200;
//       skill = 300;
//       deaths = 220;
//       killAssists = 300;
//       shotsHit = 2346;
//       shotsFired = 7800;

//       var mockReturnJson = {
//         player: {
//           name: userName,
//           plat: platform
//         },
//         stats: {
//           kills: kills,
//           skill: skill,
//           deaths: deaths,
//           killAssists: killAssists,
//           shotsHit: shotsHit,
//           shotsFired: shotsFired
//         }
//       };

//       // Mock response from BF4 API
//       battlefield4Service = nock('http://' + constants.BF4_SERVICE_URI_HOST)
//         .get(constants.BF4_SERVICE_URI_PATH.replace('[platform]', platform).replace('[name]', userName))
//         .reply(200, mockReturnJson);
//     });

//     it('Should translate BF4 API data to FPSStatsDTO', function (done) {
//       var service = new Battlefield4Service();
//       service.getPlayerInfo(userName, platform, function (fpsStats) {
//         assert(fpsStats !== null);
//         assert(fpsStats !== undefined);
//         assert(fpsStats.kills === kills, 'kills');
//         assert(fpsStats.deaths === deaths, 'deaths');
//         assert(fpsStats.killAssists === killAssists, 'deaths')
//         assert(fpsStats.kdr === kills / deaths, 'kdr');
//         assert(fpsStats.shotsFired === shotsFired, 'shotsFired');
//         assert(fpsStats.shotsHit === shotsHit, 'shotsHit');
//         assert(fpsStats.shotsAccuracy === shotsHit / shotsFired, 'shotsAccuracy');
//         assert(fpsStats.userName === userName, 'userName');
//         assert(fpsStats.platform === platform, 'platform');
//         done();
//       });
//     });
//   });
// });

require('ts-node/register');

var supertest = require('supertest');
// var assert = require('assert');


describe('AdminController', () => {
  var app;

  // Global before hook
  before((done) => {
    try {
      // Lift Sails and start the server
      sails.lift({

        log: {
          level: 'error'
        }

      }, (err, sails) => {
        app = sails;
        done(err, sails);
      });
    } catch (err) {
      return done(err);
    }
  });

  // Global after hook
  after((done) => {
    app.lower(done);
  });

  describe('loginWithFirebase()', () => {
    it('should return success', (done) => {
      supertest(sails.hooks.http.app)
        .post('/api/v1/admin/login-with-firebase')
        .send({ phoneNumber: '+44 790-553-2512', token: 'DUMMY' })
        .expect(401, done);
    });
  });
});
