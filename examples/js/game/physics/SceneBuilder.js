/**
 * @class BlockBuilder
 * @constructor
 */
game_shell.game.SceneBuilder = function () {
    cc.core.screens.SceneBuilder.call(this);
};

/**
 * @method init
 * @param config
 */
game_shell.game.SceneBuilder.prototype.init = function (config) {
    cc.core.screens.SceneBuilder.prototype.init.call(this, config);

    this.scene.content = this.createContentLayer();

    this.scene.gameBus = new cc.core.utils.EventQueue();

    this.scene.camera = this.createCamera();

    this.scene.input = this.createUserInput();

};

/**
 * 
 * @returns {game_shell.game.UserInput}
 */
game_shell.game.SceneBuilder.prototype.createUserInput = function(){
    var input = new game_shell.game.UserInput();
    input.init({
        root: this.scene.root,
        content: this.scene.content,
        blocks: this.scene.blocks,
        scene: this.scene,//to callback on drop item
        screenW: this.screenW,
        screenH: this.screenH
    });
    return input;
};

/**
 * this is in order to facilitate scaling
 * @returns {PIXI.Container}
 */
game_shell.game.SceneBuilder.prototype.createContentLayer = function(){
    var content = new PIXI.Container();
    this.scene.root.addChild(content);
    return content;
};

/**
 *
 * @returns {cc.core.game.Camera}
 */
game_shell.game.SceneBuilder.prototype.createCamera = function () {
    var camera = new cc.core.game.Camera();

    var target = {x: 0, y: 0};

    var maxTrackV = 2000;//cap the vertical tracking - TODO - is this really necessary?
    //allow vertical tracking
    var moveY = true,
        maxY = this.screenH * -0.5,//25,//allow player to be nearer middle even at start
        minY = maxY - maxTrackV;

    camera.init({
        scene: this.scene.content,
        target: target,
        moveY: moveY, minY: minY, maxY: maxY,
        resolution: this.resolution,
        bgW: this.screenW,
        screenW: this.screenW, screenH: this.screenH
    });
    this.updateList.add(camera);
    camera.update(0);//move to start pos
    return camera;
};