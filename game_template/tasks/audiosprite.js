'use strict';
module.exports = function (grunt) {
	var exec = require('child_process').exec;
    var fs = require('fs');
    var path = require('path');
    var _ = grunt.util._,
        log = grunt.log,
        f = require('util').format;
    var done;

    /**
     *
     */
	function execute(){
        var options = this.options();
        done = this.async();
        var files = getFiles(options.src, '.wav');

        processFiles(files, options);
    }

    /**
     *
     * @param files {Array}
     * @param options
     */
    function processFiles(files, options){

        var id = options.id;
        var dest = options.dest;
        var output = dest + id;


        var cwd = process.cwd();
        var scriptPath = cwd + '/node_modules/.bin/audiosprite';
        var cmd = scriptPath + ' --bitrate 64 --samplerate 44100 --channels 1 --silence 3 --vbr -1 --export ogg,m4a --output ';
        cmd += output + ' ';
        cmd += files.join(' ');
        var child = exec(cmd, {
            cwd: cwd
        },
        function(){
            console.log('callback')
        });
        child.on('error', function (err) {
            log.error(f('Failed with: %s', err));
            done(false);
        });
        child.on('exit', function (code) {
            if (code) {
                log.error(f('Exited with code: %d.', code));
                return done(false);
            }
            var audioData = refactorJSON(options);

            addToManifest(audioData, options)

            done();
        });
    }

    /**
     *
     * @param audioData
     * @param options
     */
    function addToManifest(audioData, options){
        if(options.manifest){
            var manifestPath = path.resolve(options.manifest);
            var manifestData = grunt.file.readJSON(manifestPath);
            manifestData.snd_webaudio.push(audioData);
            manifestData.snd_sprite = audioData;
            var saveString = JSON.stringify(manifestData, null, 4);
            grunt.file.write(manifestPath, saveString);
        }
    }

    /**
     *
     * @param options
     * @returns {{src: (*|string|string), id: string, sprites: Array}}
     */
    function refactorJSON(options){

        var id = options.id;
        var dest = options.dest;
        var output = dest + id;

        var filePath = path.resolve(output + '.json');
        var resultData = grunt.file.readJSON(filePath);
        //grab the sprite map
        var sprites = getSpriteList(resultData.spritemap);
        //iterate and set duration property
        var n = sprites.length, i, sprite;
        for(i =0; i < n; i++){
            sprite = sprites[i];
            sprite.duration = sprite.end - sprite.start;
            delete sprite.end;
            if(!sprite.loop) delete sprite.loop;
        }

        var audioData = {
            "src": id,
            "id": id.toUpperCase(),
            "sprites": sprites
        };
        var saveString = JSON.stringify(audioData, null, 4);
        grunt.file.write(filePath, saveString);

        return audioData;
    }

    /**
     *
     * @param sprites
     * @returns {Array}
     */
    function getSpriteList(sprites){
        var list = [], item;
        for(var s in sprites){
            if(sprites.hasOwnProperty(s)) {
                item = sprites[s];
                item.id = s;
                list.push(item);
            }
        }
        list.sort(function(a, b){
            return a.start < b.start? -1 : 1;
        });
        return list;
    }


    /**
     *
     * @param folder
     * @param type
     * @returns {Array.<T>|*}
     */
    function getFiles(folder, type){
        var files = fs.readdirSync(folder);
        var fileNames = files.filter(function(file) {
            return file.indexOf(type) > 0;
        });
        var paths = [];
        _.each(fileNames, function(file){
            paths.push(folder + file);
        });
        return paths;
    }

    // register the task
    grunt.task.registerTask('audiosprite', ['Create audio sprites'], execute);
};