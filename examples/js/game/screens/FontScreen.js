game_shell.screens.FontScreen = function (config) {
    game_shell.screens.ExampleScreen.call(this, config)
};
game_shell.screens.FontScreen.prototype = Object.create(game_shell.screens.ExampleScreen.prototype);
game_shell.screens.FontScreen.prototype.constructor = game_shell.screens.FontScreen;

/**
 *
 */
game_shell.screens.FontScreen.prototype.run = function () {
    console.log('FontScreen');

    this.createBitmapField();

    this.createBackButton();
};

game_shell.screens.FontScreen.prototype.createBitmapField = function(){
    var bitmapText = new PIXI.extras.BitmapText("text using a fancy font!", {font: "35px VAGRoundedCyrLT"});
    bitmapText.x = -100;
    this.addChild(bitmapText);
};