cc.core.game.Camera = function(){
    this.maxY = 0;
    this.minY = 0;
    this.maxX = 0;
    this.minX = 0;
    this.trackX = 0;
    this.defaultTrackX = 0;
    this.trackY = 0;
    this.defaultTrackY = 0;
    this.moveY = false;
    /**
    * object the camera tracks (should be called target really!)
    */
    this.target = null;
};
cc.core.game.Camera.prototype = Object.create(cc.core.game.HitTest);
cc.core.game.Camera.prototype.constructor = cc.core.game.Camera;

/*

 config.scene <- container
 config.target <- player position (point)
 config.screenW <- width of viewport in points
 config.bgW <- width of background in points

 */
cc.core.game.Camera.prototype.init = function(config){
    //
    this.oldX = -100;
    this.defaultTrackX = this.trackX = 0;
    this.defaultTrackY = this.trackY = 0;
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];

    // - set limits - TODO - add a default bgW?
    this.maxX = this.bgW - (this.screenW * 0.5);
    this.minX = -this.maxX;//1024 - this.screenW;

    //TODO - perhaps this should start off in the right place...
    this.viewport = new PIXI.Rectangle(0, 0, this.screenW, this.screenH);

    this.isInFrame = this._frameCheckRect;

    //optional y axis movement
    if(this.moveY){
        this.update = this._updateBoth;
    } else {
        this.update = this._update;
    }
};

cc.core.game.Camera.prototype.reset = function(){
    this.trackX = this.defaultTrackX;
    this.trackY = this.defaultTrackY;
};

//default is to just move x
cc.core.game.Camera.prototype._update = function(delta){
    this.move(this.target.x);
};

//default is to just move x
cc.core.game.Camera.prototype.move = function(px){
    if (px !== this.oldX) {
        this.oldX = px;
        this.scrollX(px + this.trackX);
    }
};

cc.core.game.Camera.prototype._updateBoth = function(delta){
    this.moveBoth(this.target);
};

cc.core.game.Camera.prototype.moveBoth = function(pt){
    if (pt.x !== this.oldX) {
        this.oldX = pt.x;
        this.scrollX(pt.x + this.trackX);
    }
    if (pt.y !== this.oldY) {
        this.oldY = pt.y;
        this.scrollY(pt.y + this.trackY);
    }
};

cc.core.game.Camera.prototype.scrollX = function(px) {
    //console.log('px: ' + px)
    if(px > this.maxX){
        px = this.maxX;
    } else if(px < this.minX){
        px = this.minX;
    }
    // *= this.resolution;
    //this.scene.pivot.x = px;
    this.scene.x = -px;
    //update viewport
    this.viewport.x = px - (this.viewport.width * 0.5);
};

cc.core.game.Camera.prototype.scrollY = function(py) {
    //console.log('px: ' + px)
    if(py > this.maxY){
        py = this.maxY;
    } else if(py < this.minY){
        py = this.minY;
    }
    // *= this.resolution;
    //this.scene.pivot.x = px;
    this.scene.y = -py;
    //update viewport
    this.viewport.y = py - (this.viewport.height * 0.5);
};


cc.core.game.Camera.prototype._frameCheckPoint = function(x, y){
    if(this.moveY){
        var inX = (x > this.viewport.x && x < this.viewport.x + this.viewport.width);
        if(!inX) return false;
        var inY = (y > this.viewport.y && y < this.viewport.y + this.viewport.height);
        return inX && inY;
    } else {
        return (x > this.viewport.x && x < this.viewport.x + this.viewport.width);
    }    
};

cc.core.game.Camera.prototype._frameCheckRect = function(rect){
    if(this.moveY){
        return this.intersects(rect, this.viewport);
    } else {
        var obj1R = rect.x + rect.width, obj2R = this.viewport.x + this.viewport.width;
        return (obj1R > this.viewport.x && rect.x < obj2R);
    }    
};


cc.core.game.Camera.prototype.getX = function(){
    return this.scene.pivot.x;
};

cc.core.game.Camera.prototype.getY = function(){
    return this.scene.pivot.y;
};