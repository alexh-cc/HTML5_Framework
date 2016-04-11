/**
 * @class DragSprite
 * @constructor
 */
cc.core.game.DragSprite = function(){
    this.useClickAndStick = false;
    this.minSize = 60;//TODO - configure this with devicePixelRatio?
    this.y = 0;
    this.x = 0;
    this.autoEnable = true;
};
cc.core.game.DragSprite.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);

/**
 *
 * @param config
 */
cc.core.game.DragSprite.prototype.init = function(config){

    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];

    if(!this.texture){
        this.texture = PIXI.utils.TextureCache[this.img];
    }
    this.root = new PIXI.Sprite(this.texture);

    this.root.anchor.x = 0.5;
    this.root.anchor.y = 0.5;
    this.root.x = this.x;
    this.root.y = this.y;
    this.startPt = new PIXI.Point(this.x, this.y);

    var w = this.texture.frame.width / this.resolution;
    var h = this.texture.frame.height / this.resolution;
    this.rect = new PIXI.Rectangle(0, 0, w, h);

    //apply a minimum size for hit area
    w = Math.max(w, this.minSize);
    h = Math.max(h, this.minSize);

    var y = h * -0.5;
    var x = w * -0.5;
    this.root.hitArea = new PIXI.Rectangle(x, y, w, h);

    //TODO - debug mode, draw the hit area

    this.initDrag();

    this.enable(this.autoEnable);
};

/**
 * this is where it all happens
 */
cc.core.game.DragSprite.prototype.initDrag = function(){
    var pt = new PIXI.Point(), global = new PIXI.Point(), dragOffset = new PIXI.Point();
    var root = this.root, self = this, modeDefault = 1, modeClick = 2;//dragging = 0,
    var pressTime = 0, useClickAndStick = this.useClickAndStick;
    var clickThreshold = 500, maxDist = 20;
    // - also click and stick
    this.dragging = 0;
    // * mousedown *

    // touch start
    this.touchstart = (function(event){
        var iData = event.data;
        iData.getLocalPosition(root, pt);
        dragOffset.x = pt.x;
        dragOffset.y = pt.y;
        if(useClickAndStick) {
            pressTime = game_shell.time;
            global.x = iData.global.x;
            global.y = iData.global.y;
        }
        if(self.dragging === 0){
            self.dragging = modeDefault;
            self.toFront();
        }
    }).bind(this);
    root.on('mousedown', this.touchstart);
    root.on('touchstart', this.touchstart);

    // * mousemove *
    this.touchmove = (function(event){
        var iData = event.data;
        if(self.dragging > 0){
            iData.getLocalPosition(root.parent, pt);
            root.x = pt.x - dragOffset.x;
            root.y = pt.y - dragOffset.y;
        }
    }).bind(this);
    root.on('mousemove', this.touchmove);
    root.on('touchmove', this.touchmove);

    // * mouseup *
    this.touchend = (function(event){
        var iData = event.data;
        //click and stick
        var didClick = false;
        //check for click and stick
        if(useClickAndStick){
            var clickTime = game_shell.time - pressTime;
            if(clickTime < clickThreshold){
                //check how far moved
                var distX = Math.abs(iData.global.x - global.x);
                var distY = Math.abs(iData.global.y - global.y);
                if(distX < maxDist && distY < maxDist){
                    didClick = true;
                }
            }
        }
        //
        if(didClick && self.dragging === modeDefault){
            self.dragging = modeClick;
        } else {
            if(self.dragging > 0){
                self.dropped.call(self);
            }
            self.dragging = 0;
            dragOffset.x = 0;
            dragOffset.y = 0;
        }
    }).bind(this);
    root.on('mouseup', this.touchend);
    root.on('touchend', this.touchend);
    root.on('mouseupoutside', this.touchend);
    root.on('touchendoutside', this.touchend);
};

/**
 *
 * @param bool
 */
cc.core.game.DragSprite.prototype.enable = function(bool){
    this.root.interactive = bool;
    this.root.buttonMode = bool;
};
/**
 *
 */
cc.core.game.DragSprite.prototype.updateRect = function(){
    this.rect.x = this.root.x - (this.rect.width * 0.5);
    this.rect.y = this.root.y - (this.rect.height * 0.5);
};

/**
 *
 */
cc.core.game.DragSprite.prototype.dropped = function(){
    this.updateRect();
    this.emit({type: 'dropped', rect: this.rect});
};

/**
 *
 */
cc.core.game.DragSprite.prototype.toFront = function(){
    var p = this.root.parent;
    this.root.removeFromParent();
    p.addChild(this.root);
};

/**
 *
 * @param pt
 */
cc.core.game.DragSprite.prototype.setStart = function(pt){
    this.startPt.x = pt.x;
    this.startPt.y = pt.y;
    this.root.x = pt.x;
    this.root.y = pt.y;
    this.updateRect();
};