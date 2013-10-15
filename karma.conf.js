// Karma configuration
// Generated on Tue Oct 15 2013 13:05:19 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['browserify', 'mocha', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      'bower_components/zepto/zepto.js',
      'bower_components/lodash/dist/lodash.js',
      'bower_components/backbone/backbone.js',
      'bower_components/leaflet-dist/leaflet-src.js',
      'js/main.js',
      'test/**/*Spec.js'
    ],

    preprocessors: {
      'js/main.js': ['browserify'],
      'test/**/*Spec.js': ['browserify']
    },

    browserify: {
      watch: true
    },

    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'growler'],


    // web server port
    port: 9877,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
