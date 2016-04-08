/**
 * @class FullscreenMgr
 * @constructor
 */
alex.utils.FullscreenMgr = function(){
    this.canvas = null;
    this.isMobile = false;
    this.fullScreenState = false;//just for debugging
    this.isFullScreen = false;
    //
    this.fullscreenChanged = this._fullscreenChanged.bind(this);
    this.goFullscreen = this._goFullscreen.bind(this);
};

/**
 * @method init
 * @param config
 */
alex.utils.FullscreenMgr.prototype.init = function(config){
    this.canvas = config.canvas;//element
    this.isMobile = config.isMobile;//
    this.isAvailable = this.checkAvailable();
    //call activate by default
    this.activate(this.isAvailable);
};

/**
 * @method activate
 * @param state
 */
alex.utils.FullscreenMgr.prototype.activate = function(state){
    this.fullScreenState = state;
    this.canvas.removeEventListener("click", this.goFullscreen);
    this.canvas.removeEventListener("touchstart", this.goFullscreen);
    if(state){
        this.canvas.addEventListener("click", this.goFullscreen, false);
        //test!
        this.canvas.addEventListener("touchstart", this.goFullscreen, false);
    }
};

/**
 * @method _goFullscreen
 * @private
 */
alex.utils.FullscreenMgr.prototype._goFullscreen = function(){
    var gameDiv = document.documentElement;
    if (gameDiv.requestFullscreen) {
        gameDiv.requestFullscreen();
        //NOTE - capital S is intentional for firefox!!
    } else if (gameDiv.mozRequestFullScreen) {
        gameDiv.mozRequestFullScreen();
    } else if (gameDiv.webkitRequestFullscreen) {
        gameDiv.webkitRequestFullscreen();
    } else if (gameDiv.msRequestFullscreen) {
        gameDiv.msRequestFullscreen();
    }
    this.activate(false);
};

/**
 * @method reactivate
 */
alex.utils.FullscreenMgr.prototype.reactivate = function(){
    this.activate(!this.isFullScreen);
};

/**
 * @method checkAvailable
 * @returns {*}
 */
alex.utils.FullscreenMgr.prototype.checkAvailable = function(){
    var doc = document.documentElement;
    //this is only for iframes
    doc.allowfullscreen = true;
    //
    var available = doc.requestFullscreen
        || doc.webkitRequestFullscreen
        || doc.msRequestFullscreen
        || doc.mozRequestFullScreen;

    if(available){
        var self = this;
        //? this bit should be redundant...!
        document.onfullscreenchange = function(event) {
            self.fullscreenChanged(event);
        };
        document.onwebkitfullscreenchange = function(event) {
            self.fullscreenChanged(event);
        };
        document.onmozfullscreenchange = function(event) {
            self.fullscreenChanged(event);
        };
        document.onmsfullscreenchange = function(event) {
            self.fullscreenChanged(event);
        };
        //error logging *********************************************
        document.onfullscreenerror = function(event) {
            self.fullscreenError(event);
        };
        document.onmozfullscreenerror = function(event) {
            self.fullscreenError(event);
        };
        document.onwebkitfullscreenerror = function(event) {
            self.fullscreenError(event);
        };
        document.onmsfullscreenerror = function(event) {
            self.fullscreenError(event);
        };
    }
    return available;
};

/**
 * @method _fullscreenChanged
 * @param event
 * @private
 */
alex.utils.FullscreenMgr.prototype._fullscreenChanged = function(event){
    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    this.isFullScreen = fullscreenElement !== null && typeof fullscreenElement != "undefined";
    console.log("FullscreenMg -> fullscreenChanged -- isFullScreen: " + this.isFullScreen);
    if(!this.isFullScreen){
        //actually don't reset - its annoying otherwise!
        //well, ok then  but only if it is a mobile device.
        if(this.isMobile) this.activate(true);
    }
};

/**
 * @method fullscreenError
 * @param event
 */
alex.utils.FullscreenMgr.prototype.fullscreenError = function(event){
    console.log("* !!!! fullscreenError !!! * " + event);
    console.log("* event.message: " + event.message);
    this.fullscreenChanged(null);
};