/* eslint-disable no-console */
//Pull in Fixtures
var fixtures = {};
const fs = require(`fs`);
const _ = require(`lodash`);

_.each(fs.readdirSync(process.cwd() + `/test/fixtures/`), (file) => {
  fixtures[file.replace(/\.js$/, ``)] = require(process.cwd() +
    `/test/fixtures/` +
    file);
  fixtures[file.replace(/\.js$/, ``) + `_fixed`] = _.cloneDeep(fixtures[file.replace(/\.js$/, ``)]);
});

async function buildDb(sails, test) {
  const dotenv = require(`dotenv`); //.load('./env'); // alias of .config()
  // const envConfig = dotenv.load().parsed;
  const envConfig = dotenv.config(`./env`).parsed;
  const util = require(`util`);

  _.extend(sails.hooks.http.app.locals, sails.config.http.locals);


  const _envRT = test ? 'testing' : 'dev server';
  console.info(`Bootstapping DB for ${_envRT}`);

  var vendorCategory = await VendorCategory.createEach(
    fixtures.vendorCategories
  ).fetch();
  // console.info(
  //   `Finished populating vendorCategories: ` +
  //     util.inspect(vendorCategory, { depth: 1 }) + // * depth: null for full object print
  //     ``
  // );

  var postalDistricts = await PostalDistrict.createEach(
    fixtures.postalDistricts
  ).fetch();
  console.info(`Finished populating Postal Districts for ${_envRT}`);

  await Vendor.createEach(fixtures.vendors);
  console.info(`Finished populating Vendors for ${_envRT}`);

  await DeliveryPartner.createEach(fixtures.deliveryPartners);
  console.info(`Finished populating Delivery Partners for ${_envRT}`);
  await FulfilmentMethod.createEach(fixtures.fulfilmentMethods);
  console.info(`Finished populating fulfilment methods for ${_envRT}`);
  await OpeningHours.createEach(fixtures.openingHours);
  console.info(`Finished populating opening hours for ${_envRT}`);

  await CategoryGroup.createEach(fixtures.categoryGroups);
  console.info(`Finished populating Category Groups for ${_envRT}`);

  await ProductCategory.createEach(fixtures.productCategories).fetch();
  console.info(`Finished populating ProductCategories for ${_envRT}`);
  await Product.createEach(fixtures.products);
  console.info(`Finished populating Products for ${_envRT}`);
  await ProductOption.createEach(fixtures.productOptions);
  console.info(`Finished populating Product Options for ${_envRT}`);
  await ProductOptionValue.createEach(fixtures.productOptionValues);
  console.info(`Finished populating Product Option Values for ${_envRT}`);
  await Discount.createEach(fixtures.discountCodes);
  console.info(`Finished populating Discounts for ${_envRT}`);

  //TODO: Populate test notifications & refunds ?

  if(test){
    await User.createEach(fixtures.users);
    await Order.createEach(fixtures.orders);
    await OrderItem.createEach(fixtures.orderItems);
    // for(const item of fixtures.orderItems){
    //   console.log(`orderItem.order = ${item.order}`);
    //   await Order.addToCollection(item.order, `items`, [item.id]);
    // }
  } else {
    await User.createEach([
      {
        email: `adam@itsaboutpeepl.co.uk`,
        // password: 'Testing123!',
        phoneNoCountry: 7905532512,
        phoneCountryCode: 44,
        name: `Adam`,
        vendor: 1,
        vendorConfirmed: true,
        isSuperAdmin: true,
        vendorRole: `none`,
        role: `admin`,
        firebaseSessionToken: `DUMMY_FIREBASE_TOKEN`,
      },
    ]);
  }
  console.info(`Finished Bootstapping DB for ${_envRT}!`);
}

module.exports = {
  buildDb,
  fixtures,
};
