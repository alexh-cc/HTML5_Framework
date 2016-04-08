'use strict';
module.exports = function (grunt) {

    function execute(){
        var pkg = grunt.file.readJSON('package.json');
        grunt.config.set('pkg', pkg);
        console.log('refresh version ' + pkg.version);
    }

    // register the task
    grunt.task.registerTask('refresh', ['refresh package json'], execute);
};