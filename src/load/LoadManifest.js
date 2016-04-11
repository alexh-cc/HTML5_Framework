/**
 * @class LoadManifest
 * @constructor
 */
cc.core.load.LoadManifest = function(){
    this.bulkLoader = null;
    //
    this.resolution = 1;
    this.audioType = null;
    this.audioFolder = null;
    //store the manifest JSON data
    this.manifest = null;
};

/**
 *
 * @param config
 */
cc.core.load.LoadManifest.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
    this.resolution = this.bulkLoader.resolution;
    this.audioType = this.bulkLoader.audioType;
    this.audioFolder = this.bulkLoader.audioFolder;
};

/**
 * load the manifest json file
 */
cc.core.load.LoadManifest.prototype.load = function(){
    var path = this.bulkLoader.manifestPath;
    var loader = new cc.core.load.JsonLoader(path);
    var self = this;
    loader.on("loaded",function(event){
        var jsonData = event.data;
        // - need to be able to insert stuff here really....
        self.bulkLoader.emit({type: "manifest_json", data: jsonData});

        //store the data structure in the bulkloader manifests map
        self.parseConfig.call(self, jsonData);

        //bail if manifest is empty
        if(self.isEmpty){
            //delay the call slightly though otherwise the loadscreen is not ready
            game_shell.timeout.delay(function(){
                self.bulkLoader.loadComplete();
            }, 100);
        } else {
            //load stuff
            self.bulkLoader.sequence.next();
        }      
    });
    loader.load();
};



/**
 *
 * @param p_data
 */
cc.core.load.LoadManifest.prototype.parseConfig = function(p_data){
    //NOTE - this is no longer compatible with hd / sd format!
    this.manifest = p_data;

    //set manifest paths according to resolution
    var res = this.resolution.toString() + "x";
    //fallback to hd / sd - TODO - this is probably redundant now...
    var fallback = (this.resolution === 1)? 'sd' : 'hd';

    //console.log('LoadManifest ' + res);
    var bulkLoader = this.bulkLoader;
    // revert to hd / sd if res version not found...
    bulkLoader.jsonManifest = this.getManifestSection('json_', res, fallback);
    //fix the paths of the atlas json - to image dir!
    this.setRoot(bulkLoader.jsonManifest, cc.core.settings.IMG_DIR);
    //
    bulkLoader.imgManifest = this.getManifestSection('img_', res, fallback);
    bulkLoader.fontManifest = this.getManifestSection('bm_font_', res, fallback);

    //get it to load non resolutionified json too
    if(this.manifest.hasOwnProperty("json")){
        this.setRoot(this.manifest.json, cc.core.settings.JSON_DIR);//fix json root
        bulkLoader.jsonManifest = bulkLoader.jsonManifest.concat(this.manifest.json);
    }
    //fix the other paths
    bulkLoader.imgManifest = this.setRoot(bulkLoader.imgManifest, cc.core.settings.IMG_DIR);
    bulkLoader.fontManifest = this.setRoot(bulkLoader.fontManifest, cc.core.settings.FONT_DIR);


    bulkLoader.urls.storeLookup(bulkLoader.jsonManifest);
    bulkLoader.urls.storeLookup(bulkLoader.imgManifest);
    bulkLoader.urls.storeLookup(bulkLoader.fontManifest);
    
    //and the sound
    bulkLoader.webAudioManifest = this.parseAudio(this.manifest.snd_webaudio);
    bulkLoader.audioSpriteManifest = this.manifest.snd_sprite || {};
};

/**
 *
 * @param list
 * @param root
 * @returns {*}
 */
cc.core.load.LoadManifest.prototype.setRoot = function(list, root){
    if(!list) return [];//allow missing manifest section
    var item;
    var n = list.length;
    for(var i = 0; i < n;i++){
        item = list[i];
        //check its not already there
        if(item.src.indexOf(root) === -1){
            item.src = root + item.src;
        }
    }
    return list;
};

/**
 *
 * @param name
 * @param res
 * @param fallback
 * @returns {*}
 */
cc.core.load.LoadManifest.prototype.getManifestSection = function(name, res, fallback){
    var list = null;
    var nameWithResolution = name + res;
    if(this.manifest.hasOwnProperty(nameWithResolution)){
        list = this.manifest[nameWithResolution];
    } else {
        //try the fallback!
        nameWithResolution = name + fallback;
        if(this.manifest.hasOwnProperty(nameWithResolution)){
            list = this.manifest[nameWithResolution];
        }
    }
    //prevent breaking!
    if(!list) list = [];
    return list;
};

/**
 *
 * @param input
 * @returns {*}
 */
cc.core.load.LoadManifest.prototype.parseAudio = function(input){
    if(!input) return [];//allow missing manifest section
    var item, folder = this.audioFolder;
    var n = input.length;
    for(var i = 0; i < n;i++){
        item = input[i];
        item.src = folder + item.src + this.audioType;
    }
    return input;
};

Object.defineProperties(cc.core.load.LoadManifest.prototype, {
    /**
     * @property isEmpty
     * type {boolean} true if no files in manifest
     */
    isEmpty: {
        get: function(){
            var loader = this.bulkLoader, count = 0;
            if(loader.jsonManifest) count += loader.jsonManifest.length;
            if(loader.imgManifest) count += loader.imgManifest.length;
            if(loader.fontManifest) count += loader.fontManifest.length;
            if(loader.webAudioManifest) count += loader.webAudioManifest.length;
            return count === 0;
        }
    }
});