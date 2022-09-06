module.exports = function (grunt) {

  // grunt.initConfig({
  //     browserify: {
  //         dev: {
  //             src: [
  //                 '**/*.page.js', '!dependencies/**/*.js',
  //             ],
  //             dest: '.tmp/public/js/',
  //             options: {
  //                 browserifyOptions: { debug: true },
  //                 transform: [["babelify", { "presets": ['@babel/preset-env'] }]],
  //                 // plugin: [
  //                 //     ["factor-bundle", {
  //                 //         outputs: [
  //                 //             "./dist/js/main-home.js",
  //                 //             "./dist/js/main-products.js"
  //                 //         ]
  //                 //     }]
  //                 // ]
  //             }
  //         }
  //     }
  // });
  // grunt.loadNpmTasks('grunt-browserify');

  grunt.config.set('browserify', {
    dev: {
      files: [
        {
          expand: true,
          cwd: '.assets_babel/js/',
          src: ['**/*.page.js', '!dependencies/**/*.js'],
          dest: '.tmp/public/js/',
          // ext: '.page.js'
        }
      ],
      options: {
        browserifyOptions: { debug: true },
        // transform: [[
        //     'babelify', {
        //         presets: [['@babel/preset-env', { modules: 'auto' }]],
        //         sourceMaps: true,
        //         ignore: ['node_modules']
        //     }
        // ]],
        plugin: [
          [require('esmify'), { /* ... options ... */ }],
          //   ['factor-bundle', {
          //     outputs: [
          //       './dist/js/main-home.js',
          //       './dist/js/main-products.js'
          //     ]
          //   }]
        ]
      }
    },
    // dev: {
    //   files: [
    //     {
    //       expand: true,
    //       cwd: 'test_babel_grunt_lib',
    //       src: ['**/*.page.js', '!dependencies/**/*.js'],
    //       dest: '.tmp/public/js/',
    //       ext: '.page.js'
    //     }
    //   ],
    //   options: {
    //     browserifyOptions: { debug: true },
    //     transform: [['babelify', { 'presets': ['preset-env'] }]],
    //     // plugin: [
    //     //   ['factor-bundle', {
    //     //     outputs: [
    //     //       './dist/js/main-home.js',
    //     //       './dist/js/main-products.js'
    //     //     ]
    //     //   }]
    //     // ]
    //   }
    // },
    devTest: {
      files: [
        {
          expand: true,
          cwd: 'test_babel_grunt_lib',
          src: ['**/*.page.js', '!dependencies/**/*.js'],
          dest: 'test_browserify_grunt_lib',
          ext: '.page.js'
        }
      ]
    },
    dist: {
      files: [
        {
          expand: true,
          cwd: '.tmp/public',
          src: ['js/**/*.js'],
          dest: '.tmp/public'
        }
      ]
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
};
