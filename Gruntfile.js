    //Gruntfile
    module.exports = function(grunt) {

    //Initializing the configuration object
      grunt.initConfig({

        // Task configuration
        concat: {
          options: {
            separator: ';',
          },
          js_frontend: {
            src: [
              'bower_components/jquery/dist/jquery.js',
              'bower_components/bootstrap/dist/js/bootstrap.js',
              'bower_components/mediaCheck/js/mediaCheck.js',
              'assets/javascript/frontend.js'
            ],
            dest: 'server/static/javascript/frontend.js',
          },
          js_backend: {
            src: [
              'bower_components/jquery/jquery.js',
              'bower_components/bootstrap/dist/js/bootstrap.js',
              'assets/javascript/backend.js'
            ],
            dest: 'server/static/javascript/backend.js',
          }
        },
        jade: {
          compile: {
            options: {
              debug: false,
              pretty: true
            },
            files: {
              'server/index.html': ['assets/jade/index.jade'] 
              /*
              'server/bandet.html': ['assets/jade/index.jade'],
              'server/cd.html': ['assets/jade/index.jade'],
              'server/historie.html': ['assets/jade/index.jade'],
              'server/bilder.html': ['assets/jade/index.jade'],
              'server/linker.html': ['assets/jade/index.jade'],
              'server/nyheter.html': ['assets/jade/index.jade'],
              'server/jubileum.html': ['assets/jade/index.jade']
              */
            }
          }
        },
        less: {
          development: {
            options: {
              compress: false,  //minifying the result
              plugins : [ new (require('less-plugin-autoprefix'))({browsers : [ 'last 2 versions', 'ie 9' ]}) ]
            },
            files: {
              //compiling frontend.less into frontend.css
              'server/static/stylesheets/frontend.css':'assets/less/frontend.less',
              //compiling backend.less into backend.css
              'server/static/stylesheets/backend.css':'assets/less/backend.less'
            }
          }
        },
        uglify: {
          options: {
            mangle: true  // Use if you want the names of your functions and variables unchanged
          },
          frontend: {
            files: {
              'server/static/javascript/frontend.js': 'server/static/javascript/frontend.js',
            }
          },
          backend: {
            files: {
              'server/static/javascript/backend.js': 'server/static/javascript/backend.js',
            }
          }
        },
        watch: {
          js_frontend: {
            files: [
              //watched files
              'bower_components/jquery/jquery.js',
              'bower_components/bootstrap/dist/js/bootstrap.js',
              'assets/javascript/frontend.js'
              ],   
            tasks: ['concat:js_frontend','uglify:frontend'],     //tasks to run
            options: {
              livereload: true                        //reloads the browser
            }
          },
          js_backend: {
            files: [
              //watched files
              'bower_components/jquery/jquery.js',
              'bower_components/bootstrap/dist/js/bootstrap.js',
              'assets/javascript/backend.js'
            ],   
            tasks: ['concat:js_backend','uglify:backend'],     //tasks to run
            options: {
              livereload: true                        //reloads the browser
            }
          },
          less: {
            files: ['assets/less/*.less'],  //watched files
            tasks: ['less'],                          //tasks to run
            options: {
              livereload: true,                        //reloads the browser
            }
          },
          jade: {
            files: ['assets/jade/*.jade'],  //watched files
            tasks: ['jade'],                          //tasks to run
            options: {
              livereload: true,                        //reloads the browser
              autoprefix: true
            }
          },
          copy: {
            files: ['assets/static/**/*.*'],  //watched files
            tasks: ['copy:staticfiles'],                          //tasks to run
            options: {
              livereload: true,                        //reloads the browser
              autoprefix: true
            }
          }
        },
        copy: {
          glyphicons: {
            expand: true,
            cwd: 'bower_components/bootstrap/dist/fonts/',
            src: '**',
            dest: 'server/static/fonts/',
            flatten: false
          },
          
          staticfiles: {
            expand: true,
            cwd: 'assets/static/',
            src: '**',
            dest: 'server/static/',
            flatten: false
          }
        }
      });


  // Plugin loading
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jade');

  // Task definition
  grunt.registerTask('default', ['watch']);

  };