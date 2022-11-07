module.exports = function (grunt) {

  grunt.config.set('browserify', {
    // dist: {
    //   files: [
    //     {
    //       expand: true,
    //       cwd: '.tmp/public',
    //       src: ['**/*.page.js', '!dependencies/**/*.js'],
    //       dest: '.tmp/public/js/',
    //     },
    //   ],
    // },
    dist: {
      files: [
        {
          expand: true,
          cwd: '.assets_babel/js/',
          src: ['**/*.page.js', '!dependencies/**/*.js'],
          dest: '.tmp/public/js/',
          // ext: '.page.js'
        },
      ],
      options: {
        // browserifyOptions: { debug: false }, // ~ https://stackoverflow.com/a/36098565
        // transform: [[
        //     'babelify', {
        //         presets: [['@babel/preset-env', { modules: 'auto' }]],
        //         sourceMaps: true,
        //         ignore: ['node_modules']
        //     }
        // ]],
        plugin: [
          [
            require('esmify'),
            {
              /* ... options ... */
            },
          ],
          //   ['factor-bundle', {
          //     outputs: [
          //       './dist/js/main-home.js',
          //       './dist/js/main-products.js'
          //     ]
          //   }]
        ],
      },
    },
    dev: {
      files: [
        {
          expand: true,
          cwd: '.assets_babel/js/',
          src: ['**/*.page.js', '!dependencies/**/*.js'],
          dest: '.tmp/public/js/',
          // ext: '.page.js'
        },
      ],
      options: {
        browserifyOptions: { debug: true },
        transform: [
          [
            //     'babelify', {
            //         presets: [['@babel/preset-env', { modules: 'auto' }]],
            //         sourceMaps: true,
            //         ignore: ['node_modules']
            //     }
            'browserify-css', {
              global: true,
              // autoInject: true,
              // minify: true,
              // rootDir: '.',
            },
          ],
        ],
        plugin: [
          [
            require('esmify'),
            {
              /* ... options ... */
            },
          ],
          //   ['factor-bundle', {
          //     outputs: [
          //       './dist/js/main-home.js',
          //       './dist/js/main-products.js'
          //     ]
          //   }]
        ],
      },
    },
    devTest: {
      files: [
        {
          expand: true,
          cwd: 'test_babel_grunt_lib',
          src: ['**/*.page.js', '!dependencies/**/*.js'],
          dest: 'test_browserify_grunt_lib',
          ext: '.page.js',
        },
      ],
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
};
