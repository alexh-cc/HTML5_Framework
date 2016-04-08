/**
 * @class Viewport
 * @constructor
 */
alex.utils.Viewport = function(){
    alex.utils.EventDispatcher.call(this);

    this.PORTRAIT = alex.settings.ORIENTATION_PORTRAIT;
    this.LANDSCAPE = alex.settings.ORIENTATION_LANDSCAPE;

    this.scaleModes = alex.settings.SCALE_MODES;

    this.settings = null;

    this.resize = alex.utils.Viewport.prototype.resize.bind(this);
};
alex.utils.Viewport.prototype = Object.create(alex.utils.EventDispatcher.prototype);
alex.utils.Viewport.prototype.constructor = alex.utils.Viewport;


//iframe modes:
//IFRAME_MODE_1 -> measure the parent window
//IFRAME_MODE_2 -> measure the iframe window (default)
alex.utils.Viewport.prototype.IFRAME_MODE_1 = 1;
alex.utils.Viewport.prototype.IFRAME_MODE_2 = 2;

/**
 * @method init
 * @param config
 */
alex.utils.Viewport.prototype.init = function(config){
    //flags
    this.CHECK_ORIENTATION = config.CHECK_ORIENTATION;
    this.DESKTOP_RESIZE = config.DESKTOP_RESIZE;
    this.isMobile = config.isMobile;
    //dimensions
    this.DEFAULT_W = config.DEFAULT_W;
    this.DEFAULT_H = config.DEFAULT_H;
    this.MIN_W = config.MIN_W;
    this.MIN_H = config.MIN_H;
    //DOM objects
    this.rotateImg = config.rotateImg;
    this.gameDiv = config.gameDiv;
    //devicePixelRatio used for resolution check
    this.pixelRatio = window.devicePixelRatio || 1;
    //window needs to refer to the top level window in iframes to get innerwidth & height
    this.isIframe = window.parent !== window;
    //set the iframe mode for measuring the window
    this.iframeMode = config.iframeMode || this.IFRAME_MODE_2;

    this.settings =  this.createSettings(config);

    this.eventResize = {type:"resize", wrongOrientation: false, settings: this.settings};
    //
    this.initResize();
    //
    this.setScaleMode(config.scaleMode || this.settings.SCALE_MATCH_HEIGHT);
};

/**
 *
 */
alex.utils.Viewport.prototype.initResize = function(){
    window.addEventListener('resize', this.resize, false);
    window.addEventListener('orientationchange', this.resize, false);
};

/**
 *
 */
alex.utils.Viewport.prototype.resize = function(){
    this.eventResize.settings = this.getSize();
    this.emit(this.eventResize);
};

/**
 *
 * @param mode
 */
alex.utils.Viewport.prototype.setScaleMode = function(mode){
    this.settings.scaleMode = mode;
    //console.log('setScaleMode: ' + mode);
    //choose the aspect handler
    switch(this.settings.scaleMode){
        case this.settings.SCALE_MATCH_HEIGHT:
            this.setAspect = this._matchHeight;
            break;
        case this.settings.SCALE_MATCH_WIDTH:
            this.setAspect = this._matchWidth;
            break;
    }
};

/**
 * enable choosing scaleMode (match height, match width, etc)
 * @param config
 */
alex.utils.Viewport.prototype.createSettings = function(config){
    var settings = {};
    settings.windowWidth = -1;
    settings.windowHeight = -1;
    settings.width = config.STAGE_W;
    settings.height = config.STAGE_H;
    settings.scale = 1;
    settings.shouldResize = (!(!this.isMobile && !this.DESKTOP_RESIZE));
    //portrait / landscape or either!
    settings.ORIENTATION_PORTRAIT = this.PORTRAIT;
    settings.ORIENTATION_LANDSCAPE = this.LANDSCAPE;//make this default!
    settings.ORIENTATION_ANY = 3;
    //choose orientation
    settings.orientation = config.orientation || settings.ORIENTATION_LANDSCAPE;
    ////scaleMode definitions
    settings.SCALE_MATCH_HEIGHT = this.scaleModes.MATCH_HEIGHT;//crop sides
    settings.SCALE_MATCH_WIDTH = this.scaleModes.MATCH_WIDTH;//crop vertical
    //TODO - support more scale modes

    //choose scalemode
    settings.scaleMode = -1;
    return settings;
};

/**
 *
 * @returns {Object || null}
 */
alex.utils.Viewport.prototype.getSize = function(){
    //***********************************************
    //show landscape only image on rotation...!
    var dimensions = this.checkWindowSize();
    //check rotation
    var showRotate = this.checkRotation(dimensions.width, dimensions.height);
    this.eventResize.wrongOrientation = showRotate;
    if(showRotate) return null;
    //
    this.setAspect(dimensions.width, dimensions.height);

    return this.settings;
};

/**
 * @method checkWindowSize
 */
alex.utils.Viewport.prototype.checkWindowSize = function(){
    var dstW, dstH;
    try{
        dstW = window.innerWidth;
        dstH = window.innerHeight;    
    } catch(e){
        //getting zero for both values in iWin framework - maybe an iframe issue?
        //default everything
        this.restoreDefaults();
        return null;
    }  
   
    if(this.isIframe && this.iframeMode === 1){
        //if iframe & iframeMode is 1 then reference parent window
        //but get an error when on a different domain!
        try{
            dstW = window.parent.innerWidth;
            dstH = window.parent.innerHeight;
        } catch(e){
            //use the parent window size then - leave as is
        }
    }

    this.settings.windowWidth = dstW;
    this.settings.windowHeight = dstH;

    return {
        width: dstW,
        height: dstH
    };
};

/**
 *
 */
alex.utils.Viewport.prototype.restoreDefaults = function(){
    this.settings.pixelWidth = this.DEFAULT_W;
    this.settings.pointWidth = this.DEFAULT_W;
    this.settings.windowWidth = this.DEFAULT_W;
    //
    this.settings.pixelHeight = this.DEFAULT_H;
    this.settings.pointHeight = this.DEFAULT_H;
    this.settings.windowHeight = this.DEFAULT_H;
};

//naming is all screwed now that portrait is in the equation
//width should just be called long edge
//height should just be called short edge



/**
 * @param dstW
 * @param dstH
 */
alex.utils.Viewport.prototype._matchWidth = function(dstW, dstH){
    var fullW = this.DEFAULT_W,
        fullH = this.DEFAULT_H;
    //
    if(!this.settings.shouldResize){
        dstW = fullW;
        dstH = fullH;
    }
    // ******************************************************
    // - allow expanding aspect ratio
    // ******************************************************

    var maxRatio = fullW / this.MIN_H,//
        aspectRatio = fullW / fullH,//the required aspect
        windowAspect = dstW / dstH;
        //
    this.settings.targetH = Math.ceil(dstW / aspectRatio);//store on settings for use in stage resize
    //
    if (windowAspect > aspectRatio) {
        if (windowAspect <= maxRatio) {
            aspectRatio = windowAspect;
        } else {
            aspectRatio = maxRatio;
        }
    }
    // ******************************************************
    var w = dstW, h = dstH; 
    //width always fixed to full width, height will crop
    var targetH = Math.ceil(dstW / aspectRatio);
    //if window height bigger than necessary
    if (dstH > targetH) {
        h = targetH;
    } else {
        //cap the width
        w = Math.ceil(aspectRatio * dstH);
    }

    // if(this.settings.orientation === this.settings.ORIENTATION_LANDSCAPE){
    //     //width always fixed to full width, height will crop
    //     var targetH = Math.ceil(dstW / aspectRatio);
    //     //if window height bigger than necessary
    //     if (dstH > targetH) {
    //         h = targetH;
    //     } else {
    //         //cap the width
    //         w = Math.ceil(aspectRatio * dstH);
    //     }
    // } else {
    //     //handle portrait!
    //     if (dstH > aspectRatio * dstW) {
    //         h = Math.ceil(aspectRatio * dstW);
    //     } else {
    //         w = Math.ceil(dstH / aspectRatio);
    //     }
    //     /*if (dstW > aspectRatio * dstH) {
    //         w = Math.ceil(aspectRatio * dstH);
    //     } else {
    //         h = Math.ceil(dstW / aspectRatio);
    //     }*/
    // }
    // ******************************************************
    //
    var scale = w / fullW;
    var stageW = Math.floor(w / scale);
    var stageH = Math.floor(h / scale);  
    //
    this.settings.pixelWidth = w;
    this.settings.pointWidth = stageW;
    this.settings.pixelHeight = h;
    this.settings.pointHeight = stageH;
    this.settings.scale = scale;
};

/**
 *
 * @param dstW
 * @param dstH
 * @private
 */
alex.utils.Viewport.prototype._matchHeight = function(dstW, dstH){       
    var fullW = this.DEFAULT_W,
        fullH = this.DEFAULT_H;
    //
    if(!this.settings.shouldResize){
        dstW = fullW;
        dstH = fullH;
    }
    // ******************************************************
    // allow cropping aspect ratio
    // ******************************************************
    
    //this is where it needs to consider whether in portrait!
    var isInPortrait = fullW < fullH;
    var minRatio, aspectRatio, windowAspect;
    if(isInPortrait){
        minRatio = this.MIN_H / fullW;
        aspectRatio = fullH / fullW;
        windowAspect = dstH / dstW;
    } else {
        minRatio = this.MIN_W / fullH;
        aspectRatio = fullW / fullH;
        windowAspect = dstW / dstH;
    }
    //
    if (windowAspect < aspectRatio) {
        if (windowAspect >= minRatio) {
            aspectRatio = windowAspect;
        } else {
            aspectRatio = minRatio;
        }
    }
    // ******************************************************
    var w = dstW, h = dstH, scale = 1;
    if(isInPortrait){
        //in this case we want to match the width
        if (dstH > aspectRatio * dstW) {
            h = Math.ceil(aspectRatio * dstW);
        } else {
            //destination height is less than what it needs to be, so adjust width accordingly
            w = Math.ceil(dstH / aspectRatio);
        }
        scale = w / fullW;
    } else {
        if (dstW > aspectRatio * dstH) {
            w = Math.ceil(aspectRatio * dstH);
        } else {
            h = Math.ceil(dstW / aspectRatio);
        }   
        scale = h / fullH;
    }
    //
    var stageW = Math.floor(w / scale);
    var stageH = Math.floor(h / scale);  
    //
    this.settings.pixelWidth = w;
    this.settings.pointWidth = stageW;
    this.settings.pixelHeight = h;
    this.settings.pointHeight = stageH;
    this.settings.scale = scale;
};

/**
 *
 * @param ww
 * @param hh
 * @returns {boolean}
 */
alex.utils.Viewport.prototype.checkRotation = function(ww, hh){
    var showRotate = false;
    if (this.CHECK_ORIENTATION){
        if(this.settings.orientation === this.settings.ORIENTATION_LANDSCAPE && hh > ww){
            showRotate = true;
        } else if(this.settings.orientation === this.settings.ORIENTATION_PORTRAIT && ww > hh){
            showRotate = true;
        }
    }

    if(showRotate){
        // hide the game divs
        this.gameDiv.style.display = "none";
        // show the rotate image
        this.rotateImg.style.display = "block";
    } else {
        //hide rotate image
        this.rotateImg.style.display = "none";
        this.gameDiv.style.display = "block";
    }
    return showRotate;
};

/**
 *
 */
Object.defineProperties(alex.utils.Viewport.prototype, {
        height: {
            get: function(){
                return this.settings.height;
            }
        },
        width: {
            get: function(){
                return this.settings.width;
            }
        }
    }
);

