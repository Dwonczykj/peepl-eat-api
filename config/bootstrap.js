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
    name: 'Uncategorised',
  }).fetch();

  var postalDistricts = await PostalDistrict.createEach([
    {
      outcode: 'L1'
    }, {
      outcode: 'L2'
    }, {
      outcode: 'L3'
    }
  ]).fetch();

  var delifonseca = await Vendor.create({
    name: 'Delifonseca',
    type: 'restaurant',
    description: 'Life\'s too short to have a bad meal. Delifonseca is here to help you enjoy the finer tastes in life.',
    walletAddress: '0xf039CD9391cB28a7e632D07821deeBc249a32410',
    imageFd: __dirname + '/../assets/images/vendors/spitroast.jpg',
    imageMime: 'image/jpeg',
    status: 'active',
    phoneNumber: '+447495995614',
    vendorCategories: [vendorCategory.id],
    fulfilmentPostalDistricts: [postalDistricts[0].id, postalDistricts[1].id, postalDistricts[2].id]
  }).fetch();

  var productCategory = await ProductCategory.create({
    name: 'Lunch',
    vendor: delifonseca.id
  }).fetch();

  var fulfilmentMethod = await FulfilmentMethod.create({
    priceModifier: 200,
    postCodeRestrictionRegex: '.',
    methodType: 'delivery',
    slotLength: 60,
    bufferLength: 15,
    maxOrders: 10,
    vendor: delifonseca.id
  }).fetch();

  await OpeningHours.create({
    dayOfWeek: 'thursday',
    openTime: '09:00',
    closeTime: '17:00',
    fulfilmentMethod: fulfilmentMethod.id,
    isOpen: true
  });

  await Vendor.updateOne(delifonseca.id, {deliveryFulfilmentMethod: fulfilmentMethod.id});

  var burnsNight = await Product.create({
    name: 'Burns Night - Dine @ Home (For 1)',
    description: 'Unfortunately, this year the 25th falls on a Monday. You won’t be able to join us, so we\'ve made our Dine@home Burns inspired instead.',
    basePrice: 2200,
    isAvailable: true,
    vendor: delifonseca.id,
    imageFd: __dirname + '/../assets/images/products/1.jpeg',
    imageMime: 'image/jpeg',
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

  await Discount.create({
    code: 'DELI10',
    percentage: 10,
    isEnabled: true
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
