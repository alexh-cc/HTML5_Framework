game_shell.screens.PhysicsScreen = function (config) {
    game_shell.screens.ExampleScreen.call(this, config)
};
game_shell.screens.PhysicsScreen.prototype = Object.create(game_shell.screens.ExampleScreen.prototype);
game_shell.screens.PhysicsScreen.prototype.constructor = game_shell.screens.PhysicsScreen;

/**
 *
 */
game_shell.screens.PhysicsScreen.prototype.run = function () {
    console.log('PhysicsScreen');

    this.createScene(game_shell.game.BlockScene);
    
    this.createBackButton();
};
