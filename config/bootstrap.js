/* eslint-disable no-console */
/* eslint-disable no-undef */
/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

// Don't include as hides the sails hooks added below needed to create models, include types implicity using .d.ts files so don't need import statements as they are global to transpiler.

const dotenv = require('dotenv');//.load('./env'); // alias of .config()
// const envConfig = dotenv.load().parsed;
const envConfig = dotenv.config('./env').parsed;
const util = require('util');
const { buildDb } = require('../scripts/build_db');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    return callback(array[index], index, array);
  }
}

module.exports.bootstrap = async function () {
  _.extend(sails.hooks.http.app.locals, sails.config.http.locals);

  //Pull in Fixtures
  var fixtures = {};
  const fs = require("fs");

  _.each(fs.readdirSync(process.cwd() + "/test/fixtures/"), function (file) {
    fixtures[file.replace(/\.js$/, "")] = require(process.cwd() +
      "/test/fixtures/" +
      file);
  });


  // Import dependencies
  var path = require('path');

  // This bootstrap version indicates what version of fake data we're dealing with here.
  var HARD_CODED_DATA_VERSION = 5;

  // This path indicates where to store/look for the JSON file that tracks the "last run bootstrap info"
  // locally on this development computer (if we happen to be on a development computer).
  var bootstrapLastRunInfoPath = path.resolve(sails.config.appPath, '.tmp/bootstrap-version.json');
  // Compare bootstrap version from code base to the version that was last run
  var lastRunBootstrapInfo = await sails.helpers.fs.readJson(bootstrapLastRunInfoPath)
    .tolerate('doesNotExist'); // (it's ok if the file doesn't exist yet-- just keep going.)

  if (lastRunBootstrapInfo && lastRunBootstrapInfo.lastRunVersion === HARD_CODED_DATA_VERSION) {
    sails.log('Skipping v' + HARD_CODED_DATA_VERSION + ' bootstrap script...  (because it\'s already been run)');
    sails.log('(last run on this computer: @ ' + (new Date(lastRunBootstrapInfo.lastRunAt)) + ')');
    return;
  } //•

  try {

    // var vendorCategory = await VendorCategory.createEach(fixtures.vendorCategories).fetch();
    // console.info(
    //   "Finished populating vendorCategories: " +
    //     util.inspect(vendorCategory, { depth: 1 }) + // * depth: null for full object print
    //     ""
    // );

    // var postalDistricts = await PostalDistrict.createEach(
    //   fixtures.postalDistricts
    // ).fetch();
    // console.info("Finished populating Postal Districts");

    // await Vendor.createEach(fixtures.vendors);

    // await DeliveryPartner.createEach(fixtures.deliveryPartners);
    // console.info("Finished populating Delivery Partners");

    // await CategoryGroup.createEach(fixtures.categoryGroups);
    // console.info("Finished populating Category Groups");

    // await ProductCategory.createEach(
    //   fixtures.productCategories
    // ).fetch();
    // console.info("Finished populating ProductCategories");
    // await Product.createEach(fixtures.products);
    // console.info("Finished populating Products");
    // await ProductOption.createEach(fixtures.productOptions);
    // await ProductOptionValue.createEach(fixtures.productOptionValues);
    // console.info("Finished populating Product Options");
    // await Discount.createEach(fixtures.discountCodes);
    // console.info("Finished populating Discounts");

    // await User.createEach([
    //   {
    //     email: "adam@itsaboutpeepl.co.uk",
    //     // password: 'Testing123!',
    //     phoneNoCountry: 7905532512,
    //     phoneCountryCode: 44,
    //     name: "Adam",
    //     vendor: 1,
    //     vendorConfirmed: true,
    //     isSuperAdmin: true,
    //     vendorRole: "none",
    //     role: "admin",
    //     firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
    //   },
    // ]);

    await buildDb(sails, false);

    // const createPostalDistricts = fixtures.postalDistricts;
    // asyncForEach(createPostalDistricts, async (pd, ind, arr) => {
    //   var existingPd = await PostalDistrict.findOne(pd);
    //   if (existingPd) {
    //     PostalDistrict.removeFromCollection(pd);
    //   }
    // });
    // var postalDistricts = createPostalDistricts.map((pd) => PostalDistrict.create(pd).fetch());
    

    // var delifonseca = await Vendor.create({
    //   name: 'Delifonseca Alt.',
    //   type: 'restaurant',
    //   description: 'Life\'s too short to have a bad meal. Delifonseca is here to help you enjoy the finer tastes in life.',
    //   walletAddress: '0xf039CD9391cB28a7e632D07821deeBc249a32410',
    //   imageUrl: 'https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png',
    //   status: 'active',
    //   phoneNumber: '+447495995614',
    //   vendorCategories: [vendorCategory.id],
    //   productCategories: [],
    //   fulfilmentPostalDistricts: [postalDistricts[0].id, postalDistricts[1].id, postalDistricts[2].id],
    //   deliveryPartner: null,
    // }).fetch();
    // console.log('Delifonseca alt. created');
    

    // var delifonseca = await Vendor.findOne({ name: "Delifonseca Alt." });

    
    // var lunchProductCategoryForDelifonsecaVendor = productCategories[0];
    // var coffeeProductCategoryForDelifonsecaVendor = productCategories[1];
    // var dinnerProductCategoryForDelifonsecaVendor = productCategories[2];
    // await Vendor.addToCollection(delifonseca.id, "productCategories", [
    //   lunchProductCategoryForDelifonsecaVendor.id,
    //   coffeeProductCategoryForDelifonsecaVendor.id,
    //   dinnerProductCategoryForDelifonsecaVendor.id,
    // ]);

    

    // var lunchProductCategoryForDelifonsecaVendor = await ProductCategory.create({
    //   name: 'Lunch',
    //   vendor: delifonseca.id,
    //   categoryGroup: readyMealCatGroup.id
    // }).fetch();
    // var coffeeProductCategoryForDelifonsecaVendor = await ProductCategory.create({
    //   name: 'Coffee',
    //   vendor: delifonseca.id,
    //   categoryGroup: coffeeCatGroup.id
    // }).fetch();
    // var dinnerProductCategoryForDelifonsecaVendor = await ProductCategory.create({
    //   name: 'Dinner',
    //   vendor: delifonseca.id,
    //   categoryGroup: readyMealCatGroup.id
    // }).fetch();

    

    // var burnsNight = await Product.findOne({
    //   name: 'Burns Night - Dine @ Home (For 1)',
    // });

    // var starterOption = await ProductOption.create({
    //   name: 'Starter',
    //   product: burnsNight.id
    // }).fetch();

    // var mainOption = await ProductOption.create({
    //   name: 'Main',
    //   product: burnsNight.id
    // }).fetch();

    // var dessertOption = await ProductOption.create({
    //   name: 'Dessert',
    //   product: burnsNight.id
    // }).fetch();
    
    
    // eslint-disable-next-line no-console
    // console.log('test.service@example.com Test Account User created');

    // // * Create consumer user
    // await User.create({
    //   email: 'jdwonczyk.fit@gmail.com',
    //   phoneNoCountry: 7905532512,
    //   phoneCountryCode: 44,
    //   // password: 'Testing123!',
    //   name: 'Consumer 1',
    //   vendor: delifonseca.id,
    //   vendorConfirmed: true,
    //   isSuperAdmin: false,
    //   role: 'vendor',
    //   vendorRole: 'salesManag'
    //   firebaseSessionToken: 'DUMMY_FIREBASE_TOKEN',
    // });

    // // * Create sales Assistant
    // await User.create({
    //   email: 'jdwonczyk@gmail.com',
    //   phoneNoCountry: 9998887777,
    //   phoneCountryCode: 1,
    //   // password: 'Testing123!',
    //   name: 'Sales Assistant 1',
    //   vendor: delifonseca.id,
    //   vendorConfirmed: true,
    //   isSuperAdmin: false,
    //   vendorRole: 'salesManager',
    //   role: 'vendor',
    //   firebaseSessionToken: 'DUMMY_FIREBASE_TOKEN',
    // });

    // // * Create Consumer
    // await User.create({
    //   email: 'jdwonczy.corpk@gmail.com',
    //   phoneNoCountry: 9995557777,
    //   phoneCountryCode: 1,
    //   // password: 'Testing123!',
    //   name: 'Consumer 1',
    //   isSuperAdmin: false,
    //   role: 'consumer',
    //   firebaseSessionToken: 'DUMMY_FIREBASE_TOKEN',
    // });

    // Save new bootstrap version


  } catch (error) {
    sails.log.warn('Bootstrapping db failed. Delete the db and start again... Error -> ' + error);
  }
  await sails.helpers.fs.writeJson.with({
    destination: bootstrapLastRunInfoPath,
    json: {
      lastRunVersion: HARD_CODED_DATA_VERSION,
      lastRunAt: Date.now()
    },
    force: true
  })
    .tolerate((err) => {
      sails.log.warn('For some reason, could not write bootstrap version .json file.  This could be a result of a problem with your configured paths, or, if you are in production, a limitation of your hosting provider related to `pwd`.  As a workaround, try updating app.js to explicitly pass in `appPath: __dirname` instead of relying on `chdir`.  Current sails.config.appPath: `' + sails.config.appPath + '`.  Full error details: ' + err.stack + '\n\n(Proceeding anyway this time...)');
    });
};
