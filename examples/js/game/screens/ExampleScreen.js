/**
 * @class ExampleScreen
 * @param config
 * @constructor
 */
game_shell.screens.ExampleScreen = function(config){
    cc.core.screens.ScreenBase.call(this, config);
};
game_shell.screens.ExampleScreen.prototype = Object.create(cc.core.screens.ScreenBase.prototype);
game_shell.screens.ExampleScreen.prototype.constructor = game_shell.screens.ExampleScreen;

/**
 * a simple navigation button
 * @method createTextBtn
 * @param label
 * @param x
 * @param y
 * @param screenId
 * @returns {PIXI.Text}
 */
game_shell.screens.ExampleScreen.prototype.createTextBtn = function(label, x, y, screenId){
    var text = new PIXI.Text(label, {
        font: 'bold italic 20px Arial',
        fill: '#F7EDCA'
    }, this.resolution);
    text.x = x; text.y = y;
    this.addChild(text);
    text.interactive = true;
    text.buttonMode = true;
    var self = this;
    var handler = function(){
        self.newScreen(screenId);
    };
    text.on('mousedown', handler);
    text.on('touchstart', handler);
    return text;
};

/**
 *
 */
game_shell.screens.ExampleScreen.prototype.createBackButton = function(){
    this.createTextBtn('< Back', -200, -150, 'title');
};


game_shell.screens.ExampleScreen.prototype.createBackground = function(){
    var bgPath = game_shell.loader.urls.getURL('bg');
    var img = new PIXI.Sprite(PIXI.utils.TextureCache[bgPath]);
    img.anchor.x = 0.5;
    img.anchor.y = 0.5;
    this.addChild(img);
    return img;
};