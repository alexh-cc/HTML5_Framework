'use strict';
/**
 * Grunt texture atlas export
 * @param grunt
 */
module.exports = function (grunt) {
    var exec = require('child_process').exec;
    var fs = require('fs');
    var atlases;
    var complete;
    var folder;

    /**
     *
     */
    function execute(){
        complete = this.async();
        folder = this.options().folder;
        atlases = getAtlases(folder);
        if(atlases.length > 0){
            publish();
        } else {
            console.log('No texture atlases found in folder ', folder);
            complete();
        }
    }

    /**
     *
     */
    function publish(){
       if(atlases.length > 0){
           var file = folder + atlases.shift();
           console.log('exporting atlas ', file);
           exec('TexturePacker ' + file + ' --force-publish', publish);
       } else {
           console.log('Texture atlas export complete')
           complete();
       }
    }

    /**
     *
     * @param folder
     * @returns {Array|Array.<T>|*}
     */
    function getAtlases(folder){
        var files = fs.readdirSync(folder);
        return files.filter(function(file) {
            return file.indexOf('.tps') > 0;
        });
    }

    // register the task
    grunt.task.registerTask('texturepacker', ['texture_packer'], execute);
};


