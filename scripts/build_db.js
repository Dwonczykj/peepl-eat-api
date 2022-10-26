/* eslint-disable no-console */
//Pull in Fixtures
const fs = require(`fs`);
const _ = require(`lodash`);

var fixtures = {};

_.each(fs.readdirSync(process.cwd() + `/test/fixtures/`), (file) => {
  fixtures[file.replace(/\.js$/, ``)] = require(process.cwd() +
    `/test/fixtures/` +
    file)();
  fixtures[file.replace(/\.js$/, ``) + `_fixed`] = _.cloneDeep(fixtures[file.replace(/\.js$/, ``)]);
});

async function buildDb(sails, test) {
  // const util = require(`util`);

  _.extend(sails.hooks.http.app.locals, sails.config.http.locals);


  const _envRT = test ? 'testing' : 'dev server';
  console.info(`Bootstrapping DB for ${_envRT}`);

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

  const vendors = await Vendor.createEach(fixtures.vendors).fetch();
  console.info(`Finished populating Vendors for ${_envRT}`);

  const deliveryPartners = await DeliveryPartner.createEach(fixtures.deliveryPartners).fetch();
  console.info(`Finished populating Delivery Partners for ${_envRT}`);

  // await FulfilmentMethod.createEach(fixtures.fulfilmentMethods);

  const fms1 = await FulfilmentMethod.find({
    'or': [
      {
        vendor: vendors.map(v => v.id)
      },
      {
        deliveryPartner: deliveryPartners.map(v => v.id)
      },
    ]
  });

  fixtures.fulfilmentMethods = fms1;
  console.info(`Finished populating fulfilment methods for ${_envRT}`);

  await OpeningHours.update({
    fulfilmentMethod: fms1.map(fm => fm.id)
  }).set({
    isOpen: true
  });

  await OpeningHours.update({
    or: fixtures.openingHours.map((oh) => ({
      dayOfWeek: oh.dayOfWeek,
      fulfilmentMethod: oh.fulfilmentMethod,
    })),
  }).set({
    isOpen: true,
    openTime: "09:00",
    closeTime: "17:00",
  });

  const openingHours = await OpeningHours.find({
    fulfilmentMethod: fms1.map((fm) => fm.id),
  });
  fixtures.openingHours = openingHours;

  // const fms = await FulfilmentMethod.find({
  //   deliveryPartner: 1
  // }).populate('deliveryPartner');
  // const debugAgileOpeningHours = await OpeningHours.find({
  //   fulfilmentMethod: fms.filter(fm => fm.deliveryPartner.id === 1).map(fm => fm.id)
  // });
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
  let users = [];
  if(test){
    users = await User.createEach(fixtures.users).fetch();
    await Order.createEach(fixtures.orders);
    await OrderItem.createEach(fixtures.orderItems);
    // for(const item of fixtures.orderItems){
    //   console.log(`orderItem.order = ${item.order}`);
    //   await Order.addToCollection(item.order, `items`, [item.id]);
    // }
  } else {
    users = await User.createEach([
      {
        email: `adam@itsaboutpeepl.com`,
        phoneNoCountry: 7917787967,
        phoneCountryCode: 44,
        name: `Adam`,
        vendor: 1,
        vendorConfirmed: true,
        isSuperAdmin: true,
        vendorRole: `none`,
        role: `admin`,
        firebaseSessionToken: `DUMMY_FIREBASE_TOKEN`,
      },
      {
        email: `joey@vegiapp.co.uk`,
        phoneNoCountry: 7905532512,
        phoneCountryCode: 44,
        name: `Joey D`,
        vendor: 1,
        vendorConfirmed: true,
        isSuperAdmin: true,
        vendorRole: `none`,
        role: `admin`,
        firebaseSessionToken: `DUMMY_FIREBASE_TOKEN`,
      },
    ]).fetch();
  }
  console.info(`Finished Bootstapping DB for ${_envRT} with ${users.length} users added!`);
  return fixtures;
}

module.exports = {
  buildDb,
  fixtures,
};
