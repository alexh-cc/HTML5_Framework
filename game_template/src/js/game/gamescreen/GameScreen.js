/**
 *
 * @param config
 * @constructor
 */
game_shell.screens.GameScreen = function(config){
    cc.core.screens.ScreenBase.call(this, config);
};
game_shell.screens.GameScreen.prototype = Object.create(cc.core.screens.ScreenBase.prototype);
game_shell.screens.GameScreen.prototype.constructor = game_shell.screens.GameScreen;

/**
 *
 */
game_shell.screens.GameScreen.prototype.run  = function(){
    this.createScene(game_shell.game.GameScene);
};