/**
 * @class TitleScene
 * @constructor
 */
game_shell.game.GameScene = function () {
    this.resolution = 1;
    this.root = null;
    this.timeout = null;
    this.updateList = null;
    this.screenW = 0;
    this.screenH = 0;
};
game_shell.game.GameScene.prototype = Object.create(alex.utils.EventDispatcher.prototype);

/**
 *
 * @param config
 */
game_shell.game.GameScene.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.build();

};

/**
 *
 * @returns {game_shell.title.TitleBuilder}
 */
game_shell.game.GameScene.prototype.build = function () {
    var builder = new game_shell.game.GameBuilder();
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
game_shell.game.GameScene.prototype.update = function (delta) {

};