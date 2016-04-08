/**
 *
 * @param config
 * @constructor
 */
game_shell.screens.GameScreen = function(config){
    alex.screens.ScreenBase.call(this, config);
};
game_shell.screens.GameScreen.prototype = Object.create(alex.screens.ScreenBase.prototype);
game_shell.screens.GameScreen.prototype.constructor = game_shell.screens.GameScreen;

/**
 *
 */
game_shell.screens.GameScreen.prototype.run  = function(){
    this.createScene(game_shell.game.GameScene);
};