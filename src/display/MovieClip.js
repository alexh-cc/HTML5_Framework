/**
 * @class MovieClip
 * @param textures
 * @constructor
 */
cc.core.display.MovieClip = function(textures) {
    PIXI.Sprite.call(this, textures[0]);
    //make it dispatch events
    // cc.core.utils.EventDispatcher.prototype.apply(this);
    //
    this.textures = textures;
    this.eventComplete = "complete";//{type:"complete"};
    this.loop = true;
    this._fps = 25;//made a setter for this!
    this.onComplete = null;
    this.currentFrame = 0;
    this.currentTime = 0;
    this.playing = false;
    this.duration = 0;
    this.lastFrame = 0;

    this.setDuration();
};
cc.core.display.MovieClip.prototype = Object.create( PIXI.Sprite.prototype );
cc.core.display.MovieClip.prototype.constructor = cc.core.display.MovieClip;

/**
 * @method gotoAndPlay
 * @param frameNumber
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.gotoAndPlay = function(frameNumber) {
    this.gotoAndStop(frameNumber);
    this.playing = true;
    return this;
};

/**
 * @method gotoAndStop
 * @param frameNumber
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.gotoAndStop = function(frameNumber) {
    this.playing = false;
    this.currentTime = frameNumber * (1000 / this._fps);
    this.currentFrame = frameNumber;
    //not sure where this technique came from?!
    var round = (this.currentFrame + 0.5) | 0;
    this.texture = this.textures[round % this.textures.length];
    return this;
};

/**
 *
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.stop = function()  {
    this.playing = false;
    return this;
};

/**
 *
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.play = function() {
    this.playing = true;
    return this;
};

/**
 *
 * @param fps
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.setFPS = function(fps) {
    this._fps = fps;
    this.setDuration();
    return this;
};

/**
 *
 */
cc.core.display.MovieClip.prototype.updateTransform = function()  {
    PIXI.Sprite.prototype.updateTransform.call(this);
};

/**
 *
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.setDuration = function(){
    var l = this.textures.length;
    this.duration = (1000 / this._fps) * l;
    this.lastFrame = l - 1;
    return this;
};

/**
 *
 * @param elapsed
 */
cc.core.display.MovieClip.prototype.update = function(elapsed){//milliseconds
    if(this.playing){
        this.currentTime += elapsed;
        if(this.currentTime > this.duration){
            //loop (make this optional!)
            if(this.loop){
                this.currentTime -= this.duration;
            } else {
                this.currentTime = this.duration;
                this.stop();
                this.isComplete = true;
                //callback
                if(this.onComplete) this.onComplete();
                //dispatch an event!
                this.emit(this.eventComplete);
            }
        }
        var frameIndex = Math.floor((this.currentTime / this.duration) * (this.lastFrame + 1));
//            //
        if(frameIndex > this.lastFrame) frameIndex = this.lastFrame;//not sure how to avoid including this line!
        //alternative would be var frameIndex = Math.floor((currentTime / duration) * lastFrame);
        this.currentFrame = frameIndex;
        this.texture = this.textures[this.currentFrame];
    }
};

/**
 *
 */
Object.defineProperties(cc.core.display.MovieClip.prototype, {
    totalFrames: {
        get: function() {
            return this.textures.length;
        }
    },
    fps: {
        get: function() {
            return this._fps;
        },
        set: function(value){
            this.setFPS(value);
        }
    }
});
