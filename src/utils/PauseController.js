/**
 * @class PauseController
 * @constructor
 */
cc.core.utils.PauseController = function(){
    this.isPaused = false;
    this.wrongOrientation = false;//whether it was going portrait that caused the pause (need to know whether to restart..)
    this.pause = this._pause.bind(this);
    this.onResized = this._resized.bind(this);
};

/**
 * 
 * @param config
 */
cc.core.utils.PauseController.prototype.init = function(config){
    this.updateLoop = config.updateLoop;
    this.renderLoop = config.renderLoop;
    this.snd = config.snd;

    this.initPageHidden();
};

/**
 * 
 */
cc.core.utils.PauseController.prototype.initPageHidden = function(){
    var self = this;
    // blur / focus
    window.addEventListener("blur", function(){
        self.pause.call(self, true);
    }, false);
    window.addEventListener("focus", function(){
        self.pause.call(self, false);
    }, false);
    //
    //************************************************
    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    //************************************************
    document.addEventListener(visibilityChange, function(e){
        if (document[hidden]) {
            self.pause.call(self, true);
        } else {
            self.pause.call(self, false);
        }
    });
};

/**
 * 
 * @param event
 * @private
 */
cc.core.utils.PauseController.prototype._resized = function(event){
    if(event.wrongOrientation){
        //pause the game
        if(!this.isPaused) {
            this.pause(true);
            this.wrongOrientation = true;
        }
    } else {
        //uh oh... don't necessarily want to restart it though!
        if(this.wrongOrientation){
            this.pause(false);
        }
        this.wrongOrientation = false;
    }
};

/**
 * 
 * @param p_state
 * @private
 */
cc.core.utils.PauseController.prototype._pause = function(p_state){
    if(p_state && !this.isPaused){
        console.log("PauseController -> " + p_state);
        TWEEN.pause();
        //pause run loop
        this.updateLoop.stop();
        //pause render loop
        this.renderLoop.stop();
        //mute sound
        this.snd.mute(true);
        this.isPaused = true;
    } else if(!p_state && this.isPaused){
        console.log("PauseController -> " + p_state);
        TWEEN.unpause();
        //restart run loop
        this.updateLoop.start();
        //restart render loop
        this.renderLoop.start();
        //unmute sound
        this.snd.mute(false);

        this.isPaused = false;
    }
};

