/**
 * Created by Alex on 2014/10/09.
 */

// JSON
cc.core.load.JSONLoadState = function(){
    this.bulkLoader = null;
    this.jsonCache = null;
    this.numLoaded = 0;
    this.numTotal = 0;
};

cc.core.load.JSONLoadState.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
    this.jsonLoaded = this._jsonLoaded.bind(this);
};


cc.core.load.JSONLoadState.prototype.unload = function(ids){
    var i, id, n = ids.length;
    for(i = 0; i < n; i++){
        id = ids[i];
        delete this.jsonCache[id];
    }
};

cc.core.load.JSONLoadState.prototype.load = function(){
    var self = this;
    this.queue = new cc.core.load.JsonQueue();
    this.queue.on("complete", function(){
        self.bulkLoader.sequence.next();
    });
    this.queue.on("loaded", this.jsonLoaded);
    this.queue.load(this.bulkLoader.jsonManifest);

};

cc.core.load.JSONLoadState.prototype._jsonLoaded = function(event){
    var filePath = event.url;
    var assetData = this.bulkLoader.urls.getAssetData(filePath);
    //store the jsonData on the assetData
    assetData.jsonData = event.jsonData;
    assetData.loaded = true;
    this.jsonProgress(event.numLoaded, event.numTotal);
    //check for some key properties to work out what it is
    var isAtlas = (assetData.jsonData.hasOwnProperty('frames')&&
        assetData.jsonData.hasOwnProperty('meta')) || assetData.type == "atlas";
    if(isAtlas){
        this.addImageToQueue(assetData.id, assetData.jsonData, filePath);
    }
    // - don't hardcode game_shell reference here
    this.jsonCache[assetData.id] = assetData.jsonData;
};

//progress event
cc.core.load.JSONLoadState.prototype.jsonProgress = function(numLoaded, total){
    this.bulkLoader.jsonLoaded(numLoaded / total);
};

cc.core.load.JSONLoadState.prototype.toString = function(){
    return "[JSONLoadState]";
};

/**
 *
 * @param id
 * @param jsonData
 * @param jsonFilePath
 */
cc.core.load.JSONLoadState.prototype.addImageToQueue = function(id, jsonData, jsonFilePath){
    var imgFilename = jsonData.meta.image;
    var imgManifest = this.bulkLoader.imgManifest;
    var n = imgManifest.length;
    //check it's not already in the list!
    //doh, could just use the id...
    var item = null;
    for(var i = 0 ; i < n;i++){
        item = imgManifest[i];
        //check for the filename....
        if(item.src.indexOf(imgFilename) > -1) {
            item.atlasData = jsonData;
            return;
        }
    }
    //add a manifest entry
    var data = {};
    //allow subfolders! -> strip the folderpath from the json filepath
    var lastSlash = jsonFilePath.lastIndexOf('/');
    var folderpath = jsonFilePath.substr(0, lastSlash + 1);
    //
    data.src = folderpath + imgFilename;
    data.id = id;//
    data.atlasData = jsonData;

    imgManifest[imgManifest.length] = data;

    //add it to the lookup!
    this.bulkLoader.urls.add(data);
};