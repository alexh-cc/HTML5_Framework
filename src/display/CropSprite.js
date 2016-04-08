/**
 * has a sprite that can crop vertically or horizontally
 * @class CropSprite
 * @constructor
 */
alex.display.CropSprite = function(sprite){
    this.sprite = null;
    this.useCopy = true;//if true then makes a new texture instance
    alex.utils.EventDispatcher.call(this);

    if(sprite){
        this.init({sprite: sprite});
    }
};
alex.display.CropSprite.prototype = Object.create(alex.utils.EventDispatcher.prototype);

/**
 * @method init
 * @param config
 */
alex.display.CropSprite.prototype.init = function(config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.copyFrame();
};

/**
 *
 */
alex.display.CropSprite.prototype.copyFrame = function() {
    this.realFrame = this.sprite.texture.frame;
    this.frame = new PIXI.Rectangle(
        this.realFrame.x,
        this.realFrame.y,
        this.realFrame.width,
        this.realFrame.height
    );
    //use a copy texture too!
    if(this.useCopy){
        var baseTexture = this.sprite.texture.baseTexture;
        this.sprite.texture = new PIXI.Texture(baseTexture, this.frame)
    } else {
        this.sprite.texture.frame = this.frame;
    }
};

/**
 *
 */
Object.defineProperties(alex.display.CropSprite.prototype,{
    width: {
        get: function(){
            return this.frame.width;
        },
        set: function(value){
            this.setWidth(value);
        }
    },
    height: {
        get: function(){
            return this.frame.height;
        },
        set: function(value){
            this.setHeight(value);
        }
    },
    heightAlt: {
        get: function(){
            return this.frame.height;
        },
        set: function(value){
            this.setHeightAlt(value);
        }
    },
    x: {
        get: function(){
            return this.sprite.x;
        },
        set: function(value){
            this.sprite.x = value;
        }
    },
    y: {
        get: function(){
            return this.sprite.y;
        },
        set: function(value){
            this.sprite.y = value;
        }
    },
    visible: {
        get: function(){
            return this.sprite.visible;
        },
        set: function(bool){
            this.sprite.visible = bool;
        }
    },
    fullHeight: {
        get: function(){
            return this.realFrame.height;
        }
    },
    fullWidth: {
        get: function(){
            return this.realFrame.width;
        }
    }
});

/**
 *
 * @param value
 */
alex.display.CropSprite.prototype.setWidth = function(value){
    this.frame.width = value;
    this.sprite.texture.crop.width = this.frame.width;
    this.sprite.texture.width = this.frame.width;
    this.sprite.texture.requiresUpdate = true;
    this.sprite.texture._updateUvs();
    this.sprite.width = this.frame.width;
};

/**
 *
 * @param value
 */
alex.display.CropSprite.prototype.setHeight = function(value){
    this.frame.height = value;
    this.sprite.texture.crop.height = this.frame.height;
    this.sprite.texture.height = this.frame.height;
    this.sprite.texture.requiresUpdate = true;
    this.sprite.texture._updateUvs();
    this.sprite.height = this.frame.height;
};

/**
 * I think this adjusts y position at the same time as height
 * @param value
 */
alex.display.CropSprite.prototype.setHeightAlt = function(value){
    this.setHeight(value);
    this.frame.y = this.realFrame.y + this.realFrame.height - value;
    this.sprite.texture.crop.y = this.frame.y;
};

/**
 *
 */
alex.display.CropSprite.prototype.restore = function(){
    this.sprite.texture.frame = this.realFrame;
    this.sprite.texture.crop.width = this.realFrame.width;
    this.sprite.texture.width = this.realFrame.width;
    this.sprite.texture.crop.y = this.realFrame.y;
    this.sprite.texture.crop.height = this.realFrame.height;
    this.sprite.texture.height = this.realFrame.height;
    this.sprite.texture.requiresUpdate = true;
    this.sprite.texture._updateUvs();
};

/**
 *
 * @param y
 * @param time
 * @param amount
 */
alex.display.CropSprite.prototype.slideUp = function(y, time, amount) {
    var fullH = amount || this.realFrame.height;
    var distY = (fullH / this.resolution);
    this.y = y + distY;
    this.height = 0;
    new TWEEN.Tween(this)
        .to({height: fullH, y: y}, time)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(this.onUp)
        .start();
};

/**
 *
 * @param y
 * @param time
 * @param amount
 */
alex.display.CropSprite.prototype.revealUp = function(y, time, amount) {
    var fullH = amount || this.realFrame.height;
    if(!time) time = 600;
    this.heightAlt = 0;
    new TWEEN.Tween(this)
        .to({heightAlt: fullH}, time)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(this.onUp)
        .start();
};

/**
 *
 * @param time
 * @param amount
 */
alex.display.CropSprite.prototype.revealDown = function(time, amount) {
    new TWEEN.Tween(this)
        .to({heightAlt: 0}, time)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(this.onDown)
        .start();
};

/**
 *
 * @param time
 * @param delay
 */
alex.display.CropSprite.prototype.slideDown = function(time, delay) {
    var y = this.y, delay = delay || 0;
    var targetY = y + (this.height / this.resolution);
    new TWEEN.Tween(this)
        .to({height: 0, y: targetY}, time)
        .delay(delay)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(this.onDown)
        .start();
};

alex.display.CropSprite.prototype.onUp = function() { };

alex.display.CropSprite.prototype.onDown = function() { };
