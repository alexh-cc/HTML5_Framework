/**
 * mixin to handle generic game init
 * @constructor
 */
cc.core.GenericGame = function () {

    //*************************************
    //set div color
    //*************************************
    this.gameDiv = cc.core.GenericGame.prototype.setGameDiv.call(this, 'game');
    //*************************************
    // system analysis
    //*************************************
    this.system = cc.core.GenericGame.prototype.createSystemInfo.call(this);
    //*************************************
    //create a central event queue
    this.eventQueue = cc.core.GenericGame.prototype.createEventQueue.call(this);
    //*************************************
    this.resolutionController = cc.core.GenericGame.prototype.initResolution.call(this);//<- do this before creating viewport!
    //*************************************
    this.viewport = cc.core.GenericGame.prototype.createViewport.call(this);
    //*************************************
    // create pixi stage instance
    //*************************************
    this.stage = cc.core.GenericGame.prototype.createStage.call(this, cc.core.settings);
    //*************************************
    //instantiate sound manager
    this.snd = cc.core.GenericGame.prototype.createSoundManager.call(this);
    //*************************************
    // create screen manager
    //*************************************
    this.screenMgr = cc.core.GenericGame.prototype.createScreenManager.call(this);
    //*************************************
    // create the render loop
    //*************************************
    this.renderLoop = cc.core.GenericGame.prototype.createRenderLoop.call(this);
    //*************************************
    //have a global updateList instance for things that need to run independently of screens
    this.updateList = new cc.core.utils.UpdateList();
    //have a global timeout
    this.timeout = new cc.core.utils.DelayedAction();
    this.updateList.add(this.timeout);
    //*************************************
    this.updateLoop = cc.core.GenericGame.prototype.createUpdateLoop.call(this);
    //*************************************
    // game pause handling
    //*************************************
    this.pauseController = cc.core.GenericGame.prototype.createPauseController.call(this);
    //*************************************
    // full screen handling
    //*************************************
    this.fullscreen = cc.core.GenericGame.prototype.createFullscreenManager.call(this);
    //*************************************
    //create loader
    this.loader = cc.core.GenericGame.prototype.createLoader.call(this);
    //*************************************
    //invoke callback - for customisation
    if (typeof this.onReady === "function") this.onReady();
    //*************************************
    //invoke resize
    this.viewport.resize();
    //*************************************
    cc.core.GenericGame.prototype.begin.call(this);
    //************************************************
    this.getURL = function (id) {
        return this.loader.urls.getURL(id);
    };
};

/**
 *
 * @returns {cc.core.load.BulkLoader}
 */
cc.core.GenericGame.prototype.createLoader = function () {
    var loader = new cc.core.load.BulkLoader();
    loader.init({
        resolution: this.resolution,
        system: this.system,
        settings: cc.core.settings,
        jsonCache: this.json,
        audioType: this.system.audioType,
        audioFolder: cc.core.settings.SND_DIR
    });
    return loader;
};

/**
 * @method updateGame
 * @param delta
 */
cc.core.GenericGame.prototype.updateGame = function (delta) {
    //update tweens
    TWEEN.update(this.updateLoop.currentTime);
    //the global update list
    this.updateList.update(delta);
    //update screen content
    this.screenMgr.update(delta);
    //and the sound manager...
    this.snd.update(delta);
    //finally deal with queued events
    this.eventQueue.dispatchQueuedEvents();
};

//************************************************
//these want to be overrideable
//************************************************

/**
 * @method start
 */
cc.core.GenericGame.prototype.begin = function () {
    this.updateLoop.start();
    //kick off the render loop
    this.renderLoop.start();
};

/**
 * @method setGameDiv
 * @param name
 * @returns {Element}
 */
cc.core.GenericGame.prototype.setGameDiv = function (name) {
    var gameDiv = document.getElementById(name);
    gameDiv.style.backgroundColor = cc.core.settings.BG_COLOR;
    return gameDiv;
};

/**
 * @method createEventQueue
 * @returns {cc.core.utils.EventQueue}
 */
cc.core.GenericGame.prototype.createEventQueue = function () {
    var eventQueue = new cc.core.utils.EventQueue();
    eventQueue.on("game_event", this.onGameEvent.bind(this));
    return eventQueue;
};

/**
 * @method createScreenManager
 * @returns {cc.core.screens.ScreenMgr}
 */
cc.core.GenericGame.prototype.createScreenManager = function () {
    var screenMgr = new cc.core.screens.ScreenMgr();//
    screenMgr.init({
        stage: this.stage, 
        snd: this.snd, 
        eventQueue: this.eventQueue, 
        resolution: this.resolution, 
        settings: cc.core.settings
    });
    return screenMgr;
};

/**
 * @method createSystemInfo
 * @returns {cc.core.utils.SystemInfo}
 */
cc.core.GenericGame.prototype.createSystemInfo = function () {
    var system = new cc.core.utils.SystemInfo();
    system.run(true);
    //allow overriding the audio type with mp3
    if (cc.core.settings.AUDIO_TYPE) system.audioType = cc.core.settings.AUDIO_TYPE;
    cc.core.utils.system = system;//for legacy reasons, store here too
    return system;
};

/**
 * @method createPauseGame
 * @returns {cc.core.utils.PauseController}
 */
cc.core.GenericGame.prototype.createPauseController = function () {
    var pauseController = new cc.core.utils.PauseController();
    pauseController.init({
        updateLoop: this.updateLoop,
        renderLoop: this.renderLoop,
        snd: this.snd
    });
    return pauseController;
};

/**
 * @method createFullscreenManager
 * @returns {cc.core.utils.FullscreenMgr}
 */
cc.core.GenericGame.prototype.createFullscreenManager = function () {
    var fullscreenMgr = null;
    if (cc.core.utils.system.isMobile) {
        window.scrollTo(0, 1); //can't use fullscreen API here, only on user interaction!
    }
    if (cc.core.settings.FULLSCREEN_ENABLED) {
        var disabledOnDesktop = cc.core.utils.system.isDesktop && !cc.core.settings.DESKTOP_FULLSCREEN;
        if (!disabledOnDesktop) {
            fullscreenMgr = new cc.core.utils.FullscreenMgr();
            fullscreenMgr.init({
                canvas: this.stage.renderer.view,
                isMobile: cc.core.utils.system.isMobile
            });
        }
    }
    return fullscreenMgr;
};

/**
 * @method createRenderLoop
 * @returns {cc.core.utils.RenderLoop}
 */
cc.core.GenericGame.prototype.createRenderLoop = function () {
    var renderLoop = new cc.core.utils.RenderLoop();
    renderLoop.init({
        stage: this.stage,
        screenMgr: this.screenMgr,
        useStats: this.config.SHOW_STATS === true
    });
    return renderLoop;
};

/**
 * @method createStage
 * @param config
 * @returns {cc.core.display.Stage}
 */
cc.core.GenericGame.prototype.createStage = function (config) {
    var stage = new cc.core.display.Stage();
    stage.init({
        width: config.STAGE_W,
        height: config.STAGE_H,
        forceCanvas: !config.WEB_GL_ENABLED,
        settings: {
            backgroundColor: parseInt(config.BG_COLOR.substr(1), 16),
            resolution: this.resolutionController.resolution
        }
    });
    return stage;
};

/**
 * @method createUpdateLoop
 * @returns {cc.core.utils.UpdateLoop}
 */
cc.core.GenericGame.prototype.createUpdateLoop = function () {
    //run loop controller component that uses setInterval to run an update loop
    var updateLoop = new cc.core.utils.UpdateLoop();
    updateLoop.updateGame = cc.core.GenericGame.prototype.updateGame.bind(this);
    return updateLoop;
};

/**
 * @method initResolution
 * @returns {cc.core.utils.Resolution}
 */
cc.core.GenericGame.prototype.initResolution = function () {
    var resolutionController = new cc.core.utils.Resolution();
    var forceResolution = cc.core.GenericGame.prototype.checkForceResolution(this.config);
    resolutionController.init({
        forceResolution: forceResolution
    });
    if (cc.core.settings.SCALE_MODE === 2) {
        //match width
        cc.core.settings.setIpad();
        resolutionController.setByWidth();
    } else {
        //match height
        cc.core.settings.setIphone();
        resolutionController.setByHeight();
    }
    return resolutionController;
};

/**
 * under some conditions a specific resolution may be forced
 */
cc.core.GenericGame.prototype.checkForceResolution = function(config){
    var forceResolution = config.RESOLUTION || -1;
    var system = cc.core.utils.system, version = system.osVersion;
    if (system.isAndroid && version < 4 ||
        system.isAndroidStock) {
        //always force resolution 1 for these older systems
        forceResolution = 1;
    }
    return forceResolution;
};

/**
 * @method createSoundManager
 * @returns {cc.core.audio.SndMgr}
 */
cc.core.GenericGame.prototype.createSoundManager = function () {
    var sndMgr = new cc.core.audio.SndMgr();
    var sndConfig = cc.core.GenericGame.prototype.getSoundConfig();
    sndMgr.init(sndConfig);
    return sndMgr;
};

/**
 *
 * @returns {Object}
 */
cc.core.GenericGame.prototype.getSoundConfig = function(){
    var settings = cc.core.settings,
        system = cc.core.utils.system;
    return {
        isIOS: system.isIOS,
        audioType: system.audioType,
        audioEnabled: settings.AUDIO_ENABLED,
        webAudioEnabled: settings.WEB_AUDIO_ENABLED,
        isMuted: settings.MUTE_STATE
    };
};

/**
 * @method createViewport
 * @returns {cc.core.utils.Viewport}
 */
cc.core.GenericGame.prototype.createViewport = function () {
    var settings = cc.core.settings;
    //scaleMode
    var scaleMode = settings.SCALE_MODE || 1;
    var isMobile = cc.core.utils.system.isMobile;
    var viewport = new cc.core.utils.Viewport();
    viewport.init({
        //don't bother showing please rotate screen on desktop!
        CHECK_ORIENTATION: settings.CHECK_ORIENTATION && isMobile,
        DESKTOP_RESIZE: settings.DESKTOP_RESIZE,
        DEFAULT_W: settings.DEFAULT_W,
        DEFAULT_H: settings.DEFAULT_H,
        MIN_W: settings.MIN_W,
        MIN_H: settings.MIN_H,
        STAGE_W: settings.STAGE_W,
        STAGE_H: settings.STAGE_H,
        iframeMode: settings.IFRAME_MODE,
        orientation: settings.ORIENTATION,
        isMobile: isMobile,
        scaleMode: scaleMode,
        rotateImg: document.getElementById("rotate"),
        gameDiv: document.getElementById('game')
    });
    var self = this;
    viewport.on("resize", function (event) {
        self.pauseController.onResized.call(self.pauseController, event);
        if (!event.wrongOrientation) {
            settings.STAGE_W = event.settings.pointWidth;
            settings.STAGE_H = event.settings.pointHeight;
            self.stage.resize(event.settings);
            self.screenMgr.resize(event.settings);
        }
        if (isMobile) window.scrollTo(0, 1);
    });

    return viewport;
};