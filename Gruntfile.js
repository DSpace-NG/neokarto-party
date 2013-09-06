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
        tasks: ["jshint"]
      },
      templates: {
        files: "templates/*.hbs",
        tasks: ["handlebars"]
      }
    },
    jshint: {
      all: ["Gruntfile.js", "js/**"],
      options: {
        ignores: "js/LeafletPlayback.js"
      }
    },
    handlebars: {
      compile: {
        options: {
          namespace: "JST",
          processName: function(filePath){ return filePath.split('/')[1].replace('.hbs', ''); }
        },
        files: {
          "templates.js": ["templates/*.hbs"],
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'handlebars', 'connect', 'watch']);

};
