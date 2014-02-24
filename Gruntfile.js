module.exports = function(grunt) {
  this.registerTask('default', ['test']);

  this.registerTask('dist', 'Builds a distributable version of EmberSimpleAuth', [
    'jshint',
    'build',
    'copy:sources',
    'uglify:library',
    'uglify:browser'
  ]);

  this.registerTask('build', 'Builds EmberSimpleAuth', [
    'clean',
    'transpile:amd',
    'concat:amd'
  ]);

  this.registerTask('build_tests', "Builds EmberSimpleAuth's tests", [
    'build',
    'transpile:tests',
    'concat:tests',
  ]);

  this.registerTask('server', 'Runs a development server', [
    'build_tests',
    'connect',
    'watch'
  ]);

  this.registerTask('test', 'Executes the tests', [
    'jshint',
    'build_tests',
    'connect',
    'qunit'
  ]);

  this.registerTask('docs', 'Builds the documentation', [
    'yuidoc',
    'compile-handlebars:docs'
  ]);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {},
      options: {
        hostname: '0.0.0.0',
        port: grunt.option('port') || 8000,
        base: '.',
        middleware: function(connect, options) {
          return [
            require('connect-redirection')(),
            function(request, response, next) {
              if (request.url === '/') {
                response.redirect('/test');
              } else {
                next();
              }
            },
            connect.static(options.base)
          ];
        }
      }
    },

    watch: {
      files: ['lib/**', 'test/**/*'],
      tasks: ['build_tests', 'jshint']
    },

    transpile: {
      amd: {
        type: 'amd',
        files: [{
          expand: true,
          cwd: 'lib/',
          src: ['**/*.js'],
          dest: 'tmp/'
        }]
      },
      tests: {
        type: 'amd',
        files: [{
          expand: true,
          cwd: 'test/',
          src: ['test_helpers.js', 'tests.js', 'tests/**/*_test.js'],
          dest: 'tmp/'
        }]
      }
    },

    concat: {
      amd: {
        src: ['tmp/ember-simple-auth.js', 'tmp/ember-simple-auth/**/*.js'],
        dest: 'tmp/ember-simple-auth.amd.js'
      },
      tests: {
        src: ['tmp/tests/**/*.js'],
        dest: 'tmp/ember-simple-auth-tests.amd.js'
      }
    },

    copy: {
      sources: {
        files: [{
          expand: true,
          cwd: 'tmp/',
          src: ['<%= pkg.name %>.js', '<%= pkg.name %>.amd.js', '<%= pkg.name %>.amd.js.map', '<%= pkg.name %>/**/*.js', 'vendor/**/*.js'],
          dest: 'dist/sources-<%= pkg.version %>/'
        }, {
          expand: true,
          src: ['wrap/*', 'vendor/**/*.js'],
          dest: 'dist/sources-<%= pkg.version %>/'
        }]
      }
    },

    uglify: {
      library: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.amd.min.js': ['dist/sources-<%= pkg.version %>/<%= pkg.name %>.amd.js']
        }
      },
      browser: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/sources-<%= pkg.version %>/<%= pkg.name %>.amd.js']
        }
      }
    },

    jshint: {
      library: 'lib/**/*.js',
      tests: 'test/tests/**/*.js',
      options: {
        jshintrc: '.jshintrc'
      }
    },

    clean: ['dist', 'tmp', 'docs/build'],

    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8000/test/index.html'
          ]
        }
      }
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        options: {
          parseOnly: true,
          paths: 'lib',
          outdir: 'docs/build'
        }
      }
    },

    'compile-handlebars': {
      docs: {
        template: 'docs/theme/main.hbs',
        templateData: 'docs/build/data.json',
        globals: ['docs/config.json'],
        helpers: 'docs/theme/helpers/**/*.js',
        output: 'docs/build/api.html'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-compile-handlebars');
};
