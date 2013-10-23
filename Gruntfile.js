module.exports = function(grunt) {

  grunt.initConfig({
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
          base: 'tmp/doc',
          livereload: 35730
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      js: {
        files: ["js/**"],
        tasks: ["jshint", 'browserify:main']
      },
      templates: {
        files: "templates/*.hbs",
        tasks: ["jshint"]
      },
      css: {
        files: "css/*.css"
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
            dest: 'tmp/doc/README.md.html'
          }
        ]
      }
    },
    jshint: {
      all: ["Gruntfile.js", "js/**"]
    },
    browserify: {
      vendor: {
        src: [
          'bower_components/zepto/zepto.js',
          'bower_components/lodash/dist/lodash.js',
          'bower_components/backbone/backbone.js',
          'bower_components/faye/include.js',
        ],
        dest: 'tmp/vendor.js',
        options: {
          shim: {
            zepto: {
              path: 'bower_components/zepto/zepto.js',
              exports: '$'
            },
            underscore: {
              path: 'bower_components/lodash/dist/lodash.js',
              exports: '_'
            },
            backbone: {
              path: 'bower_components/backbone/backbone.js',
              exports: 'Backbone'
            }
          }
        }
      },
      main: {
        src: ['js/main.js'],
        dest: 'tmp/main.js',
        options: {
          external: ["$", "_", "Backbone"],
          transform: ['hbsfy'],
          debug: true
        }
      },
      build: {
        src: ['js/main.js'],
        dest: 'tmp/main.js',
        options: {
          external: ["$", "_", "Backbone"],
          transform: ['hbsfy']
        }
      }
    },
    uglify: {
      app: {
        files: {
          'build/bundle.js': ['tmp/vendor.js', 'tmp/main.js']
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'build/css/bundle.css': [
            'bower_components/leaflet-dist/leaflet.css',
            'css/fontello.css',
            'css/main.css'
          ]
        }
      }
    },
    copy: {
      assets: {
        src: 'assets/*/**',
        dest: 'build/'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'browserify:vendor', 'browserify:main', 'connect:app', 'watch:js', 'watch:templates', 'watch:css']);
  grunt.registerTask('build', ['jshint', 'browserify:vendor', 'browserify:build', 'uglify', 'cssmin', 'copy']);
  grunt.registerTask('doc', ['markdown', 'connect:doc', 'watch:doc']);

};
