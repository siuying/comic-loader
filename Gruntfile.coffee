module.exports = (grunt) =>
  grunt.initConfig
    coffee:
      compile:
        expand: true
        cwd: 'lib'
        src: ['**/*.coffee']
        dest: 'lib'
        ext: '.js'
    mochaTest:
      test:
        options:
          reporter: 'spec'
          compilers: 'coffee:coffee-script/register'
        src: ['test/**/*.coffee']
    watch:
      compile:
        files: ['lib/**/*.coffee']
        tasks: ['coffee:compile']
        options:
          spawn: false

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-mocha-test')
  grunt.registerTask('default', ['coffee:compile'])
  grunt.registerTask('test', ['mochaTest:test'])
