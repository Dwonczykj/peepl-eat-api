/**
 * `tasks/register/syncAssets.js`
 *
 * ---------------------------------------------------------------
 *
 * For more information see:
 *   https://sailsjs.com/anatomy/tasks/register/sync-assets.js
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('syncAssets', [
    'babel:dev',
    'browserify:dev',
    // 'browserify:devTest',
    'less:dev',
    'sass:dev',
    'sync:dev',
  ]);
};
