/**
 *
 * @param config
 * @constructor
 */
game_shell.screens.MenuScreen = function(config){
    alex.screens.ScreenBase.call(this, config);
};
game_shell.screens.MenuScreen.prototype = Object.create(alex.screens.ScreenBase.prototype);
game_shell.screens.MenuScreen.prototype.constructor = game_shell.screens.MenuScreen;

/**
 *
 */
game_shell.screens.MenuScreen.prototype.run  = function(){
    this.createScene(game_shell.menu.MenuScene);
};