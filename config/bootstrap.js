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
  var HARD_CODED_DATA_VERSION = 3;

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

  await Product.createEach([{
      name: 'Love Lane Lager',
      description: 'One of the city’s best loved beers, made with Pilsner and Munich malts for a delicate, herbal brew. Love Lane’s brewery, about 100 metres from here, on the site of an old rubber factory, can produce over 3 million pints of this gorgeous amber nectar at a time.',
      fullPrice: 5.00,
      reducedPrice: 4.60
  }, {
      name: 'Pomegranate Gin Fizz',
      description: 'This combination of pomegranate with Persian rose petals and Turkish apple creates a particularly aromatic and refreshing gin. Mix that with some sweetness, some lime, and some club soda – delicious!',
      fullPrice: 7.50,
      reducedPrice: 6.80
  }, {
      name: 'Gin & Tonic',
      description: 'Choose from traditional dry gin, sophisticated pomegranate, or moody coffee & vanilla – all distilled around 80 metres away in the Love Lane Brewery and bottled by hand.',
      fullPrice: 5.00,
      reducedPrice: 4.50
  }, {
      name: 'Dark & Stormzy',
      description: 'AKA dark rum and coke, with a splash of fresh lime. The fine rum at the heart of this drink is made by the Big Bog Brewing company, a real living wage employer based in Speke.',
      fullPrice: 4.50,
      reducedPrice: 4.10
  }, {
      name: 'Oolong Tea',
      description: 'A Chinese speciality oolong tea, grown in the Fujian province. Calming, tasty and quite refreshing after, or before, a drink or two – it is a Monday after all.',
      fullPrice: 3.00,
      reducedPrice: 2.70
  }, {
      name: 'Elderflower Collins',
      description: 'Refreshingly zingy. Love Lane dry gin, lemon, sugar and elderflower cordial. Not much history to this drink other than it came from a Google search and the BBC Good Food guide.',
      fullPrice: 7.50,
      reducedPrice: 6.80
  }, {
      name: 'Mineral Water',
      description: 'All the classics.',
      fullPrice: 2.00,
      reducedPrice: 1.80
  }, {
      name: 'Proper Scouse Tap Water',
      description: 'Liverpool’s finest, which it turns out actually comes from Lake Vymwy, in the Welsh hills. We thought it was the Mersey at first, but looking at the Mersey lately, we’re quite glad it’s not.',
      fullPrice: 0.00,
      reducedPrice: 0.00
  }]);

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
