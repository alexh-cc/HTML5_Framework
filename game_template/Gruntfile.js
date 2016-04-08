/**
 * Generic grunt build file template *
 */
module.exports = function (grunt) {
    //import the list of js files
    var sourceFiles = grunt.file.readJSON('src/sourceFiles.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        game: '<%= pkg.name %>',
        sourceDir: 'src/',
        deployDir: '<%= game %>/',

        // Before generating any new files, remove any previously-created files.
        clean: {
            build: {
                options: {force: true},
                src: ['<%= deployDir %>*']
            },
            //after minification, remove the framework and game source files that were created
            source: {
                options: {force: true},
                src: ['<%= sourceDir %>js/framework.source.js', '<%= sourceDir %>js/<%= game %>.source.js']
            }
        },
        concat: {
            build: {
                options: {bare: true},
                files: {
                    '<%= sourceDir %>js/<%= game %>.source.js': getSourceFiles('<%= sourceDir %>', sourceFiles.files, grunt)
                }
            },
            //second stage of concatting! bring pixi and dragonbones into the framework file
            framework: {
                options: {bare: true},
                files: {
                    '<%= sourceDir %>js/framework.source.js': getSourceFiles('<%= sourceDir %>', sourceFiles.libs, grunt)
                }
            }
        },
        uglify: {
            options: {
                mangle: false 
                //,preserveComments: 'some'
            },
            build: {
                files: {
                    '<%= deployDir %>js/game.min.js': ['<%= sourceDir %>js/<%= game %>.source.js'],
                    '<%= deployDir %>js/framework.min.js': ['<%= sourceDir %>js/framework.source.js']
                }
            }
        },
        pngmin: {
            build: {
                options: {
                    ext: '.png',
                    speed: 1
                },
                files: [
                    {
                        expand: true, // required option
                        src: ['**/*.png'],
                        cwd: '<%= sourceDir %>img', // required option
                        dest: '<%= deployDir %>img/'
                    }
                ]
            }
        },
        copy: {
            build: {
                files: [
                    //main game files
                    {src: ['<%= sourceDir %>js/utils/game_shell.js'], dest: '<%= deployDir %>js/game_shell.js'},
                    //{src: [sourceDir + 'js/utils/external_api.js'], dest: deployDir + 'js/external_api.js'},
                    {src: ['<%= sourceDir %>index_deploy*//*'], expand: true, flatten: true, dest: '<%= deployDir %>'},
                    //snd folder
                    {cwd: '<%= sourceDir %>snd', src: ['**/*.*'], expand: true, dest: '<%= deployDir %>snd/'},
                    {cwd: '<%= sourceDir %>img', src: ['**/*.*', '!**/*.png'], expand: true, dest: '<%= deployDir %>img/'},
                    //fonts folder
                    {src: ['<%= sourceDir %>font*//*'], expand: true, flatten: true, dest: '<%= deployDir %>font/'},
                    //json folder
                    {cwd: '<%= sourceDir %>json', src: ['**/*.json'], expand: true, dest: '<%= deployDir %>json/'}
                ]
            },
            json: {
                files: [
                    {src: ['<%= sourceDir %>index_deploy*//*'], expand: true, flatten: true, dest: '<%= deployDir %>'},
                    {cwd: '<%= sourceDir %>json', src: ['**/*.json'], expand: true, dest: '<%= deployDir %>json/'}
                ]
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                commit: false,
                push: false,
                createTag: false
            }
        },
        texturepacker: {
            options: {
                folder: 'assets/'
            }
        },
        audiosprite: {
            options: {
                src: 'assets/audio/game_screen/',
                dest: 'assets/audio/game_screen/sprites/',
                id: 'game_sfx',
                manifest: '<%= sourceDir %>json/asset_manifest.json'
            }
        }
    });
    //NPM TASKS
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');//to delete files
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-pngmin');  
    grunt.loadNpmTasks('grunt-ivantage-svn-changelog');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-push-svn');
    //texture packer, audiosprite
    grunt.loadTasks('tasks');
    //
    grunt.registerTask('default', [
        'clean:build',
        'concat:build',
        'concat:framework',
        'uglify:build',
        'copy:build',
        'clean:source',
        'pngmin:build']);
    //shortcut tasks
    grunt.registerTask('code', ['concat:build', 'concat:framework', 'uglify:build', 'clean:source']);
    grunt.registerTask('code_json', ['concat:build', 'concat:framework', 'uglify:build', 'copy:json', 'clean:source']);
    //other
    grunt.registerTask('test', ['clean:build', 'copy:build']);
	//audio
    grunt.registerTask('audio', ['audiosprite']);
    //bump
    grunt.registerTask('bump-major', ['bump: major']);
    grunt.registerTask('bump-minor', ['bump: minor']);
    grunt.registerTask('bump-patch', ['bump', 'refresh', 'push_svn', 'changelog']);

};

/**
 *
 * @param folder
 * @param files
 * @returns {Array}
 */
function getSourceFiles(folder, files) {
    for (var i = 0; i < files.length; i++) files[i] = folder + files[i];
    return files;
}