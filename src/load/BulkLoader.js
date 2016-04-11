cc.core.load.BulkLoader = function(){
	cc.core.utils.EventDispatcher.call(this);

    this.resolution = 1;
    //reference to game_shell.json
    this.jsonCache = null;
    //**************************************
    // MANIFESTS - populated in loadManifestState  
    //**************************************
    this.jsonManifest = null;
    this.imgManifest = null;
    this.fontManifest = null;
    this.webAudioManifest = null;
    this.audioSpriteManifest = null;

};
//*******************************
cc.core.load.BulkLoader.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.load.BulkLoader.prototype.constructor = cc.core.load.BulkLoader;

/**
 *
 * @param config
 */
cc.core.load.BulkLoader.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];

    this.webAudio = this.settings.WEB_AUDIO_ENABLED && this.system.webAudio;//bool

    //**************************************
    //loaders
    //**************************************
    cc.core.load.soundLoader = new cc.core.audio.SoundLoader();
    //**************************************
    //load states
    //**************************************
    this.loadManifest = this.createLoadManifest();
    this.jsonLoad = this.createJsonLoad();
    this.imageLoad = this.createImageLoad();
    this.audioLoad = this.createAudioLoad();
    this.fontLoad = this.createFontLoad();

    //**************************************
    // Sequence control (Switch statement)
    //**************************************
    this.sequence = new cc.core.load.LoadingSequence(this, this.webAudio);

    //**************************************
    // url lookup component
    //**************************************
    this.urls = new cc.core.utils.UrlLookup();//use for id lookup

    //**************************************
    // OVERALL PROGRESS
    //**************************************
    this.progressTracker = new cc.core.load.ProgressTracker(this.webAudio);
};


/**
 * add a file to the manifest before loading it
 * @param filepath
 * @param id
 * @param type
 * @returns {*}
 */
cc.core.load.BulkLoader.prototype.addFile = function(filepath, id, type){
    var manifest = this.getManifestByExtension(filepath);
    var item = null;
    if(manifest !== null){
        item = {
            "src": filepath,
            "id": id
        };
        if(typeof type != 'undefined'){
            item.type = type;
        }
        manifest[manifest.length] = item;
        this.urls.add(item);
    }
    return item;//return then can modify if necessary
};

cc.core.load.BulkLoader.prototype.getManifest = function(){
    return this.loadManifest.manifest;
};


/**
 *
 * @param file
 * @returns {*}
 */
cc.core.load.BulkLoader.prototype.getManifestByExtension = function(file){
    //choose appropriate manifest
    var ext = file.match(/\.(\w+)$/)[0];
    var manifest = null;
    switch(ext){
        case '.png':
        case '.jpg':
            manifest = this.imgManifest;
            break;
        case '.json':
            manifest = this.jsonManifest;
            break;
        case '.fnt':
        case '.xml':
            manifest = this.fontManifest;
            break;
        case '.ogg':
        case '.m4a':
        case '.mp3':
        case '.wav':
            manifest = this.webAudioManifest;
            break;
    }
    return manifest;
};

//
/**
 * not too useful actually due to @2x, @4x etc
 * @param file
 * @returns {boolean}
 */
cc.core.load.BulkLoader.prototype.contains = function(file){
    var manifest = this.getManifestByExtension(file);
    var item = null, i, n = manifest.length, itemFound = false;
    for(i = 0; i < n; i++){
        item = manifest[i];
        //allow just filename maybe - indexOf
        if(item.src.indexOf(file) > -1){
            itemFound = true;
            break;
        }           
    }
    return itemFound;
};

/**
 *
 * @param id
 * @param fileType
 * @returns {boolean}
 */
cc.core.load.BulkLoader.prototype.containsId = function(id, fileType){
    var manifest = this.getManifestByExtension(fileType);
    var item = null, i, n = manifest.length, itemFound = false;
    for(i = 0; i < n; i++){
        item = manifest[i];
        //allow just filename maybe - indexOf
        if(item.id.indexOf(id) > -1){
            itemFound = true;
            break;
        }           
    }
    return itemFound;
};

//**************************************
// START LOAD
//**************************************
cc.core.load.BulkLoader.prototype.load = function(manifestPath){
    this.manifestPath = manifestPath;
    this.progressTracker.reset();
    this.sequence.reset();
    this.sequence.next();
};

/**
 *
 */
cc.core.load.BulkLoader.prototype.loadProgress = function(){
    var overallProgress = this.progressTracker.overallProgress();
    //TODO - event reuse
    this.emit({type:"progress", value: overallProgress});
};

cc.core.load.BulkLoader.prototype.fontLoaded = function(percent){
    this.progressTracker.progressFonts = percent;
    this.loadProgress();
};

cc.core.load.BulkLoader.prototype.imageLoaded = function(percent){
    this.progressTracker.progressImages = percent;
    this.loadProgress();
};

cc.core.load.BulkLoader.prototype.jsonLoaded = function(percent){
    this.progressTracker.progressJSON = percent;
    this.loadProgress();
};

cc.core.load.BulkLoader.prototype.audioLoaded = function(percent){
    this.progressTracker.progressSounds = percent;
    this.loadProgress();
};

/**
 * pass sounds over to sound manager
 */
cc.core.load.BulkLoader.prototype.addSounds = function(){
    var soundData = {};
    if(this.webAudio){
        //get the loaded sound assets
        soundData.assets = this.audioLoad.soundLoader.assets;
        game_shell.snd.addSounds(soundData.assets);
    } else {
        //audio sprite
        var manifestData = this.audioSpriteManifest;
        soundData.autoplay = true;
        soundData.sprites = (manifestData.sprites)? manifestData.sprites : null;
        soundData.src = null;
        if(manifestData.src) soundData.src = cc.core.settings.SND_DIR + manifestData.src;       
        game_shell.snd.addSounds(soundData);
    }
};

/**
 *
 */
cc.core.load.BulkLoader.prototype.loadComplete = function(){

    this.addSounds();

    this.emit({type:"complete"});
    //now remove all event listeners!
    this.offAll();
};

//**************************************
// UN-LOAD
//**************************************
        
cc.core.load.BulkLoader.prototype.unload = function(){
    // - get the manifest json data
    var jsonData = this.loadManifest.manifest;
    if(jsonData){
        // - unload the images
        this.imageLoad.unload(this.getIds(this.imgManifest));
        // - unload the sounds
        cc.core.load.soundLoader.unload(this.getIds(this.webAudioManifest));
        // - unload the fonts
        this.fontLoad.unload();
        // - unload the json
        this.jsonLoad.unload(this.getIds(this.jsonManifest));
        // - null the other bits and bobs
        this.loadManifest.manifest = null;
        this.jsonManifest = null;
        this.imgManifest = null;
        this.fontManifest = null;
        this.webAudioManifest = null;
        this.audioSpriteManifest = null;

    }
};

/**
 *
 * @param data
 * @returns {Array}
 */
cc.core.load.BulkLoader.prototype.getIds = function(data){
    var ids = [];
    var n = data.length, i, item;
    for(i =0; i < n; i++){
        item = data[i];
        ids[i] = item.id;
    }
    return ids;
};


// **************************************************************
// move these to a builder
// **************************************************************

/**
 *
 * @returns {cc.core.load.FontLoadState}
 */
cc.core.load.BulkLoader.prototype.createFontLoad = function(){
    var fontLoad = new cc.core.load.FontLoadState();
    fontLoad.init({
        resolution: this.resolution,
        bulkLoader: this
    });
    return fontLoad;
};

/**
 *
 * @returns {cc.core.load.AudioLoadState}
 */
cc.core.load.BulkLoader.prototype.createAudioLoad = function(){
    var audioLoad = new cc.core.load.AudioLoadState();
    audioLoad.init({
        bulkLoader: this,
        soundLoader: cc.core.load.soundLoader
    });
    return audioLoad;
};

/**
 *
 * @returns {cc.core.load.ImageLoadState}
 */
cc.core.load.BulkLoader.prototype.createImageLoad = function(){
    var imageLoad = new cc.core.load.ImageLoadState(this);
    imageLoad.init({
        resolution: this.resolution,
        bulkLoader: this
    });
    return imageLoad;
};

/**
 *
 * @returns {cc.core.load.LoadManifest}
 */
cc.core.load.BulkLoader.prototype.createLoadManifest = function(){
    var loadManifest = new cc.core.load.LoadManifest();
    loadManifest.init({
        resolution: this.resolution,
        bulkLoader: this
    });
    return loadManifest;
};

/**
 *
 * @returns {cc.core.load.JSONLoadState}
 */
cc.core.load.BulkLoader.prototype.createJsonLoad = function(){
    var loader = new cc.core.load.JSONLoadState();
    loader.init({
        resolution: this.resolution,
        bulkLoader: this,
        jsonCache: this.jsonCache
    });
    return loader;
};