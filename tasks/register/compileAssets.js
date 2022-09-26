/**
 * `tasks/register/compileAssets.js`
 *
 * ---------------------------------------------------------------
 *
 * For more information see:
 *   https://sailsjs.com/anatomy/tasks/register/compile-assets.js
 *
 */
module.exports = function(grunt) {
  var compileAssets = [
    'clean:dev',
    'babel:dev',
    'browserify:dev',
    // 'browserify:devTest',
    'less:dev',
    'sass:dev',
    'copy:dev',
    'copy:devbabel',
    // 'copy:devbabelTest',
  ];
  grunt.log.writeln(['running compileAssets: ' + compileAssets.join(', ')]);
  grunt.registerTask('compileAssets', compileAssets);
};
