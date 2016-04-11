/**
 *
 * @param config
 * @constructor
 */
game_shell.screens.TitleScreen = function(config){
	cc.core.screens.ScreenBase.call(this, config);
};
game_shell.screens.TitleScreen.prototype = Object.create(cc.core.screens.ScreenBase.prototype);
game_shell.screens.TitleScreen.prototype.constructor = game_shell.screens.TitleScreen;

/**
 *
 */
game_shell.screens.TitleScreen.prototype.run  = function(){
    this.createScene(game_shell.title.TitleScene);
};