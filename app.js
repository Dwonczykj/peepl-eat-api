/* eslint-disable no-console */
/**
 * app.js
 *
 * Use `app.js` to run your app without `sails lift`.
 * To start the server, run: `node app.js`.
 *
 * This is handy in situations where the sails CLI is not relevant or useful,
 * such as when you deploy to a server, or a PaaS like Heroku.
 *
 * For example:
 *   => `node app.js`
 *   => `npm start`
 *   => `forever start app.js`
 *   => `node debug app.js`
 *
 * The same command-line arguments and env vars are supported, e.g.:
 * `NODE_ENV=production node app.js --port=80 --verbose`
 *
 * For more information see:
 *   https://sailsjs.com/anatomy/app.js
 */

console.log('Running app after small delay');

// console.log(v8.getHeapStatistics().heap_size_limit / (1024 * 1024));

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

sleep(1*1000);

require('ts-node/register');

console.log(`Registered TS-Node`);
// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
// > Note: This is not required in order to lift, but it is a convenient default.
process.chdir(__dirname);


// Attempt to import `sails` dependency, as well as `rc` (for loading `.sailsrc` files).
var sails;
var rc;
try {
  sails = require('sails');
  console.log(`sails succesfully required`);
  rc = require('sails/accessible/rc');
} catch (err) {
  console.error('Encountered an error when attempting to require(\'sails\'):');
  console.error(err.stack);
  console.error('--');
  console.error('To run an app using `node app.js`, you need to have Sails installed');
  console.error('locally (`./node_modules/sails`).  To do that, just make sure you\'re');
  console.error('in the same directory as your app and run `npm install`.');
  console.error();
  console.error('If Sails is installed globally (i.e. `npm install -g sails`) you can');
  console.error('also run this app with `sails lift`.  Running with `sails lift` will');
  console.error('not run this file (`app.js`), but it will do exactly the same thing.');
  console.error('(It even uses your app directory\'s local Sails install, if possible.)');
  return;
}//-•

// Start server
try {
  console.log(`Lift the sails app`);
  console.log(process.memoryUsage());
  sails.lift(rc('sails'));
  console.log(`Successfully lifted the sails app`);
} catch (error) {
  if (`${error.message}`.includes('ECONNREFUSED 127.0.0.1:6379')) {
    console.error('Error connecting to redis service, Please check that redis is running on localhost:6379');
  }
  throw error;
}
