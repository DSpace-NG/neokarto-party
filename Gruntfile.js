module.exports = function(grunt) {

  //Project configuration.
  grunt.initConfig({
    //pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          hostname: "*",
          livereload: true
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      scripts: {
        files: "js/**",
        tasks: ["jshint", 'browserify:app', 'concat']
      },
      templates: {
        files: "templates/*.hbs",
        tasks: ["jshint", 'browserify:app', 'concat']
      }
    },
    jshint: {
      all: ["Gruntfile.js", "js/**"],
      options: {
        ignores: "js/LeafletPlayback.js"
      }
    },
    browserify: {
      vendor: {
        src: [
          'bower_components/zepto/zepto.js',
          'bower_components/leaflet-dist/leaflet-src.js',
          'bower_components/lodash/dist/lodash.js',
          'bower_components/backbone/backbone.js',
          'bower_components/faye/include.js',
        ],
        dest: 'build/vendor.js',
        options: {
          shim: {
            zepto: {
              path: 'bower_components/zepto/zepto.js',
              exports: '$'
            },
            leaflet: {
              path: 'bower_components/leaflet-dist/leaflet-src.js',
              exports: 'L'
            },
            underscore: {
              path: 'bower_components/lodash/dist/lodash.js',
              exports: '_'
            },
            backbone: {
              path: 'bower_components/backbone/backbone.js',
              exports: 'Backbone'
            },
            faye: {
              path: 'bower_components/faye/include.js',
              exports: 'Faye'
            },
          }
        }
      },
      app: {
        src: ['js/app.js'],
        dest: 'build/app.js',
        options: {
          external: ["$", "L", "_", "Backbone", "Faye"],
          transform: ['hbsfy'],
          debug: true
        }
      }
    },
    concat: {
      'build/main.js': ['build/vendor.js', 'build/app.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'browserify', 'concat', 'connect', 'watch']);

};
