'use strict';

var pack = require('./package.json');

module.exports = function (grunt){

    // load grunt tasks
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.initConfig({

        config: {
            src: 'src',
            tests: 'tests',
            dest: 'dest'
        },

        watch: {
            scripts: {
                files: ['<%= config.src %>/{,*/}*.js', '<%= config.tests %>/{,*/}*.js'],
                tasks: ['karma']
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },

        browserify: {
            dist:{
                files:{
                    '<%= config.dest %>/js/main.js': ['<%= config.src %>/{,*/}*.js']
                },
                options:{
                    transform: ['6to5ify']
                }
            }
        }
    });

    grunt.registerTask('dev', [
        'browserify'
    ]);

    grunt.registerTask('default', [
        'watch'
    ]);
};