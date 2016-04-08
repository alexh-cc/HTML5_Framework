/**
 * @class DragAndDropScreen
 * @param config
 * @constructor
 */
game_shell.screens.DragAndDropScreen = function (config) {
    game_shell.screens.ExampleScreen.call(this, config)
};
game_shell.screens.DragAndDropScreen.prototype = Object.create(game_shell.screens.ExampleScreen.prototype);
game_shell.screens.DragAndDropScreen.prototype.constructor = game_shell.screens.DragAndDropScreen;

/**
 *
 */
game_shell.screens.DragAndDropScreen.prototype.run = function () {
    console.log('DragAndDropScreen');

    this.createItem();

    this.createBackButton();
};

/**
 *
 * @returns {alex.game.DragSprite}
 */
game_shell.screens.DragAndDropScreen.prototype.createItem = function(){

    var useClickAndStick = !game_shell.system.isMobile;

    var item = new alex.game.DragSprite();
    item.init({
        texture: PIXI.utils.TextureCache['vader.png'],
        autoEnable: true,
        useClickAndStick: useClickAndStick,
        resolution: this.resolution
    });

    this.addChild(item.root);
    var self = this;
    item.on('dropped', function(event){
        var target = event.target;
        console.log('dropped!');
    });

    return item;
};