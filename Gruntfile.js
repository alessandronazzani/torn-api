var _= require('underscore');

global.navigator= {} // avoid r.js to break

/*global module:false*/
module.exports = function(grunt) {

  var os= require('os');


  // Project configuration.
  grunt.initConfig({

    'html-builder': {
      parallel: 3,
      blocks: { 'header': 'header' },
      json: [
              { collection: 'app-info', transform: 'logos', dest: 'logos' }
            ]
    },
    watch: {
      files: ['Gruntfile.js','src/client/js/**/*.js','src/client/js/**/*.html','!src/client/js/components/**','src/less/**/*.less'],
      tasks: ['less:dev','client']
    },
    clean: ['./dist'],
    copy: {
      client: {
         files: [ {expand: true, cwd: 'src/client/', src: ['**'], dest: 'dist/'},
                  {expand: true, cwd: 'src/html/template/', src: ['*'], dest: 'dist/js/template/'}
                ]
      },
      pkgprod: {
         files: [ {src: ['package.json'], dest: 'package.dev.json'},
                  {src: ['package.prod.json'], dest: 'package.json'}]
      },
      pkgdev: {
         files: [ {src: ['package.json'], dest: 'package.prod.json'},
                  {src: ['package.dev.json'], dest: 'package.json'}]
      },
      main: {
         files: [ {src: ['dist/js/main.gz.js'], dest: 'dist/js/main.js'}]
      }
    },
    less: {
            dev: {
                options: {
                    paths: ["src/less","src/client/js/components","."]
                },
                files: {
                    "dist/css/app.css": "src/less/app.less"
                }
            }
    },
    express: {
        server: {
          options: {
            port: 8888,
            bases: 'dist',
            server: require('path').resolve('app.js')
          }
        }
    },
    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        files: [
          {expand: true, src: ['dist/js/main.js'], dest: '.', ext: '.gz.js'}
        ]
      },
      app: {
        options: {
          archive: 'app.zip'
        },
        files: [
          {src: ['**','.ebextensions/**','!node_modules/**','!app.zip'], dest: '/'}
        ]
      }
    },
    requirejs: { compile: { options: _.extend(require('./src/client/js/main.js'),{
          preserveLicenseComments: false,
          baseUrl: 'src/client/js',
          dir: 'dist/js',
          keepBuildDir: true,
          modules: [ {name:'main', include: ['ga','module/app']} ],
    }) } }, 
  });

  // Default task.
  grunt.registerTask('default', ['less:dev','html-builder-json','html-builder','client']);
  grunt.registerTask('client', 'copy:client');
  grunt.registerTask('listen', ['default','express','watch']);
  grunt.registerTask('optimize', ['client','requirejs']);
  grunt.registerTask('package', ['optimize','compress:main','copy:main','copy:pkgprod','compress:app','copy:pkgdev']);
  
  // contrib
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-requirejs');
  
  // github
  grunt.loadNpmTasks('grunt-html-builder');
  grunt.loadNpmTasks('grunt-express');

};
