/* eslint-disable no-console */
//Pull in Fixtures
const fs = require(`fs`);
const _ = require(`lodash`);

var fixtures = {};

_.each(fs.readdirSync(process.cwd() + `/test/fixtures/`), (file) => {
  if (file.endsWith('js') || file.endsWith('ts')){
    fixtures[file.replace(/\.js$/, ``)] = require(process.cwd() +
      `/test/fixtures/` +
      file)();
    fixtures[file.replace(/\.js$/, ``) + `_fixed`] = _.cloneDeep(fixtures[file.replace(/\.js$/, ``)]);
  }
});

async function buildDb(sails, test) {
  // const util = require(`util`);

  _.extend(sails.hooks.http.app.locals, sails.config.http.locals);


  const _envRT = test ? 'testing' : 'dev server';
  console.info(`Bootstrapping DB for ${_envRT}`);

  // If in migrate: alter, then do NOT create the records as below as we already will have records to seed the DB from memory.
  if (sails.config.models.migrate && sails.config.models.migrate === 'drop'){
    console.info(`Dropping DB for ${_envRT}`);
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

    // await FulfilmentMethod.createEach(fixtures.fulfilmentMethods);

    await Address.createEach(fixtures.addresses).fetch();
    console.info(`Finished populating Addresses for ${_envRT}`);
    const vendors = await Vendor.createEach(fixtures.vendors).fetch();
    console.info(`Finished populating Vendors for ${_envRT}`);

    const deliveryPartners = await DeliveryPartner.createEach(fixtures.deliveryPartners).fetch();
    console.info(`Finished populating Delivery Partners for ${_envRT}`);


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
          createdAt: 1649681733485,
          updatedAt: 1649681733485,
          id: 1,
          email: 'adam@itsaboutpeepl.com',
          name: 'Adam Galloway',
          isSuperAdmin: true,
          role: 'admin',
          vendor: 1,
          vendorRole: `none`,
          vendorConfirmed: true,
          marketingPushContactAllowed: true,
          marketingEmailContactAllowed: true,
          marketingPhoneContactAllowed: true,
          marketingNotificationUtility: 0,
          verified: false,
          walletAddress: '',
          phoneNoCountry: 7917787967,
          phoneCountryCode: 44,
        },
        {
          // password: '$2b$10$GQUEs9aGm2lmFyH3AS5iKugW.M2/9aap9WJFkA9Z.bMpbuUjQC3Om',
          createdAt: 1649681733485,
          updatedAt: 1649681733485,
          id: 2,
          email: 'purplecarrotliverpool@outlook.com',
          name: 'Purple Carrot',
          isSuperAdmin: false,
          role: 'consumer',
          vendor: 17,
          marketingPushContactAllowed: true,
          marketingEmailContactAllowed: true,
          marketingPhoneContactAllowed: true,
          marketingNotificationUtility: 0,
          verified: false,
          walletAddress: '',
          phoneNoCountry: 7905531112,
          phoneCountryCode: 44,
        },
        {
          id: 3,
          email: `joey@vegiapp.co.uk`,
          name: `Joey D`,
          isSuperAdmin: true,
          role: `admin`,
          vendor: 1,
          vendorRole: `none`,
          vendorConfirmed: true,
          phoneNoCountry: 7905532512,
          phoneCountryCode: 44,
          marketingPushContactAllowed: true,
          marketingEmailContactAllowed: true,
          marketingPhoneContactAllowed: true,
          marketingNotificationUtility: 0,
          verified: false,
          walletAddress: '',
        },
      ]).fetch();
    }
    console.info(`Finished Bootstrapping DB for ${_envRT} with ${users.length} users added!`);
  }else if (sails.config.models.migrate) {
    console.info(
      `Finished Bootstrapping (${sails.config.models.migrate}) DB for ${_envRT}!`
    );
  }else{
    console.info(
      `Finished Bootstrapping DB for ${_envRT} - No records created!`
    );
  }
  return fixtures;
}

module.exports = {
  buildDb,
  fixtures,
};
