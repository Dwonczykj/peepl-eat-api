/**
 * `tasks/register/runTsc.js`
 *
 *
 */
var path = require('path');
module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-ts');
  grunt.registerTask('runTsc', ['ts']);
  // grunt.registerTask('runTsc', function () {
  //   var done = this.async();
  //   // Specify tasks to run spawned
  //   // var tasks = Array.prototype.slice.call(arguments, 0);
  //   var execCmd = path.join(path.dirname(process.execPath), 'npm') + ' run tsc';
  //   grunt.log.writeln(execCmd);
  //   grunt.util.spawn({
  //     // Use the existing node path
  //     cmd: execCmd,
  //     // Add the flags and use process.argv[1] to get path to grunt bin
  //     // args: ['--debug', '--harmony', process.argv[1]].concat(tasks),
  //     // Print everything this process is doing to the parent stdio
  //     opts: { stdio: 'inherit' }
  //   }, done);
  // });
};
