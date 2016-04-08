/**
 * @class TitleScreen
 * @param config
 * @constructor
 */
game_shell.screens.TitleScreen = function(config){
    game_shell.screens.ExampleScreen.call(this, config);
};
game_shell.screens.TitleScreen.prototype = Object.create(game_shell.screens.ExampleScreen.prototype);
game_shell.screens.TitleScreen.prototype.constructor = game_shell.screens.TitleScreen;

/**
 *
 */
game_shell.screens.TitleScreen.prototype.run  = function(){

    var img = this.createBackground();
    img.tint = 0x00ccff;

    // - create links to other screens
    this.createTextBtn('DragonBones', -200, -100, 'dragonbones');
    this.createTextBtn('Spine', -200, 0, 'spine');
    this.createTextBtn('Bitmap Text', -200, 100, 'font');

    this.createTextBtn('Drag n Drop', 100, -100, 'drag_n_drop');
    this.createTextBtn('Particles', 100, 0, 'particles');
    this.createTextBtn('Physics', 100, 100, 'physics');

};