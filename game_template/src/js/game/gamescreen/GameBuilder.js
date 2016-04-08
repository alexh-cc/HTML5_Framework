/**
 *
 * @constructor
 */
game_shell.game.GameBuilder = function(){
    alex.screens.SceneBuilder.call(this);
};

/**
 *
 * @param config
 */
game_shell.game.GameBuilder.prototype.init = function(config) {
    alex.screens.SceneBuilder.prototype.init.call(this, config);
    //
    this.createTextBtn('Game Screen', -100, -50, 'title');
};

/**
 *
 * @param label
 * @param x
 * @param y
 * @param screenId
 * @returns {PIXI.Text}
 */
game_shell.game.GameBuilder.prototype.createTextBtn = function(label, x, y, screenId){
    var text = new PIXI.Text(label, { font: 'bold italic 20px Arial', fill: '#F7EDCA' }, this.resolution);
    text.x = x; text.y = y;
    this.scene.root.addChild(text);
    text.interactive = text.buttonMode = true;
    var scene = this.scene;
    var handler = function(){
        scene.emit({type: 'screen', id: screenId});
    };
    text.on('mousedown', handler);
    text.on('touchstart', handler);
    return text;
};
