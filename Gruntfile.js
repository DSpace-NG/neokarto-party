module.exports = function(grunt) {

  //Project configuration.
  grunt.initConfig({
    //pkg: grunt.file.readJSON('package.json'),
    connect: {
      app: {
        options: {
          port: 8000,
          hostname: "*",
          livereload: true
        }
      },
      doc: {
        options: {
          port: 8001,
          hostname: "*",
          base: 'build/doc',
          livereload: 35730
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      scripts: {
        files: "js/**",
        tasks: ["jshint", 'browserify:mobile', 'browserify:hq', 'concat']
      },
      templates: {
        files: "templates/*.hbs",
        tasks: ["jshint", 'browserify:hq', 'browserify:hq', 'concat']
      },
      doc: {
        files: "README.md",
        tasks:["markdown"],
        options: {
          livereload: 35730
        }
      }
    },
    markdown: {
      all: {
        files: [
          {
            src: 'README.md',
            dest: 'build/doc/README.md.html'
          }
        ]
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
      mobile: {
        src: ['js/mobile.js'],
        dest: 'build/mobile.js',
        options: {
          external: ["$", "L", "_", "Backbone", "Faye"],
          transform: ['hbsfy'],
          debug: true
        }
      },
      hq: {
        src: ['js/hq.js'],
        dest: 'build/hq.js',
        options: {
          external: ["$", "L", "_", "Backbone", "Faye"],
          transform: ['hbsfy'],
          debug: true
        }
      }
    },
    concat: {
      'build/mobile.js': ['build/vendor.js', 'build/mobile.js'],
      'build/hq.js': ['build/vendor.js', 'build/hq.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['markdown', 'jshint', 'browserify', 'concat', 'connect', 'watch']);

};
