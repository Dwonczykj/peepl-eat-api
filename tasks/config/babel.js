/**
 * `tasks/config/babel`
 *
 * ---------------------------------------------------------------
 *
 * Transpile >=ES6 code for broader browser compatibility.
 *
 * For more information, see:
 *   https://sailsjs.com/anatomy/tasks/config/babel.js
 *
 */
module.exports = function(grunt) {

  grunt.config.set('babel', {
    // dist: {
    //   options: {
    //     // presets: [require('sails-hook-grunt/accessible/babel-preset-env')], // only need this preset as already transpiled for dev
    //     presets: ['@babel/preset-env'],
    //     compact: false,
    //     plugins: [
    //       '@babel/plugin-proposal-object-rest-spread',
    //       '@babel/plugin-transform-classes',
    //     ],
    //   },
    //   files: [
    //     {
    //       expand: true,
    //       cwd: '.tmp/public',
    //       src: ['**/*.page.js', '!dependencies/**/*.js'],
    //       dest: '.tmp/public',
    //       ext: '.page.js',
    //     },
    //     {
    //       expand: true,
    //       cwd: '.tmp/public',
    //       src: ['**/*.component.js', '!dependencies/**/*.js'],
    //       dest: '.tmp/public',
    //       ext: '.component.js',
    //     },
    //   ],
    // },
    dist: {
      // * should for now do the same as dev
      options: {
        presets: [
          '@babel/preset-env',
          'minify'
        ],
        // presets: [require('sails-hook-grunt/accessible/babel-preset-env')] // ! Do not use for now
      },
      files: [
        {
          expand: true,
          cwd: 'assets/js/',
          src: ['**/*.page.js', '!dependencies/**/*.js'],
          dest: '.tmp/public/js/',
          // dest: '.tmp/public/js/',
          ext: '.page.min.js',
        },
        {
          expand: true,
          cwd: 'assets/js/',
          src: ['**/*.component.js', '!dependencies/**/*.js'],
          dest: '.tmp/public/js/',
          // dest: '.tmp/public/js/',
          ext: '.component.min.js',
        },
      ],
    },
    dev: {
      options: {
        presets: ['@babel/preset-env'],
        // presets: [require('sails-hook-grunt/accessible/babel-preset-env')]
      },
      files: [
        // {
        //   expand: true,
        //   cwd: 'api/',
        //   src: ['**/*.modjs'],
        //   dest: '.',
        //   // dest: '.tmp/public/js/',
        //   ext: '.js'
        // },
        {
          expand: true,
          cwd: 'assets/js/',
          src: ['**/*.page.js', '!dependencies/**/*.js'],
          dest: '.assets_babel/js/',
          // dest: '.tmp/public/js/',
          ext: '.page.js',
        },
        {
          expand: true,
          cwd: 'assets/js/',
          src: ['**/*.component.js', '!dependencies/**/*.js'],
          dest: '.assets_babel/js/',
          // dest: '.tmp/public/js/',
          ext: '.component.js',
        },
      ],
    },
  });

  grunt.loadNpmTasks('grunt-babel');
};
