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
    'clean:dist',
    'runTsc',
    // 'babel:dist',
    'babel:dev',
    // 'browserify:dist',
    'browserify:dev',
    // 'browserify:devTest',
    'less:dev',
    'sass:dev',
    'copy:dev',
    'copy:devbabel',
    // 'copy:devbabelTest',
  ];
  grunt.log.writeln(['running compileAssetsProd: ' + compileAssets.join(', ')]);
  grunt.registerTask('compileAssetsProd', compileAssets);
};
