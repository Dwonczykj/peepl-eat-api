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
// const PostalDistrict = require('../api/models/PostalDistrict');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    return callback(array[index], index, array);
  }
}


module.exports.bootstrap = async function() {
  _.extend(sails.hooks.http.app.locals, sails.config.http.locals);


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

  var vendorCategory = await VendorCategory.create({
    name: 'Cafes',
  }).fetch();

  const createPostalDistricts = [
    {
      outcode: 'L1'
    }, {
      outcode: 'L2'
    }, {
      outcode: 'L3'
    }
  ];
  asyncForEach(createPostalDistricts, async (pd, ind, arr) => {
    var existingPd = await PostalDistrict.findOne(pd);
    if (existingPd) {
      PostalDistrict.removeFromCollection(pd);
    }
  });
  // var postalDistricts = createPostalDistricts.map((pd) => PostalDistrict.create(pd).fetch());
  var postalDistricts = await PostalDistrict.createEach(createPostalDistricts).fetch();

  var deliveryPartner = await DeliveryPartner.create({
    name: 'Agile',
    email: 'agile@example.com',
    phoneNumber: '0123456789',
    status: 'active',
  }).fetch();

  var deliveryPartner = await DeliveryPartner.create({
    name: 'Agile',
    email: 'agile@example.com',
    phoneNumber: '0123456789',
    status: 'active',
  }).fetch();

  var delifonseca = await Vendor.create({
    name: 'Delifonseca',
    type: 'restaurant',
    description: 'Life\'s too short to have a bad meal. Delifonseca is here to help you enjoy the finer tastes in life.',
    walletAddress: '0xf039CD9391cB28a7e632D07821deeBc249a32410',
    imageUrl: 'https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png',
    status: 'active',
    phoneNumber: '+447495995614',
    vendorCategories: [vendorCategory.id],
    fulfilmentPostalDistricts: [postalDistricts[0].id, postalDistricts[1].id, postalDistricts[2].id],
    deliveryPartner: deliveryPartner.id,
  }).fetch();

  var productCategory = await ProductCategory.create({
    name: 'Lunch',
    vendor: delifonseca.id
  }).fetch();

  var burnsNight = await Product.create({
    name: 'Burns Night - Dine @ Home (For 1)',
    description: 'Unfortunately, this year the 25th falls on a Monday. You won’t be able to join us, so we\'ve made our Dine@home Burns inspired instead.',
    basePrice: 2200,
    isAvailable: true,
    vendor: delifonseca.id,
    imageUrl: 'https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png',
    category: productCategory.id
  }).fetch();

  var starterOption = await ProductOption.create({
    name: 'Starter',
    product: burnsNight.id
  }).fetch();

  await ProductOptionValue.createEach([{
    name: 'Traditional Cullen Skink – smoked haddock, potato and leek soup (GF)',
    priceModifier: 0,
    isAvailable: true,
    option: starterOption.id
  }, {
    name: 'Rabbit ‘cock-a-leekie’ terrine. A chicken, rabbit and leek terrine served with whisky jelly and oatcakes',
    priceModifier: 0,
    isAvailable: true,
    option: starterOption.id
  }, {
    name: 'Classic traditional haggis, neeps and tatties',
    priceModifier: 0,
    isAvailable: true,
    option: starterOption.id
  }, {
    name: 'Martin’s classic vegetarian haggis, neeps and tatties (V)',
    priceModifier: 0,
    isAvailable: true,
    option: starterOption.id
  }]);

  var mainOption = await ProductOption.create({
    name: 'Main',
    product: burnsNight.id
  }).fetch();

  await ProductOptionValue.createEach([{
    name: 'Venison, beef and beer stew, whiskey dumplings and creamy mash',
    priceModifier: 0,
    isAvailable: true,
    option: mainOption.id
  }, {
    name: 'Darne of Scottish salmon, kale, creamy mash and Loch Spelve mussel sauce (GF)',
    priceModifier: 0,
    isAvailable: true,
    option: mainOption.id
  }, {
    name: 'Lanarkshire blue portobello mushroom top hat with rumbledethump croquettes and pearl onion pickle (V)',
    priceModifier: 0,
    isAvailable: true,
    option: mainOption.id
  }, {
    name: 'Classic traditional haggis, neeps and tatties',
    priceModifier: 0,
    isAvailable: true,
    option: mainOption.id
  }, {
    name: 'Martin’s classic vegetarian haggis, neeps and tatties (V)',
    priceModifier: 0,
    isAvailable: true,
    option: mainOption.id
  }]);

  var dessertOption = await ProductOption.create({
    name: 'Dessert',
    product: burnsNight.id
  }).fetch();

  await ProductOptionValue.createEach([{
    name: 'Traditional Cranachan (V)',
    priceModifier: 0,
    isAvailable: true,
    option: dessertOption.id
  }, {
    name: 'Bitter chocolate tart with Drambuie fudge  (V/GF)',
    priceModifier: 0,
    isAvailable: true,
    option: dessertOption.id
  }, {
    name: 'Ecclefechan Border Tart (V)',
    priceModifier: 0,
    isAvailable: true,
    option: dessertOption.id
  }]);

  // await Discount.create({
  //   code: 'DELI10',
  //   percentage: 10,
  //   isEnabled: true
  // });

  // * Create admin-user
  await User.create({
    email: 'joey@vegi.com',
    // password: 'Testing123!',
    phoneNoCountry: 7905532512,
    phoneCountryCode: 44,
    name: 'Joey Dwonczyk',
    vendor: delifonseca.id,
    vendorConfirmed: true,
    isSuperAdmin: true,
    vendorRole: 'none',
    role: 'admin',
    firebaseSessionToken: 'DUMMY_FIREBASE_TOKEN',
  });

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

  // * Create sales Assistant
  await User.create({
    email: 'jdwonczyk@gmail.com',
    phoneNoCountry: 9998887777,
    phoneCountryCode: 1,
    // password: 'Testing123!',
    name: 'Sales Assistant 1',
    vendor: delifonseca.id,
    vendorConfirmed: true,
    isSuperAdmin: false,
    vendorRole: 'salesManager',
    role: 'vendor',
    firebaseSessionToken: 'DUMMY_FIREBASE_TOKEN',
  });

  // * Create Courier (Manager)
  await User.create({
    email: 'jdwonczy.corpk@gmail.com',
    phoneNoCountry: 9995557777,
    phoneCountryCode: 1,
    // password: 'Testing123!',
    name: 'Courier 1',
    isSuperAdmin: false,
    role: 'courier',
    courierRole: 'deliveryManager',
    firebaseSessionToken: 'DUMMY_FIREBASE_TOKEN',
  });

  // * Create Consumer
  await User.create({
    email: 'jdwonczy.corpk@gmail.com',
    phoneNoCountry: 9995557777,
    phoneCountryCode: 1,
    // password: 'Testing123!',
    name: 'Consumer 1',
    isSuperAdmin: false,
    role: 'consumer',
    firebaseSessionToken: 'DUMMY_FIREBASE_TOKEN',
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
