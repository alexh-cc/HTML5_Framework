/**
 * @class BlockScene
 * @constructor
 */
game_shell.game.BlockScene = function () {
    this.isPaused = false;
    this.worldTime = 1000;
    this.blocks = [];
};
game_shell.game.BlockScene.prototype = Object.create(alex.utils.EventDispatcher.prototype);

/**
 * @method init
 * @param config
 */
game_shell.game.BlockScene.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.sceneBuilder = this.build();

    this.buildPhysics();

    this.start();
};

/**
 * 
 */
game_shell.game.BlockScene.prototype.start = function(){
    this.gameLoop.start();
};

/**
 *
 * @returns {game_shell.physics.PhysicsBuilder}
 */
game_shell.game.BlockScene.prototype.buildPhysics = function () {
    var builder = new game_shell.physics.PhysicsBuilder();
    var data = builder.getTestData();
    builder.init({
        scene: this,
        data: data,
        screenW: this.screenW, screenH: this.screenH,
        resolution: this.resolution
    });
    return builder;
};

/**
 *
 * @returns {game_shell.game.SceneBuilder}
 */
game_shell.game.BlockScene.prototype.build = function () {
    var builder = new game_shell.game.SceneBuilder();
    builder.init({
        scene: this,
        screenW: this.screenW, screenH: this.screenH,
        resolution: this.resolution
    });
    return builder;
};

/**
 *
 * @param delta
 */
game_shell.game.BlockScene.prototype.update = function (delta) {
    if (!this.isPaused ) {
        this.world.step(delta / this.worldTime);
        this.timeout.update(delta);
    }
    //this must be last
    this.gameBus.update(delta);
};
