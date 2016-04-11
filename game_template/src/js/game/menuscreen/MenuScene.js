/**
 * @class TitleScene
 * @constructor
 */
game_shell.menu.MenuScene = function () {
    this.resolution = 1;
    this.root = null;
    this.timeout = null;
    this.updateList = null;
    this.screenW = 0;
    this.screenH = 0;
};
game_shell.menu.MenuScene.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);

/**
 *
 * @param config
 */
game_shell.menu.MenuScene.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.build();

};

/**
 *
 * @returns {game_shell.title.TitleBuilder}
 */
game_shell.menu.MenuScene.prototype.build = function () {
    var builder = new game_shell.menu.MenuBuilder();
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
game_shell.menu.MenuScene.prototype.update = function (delta) {

};