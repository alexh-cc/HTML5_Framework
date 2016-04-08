/**
 * @class TitleScene
 * @constructor
 */
game_shell.title.TitleScene = function () {
    this.resolution = 1;
    this.root = null;
    this.timeout = null;
    this.updateList = null;
    this.screenW = 0;
    this.screenH = 0;
};
game_shell.title.TitleScene.prototype = Object.create(alex.utils.EventDispatcher.prototype);

/**
 *
 * @param config
 */
game_shell.title.TitleScene.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.build();

};

/**
 *
 * @returns {game_shell.title.TitleBuilder}
 */
game_shell.title.TitleScene.prototype.build = function () {
    var builder = new game_shell.title.TitleBuilder();
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
game_shell.title.TitleScene.prototype.update = function (delta) {

};