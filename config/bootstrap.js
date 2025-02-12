/* eslint-disable prefer-arrow-callback */
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

const { buildDb } = require('../scripts/build_db');

module.exports.bootstrap = async function () {
  _.extend(sails.hooks.http.app.locals, sails.config.http.locals);

  var Promise = require('bluebird');

  Object.keys(sails.models).forEach(function (key) {
    if (sails.models[key].query) {
      sails.models[key].query = Promise.promisify(sails.models[key].query);
    }
  });


  // const { initFirebase } = require(`${process.cwd()}/config/firebase`);
  // initFirebase(sails);

  // Import dependencies
  var path = require('path');

  // This bootstrap version indicates what version of fake data we're dealing with here.
  var HARD_CODED_DATA_VERSION = 5;

  // This path indicates where to store/look for the JSON file that tracks the "last run bootstrap info"
  // locally on this development computer (if we happen to be on a development computer).
  var bootstrapLastRunInfoPath = path.resolve(
    sails.config.appPath,
    '.tmp/bootstrap-version.json'
  );
  // Compare bootstrap version from code base to the version that was last run
  var lastRunBootstrapInfo = await sails.helpers.fs
    .readJson(bootstrapLastRunInfoPath)
    .tolerate('doesNotExist'); // (it's ok if the file doesn't exist yet-- just keep going.)

  if (
    lastRunBootstrapInfo &&
    lastRunBootstrapInfo.lastRunVersion === HARD_CODED_DATA_VERSION
  ) {
    sails.log.info(
      'Skipping v' +
        HARD_CODED_DATA_VERSION +
        " bootstrap script...  (because it's already been run)"
    );
    sails.log.info(
      '(last run on this computer: @ ' +
        new Date(lastRunBootstrapInfo.lastRunAt) +
        ')'
    );
    return;
  } //•

  try {
    var isMochaTestEnv =
      sails.config.environment === 'test' ||
      process.env.NODE_ENV === 'test';
    if (!isMochaTestEnv) {
      fixtures = await buildDb(sails, false);
    }
  } catch (error) {
    sails.log.warn(
      'Bootstrapping db failed. Delete the db and start again... Error -> ' +
        error
    );
  }
  await sails.helpers.fs.writeJson
    .with({
      destination: bootstrapLastRunInfoPath,
      json: {
        lastRunVersion: HARD_CODED_DATA_VERSION,
        lastRunAt: Date.now(),
      },
      force: true,
    })
    .tolerate((err) => {
      sails.log.warn(
        'For some reason, could not write bootstrap version .json file.  This could be a result of a problem with your configured paths, or, if you are in production, a limitation of your hosting provider related to `pwd`.  As a workaround, try updating app.js to explicitly pass in `appPath: __dirname` instead of relying on `chdir`.  Current sails.config.appPath: `' +
          sails.config.appPath +
          '`.  Full error details: ' +
          err.stack +
          '\n\n(Proceeding anyway this time...)'
      );
    });
};
