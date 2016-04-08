game_shell.screens.SpineScreen = function (config) {
    game_shell.screens.ExampleScreen.call(this, config)
};
game_shell.screens.SpineScreen.prototype = Object.create(game_shell.screens.ExampleScreen.prototype);
game_shell.screens.SpineScreen.prototype.constructor = game_shell.screens.SpineScreen;

/**
 *
 */
game_shell.screens.SpineScreen.prototype.run = function () {
    console.log('SpineScreenScreen');

	// - create Gorilla
	this.spineSprite = this.createSpine();

    this.createBackButton();
};

game_shell.screens.SpineScreen.prototype.createSpine = function(){

    var spineSprite = new game_shell.SpineSprite();
    spineSprite.init({
        skeletonId: 'spineboy_skeleton',
        atlasId: 'spineboy',
        x: 0,
        y: 165
    });

    this.addChild(spineSprite.root);

    spineSprite.play("run", true);

	this.addUpdateItem(spineSprite);

    return spineSprite;
};