/**
 * Base builder file for scene
 * @class SceneBuilder
 * @constructor
 */
alex.screens.SceneBuilder = function(){
    this.scene = null;
    this.root = null;
    this.screenW = 0;
    this.screenH = 0;
    this.resolution = 1;
};

/**
 * @method init
 * @param config
 */
alex.screens.SceneBuilder.prototype.init = function(config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];
    //
    this.scene.root = new PIXI.Container();
    this.scene.timeout = new alex.utils.DelayedAction();
    this.scene.updateList = this.updateList = new alex.utils.UpdateList();
    //add screen to update
    this.updateList.add(this.scene);
};