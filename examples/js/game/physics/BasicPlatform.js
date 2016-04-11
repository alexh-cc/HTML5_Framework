/**
 *
 * @constructor
 */
game_shell.physics.BasicPlatform = function() {
    cc.core.game.GameObject.call(this);
    this.type = game_shell.physics.BodyTypes.PLATFORM;
};
game_shell.physics.BasicPlatform.prototype = Object.create(cc.core.game.GameObject.prototype);
game_shell.physics.BasicPlatform.prototype.constructor = game_shell.physics.BasicPlatform;

/**
 *
 * @param config
 */
game_shell.physics.BasicPlatform.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];

    var shapes = this.createMultiShape(config);

    this.body.mass = 1;//default
    this.body.userData = this;
    this.parse(config);

    //I think this would always have an image?
    if(config.image){
        this.graphics = new this.makeSprite(config.image);
        this.graphics.anchor.x = this.graphics.anchor.y = 0.5;
        if(this.debug) this.debugGraphics(shapes, config.shapes, this.graphics);
    } else {
        this.graphics = this.debugGraphics(shapes, config.shapes);
        this.graphics.visible = false;
    }
    this.draw(true);
    this.updateFrame();
};

/**
 * make into sensor
 */
game_shell.physics.BasicPlatform.prototype.makeSensor = function(){
    var n = this.shapes.length, i, shape;
    for(i = 0; i < n; i++){
        shape = this.shapes[i];
        shape.sensor = true;
    }
};

