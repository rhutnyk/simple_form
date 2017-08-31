
'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        tgt: 'build',

        // Watch File
        // Watches my sass files and html files inside the root
        // for any changes; then it reloads my document
        watch: {
            cwd: process.cwd(),
            options: {
                livereload: true,
            },
            scripts: {
                files: ['src/app/*.js', 'src/app/*/*.js', 'src/app/*.js', 'src/app/*/*.js' ],
                tasks: ['concat:dev'],
            },
            // css: {
            //     files: ['src/scss/*.scss', 'src/scss/*/*.scss'],
            //     tasks: ['sass:main', 'concat:dev']
            // },
            html: {
                files: ['src/*.html', 'src/app/components/*/*.htlm', 'src/app/components/*/*/*.htlm'],
                tasks: ['htmlbuild:dev']
            },
            images: {
                files: ['src/images/*.{png,jpg,gif}'],
                tasks: ['imagemin:main']
            }
        },

        // jsHint File
        // == detects any js errors
        jshint: {
            options: {
                jshintrc: '.jshintrc',
            },
            files: {
                src: ['src/app/*.js', 'src/app/*/*.js', 'src/app/*.js', 'src/app/*/*.js']
            }
        },

        //Clean up destination
        clean: ['<%= tgt %>/css/*.*', '<%= tgt %>/js/*.*', '<%= tgt %>/fonts/*.*', '<%= tgt %>/images/*.*', '<%= tgt %>/*.html'],

        //JS & CSS resources concat
        concat: {
            dev: {
                files: {
                    '<%= tgt %>/css/app.css': ['node_modules/bootstrap/dist/css/bootstrap.min.css', 'src/css/styles.css'],
                    '<%= tgt %>/js/libraries.js': ['node_modules/jquery/dist/jquery.min.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js'],
                    '<%= tgt %>/js/angular.min.js': ['node_modules/angular/angular.min.js', 'node_modules/angular-resource/angular-resource.min.js', 'node_modules/angular-route/angular-route.min.js'],
                    '<%= tgt %>/js/ng-app.js': ['src/app/*.js', 'src/app/*/*.js', 'src/app/*.js', 'src/app/*/*.js'],
                }
            },
            prod: {
                files: {
                    '<%= tgt %>/js/libraries.js': ['src/js/jquery-1.12.4.min.js', 'src/js/vendors/*.js'],
                    '<%= tgt %>/js/angular.min.js': ['node_modules/angular/angular.min.js', 'node_modules/angular-resource/angular-resource.min.js', 'node_modules/angular-route/angular-route.min.js', 'node_modules/ng-sweet-alert/ng-sweet-alert.js', 'node_modules/angular-contenteditable/angular-contenteditable.js'],
                    //'<%= tgt %>/js/cordova.js': ['src/js/vendors/ionic/js/ionic.bundle.js', 'src/js/vendors/ngCordova/dist/ng-cordova.js']
                }
            }
        },

        //copy static resources
        copy: {
            fonts: {
                files: [
                    {
                        cwd: 'src/fonts/',  // set working folder / root to copy
                        src: '*.*',           // copy all files and subfolders
                        dest: 'cordova/PILOT/www/fonts',    // destination folder
                        expand: true           // required when using cwd
                    }
                ]
            }
        },

        //sass processing
        sass: {
            main: {
                files: {
                    'src/css/styles.css': 'src/scss/style.scss',
                    'src/css/normalize.css': 'node_modules/normalize.css/normalize.css',
                    'src/css/animate.css': 'node_modules/animate.css/animate.css',
                }
            },
            options: {
                sourceMap: true,
            }
        },

        // Uglify
        // == Minifies/packages all js files to my dist folder
        uglify: {
            prod: {
                files: {
                    '<%= tgt %>/js/ng-app.min.js': ['src/app/*.js', 'src/app/infrastructure/prod.js'],
                }
            },
            stage: {
                files: {
                    '<%= tgt %>/js/ng-app.min.js': ['src/app/*.js', 'src/app/infrastructure/stage.js'],
                }
            }
        },

        // CSSmin
        // == minifies my stylesheets
        cssmin: {
            main: {
                files: {
                    '<%= tgt %>/css/app.min.css': ['src/css/styles.css']
                }
            },
            options: {
                sourceMap: false
            }
        },

        // HTML Build
        // == Builds out two different versions of my html structure
        // == grunt build//dev & grunt build//dist
        htmlbuild: {
            dev: {
                src: 'src/index.html',
                dest: '<%= tgt %>/',
                options: {
                    // prefix: 'dev/',
                    relative: true,
                    scripts: {
                        'package': ['<%= tgt %>/js/libraries.js', '<%= tgt %>/js/angular.min.js', '<%= tgt %>/js/ng-app.js']
                    },
                    styles: {
                        css: [
                            '<%= tgt %>/css/app.css'
                        ]
                    }
                }

            },
            prod: {
                src: 'src/index.html',
                dest: '<%= tgt %>/',
                options: {
                    // prefix: 'dev/',
                    relative: true,
                    scripts: {
                        'package': ['<%= tgt %>/js/libraries.js', '<%= tgt %>/js/angular.min.js', '<%= tgt %>/js/ng-app.min.js']
                    },
                    styles: {
                        css: [
                            '<%= tgt %>/css/app.min.css'
                        ]
                    }
                }

            }
        },

        htmlmin: {                                 // Task
            dist: {                                  // Target
                options: {                             // Target options
                    //removeComments: true,
                    collapseWhitespace: true
                },
                files: {                               // Dictionary of files
                    'dist/index.html': 'index.html'     // 'destination': 'source'
                }
            }
        },

        // Minify Images
        // Optimzes Images
        imagemin: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/images/',
                    src: ['**/*.{png,jpg,gif,svg}'],
                    dest: '<%= tgt %>/images',
                }]
            },
            options: {
                optimizationLevel: 7,
                progressive: true,
                cache: false
            }
        },

        connect: {
            dev: {
                options: {
                    port: 1234,
                    hostname: 'localhost',
                    base: './build/',
                    // keepalive: true,
                    livereload: true,
                    open: {
                        target: 'http://localhost:1234'
                    }
                }
            },
        }
    });

    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    grunt.registerTask('watchfiles', ['watch']);

    grunt.registerTask('validate', ['jshint']);

    grunt.registerTask('cleanup', ['clean']);
        
    //builds
    grunt.registerTask('default', ['clean', 'concat:dev', 'htmlbuild:dev', 'imagemin:main', 'connect:dev', 'watchfiles']);

    //possible targets:
    //dev
    //stage
    //prod
    var target = grunt.option('target') || 'dev';
    grunt.registerTask('build', ['clean', 'sass', 'concat:prod', 'cssmin:main', 'uglify:' + target, 'copy:fonts', 'htmlbuild:prod', 'imagemin:main']);
}