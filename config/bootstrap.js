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

  var delifonseca = await Vendor.create({
    name: 'Delifonseca',
    type: 'restaurant',
    description: 'Life\'s too short to have a bad meal. Delifonseca is here to help you enjoy the finer tastes in life.',
    walletId: '0xf039CD9391cB28a7e632D07821deeBc249a32410',
    imageFd: __dirname + '/../assets/images/vendors/spitroast.jpg',
    imageMime: 'image/jpeg'
  }).fetch();

  var burnsNight = await Product.create({
    name: 'Burns Night - Dine @ Home (For 1)',
    description: 'Unfortunately, this year the 25th falls on a Monday. You won’t be able to join us, so we\'ve made our Dine@home Burns inspired instead.',
    basePrice: 2200,
    isAvailable: true,
    vendor: delifonseca.id,
    image: 'https://www.delifonseca.co.uk/wp-content/uploads/2016/08/IMG_9705-1024x683.jpg'
  }).fetch();

  var starterOption = await ProductOption.create({
    name: 'Starter',
    product: burnsNight.id
  }).fetch();

  await ProductOptionValue.createEach([{
    name: 'Traditional Cullen Skink – smoked haddock, potato and leek soup (GF)',
    priceModifier: 0,
    isAvailable: true,
    options: [starterOption.id]
  }, {
    name: 'Rabbit ‘cock-a-leekie’ terrine. A chicken, rabbit and leek terrine served with whisky jelly and oatcakes',
    priceModifier: 0,
    isAvailable: true,
    options: [starterOption.id]
  }, {
    name: 'Classic traditional haggis, neeps and tatties',
    priceModifier: 0,
    isAvailable: true,
    options: [starterOption.id]
  }, {
    name: 'Martin’s classic vegetarian haggis, neeps and tatties (V)',
    priceModifier: 0,
    isAvailable: true,
    options: [starterOption.id]
  }]);

  var mainOption = await ProductOption.create({
    name: 'Main',
    product: burnsNight.id
  }).fetch();

  await ProductOptionValue.createEach([{
    name: 'Venison, beef and beer stew, whiskey dumplings and creamy mash',
    priceModifier: 0,
    isAvailable: true,
    options: [mainOption.id]
  }, {
    name: 'Darne of Scottish salmon, kale, creamy mash and Loch Spelve mussel sauce (GF)',
    priceModifier: 0,
    isAvailable: true,
    options: [mainOption.id]
  }, {
    name: 'Lanarkshire blue portobello mushroom top hat with rumbledethump croquettes and pearl onion pickle (V)',
    priceModifier: 0,
    isAvailable: true,
    options: [mainOption.id]
  }, {
    name: 'Classic traditional haggis, neeps and tatties',
    priceModifier: 0,
    isAvailable: true,
    options: [mainOption.id]
  }, {
    name: 'Martin’s classic vegetarian haggis, neeps and tatties (V)',
    priceModifier: 0,
    isAvailable: true,
    options: [mainOption.id]
  }]);

  var dessertOption = await ProductOption.create({
    name: 'Dessert',
    product: burnsNight.id
  }).fetch();

  await ProductOptionValue.createEach([{
    name: 'Traditional Cranachan (V)',
    priceModifier: 0,
    isAvailable: true,
    options: [dessertOption.id]
  }, {
    name: 'Bitter chocolate tart with Drambuie fudge  (V/GF)',
    priceModifier: 0,
    isAvailable: true,
    options: [dessertOption.id]
  }, {
    name: 'Ecclefechan Border Tart (V)',
    priceModifier: 0,
    isAvailable: true,
    options: [dessertOption.id]
  }]);

  var localDeliveryMethod = await DeliveryMethod.create({
    name: 'Local Courier',
    description: 'Delivered fresh by one of our reliable local couriers!',
    priceModifier: 200,
    postCodeRestrictionRegex: '*',
    products: [burnsNight.id]
  }).fetch();

  await DeliveryMethodSlot.create({
    startTime: 1649243393,
    endTime: 1649246993,
    slotsRemaining: 3,
    deliveryMethod: localDeliveryMethod.id
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
