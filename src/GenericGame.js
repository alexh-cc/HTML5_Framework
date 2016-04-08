/**
 * mixin to handle generic game init
 * @constructor
 */
alex.GenericGame = function () {

    //*************************************
    //set div color
    //*************************************
    this.gameDiv = alex.GenericGame.prototype.setGameDiv.call(this, 'game');
    //*************************************
    // system analysis
    //*************************************
    this.system = alex.GenericGame.prototype.createSystemInfo.call(this);
    //*************************************
    //create a central event queue
    this.eventQueue = alex.GenericGame.prototype.createEventQueue.call(this);
    //*************************************
    this.resolutionController = alex.GenericGame.prototype.initResolution.call(this);//<- do this before creating viewport!
    //*************************************
    this.viewport = alex.GenericGame.prototype.createViewport.call(this);
    //*************************************
    // create pixi stage instance
    //*************************************
    this.stage = alex.GenericGame.prototype.createStage.call(this, alex.settings);
    //*************************************
    //instantiate sound manager
    this.snd = alex.GenericGame.prototype.createSoundManager.call(this);
    //*************************************
    // create screen manager
    //*************************************
    this.screenMgr = alex.GenericGame.prototype.createScreenManager.call(this);
    //*************************************
    // create the render loop
    //*************************************
    this.renderLoop = alex.GenericGame.prototype.createRenderLoop.call(this);
    //*************************************
    //have a global updateList instance for things that need to run independently of screens
    this.updateList = new alex.utils.UpdateList();
    //have a global timeout
    this.timeout = new alex.utils.DelayedAction();
    this.updateList.add(this.timeout);
    //*************************************
    this.updateLoop = alex.GenericGame.prototype.createUpdateLoop.call(this);
    //*************************************
    // game pause handling
    //*************************************
    this.pauseController = alex.GenericGame.prototype.createPauseController.call(this);
    //*************************************
    // full screen handling
    //*************************************
    this.fullscreen = alex.GenericGame.prototype.createFullscreenManager.call(this);
    //*************************************
    //create loader
    this.loader = alex.GenericGame.prototype.createLoader.call(this);
    //*************************************
    //invoke callback - for customisation
    if (typeof this.onReady === "function") this.onReady();
    //*************************************
    //invoke resize
    this.viewport.resize();
    //*************************************
    alex.GenericGame.prototype.begin.call(this);
    //************************************************
    this.getURL = function (id) {
        return this.loader.urls.getURL(id);
    };
};

/**
 *
 * @returns {alex.load.BulkLoader}
 */
alex.GenericGame.prototype.createLoader = function () {
    var loader = new alex.load.BulkLoader();
    loader.init({
        resolution: this.resolution,
        system: this.system,
        settings: alex.settings,
        jsonCache: this.json,
        audioType: this.system.audioType,
        audioFolder: alex.settings.SND_DIR
    });
    return loader;
};

/**
 * @method updateGame
 * @param delta
 */
alex.GenericGame.prototype.updateGame = function (delta) {
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
alex.GenericGame.prototype.begin = function () {
    this.updateLoop.start();
    //kick off the render loop
    this.renderLoop.start();
};

/**
 * @method setGameDiv
 * @param name
 * @returns {Element}
 */
alex.GenericGame.prototype.setGameDiv = function (name) {
    var gameDiv = document.getElementById(name);
    gameDiv.style.backgroundColor = alex.settings.BG_COLOR;
    return gameDiv;
};

/**
 * @method createEventQueue
 * @returns {alex.utils.EventQueue}
 */
alex.GenericGame.prototype.createEventQueue = function () {
    var eventQueue = new alex.utils.EventQueue();
    eventQueue.on("game_event", this.onGameEvent.bind(this));
    return eventQueue;
};

/**
 * @method createScreenManager
 * @returns {alex.screens.ScreenMgr}
 */
alex.GenericGame.prototype.createScreenManager = function () {
    var screenMgr = new alex.screens.ScreenMgr();//
    screenMgr.init({
        stage: this.stage, 
        snd: this.snd, 
        eventQueue: this.eventQueue, 
        resolution: this.resolution, 
        settings: alex.settings
    });
    return screenMgr;
};

/**
 * @method createSystemInfo
 * @returns {alex.utils.SystemInfo}
 */
alex.GenericGame.prototype.createSystemInfo = function () {
    var system = new alex.utils.SystemInfo();
    system.run(true);
    //allow overriding the audio type with mp3
    if (alex.settings.AUDIO_TYPE) system.audioType = alex.settings.AUDIO_TYPE;
    alex.utils.system = system;//for legacy reasons, store here too
    return system;
};

/**
 * @method createPauseGame
 * @returns {alex.utils.PauseController}
 */
alex.GenericGame.prototype.createPauseController = function () {
    var pauseController = new alex.utils.PauseController();
    pauseController.init({
        updateLoop: this.updateLoop,
        renderLoop: this.renderLoop,
        snd: this.snd
    });
    return pauseController;
};

/**
 * @method createFullscreenManager
 * @returns {alex.utils.FullscreenMgr}
 */
alex.GenericGame.prototype.createFullscreenManager = function () {
    var fullscreenMgr = null;
    if (alex.utils.system.isMobile) {
        window.scrollTo(0, 1); //can't use fullscreen API here, only on user interaction!
    }
    if (alex.settings.FULLSCREEN_ENABLED) {
        var disabledOnDesktop = alex.utils.system.isDesktop && !alex.settings.DESKTOP_FULLSCREEN;
        if (!disabledOnDesktop) {
            fullscreenMgr = new alex.utils.FullscreenMgr();
            fullscreenMgr.init({
                canvas: this.stage.renderer.view,
                isMobile: alex.utils.system.isMobile
            });
        }
    }
    return fullscreenMgr;
};

/**
 * @method createRenderLoop
 * @returns {alex.utils.RenderLoop}
 */
alex.GenericGame.prototype.createRenderLoop = function () {
    var renderLoop = new alex.utils.RenderLoop();
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
 * @returns {alex.display.Stage}
 */
alex.GenericGame.prototype.createStage = function (config) {
    var stage = new alex.display.Stage();
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
 * @returns {alex.utils.UpdateLoop}
 */
alex.GenericGame.prototype.createUpdateLoop = function () {
    //run loop controller component that uses setInterval to run an update loop
    var updateLoop = new alex.utils.UpdateLoop();
    updateLoop.updateGame = alex.GenericGame.prototype.updateGame.bind(this);
    return updateLoop;
};

/**
 * @method initResolution
 * @returns {alex.utils.Resolution}
 */
alex.GenericGame.prototype.initResolution = function () {
    var resolutionController = new alex.utils.Resolution();
    var forceResolution = alex.GenericGame.prototype.checkForceResolution(this.config);
    resolutionController.init({
        forceResolution: forceResolution
    });
    if (alex.settings.SCALE_MODE === 2) {
        //match width
        alex.settings.setIpad();
        resolutionController.setByWidth();
    } else {
        //match height
        alex.settings.setIphone();
        resolutionController.setByHeight();
    }
    return resolutionController;
};

/**
 * under some conditions a specific resolution may be forced
 */
alex.GenericGame.prototype.checkForceResolution = function(config){
    var forceResolution = config.RESOLUTION || -1;
    var system = alex.utils.system, version = system.osVersion;
    if (system.isAndroid && version < 4 ||
        system.isAndroidStock) {
        //always force resolution 1 for these older systems
        forceResolution = 1;
    }
    return forceResolution;
};

/**
 * @method createSoundManager
 * @returns {alex.audio.SndMgr}
 */
alex.GenericGame.prototype.createSoundManager = function () {
    var sndMgr = new alex.audio.SndMgr();
    var sndConfig = alex.GenericGame.prototype.getSoundConfig();
    sndMgr.init(sndConfig);
    return sndMgr;
};

/**
 *
 * @returns {Object}
 */
alex.GenericGame.prototype.getSoundConfig = function(){
    var settings = alex.settings,
        system = alex.utils.system;
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
 * @returns {alex.utils.Viewport}
 */
alex.GenericGame.prototype.createViewport = function () {
    var settings = alex.settings;
    //scaleMode
    var scaleMode = settings.SCALE_MODE || 1;
    var isMobile = alex.utils.system.isMobile;
    var viewport = new alex.utils.Viewport();
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