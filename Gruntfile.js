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
      }
    },
    jshint: {
      all: ["Gruntfile.js", "js/**"],
      options: {
        ignores: "js/LeafletPlayback.js"
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'connect', 'watch']);

};
