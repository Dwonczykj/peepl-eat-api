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

// const Product = require("../api/models/Product");

module.exports.bootstrap = async function() {

  // Import dependencies
  var path = require('path');

  // This bootstrap version indicates what version of fake data we're dealing with here.
  var HARD_CODED_DATA_VERSION = 4;

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

  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)
  // if (await User.count() > 0) {
  //   return;
  // }
  //
  // await User.createEach([
  //   { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
  //   { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
  //   // etc.
  // ]);
  // ```

  var testVendor = await Vendor.create({
    name: 'Baltic Social',
    type: 'restaurant',
    description: 'A great place to eat!',
    walletId: 'testtesttesttest'
  }).fetch();

  var testProduct = await Product.createEach([{
      name: 'Punk Afternoon Tea',
      description: 'A classic!',
      basePrice: 2495,
      isAvailable: true,
      vendor: testVendor.id
  }, {
      name: 'Vegan Afternoon Tea',
      description: 'A vegan classic!',
      basePrice: 2495,
      isAvailable: true,
      vendor: testVendor.id
  }]).fetch();

  var testProductOption = await ProductOption.create({
    name: 'With gravy?',
    product: testProduct[0].id
  }).fetch();

  var testProductOptionTwo = await ProductOption.create({
    name: 'With custard?',
    product: testProduct[0].id
  }).fetch();

  var testProductOptionValues = await ProductOptionValue.createEach([{
    name: 'Yes',
    priceModifier: 100,
    isAvailable: true,
    options: [testProductOption.id, testProductOptionTwo.id]
  }, {
    name: 'No',
    priceModifier: 0,
    isAvailable: true,
    options: [testProductOption.id, testProductOptionTwo.id]
  }]);

  var testDeliveryMethod = await DeliveryMethod.create({
    name: 'Local Courier',
    description: 'Delivered fresh by one of our reliable local couriers!',
    priceModifier: 200,
    products: [testProduct[0].id]
  }).fetch();

  var testDeliveryMethodSlots = await DeliveryMethodSlot.create({
    startTime: 1605430800,
    endTime: 1605434400,
    slotsRemaining: 30,
    deliveryMethod: testDeliveryMethod.id
  });

   // Save new bootstrap version
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
