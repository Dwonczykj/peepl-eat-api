/**
 * `tasks/config/copy`
 *
 * ---------------------------------------------------------------
 *
 * Copy files and/or folders.
 *
 * For more information, see:
 *   https://sailsjs.com/anatomy/tasks/config/copy.js
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

  grunt.config.set('copy', {
    dev: {
      files: [
        {
          expand: true,
          cwd: './assets/dependencies',
          src: ['**/*.!(coffee|less|scss|sass)'],
          dest: '.tmp/public/dependencies'
        },
        {
          expand: true,
          cwd: './assets/images',
          src: ['**/*.!(coffee|less|scss|sass)'],
          dest: '.tmp/public/images'
        },
      ]
    },
    devbabel: {
      files: [{
        expand: true,
        cwd: './assets/js',
        src: ['**/*.!(coffee|less|scss|sass|page.js|page.ts|page.js.map|js|js.map|ts)'],
        dest: '.tmp/public/js'
      }]
    },
    build: {
      files: [{
        expand: true,
        cwd: '.tmp/public',
        src: ['**/*'],
        dest: 'www'
      }]
    },
    beforeLinkBuildProd: {
      files: [{
        expand: true,
        cwd: '.tmp/public/hash',
        src: ['**/*'],
        dest: '.tmp/public/dist'
      }]
    },
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // This Grunt plugin is part of the default asset pipeline in Sails,
  // so it's already been automatically loaded for you at this point.
  //
  // Of course, you can always remove this Grunt plugin altogether by
  // deleting this file.  But check this out: you can also use your
  // _own_ custom version of this Grunt plugin.
  //
  // Here's how:
  //
  // 1. Install it as a local dependency of your Sails app:
  //    ```
  //    $ npm install grunt-contrib-copy --save-dev --save-exact
  //    ```
  //
  //
  // 2. Then uncomment the following code:
  //
  // ```
  // // Load Grunt plugin from the node_modules/ folder.
  // grunt.loadNpmTasks('grunt-contrib-copy');
  // ```
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

};
