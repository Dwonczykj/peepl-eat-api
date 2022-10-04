/* eslint-disable no-console */
var sails = require('sails');
const dotenv = require('dotenv');//.load('./env'); // alias of .config()
// const envConfig = dotenv.load().parsed;
const envConfig = dotenv.config('./env').parsed;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    return callback(array[index], index, array);
  }
}

async function createUsers() {
    await User.createEach([
      {
        email: "service.account@example.com",
        phoneNoCountry: 9995557777,
        phoneCountryCode: 1,
        name: "SERVICE 1",
        isSuperAdmin: false,
        role: "courier",
        courierRole: "deliveryManager",
        firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
      },
    ]);
    console.log("service.account@example.com Service Account User created");
    await User.create({
      email: "test.service@example.com",
      phoneNoCountry: 9993137777,
      phoneCountryCode: 44,
      name: "TEST_SERVICE",
      isSuperAdmin: true,
      role: "admin",
      firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
      secret: envConfig["test_secret"],
    });
    console.log("test.service@example.com Test Account User created");

<<<<<<< HEAD
    await User.create({
      email: "joey@vegiapp.co.uk",
      // password: 'Testing123!',
      phoneNoCountry: 7905532512,
      phoneCountryCode: 44,
      name: "Joey Dwonczyk",
      vendor: 1,
      vendorConfirmed: true,
      isSuperAdmin: true,
      vendorRole: "none",
      role: "admin",
      firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
    });
}
=======
  // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
  this.timeout(16000);
>>>>>>> upstream/main

async function populateDbData() {
    var vendorCategory = await VendorCategory.create({
      name: "Cafes",
    }).fetch();

    const createPostalDistricts = [
      {
        outcode: "L1",
      },
      {
        outcode: "L2",
      },
      {
        outcode: "L3",
      },
    ];
    // asyncForEach(createPostalDistricts, async (pd, ind, arr) => {
    //     var existingPd = await PostalDistrict.findOne(pd);
    //     if (existingPd) {
    //         PostalDistrict.removeFromCollection(pd);
    //     }
    // });
    // var postalDistricts = createPostalDistricts.map((pd) => PostalDistrict.create(pd).fetch());
    var postalDistricts = await PostalDistrict.createEach(
      createPostalDistricts
    ).fetch();

    var deliveryPartner = await DeliveryPartner.create({
      name: "Agile",
      email: "agile@example.com",
      phoneNumber: "0123456789",
      status: "active",
    }).fetch();

    var delifonseca = await Vendor.create({
      name: "Delifonseca",
      type: "restaurant",
      description:
        "Life's too short to have a bad meal. Delifonseca is here to help you enjoy the finer tastes in life.",
      walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
      imageUrl:
        "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
      status: "active",
      phoneNumber: "+447495995614",
      vendorCategories: [vendorCategory.id],
      productCategories: [],
      products: [],
      fulfilmentPostalDistricts: [
        postalDistricts[0].id,
        postalDistricts[1].id,
        postalDistricts[2].id,
      ],
      deliveryPartner: deliveryPartner.id,
    }).fetch();

    await CategoryGroup.createEach([
      {
        name: "Sweets",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Snacks",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Drinks",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Alcohol",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Fruit & Veg",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Protein",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Dairy substitutes",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Bakery",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Cupboard",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Pharmacy",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Ready Meals",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Pantry",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Personal Care",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Baby",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Pet",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "World Cuisine",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Frozen",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
      {
        name: "Curry",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: true,
      },
      {
        name: "Italian",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: true,
      },
      {
        name: "Greek",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: true,
      },
      {
        name: "French",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: true,
      },
      {
        name: "Cafe",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: true,
      },
      {
        name: "Coffee",
        imageUrl:
          "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
        forRestaurantItem: false,
      },
    ]);

    var readyMealCatGroup = await CategoryGroup.findOne({
      name: "Ready Meals",
    });
    var coffeeCatGroup = await CategoryGroup.findOne({
      name: "Coffee",
    });

    var lunchProductCategoryForDelifonsecaVendor = await ProductCategory.create(
      {
        name: "Lunch",
        vendor: delifonseca.id,
        categoryGroup: readyMealCatGroup.id,
      }
    ).fetch();
    var coffeeProductCategoryForDelifonsecaVendor =
      await ProductCategory.create({
        name: "Coffee",
        vendor: delifonseca.id,
        categoryGroup: coffeeCatGroup.id,
      }).fetch();
    var dinnerProductCategoryForDelifonsecaVendor =
      await ProductCategory.create({
        name: "Dinner",
        vendor: delifonseca.id,
        categoryGroup: readyMealCatGroup.id,
      }).fetch();

    await Vendor.addToCollection(delifonseca.id, "productCategories", [
      lunchProductCategoryForDelifonsecaVendor.id,
      coffeeProductCategoryForDelifonsecaVendor.id,
      dinnerProductCategoryForDelifonsecaVendor.id,
    ]);

    var burnsNight = await Product.create({
      name: "Burns Night - Dine @ Home (For 1)",
      description:
        "Unfortunately, this year the 25th falls on a Monday. You won’t be able to join us, so we've made our Dine@home Burns inspired instead.",
      basePrice: 2200,
      isAvailable: true,
      vendor: delifonseca.id,
      categoryGroup: readyMealCatGroup.id,
      imageUrl:
        "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
      category: lunchProductCategoryForDelifonsecaVendor.id,
    }).fetch();

    var starterOption = await ProductOption.create({
      name: "Starter",
      product: burnsNight.id,
    }).fetch();

    await ProductOptionValue.createEach([
      {
        name: "Traditional Cullen Skink – smoked haddock, potato and leek soup (GF)",
        priceModifier: 0,
        isAvailable: true,
        option: starterOption.id,
      },
      {
        name: "Rabbit ‘cock-a-leekie’ terrine. A chicken, rabbit and leek terrine served with whisky jelly and oatcakes",
        priceModifier: 0,
        isAvailable: true,
        option: starterOption.id,
      },
      {
        name: "Classic traditional haggis, neeps and tatties",
        priceModifier: 0,
        isAvailable: true,
        option: starterOption.id,
      },
      {
        name: "Martin’s classic vegetarian haggis, neeps and tatties (V)",
        priceModifier: 0,
        isAvailable: true,
        option: starterOption.id,
      },
    ]);

    var mainOption = await ProductOption.create({
      name: "Main",
      product: burnsNight.id,
    }).fetch();

    await ProductOptionValue.createEach([
      {
        name: "Venison, beef and beer stew, whiskey dumplings and creamy mash",
        priceModifier: 0,
        isAvailable: true,
        option: mainOption.id,
      },
      {
        name: "Darne of Scottish salmon, kale, creamy mash and Loch Spelve mussel sauce (GF)",
        priceModifier: 0,
        isAvailable: true,
        option: mainOption.id,
      },
      {
        name: "Lanarkshire blue portobello mushroom top hat with rumbledethump croquettes and pearl onion pickle (V)",
        priceModifier: 0,
        isAvailable: true,
        option: mainOption.id,
      },
      {
        name: "Classic traditional haggis, neeps and tatties",
        priceModifier: 0,
        isAvailable: true,
        option: mainOption.id,
      },
      {
        name: "Martin’s classic vegetarian haggis, neeps and tatties (V)",
        priceModifier: 0,
        isAvailable: true,
        option: mainOption.id,
      },
    ]);

    var dessertOption = await ProductOption.create({
      name: "Dessert",
      product: burnsNight.id,
    }).fetch();

    await ProductOptionValue.createEach([
      {
        name: "Traditional Cranachan (V)",
        priceModifier: 0,
        isAvailable: true,
        option: dessertOption.id,
      },
      {
        name: "Bitter chocolate tart with Drambuie fudge  (V/GF)",
        priceModifier: 0,
        isAvailable: true,
        option: dessertOption.id,
      },
      {
        name: "Ecclefechan Border Tart (V)",
        priceModifier: 0,
        isAvailable: true,
        option: dessertOption.id,
      },
    ]);

    await Discount.create({
      code: "DELI10",
      percentage: 10,
      isEnabled: true,
    });

    sails.log.info("Product Categories added to delifonseca");
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
      console.log('Creating test users');
      try {
        await createUsers();
      } catch (dbErr) {
        console.warn('test db creation error in lifecycle hooks: ' + dbErr);
        return done(dbErr);
      }

      try {
        await populateDbData();
      } catch (dbErr) {
        console.warn('test db creation error in lifecycle hooks: ' + dbErr);
        return done(dbErr);
      }

      try {

        console.log('Login with Test Account');

        const request = require('supertest');

        // request(sails.hooks.http.app)
        //     .get('/csrfToken')
        //     .set('Accept', 'application/json')
        //     .then(response => {
        //         console.log(response.body);
        //         this._csrf = response.body._csrf;
        //         console.log('Sails lifted!');
        //         return;
        //     })
        //     .catch(err => err);

        request(sails.hooks.http.app)
                  .post("/api/v1/admin/login-with-secret")
                  .send({
                    name: "TEST_SERVICE",
                    secret: envConfig["test_secret"],
                  })
                  .then((errs, response, body) => {
                    return response;
                  });
      } catch (loginErr) {
        console.warn('Lifecycle.test failed to login with test service account: ' + loginErr);
        return loginErr;
      }


      var request = require('supertest');

      request(sails.hooks.http.app)
        .get('/csrfToken')
        .set('Accept', 'application/json')
        .then(response => {
            console.log(response.body);
            this._csrf = response.body._csrf;
            console.log('Sails lifted!');
        })
        .catch(err => done(err));
        return done();
    });
  } catch (err) {
    return done(err);
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