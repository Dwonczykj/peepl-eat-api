/* eslint-disable no-undef */
/* eslint-disable no-console */
var sails = require('sails');
var _ = require('lodash');
var util = require("util");
const dotenv = require('dotenv');//.load('./env'); // alias of .config()
// const envConfig = dotenv.load().parsed;
const envConfig = dotenv.config('./test/env').parsed;
const {assert} = require('chai');
const { buildDb } = require('../scripts/build_db');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    return callback(array[index], index, array);
  }
}

// async function createUsers() {
//     // await User.createEach([
//     //   {
//     //     email: "service.account@example.com",
//     //     phoneNoCountry: 9995557777,
//     //     phoneCountryCode: 1,
//     //     name: "SERVICE 1",
//     //     isSuperAdmin: false,
//     //     role: "deliveryPartner",
//     //     deliveryPartnerRole: "deliveryManager",
//     //     firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
//     //   },
//     // ]);
//     // console.log("service.account@example.com Service Account User created");
//     // await User.create({
//     //   email: "test.service@example.com",
//     //   phoneNoCountry: 9993137777,
//     //   phoneCountryCode: 44,
//     //   name: "TEST_SERVICE",
//     //   isSuperAdmin: true,
//     //   role: "admin",
//     //   firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
//     //   secret: envConfig["test_secret"],
//     // });
//     // console.log("test.service@example.com Test Account User created");

//     // await User.create({
//     //   email: "joey@vegiapp.co.uk",
//     //   // password: 'Testing123!',
//     //   phoneNoCountry: 7905532512,
//     //   phoneCountryCode: 44,
//     //   name: "Joey Dwonczyk",
//     //   vendor: 1,
//     //   vendorConfirmed: true,
//     //   isSuperAdmin: true,
//     //   vendorRole: "none",
//     //   role: "admin",
//     //   firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
//     // });
// }

async function populateDbData(done) {
  //Pull in Fixtures
  // var fixtures = {};
  // const fs = require("fs");

  // _.each(fs.readdirSync(process.cwd() + "/test/fixtures/"), (file) => {
  //   fixtures[file.replace(/\.js$/, "")] = require(process.cwd() +
  //     "/test/fixtures/" +
  //     file);
  // });

  try {
    await buildDb(sails, true);
    // await User.createEach(fixtures.users);
    // console.info(
    //   `Created users:-> ` +
    //     util.inspect(
    //       fixtures.users.map((user) => ({ name: user.name })),
    //       { depth: 1 }
    //     ) + // * depth: null for full object print
    //     ""
    // );

    // const vendorCats = await VendorCategory.createEach(fixtures.vendorCategories).fetch();
    // console.info(
    //   "Finished populating vendorCategories: " +
    //     util.inspect(vendorCats, { depth: 1 }) + // * depth: null for full object print
    //     ""
    // );

    // const createPostalDistricts = [
    //   {
    //     outcode: "L1",
    //   },
    //   {
    //     outcode: "L2",
    //   },
    //   {
    //     outcode: "L3",
    //   },
    // ];
    // asyncForEach(createPostalDistricts, async (pd, ind, arr) => {
    //     var existingPd = await PostalDistrict.findOne(pd);
    //     if (existingPd) {
    //         PostalDistrict.removeFromCollection(pd);
    //     }
    // });
    // var postalDistricts = createPostalDistricts.map((pd) => PostalDistrict.create(pd).fetch());
    // const postalDistricts = await PostalDistrict.createEach(
    //   createPostalDistricts
    // ).fetch();
    // const createPostalDistricts = fixtures.postalDistricts;
    // asyncForEach(createPostalDistricts, async (pd, ind, arr) => {
    //   var existingPd = await PostalDistrict.findOne(pd);
    //   if (existingPd) {
    //     PostalDistrict.removeFromCollection(pd);
    //   }
    // });
    // var postalDistricts = createPostalDistricts.map((pd) => PostalDistrict.create(pd).fetch());
    // const existingPostalDistricts = await PostalDistrict.find();
    // assert.isEmpty(existingPostalDistricts);
    // var postalDistricts = await PostalDistrict.createEach(
    //   fixtures.postalDistricts
    // ).fetch();
    
    // console.info("Finished populating Postal Districts");

    // await DeliveryPartner.createEach(fixtures.deliveryPartners);
    // console.info("Finished populating Delivery Partners");

    // await CategoryGroup.createEach(fixtures.categoryGroups);
    // console.info("Finished populating Category Groups");

    // const vendorCategory = await VendorCategory.findOne({
    //   name: "Cafes",
    // });
    // const deliveryPartner = await DeliveryPartner.findOne({
    //   name: 'Agile',
    // });
    // console.log('Creating Vendor Delifonseca');
    // await Vendor.create({
    //   name: 'Delifonseca Alt.',
    //   type: 'restaurant',
    //   description: 'Life\'s too short to have a bad meal. Delifonseca is here to help you enjoy the finer tastes in life.',
    //   walletAddress: '0xf039CD9391cB28a7e632D07821deeBc249a32410',
    //   imageUrl: 'https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png',
    //   status: 'active',
    //   phoneNumber: '+447495995615',
    //   // vendorCategories: [vendorCats[0].id],
    //   vendorCategories: [],
    //   productCategories: [],
    //   fulfilmentPostalDistricts: [],//postalDistricts.map(pd => pd.id),
    //   deliveryPartner: null, //deliveryPartner.id,
    // }).fetch();
    
    // var delifonseca = await Vendor.create({
    //   name: "Delifonseca Alt.",
    //   type: "restaurant",
    //   description:
    //     "Life's too short to have a bad meal. Delifonseca is here to help you enjoy the finer tastes in life.",
    //   walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
    //   imageUrl:
    //     "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
    //   status: "active",
    //   phoneNumber: "+447495995614",
    //   vendorCategories: [vendorCategory.id],
    //   productCategories: [],
    //   fulfilmentPostalDistricts: [
    //     postalDistricts[0].id,
    //     postalDistricts[1].id,
    //     postalDistricts[2].id,
    //   ],
    //   deliveryPartner: null,
    // }).fetch();
    
    // console.info("Finished creating vendor: 'Delifonseca Alt.'");

    // await Vendor.createEach(fixtures.vendors);
    // console.info("Finished populating Vendors");

    // delifonseca = await Vendor.findOne({
    //   name: "Delifonseca",
    //   type: "restaurant",
    // });

    // await ProductCategory.createEach(fixtures.productCategories);

    // const lunchProductCategoryForDelifonsecaVendor =
    //   await ProductCategory.findOne({
    //     name: "Lunch",
    //   });
    // const coffeeProductCategoryForDelifonsecaVendor =
    //   await ProductCategory.findOne({
    //     name: "Coffee",
    //   });
    // const dinnerProductCategoryForDelifonsecaVendor =
    //   await ProductCategory.findOne({
    //     name: "Dinner",
    //   });
    // await Vendor.addToCollection(delifonseca.id, "productCategories", [
    //   lunchProductCategoryForDelifonsecaVendor.id,
    //   coffeeProductCategoryForDelifonsecaVendor.id,
    //   dinnerProductCategoryForDelifonsecaVendor.id,
    // ]);
    // console.info("Finished populating Product Categories");

    // await Product.createEach(fixtures.products);

    // await ProductOption.createEach(fixtures.productOptions);

    // await ProductOptionValue.createEach(fixtures.productOptionValues);

    // console.info("Finished populating Products");

    // await Discount.createEach(fixtures.discountCodes);

    // await Order.createEach(fixtures.orders); // ! Not for bootstrap.js

    console.info("Finished populating DB");
  } catch (error) {
    console.error(error);
    done(error);
    return;
  }
}

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
    console.log("Call sails.lift");
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

      // try {

      //   console.log('Login with Test Account');

      //   const request = require('supertest');

      //   // request(sails.hooks.http.app)
      //   //     .get('/csrfToken')
      //   //     .set('Accept', 'application/json')
      //   //     .then(response => {
      //   //         console.log(response.body);
      //   //         this._csrf = response.body._csrf;
      //   //         console.log('Sails lifted!');
      //   //         return;
      //   //     })
      //   //     .catch(err => err);

      //   request(sails.hooks.http.app)
      //             .post("/api/v1/admin/login-with-secret")
      //             .send({
      //               name: "TEST_SERVICE",
      //               secret: envConfig["test_secret"],
      //             })
      //             .then((errs, response, body) => {
      //               return response;
      //             });
      // } catch (loginErr) {
      //   console.warn('Lifecycle.test failed to login with test service account: ' + loginErr);
      //   return loginErr;
      // }


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