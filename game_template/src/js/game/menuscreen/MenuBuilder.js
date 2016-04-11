/**
 *
 * @constructor
 */
game_shell.menu.MenuBuilder = function(){
    cc.core.screens.SceneBuilder.call(this);
};

/**
 *
 * @param config
 */
game_shell.menu.MenuBuilder.prototype.init = function(config) {
    cc.core.screens.SceneBuilder.prototype.init.call(this, config);
    //
    this.createTextBtn('Menu Screen', -100, -50, 'game');
};

/**
 *
 * @param label
 * @param x
 * @param y
 * @param screenId
 * @returns {PIXI.Text}
 */
game_shell.menu.MenuBuilder.prototype.createTextBtn = function(label, x, y, screenId){
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
