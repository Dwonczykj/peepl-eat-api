/**
 * `tasks/register/prod.js`
 *
 * ---------------------------------------------------------------
 *
 * This Grunt tasklist will be executed instead of `default` when
 * your Sails app is lifted in a production environment (e.g. using
 * `NODE_ENV=production node app`).
 *
 * For more information see:
 *   https://sailsjs.com/anatomy/tasks/register/prod.js
 *
 */
var path = require('path');
// eslint-disable-next-line no-console
console.log(
  `register-"${path.basename(__filename)}" task with NODE_ENV="${
    process.env.NODE_ENV
  }"`
);
module.exports = function(grunt) {
  grunt.registerTask('prod', [
    'polyfill:prod', //« Remove this to skip transpilation in production (not recommended)
    'compileAssetsProd',
    'concat',
    'uglify',
    'cssmin',
    'hash',
    'sails-linker:prodJs',
    'sails-linker:prodStyles',
  ]);
};

