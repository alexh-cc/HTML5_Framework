/**
 * Base builder file for scene
 * @class SceneBuilder
 * @constructor
 */
cc.core.screens.SceneBuilder = function(){
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
cc.core.screens.SceneBuilder.prototype.init = function(config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];
    //
    this.scene.root = new PIXI.Container();
    this.scene.timeout = new cc.core.utils.DelayedAction();
    this.scene.updateList = this.updateList = new cc.core.utils.UpdateList();
    //add screen to update
    this.updateList.add(this.scene);
};