module.exports = function(grunt) {

  //Project configuration.
  grunt.initConfig({
    //pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          hostname: '*',
          livereload: true
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      scripts: {
        files: 'js/**'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['connect', 'watch']);

};
