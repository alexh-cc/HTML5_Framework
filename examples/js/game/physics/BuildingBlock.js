/**
 * @class BuildingBlock
 * @constructor
 */
game_shell.physics.BuildingBlock = function () {
    alex.game.GameObject.call(this);

    this.type = game_shell.physics.BodyTypes.BLOCK;

    this.radius = 1;

};
game_shell.physics.BuildingBlock.prototype = Object.create(alex.game.GameObject.prototype);
game_shell.physics.BuildingBlock.prototype.constructor = game_shell.physics.BuildingBlock;

/**
 * @method init
 * @param config
 */
game_shell.physics.BuildingBlock.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    var types = game_shell.physics.BodyTypes;
    this.createMultiShape(config);

    this.body.type = p2.Body.DYNAMIC;
    this.body.mass = 2;
    this.body.damping = 0.8;
    this.body.userData = this;
    this.body.updateMassProperties();
//
    this.graphics = this.makeSprite(config.image);
    this.graphics.pivot.x = this.graphics.texture.width * 0.5;
    this.graphics.pivot.y = this.graphics.texture.height * 0.5;

    this.needsDraw = true;

    this.updateFrame();

    this.setRadius();

};

/**
 *
 */
game_shell.physics.BuildingBlock.prototype.setRadius = function () {
    var longest = Math.max(this.frame.width, this.frame.height);
    if (longest < 10) {
        //console.log('longest: ', longest);
        longest = 60;
    }
    this.radius = longest / 2;
};

/**
 * in graphics scale, check if frame contain point
 * @param point
 */
game_shell.physics.BuildingBlock.prototype.containsPoint = function (point) {
    //do a rect check using radius
    var x = this.graphics.x;
    var left = x - this.radius;
    var right = x + this.radius;

    var inX = (point.x > left && point.x < right);
    if (!inX) return false;
    var y = this.graphics.y;
    var top = y + this.radius;
    var bottom = y - this.radius;
    var inY = (point.y > bottom && point.y < top);
    return inX && inY;
};