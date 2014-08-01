module.exports = (grunt) =>
  grunt.initConfig
    coffee:
      compile:
        files:
          'lib/comic-reader.js': ['lib/**/*.coffee']

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.registerTask('default', ['coffee:compile'])
