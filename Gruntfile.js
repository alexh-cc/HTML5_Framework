/**
 * File: Gruntfile date: 2016-02-11.
 */
module.exports = function (grunt) {
    //import the list of js files
    var sourceFiles = grunt.file.readJSON('src/sourceFiles.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        name: '<%= pkg.name %>',
        version: '<%= pkg.version %>',
        sourceDir: 'src/',
        deployDir: 'bin/',
        templateDir: 'game_template/src/',
        examplesDir: 'examples/',
        unmin: 'alex_v<%= pkg.version %>.source.js',
        minified: 'alex_v<%= pkg.version %>.min.js',

        clean: {
            alex: {
                options: {force: true},
                // - empty the bin folder
                src: ['<%= deployDir %>*.*']
            },
            template: {
                options: {force: true},
                src: ['<%= templateDir %>js/libs/<%= unmin %>*.*']
            },
            examples: {
                options: {force: true},
                src: ['<%= examplesDir %>js/libs/<%= unmin %>*.*']
            }
        },
        concat: {
            alex: {
                options: {bare: true},
                files: {
                    '<%= deployDir %><%= unmin %>': getSourceFiles('<%= sourceDir %>', sourceFiles.files, grunt)
                }
            }
        },
        uglify: {
            options: {
                'mangle': false
            },
            build: {
                files: {
                    '<%= deployDir %><%= minified %>': ['<%= deployDir %><%= unmin %>'],
                    '<%= deployDir %>game_shell.js': ['<%= sourceDir %>game_shell.js']
                }
            }
        },
        copy: {
            pixi: {
                files: [
                    {src: ['<%= sourceDir %>pixi/pixi_v3.09.js'], dest: '<%= deployDir %>pixi_v3.09.js'}
                ]
            },
            template: {
                files: [
                    {src: ['<%= deployDir %><%= unmin %>'], dest: '<%= templateDir %>js/libs/<%= unmin %>'},
                    {src: ['<%= deployDir %>game_shell.js'], dest: '<%= templateDir %>js/utils/game_shell.js'}
                ]
            },
            examples: {
                files: [
                    {src: ['<%= deployDir %><%= unmin %>'], dest: '<%= examplesDir %>js/libs/<%= unmin %>'},
                    {src: ['<%= deployDir %>game_shell.js'], dest: '<%= examplesDir %>js/utils/game_shell.js'}
                ]
            }
        },
        jshint: {
            files: getSourceFiles('<%= sourceDir %>', sourceFiles.files, grunt),
            //files: ['<%= sourceDir %>alex.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        ivantage_svn_changelog: {
            internal_log: {
                options: {
                    outFile: '<%= sourceDir %>../changelog.md',
                    revFrom: 1
                    // revTo: 'HEAD',
                }
            }
        },
        push_svn: {
            options: {
                remove: false,
                message: 'bumped to v<%= pkg.version %>'//getVersion(grunt)//
            },
            main: {
                src: './',
                dest: 'https://worklaptop/svn/Alex_HTML5_Framework_v3'
            }
        },
        bump: {
            options: {
                files: ['<%= sourceDir %>alex.js', 'package.json'],
                commit: false,
                push: false,
                createTag: false
            }
        }
    });

    //tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ivantage-svn-changelog');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-push-svn');

    //refresh the package json
    grunt.loadTasks('tasks');

    //
    grunt.registerTask('build', ['clean', 'concat', 'uglify', 'copy']);
    grunt.registerTask('default', ['build']);
    grunt.registerTask('changelog', ['ivantage_svn_changelog']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('bump-major', ['bump: major']);
    grunt.registerTask('bump-minor', ['bump: minor']);
    grunt.registerTask('bump-patch', ['clean', 'bump', 'refresh', 'build', 'push_svn', 'changelog']);

};

function getSourceFiles(folder, inputFiles) {
    var n = inputFiles.length, i, file, outputFiles = [];
    for (i = 0; i < n; i++) {
        file = inputFiles[i];
        outputFiles[i] = folder + file;
    }
    return outputFiles;
}