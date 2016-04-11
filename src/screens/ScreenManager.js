/**
 * @class ScreenMgr
 * @constructor
 */
cc.core.screens.ScreenMgr = function(){
    this.currentScreen = null;
    this.lastScreenId = null;
    this.stage = null;
    this.snd = null;
    this.eventQueue = null;
    //
    this.resolution = 1;
};
cc.core.screens.ScreenMgr.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.screens.ScreenMgr.prototype.constructor = cc.core.screens.ScreenMgr;

/**
 * @method init
 * @param config
 */
cc.core.screens.ScreenMgr.prototype.init = function(config){
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];
    
    this.showScreen = this._showScreen.bind(this);
    
    this.eventQueue.on("new_screen", this.showScreen);
};

/**
 * @method getScreenConfig
 * @param p_event
 * @returns {{screenId: *}}
 */
cc.core.screens.ScreenMgr.prototype.getScreenConfig = function(p_event){
    var config = (typeof p_event === "string")? {screenId: p_event} : p_event;
    config.screenW = this.settings.STAGE_W;
    config.screenH = this.settings.STAGE_H;
    config.defaultW = this.settings.DEFAULT_W;
    config.defaultH = this.settings.DEFAULT_H;
    config.resolution = this.resolution;
    config.eventQueue = this.eventQueue;
    config.lastScreenId = this.lastScreenId;
    config.snd = this.snd;
    //decided not to pass through cc.core.settings, its a bit redundant
    //config.settings = this.settings;
    return config; 
};

/**
 * @method resize
 * @param settings
 */
cc.core.screens.ScreenMgr.prototype.resize = function(settings){
    if(this.currentScreen !== null){
        //call resize on current screen
        var pointW = settings.pointWidth;
        var pointH = settings.pointHeight;
        this.currentScreen.resize(pointW, pointH);
    }
};

/**
 * @method displayScreen
 * @param p_event
 */
cc.core.screens.ScreenMgr.prototype.displayScreen = function(event){
    //kill old screen
    this.disposeScreen();
    var config = this.getScreenConfig(event);
    this.currentScreen = this.createScreen(config);
    this.stage.content.addChild(this.currentScreen);
    this.currentScreen.run();
};

/**
 * @method _showScreen
 * @param data
 * @param callback
 */
cc.core.screens.ScreenMgr.prototype._showScreen = function(data, callback){
    var config = (typeof data === "string")? {screenId: data} : data;
    var screenId = config.screenId;
    var manifest = this.getManifestPath(screenId);
    if(config.reload){
        delete config.reload;
        this.loadWithManifest(config, manifest, callback);
    } else {
        //check its not already loaded!
        if(!manifest || this.currentManifest === manifest){
            this.displayScreen(config);
        } else {
            // - unload this screen!
            this.unloadScreen();
            this.loadWithManifest(config, manifest, callback);
        }
    }
};

/**
 * @method loadWithManifest
 * @param screenId
 * @param manifest
 * @param callback
 */
cc.core.screens.ScreenMgr.prototype.loadWithManifest = function(screenId, manifest, callback){
    this.currentManifest = manifest;
    //NOTE - loader removes event listeners on load complete
    var self = this;
    game_shell.loader.on("manifest_json", function(event){
        self.addToManifestJSON(screenId, event.data);
    });
    game_shell.loader.on("manifest_loaded", function(){
        var data = game_shell.loader.getManifest();
        self.customizeManifest(screenId, data);
    });
    if(typeof callback === 'function'){
        game_shell.loader.on('complete', function(){
            callback();
        });
    }
    //now load the new manifest
    game_shell.loader.load(manifest, false);
    // show the preload bar
    this.eventQueue.queueEvent({type: "new_screen",
        screenId: "load",
        targetScreen:screenId});
};

//append source array content to target array
cc.core.screens.ScreenMgr.prototype.merge = function(target, source){
    var i, n = source.length;
    for(i = 0; i < n; i++){
        target[target.length] = source[i];
    }
};

/**
 *
 * @param screenId
 * @returns {string}
 */
cc.core.screens.ScreenMgr.prototype.getManifestPath = function(screenId){
    //override this, just return default
    return cc.core.settings.JSON_DIR + 'asset_manifest.json';
};

/**
 * this is BEFORE manifest json is parsed
 * @param screenId
 * @param jsonData
 */
cc.core.screens.ScreenMgr.prototype.addToManifestJSON = function(screenId, jsonData){
    //override this
};

/**
 * this is AFTER manifest json is parsed
 * @param screenId
 * @param data
 */
cc.core.screens.ScreenMgr.prototype.customizeManifest = function(screenId, data){
    //override this
};

/**
 *
 */
cc.core.screens.ScreenMgr.prototype.unloadScreen = function(){
    if(game_shell.spineUtils) game_shell.spineUtils.purge();
    game_shell.snd.removeSounds(game_shell.loader.webAudioManifest);//NOTE - could also call purge
    game_shell.loader.unload();
};

/**
 * override this - this stuff is just default
 * @param p_event
 * @returns {*}
 */
cc.core.screens.ScreenMgr.prototype.createScreen = function(p_event){
    var screen, scr = cc.core.screens;
    var screenId = (typeof p_event === "string")? p_event : p_event.screenId;
    switch(screenId){
        case "load": screen = new scr.LoadScreen(p_event); break;
        case "title": screen = new scr.TitleScreen(p_event); break;
    }
    return screen;
};

/**
 *
 * @param p_time
 */
cc.core.screens.ScreenMgr.prototype.update = function(p_time){
    if(this.currentScreen) this.currentScreen.update(p_time);
};

/**
 *
 * @param p_delta
 */
cc.core.screens.ScreenMgr.prototype.render = function(p_delta){
    if(this.currentScreen) this.currentScreen.render(p_delta);
};

/**
 *
 */
cc.core.screens.ScreenMgr.prototype.disposeScreen = function(){
    if(this.currentScreen !== null){
        //ignore the load screen!
        if(this.currentScreen.screenId !== 'load'){
            this.lastScreenId = this.currentScreen.screenId;
        }
        this.currentScreen.dispose();
        this.currentScreen = null;
    }
};