/**
 * @class Toggle
 * @param p_onImg
 * @param p_offImg
 * @param p_on
 * @constructor
 */
cc.core.display.Toggle = function (p_onImg, p_offImg, p_on) {
    this.isOn = (p_on !== false);
    //*******************************
    // - support the arguments being textures

    this.txOn = this.getTexture(p_onImg);
    this.txOff = this.getTexture(p_offImg);

    this.upScale = 1;
    this.downScale = 0.95;

    //set start texture
    var tx = (this.isOn) ? this.txOn : this.txOff;
    PIXI.Sprite.call(this, tx);
    //
    //!!! can't use my event dispatcher, have to use pixi one!
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

    //center the anchor for consistency with buttons
    this.anchor.x = this.anchor.y = 0.5;

    //create hit area - use resolution of the baseTexture!
    this.createHitArea();

    this.enabled = true;

};
cc.core.display.Toggle.prototype = Object.create(PIXI.Sprite.prototype);
cc.core.display.Toggle.prototype.constructor = cc.core.display.Toggle;

/**
 * @method getTexture
 * @param p_img
 * @returns {PIXI.Texture}
 */
cc.core.display.Toggle.prototype.getTexture = function (p_img) {
    var tx = null;
    if (typeof p_img === 'string') {
        tx = PIXI.utils.TextureCache[p_img];
    } else {
        //assume it was a PIXI.Texture!
        tx = p_img;
    }
    return tx;
};

/**
 *
 */
cc.core.display.Toggle.prototype.createHitArea = function () {
    //this.resolution = this.txOn.baseTexture.resolution;
    var w = this.txOn.frame.width;
    var h = this.txOn.frame.height;
    var x = w * -this.anchor.x;
    var y = h * -this.anchor.x;
    this.hitArea = new PIXI.Rectangle(x, y, w, h);
};

/**
 *
 */
cc.core.display.Toggle.prototype._touchstart = function (event) {
    this._pressed = true;
    this.scale.x = this.scale.y = this.downScale;
};

/**
 *
 */
cc.core.display.Toggle.prototype._touchend = function (event) {
    if (this._pressed) {
        this._pressed = false;
        if(this.downScale < 1) this.scale.x = this.scale.y = this.upScale;
        this.toggle();
    }
};

/**
 *
 */
cc.core.display.Toggle.prototype._touchendoutside = function (event) {
    if (this._pressed) {
        if(this.downScale < 1) this.scale.x = this.scale.y = this.upScale;
        this._pressed = false;
    }
};

/**
 *
 */
cc.core.display.Toggle.prototype.toggle = function () {
    this.isOn = !this.isOn;
    if (this.isOn) {
        this.texture = this.txOn;
    } else {
        this.texture = this.txOff;
    }
    this.emit("toggle");
};

/**
 *
 */
cc.core.display.Toggle.prototype.setOff = function () {
    this.texture = this.txOff;
    this.isOn = false;
};

/**
 *
 */
cc.core.display.Toggle.prototype.setOn = function () {
    this.texture = this.txOn;
    this.isOn = true;
};

/**
 *
 */
Object.defineProperty(cc.core.display.Toggle.prototype, 'enabled', {
    get: function () {
        return this.interactive;
    },
    set: function (value) {
        this.interactive = value;
        this.buttonMode = value;
    }
});