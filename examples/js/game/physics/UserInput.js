/**
 * @class UserInput
 * @constructor
 */
game_shell.game.UserInput = function () {
    this.root = null;
    this.content = null;
    this.scene = null;
    this.blocks = null;
    this.world = null;
    this.currentItem = null;
    this.touchLayer = null;
    this.mouseConstraint = null;
    this.selectionList = [];
    this.nullBody = new p2.Body();
    this.localPoint = p2.vec2.create();
    this.touchPoint = {x: 0, y: 0};
    this.screenW = 0;
    this.screenH = 0;
    this.scaling = 100;//TODO - share value with GameObject
    //detect taps
    this.pressTime = 0;
    this.tapDuration = 100;
};

/**
 * @method init
 * @param config
 */
game_shell.game.UserInput.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.touchstart = this._touchstart.bind(this);
    this.touchmove = this._touchmove.bind(this);
    this.touchend = this._touchend.bind(this);

    this.touchLayer = this.createTouchLayer();

    this.addListeners();
};

/**
 *
 * @param event
 * @private
 */
game_shell.game.UserInput.prototype._touchstart = function(event){
    var iData = event.data;
    iData.getLocalPosition(this.content, this.touchPoint, iData.global);
    var block = this.getBlockByPoint(this.touchPoint);
    if(block){

        //convert touchpoint to physics space
        this.toPhysicsScale(this.touchPoint);

        this.mouseConstraint = this.createConstraint(block.body, this.touchPoint);

        this.currentItem = block;

        this.pressTime = game_shell.time;
    }
};

/**
 *
 * @param event
 * @private
 */
game_shell.game.UserInput.prototype._touchmove = function(event){
    if(this.currentItem){
        var iData = event.data;
        iData.getLocalPosition(this.content, this.touchPoint, iData.global);

        this.nullBody.position[0] = this.touchPoint.x / -this.scaling;
        this.nullBody.position[1] = this.touchPoint.y / -this.scaling;
    }
};

/**
 *
 * @param event
 * @private
 */
game_shell.game.UserInput.prototype._touchend = function(event){
    //TODO - multi-touch?
    if(this.currentItem){

        var isTap = this.checkTap();
        if(isTap){
            // this.currentItem.rotate();
        }

        this.dropItem();
    }
};

/**
 *
 * @param point
 * @returns {*}
 */
game_shell.game.UserInput.prototype.toPhysicsScale = function(point){
    point.x /= -this.scaling;
    point.y /= -this.scaling;
    return point;
};

/**
 *
 * @returns {boolean}
 */
game_shell.game.UserInput.prototype.checkTap = function(){
    return (game_shell.time - this.pressTime) < this.tapDuration;
};

/**
 *
 */
game_shell.game.UserInput.prototype.dropItem = function(){
    if(this.currentItem){
        //this.scene.blockDropped(this.currentItem);
    }
    this.currentItem = null;
    //kill the constraint
    this.destroyConstraint();
};

/**
 *
 */
game_shell.game.UserInput.prototype.destroyConstraint = function(){
    if(this.mouseConstraint){
        this.world.removeConstraint(this.mouseConstraint);
        this.mouseConstraint = null;
        this.world.removeBody(this.nullBody);
    }
};

/**
 *
 * @param body
 * @param cursor
 * @returns {p2.RevoluteConstraint}
 */
game_shell.game.UserInput.prototype.createConstraint = function(body, cursor){
    this.destroyConstraint();
    this.nullBody.position[0] = cursor.x;
    this.nullBody.position[1] = cursor.y;
    this.world.addBody(this.nullBody);

    var mouseConstraint = new p2.RevoluteConstraint(this.nullBody, body, {
        worldPivot: [cursor.x, cursor.y],
        maxForce: 1000 * body.mass
    });
    this.world.addConstraint(mouseConstraint);
    return mouseConstraint;
};

/**
 *
 * @param point
 * @returns {BuildingBlock}
 */
game_shell.game.UserInput.prototype.getBlockByPoint = function(point){
    var n = this.blocks.length, block, i, selected = null;
    this.selectionList.length = 0;
    for(i = 0 ; i < n;i++){
        block = this.blocks[i];
        if(block.containsPoint(point)){
            // selected = block;
            this.selectionList[this.selectionList.length] = block;
            //break;
        }
    }
    var numItems = this.selectionList.length;
    if(numItems > 0){
        if(numItems === 1){
            selected = this.selectionList[0];
        } else {
            // - find closest
            var shortest = this.screenW, dist;
            for(i = 0 ; i < numItems;i++) {
                block = this.selectionList[i];
                //avoid using sqrt by checking each axis individually
                //
                dist = Math.abs(block.graphics.x - point.x);
                if(dist < shortest){
                    shortest = dist;
                    selected = block;
                }
                //
                dist = Math.abs(block.graphics.y - point.y);
                if(dist < shortest){
                    shortest = dist;
                    selected = block;
                }

            }
        }
    }


    return selected;
};

/**
 *
 */
game_shell.game.UserInput.prototype.addListeners = function(){
    this.touchLayer.on('mousedown', this.touchstart);
    this.touchLayer.on('mousemove', this.touchmove);
    this.touchLayer.on('mouseup', this.touchend);
    this.touchLayer.on('touchstart', this.touchstart);
    this.touchLayer.on('touchmove', this.touchmove);
    this.touchLayer.on('touchend', this.touchend);
};

/**
 *
 */
game_shell.game.UserInput.prototype.createTouchLayer = function(){
    var layer = new alex.display.Quad(this.screenW, this.screenH, 0xffcc00);
    layer.x = this.screenW * -0.5;
    layer.y = this.screenH * -0.5;
    layer.alpha = 0;
    layer.interactive = true;
    this.root.addChildAt(layer, 0);

    return layer;
};


game_shell.game.UserInput.prototype.check = function(delta){

};
