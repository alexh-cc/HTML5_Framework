/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/10/08
 * Time: 3:29 PM
 * To change this template use File | Settings | File Templates.
 */
cc.core.audio.SoundLoader = function(){
    cc.core.utils.EventDispatcher.call(this);
    //
    this.assets = {};
    this.manifest = null;
    this.context = null;
    this.numLoaded = 0;
    this.evtProgress = {type:'progress', value: 0};
    this.evtComplete = {type:'complete', value: 1};
};
cc.core.audio.SoundLoader.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.audio.SoundLoader.prototype.constructor = cc.core.audio.SoundLoader;
/*
 * asset load manifest
 @param: items < Array of objects with src and id strings eg {src:"./img/bg1.jpg", id:"bg"},
 */
cc.core.audio.SoundLoader.prototype.load = function(items){
    if(!this.context) this.initContext();//only create context if not already in existence!
    if(!this.manifest){
        this.manifest = items;
    } else {
        this.manifest = this.manifest.concat(items);
    }
    this.loadNext();
};

// *****************************************************
// UNLOADING
// *****************************************************

cc.core.audio.SoundLoader.prototype.purge = function(){
    //remove references to loaded content
    //quick way is to ditch the whole assets object
    this.assets = {};
};

cc.core.audio.SoundLoader.prototype.unloadSound = function(id){
    delete this.assets[id];
};

cc.core.audio.SoundLoader.prototype.unload = function(sounds){
    var i, n = sounds.length, id;
    for(i = 0; i < n; i++){
        id = sounds[i];
        this.unloadSound(id);
    }
};
// *****************************************************

cc.core.audio.SoundLoader.prototype.initContext = function(){
    if (window.AudioContext) {
        this.context = new AudioContext();
    } else if (window.webkitAudioContext) {
        this.context = new webkitAudioContext();
    }
};

cc.core.audio.SoundLoader.prototype.nextItem = function(){
    //find next item that is not loaded
    var checkObj;
    var foundObj = null;
    var n = this.manifest.length;
    for(var i = 0; i < n; i++){
        checkObj = this.manifest[i];
        //is there an asset with this id?
        if(!this.assets.hasOwnProperty(checkObj.id)){
            foundObj = checkObj;
            break;
        }
    }
    return foundObj;
};

cc.core.audio.SoundLoader.prototype.countLoaded = function(){
    //find next item that is not loaded
    var checkObj, n = this.manifest.length;
    this.numLoaded = 0;
    for(var i = 0; i < n; i++){
        checkObj = this.manifest[i];
        //is there an asset with this id?
        if(this.assets.hasOwnProperty(checkObj.id)){
            this.numLoaded++;
        }
    }
};

cc.core.audio.SoundLoader.prototype.loadNext = function(){
    //find next item that is not loaded
    var itemData = this.nextItem();
    this.countLoaded();
    //console.log('SoundLoader.prototype.loadNext');
    //create an XMLHttpRequest to load the item
    if(itemData){
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", itemData.src, true);
        request.responseType = "arraybuffer";
        //
        var self = this;
        request.onload = function(){
            self.onSoundLoaded.call(self, itemData, request);
        };
        //
        request.onerror = function() {
            self.assets[itemData.id] = null;
            //update load bar
            self.loadProgress();
            self.loadNext();
        };
        //
        function updateProgress(evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                self.loadProgress(percentComplete);
                //console.log("updateProgress " + percentComplete)
                // var amount = self.numLoaded + percentComplete;
                // var total = self.manifest.length;
                // var progress = amount / total;
                // self.emit({type:"progress", value: progress})
                //if(self.onLoadProgress) self.onLoadProgress(progress);
           // } else {
                // Unable to compute progress information since the total size is unknown
            }
        }
        request.addEventListener("progress", updateProgress, false);


        //
        try{
            request.send();
        } catch(e){
            console.log('SoundLoader: XHR error ' + request.status);
        }

    } else {
        this.manifest.length = 0; //clear the manifest
        //load complete!
        //update load bar
        this.loadComplete();
    }
};

cc.core.audio.SoundLoader.prototype.onSoundLoaded = function(itemData, request) {
    var self = this;
    var id = itemData.id;
   // console.log('onSoundLoaded ' + id)
    if(typeof this.context.decodeAudioData == "function"){
        this.context.decodeAudioData(request.response,
            function onSuccess(decodedBuffer) {
                //Attach the buffer to the data as property 'soundData'
                itemData.soundData = decodedBuffer;
                //and put the data object itself into the assets array
                self.assets[id] = itemData;//context.createBuffer(request.response, true);
                //update load bar
                self.loadProgress();
                self.loadNext();
            },
            function onFailure() {
                self.assets[id] = null;
                //update load bar
                self.loadProgress();
                self.loadNext();
            }
        );
    } else {
        if(request.status === 200){
            if(window.AudioContext){
                itemData.soundData = this.context.createBuffer(request.response, 1, 44100);
            } else {
                //Attach the buffer to the data as property 'soundData'
                itemData.soundData = this.context.createBuffer(request.response, true);
            }
            //and put the data object itself into the assets array
            this.assets[id] = itemData;//context.createBuffer(request.response, true);
        } else {
            this.assets[id] = null;
        }
        //update load bar
        this.loadProgress();
        this.loadNext();
    }
};

cc.core.audio.SoundLoader.prototype.loadProgress = function(progress){
    if(progress === undefined) progress = 0;
    var total = this.manifest.length;
    var amount = (this.numLoaded + progress) / total;
    //console.log('SoundLoader progress ' + amount)
    this.evtProgress.value = amount;
    this.emit(this.evtProgress);
};

cc.core.audio.SoundLoader.prototype.loadComplete = function(){
    this.emit(this.evtComplete);
};