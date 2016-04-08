/**
 *
 * @constructor
 */
game_shell.title.TitleBuilder = function(){
    alex.screens.SceneBuilder.call(this);
};

/**
 *
 * @param config
 */
game_shell.title.TitleBuilder.prototype.init = function(config) {
    alex.screens.SceneBuilder.prototype.init.call(this, config);
    //
    this.createTextBtn('Title Screen', -100, -50, 'menu');
};

/**
 *
 * @param label
 * @param x
 * @param y
 * @param screenId
 * @returns {PIXI.Text}
 */
game_shell.title.TitleBuilder.prototype.createTextBtn = function(label, x, y, screenId){
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
