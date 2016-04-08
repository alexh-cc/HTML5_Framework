/**
 * @class Button
 * @param p_upImgId {String|PIXI.Texture}
 * @param p_downImgId {String|PIXI.Texture}
 * @param p_disabledImgId {String|PIXI.Texture}
 */
alex.display.Button = function(p_upImgId, p_downImgId, p_disabledImgId){
    if(typeof p_upImgId === 'string'){
        this.txUp = PIXI.utils.TextureCache[p_upImgId];
    } else {
        //assume it was a PIXI.Texture!
        this.txUp = p_upImgId;
    }
    PIXI.Sprite.call(this, this.txUp);
    this.upScale = 1;
    this.downScale = 1;
    this._pressed = false;
    //!!! can't use my event dispatcher, have to use pixi one!
    this.evtPress = "press";//{type:"press"};
    this.evtRelease = "release";//{type:"release"};
    this.evtReleaseOutside = "release_outside";//{type:"release_outside"};
    // touch start
    this.touchstart = this._touchstart.bind(this);
    this.on('mousedown', this.touchstart);
    this.on('touchstart', this.touchstart);

    // touch end
    this.touchend = this._touchend.bind(this);
    this.on('mouseup', this.touchend);
    this.on('touchend', this.touchend);

    //_touchendoutside
    this.touchendoutside = this._touchendoutside.bind(this);
    this.on('mouseupoutside', this.touchendoutside);
    this.on('touchendoutside', this.touchendoutside);
    //
    this.enabled = true;//enable by default (annoying otherwise!)

    //create hit area - use resolution of the baseTexture!
    this.createHitArea();

    this.setAdditionalTextures(p_downImgId, p_disabledImgId);
};
alex.display.Button.prototype = Object.create(PIXI.Sprite.prototype);
alex.display.Button.prototype.constructor = alex.display.Button;

/**
 * @method setAdditionalTextures
 * @param p_downImgId
 * @param p_disabledImgId
 */
alex.display.Button.prototype.setAdditionalTextures = function(p_downImgId, p_disabledImgId) {
//NOTE center reg point only applies when no down state!
    var downType = typeof p_downImgId;

    if(!p_downImgId || downType === "undefined"){
        this.txDown = null;
        this.downScale = 0.95;
        //center it
        this.pivot.x = this.hitArea.width * 0.5;
        this.pivot.y = this.hitArea.height * 0.5;
        // this.hitArea.x =-this.pivot.x;
        // this.hitArea.y =-this.pivot.y;
    } else {
        if(downType === 'string'){
            this.txDown = PIXI.utils.TextureCache[p_downImgId];
        } else {
            // - allow it to be a texture!
            this.txDown = p_downImgId;
        }

        this.downScale = 1;
    }
    // disabled image
    var disabledType = typeof p_disabledImgId;
    if(!disabledType || disabledType === "undefined"){
        this.txDisabled = null;
    } else {
        if(disabledType === 'string'){
            this.txDisabled = PIXI.utils.TextureCache[disabledType];
        } else {
            // - allow it to be a texture!
            this.txDisabled = disabledType;
        }
    }
};

/**
 *
 */
alex.display.Button.prototype.createHitArea = function() {
    //this.resolution = this.txUp.baseTexture.resolution;
    var w = this.txUp.frame.width;//(this.txUp.frame.width / this.resolution);
    var h = this.txUp.frame.height;//(this.txUp.frame.height / this.resolution);
    this.hitArea = new PIXI.Rectangle(0, 0, w, h);
};

/**
 *
 * @private
 */
alex.display.Button.prototype._touchstart = function() {
    if(!this.txDown){
        this.scale.x = this.scale.y = this.downScale;
    } else {
        this.setTexture(this.txDown);
    }
    this._pressed = true;
    this.emit(this.evtPress);
};

/**
 *
 * @private
 */
alex.display.Button.prototype._touchend = function() {
    if(this._pressed){
        this._pressed = false;
        this.restore();
        this.emit(this.evtRelease);
    }   
};

/**
 *
 * @private
 */
alex.display.Button.prototype._touchendoutside = function() {
    if(this._pressed){
        this._pressed = false;
        this.restore();
        this.emit(this.evtReleaseOutside);
    }
};

/**
 *
 * @private
 */
alex.display.Button.prototype.restore = function() {
    if(this.downScale < 1){
        this.scale.x = this.scale.y = this.upScale;
    } 
    if(this.texture !== this.txUp) {
        this.setTexture(this.txUp);
    }
};

/**
 *
 * @private
 */
Object.defineProperty(alex.display.Button.prototype, 'enabled', {
    get: function() {
        return  this.interactive;
    },
    set: function(bool) {
        this.interactive = bool;
        this.buttonMode = bool;
        if(this.txDisabled){
            if(bool){
                this.setTexture(this.txUp);
            } else {
                this.setTexture(this.txDisabled);
            }
        }
    }
});
