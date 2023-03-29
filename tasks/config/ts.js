module.exports = function (grunt) {

  grunt.config.set('ts', {
    default: {
      src: ['assets/js/**/*.ts', '!node_modules/**'],
      tsconfig:
        process.env.NODE_ENV === 'production'
          ? './assets/js/tsconfig.production.json'
          : './assets/js/tsconfig.json',
    },
    // default: {
    //   src: ['assets/js/**/*.ts', '!node_modules/**'],
    //   // src: ['.tmp/public/min/*.js', '!node_modules/**'],
    //   noImplicitAny: false,
    //   moduleResolution: 'node',
    //   target: 'es5',                 // target javascript language. [es3 | es5 (grunt-ts default) | es6]
    //   module: 'es6',
    //   sourceMap: true,               // set to true to output .map.js sourcemaps too.
    //   lib: [
    //     'dom',
    //     'es6'
    //   ],
    //   // module: 'commonjs',                 // target javascript module style. [amd (default) | commonjs]
    // },
    // use to override the default options, See: http://gruntjs.com/configuring-tasks#options
    // these are the default options to the typescript compiler for grunt-ts:
    // see `tsc --help` for a list of supported options.
    // options: {
    //   compile: true,                 // perform compilation. [true (default) | false]
    //   comments: false,               // same as !removeComments. [true | false (default)]
    //   target: 'es5',                 // target javascript language. [es3 | es5 (grunt-ts default) | es6]
    //   module: 'es6',
    //   lib: [
    //     'dom',
    //     'es6'
    //   ],
    //   // module: 'commonjs',                 // target javascript module style. [amd (default) | commonjs]
    //   sourceMap: false,               // generate a source map for every output js file. [true (default) | false]
    //   sourceRoot: '',                // where to locate TypeScript files. [(default) '' == source ts location]
    //   mapRoot: '',                   // where to locate .map.js files. [(default) '' == generated js location.]
    //   declaration: false,            // generate a declaration .d.ts file for every output js file. [true | false (default)]
    //   htmlModuleTemplate: 'My.Module.<%= filename %>',    // Template for module name for generated ts from html files [(default) '<%= filename %>']
    //   htmlVarTemplate: '<%= ext %>',                      // Template for variable name used in generated ts from html files [(default) '<%= ext %>]
    //   // Both html templates accept the ext and filename parameters.
    //   noImplicitAny: false,          // set to true to pass --noImplicitAny to the compiler. [true | false (default)]
    //   fast: 'watch'                  // see https://github.com/TypeStrong/grunt-ts/blob/master/docs/fast.md ["watch" (default) | "always" | "never"]
    //   /* ,compiler: './node_modules/grunt-ts/customcompiler/tsc'  */ //will use the specified compiler.
    // },
    // a particular target
    // dev: { //* used if we register the grunt task 'ts:dev' instead of 'ts' in the array here: grunt.registerTask('runTsc', ['ts']);
    //   src: ['assets/js/**/*.ts', '!node_modules/**'],          // The source typescript files, http://gruntjs.com/configuring-tasks#files
    //   // html: ['app/**/**.tpl.html'],  // The source html files, https://github.com/basarat/grunt-ts#html-2-typescript-support
    //   // reference: 'app/reference.ts', // If specified, generate this file that you can use for your reference management
    //   // out: 'app/out.js',             // If specified, generate an out.js file which is the merged js file
    //   watch: 'app',                  // If specified, watches this directory for changes, and re-runs the current target
    //   // // use to override the grunt-ts project options above for this target
    //   options: {
    //     // module: 'commonjs',
    //     sourceMap: true,               // generate a source map for every output js file. [true (default) | false]
    //     sourceRoot: '',                // where to locate TypeScript files. [(default) '' == source ts location]
    //     mapRoot: '',                   // where to locate .map.js files. [(default) '' == generated js location.]
    //     declaration: false,            // generate a declaration .d.ts file for every output js file. [true | false (default)]
    //   }
    // }
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
  //    $ npm install grunt-babel --save-dev --save-exact
  //    ```
  //
  //
  // 2. Then uncomment the following code:
  //
  // ```
  // // Load Grunt plugin from the node_modules/ folder.
  // grunt.loadNpmTasks('grunt-babel');
  // ```
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

};
