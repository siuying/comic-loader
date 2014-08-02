module.exports = (grunt) =>
  grunt.initConfig
    coffee:
      compile:
        expand: true
        cwd: 'lib'
        src: ['**/*.coffee']
        dest: 'lib'
        ext: '.js'
      tests:
        expand: true
        cwd: 'tests'
        src: ['**/*.coffee']
        dest: 'tests'
        ext: '.test.js'

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.registerTask('default', ['coffee:compile'])
