/**
 * @class ScreenBase
 * @param config
 * @constructor
 */
alex.screens.ScreenBase = function(config){
	PIXI.Container.call(this);
	//these vars all come from config
    this.screenW = 0; this.screenH = 0;
    this.defaultW = 0;  this.defaultH = 0;
    this.resolution = 1;
    this.eventQueue = null;
    this.lastScreenId = null;
    this.snd = null;
    //get screenW, screenH, defaultW, defaultH - actual screen width in points
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
    //
    alex.utils.UpdateList.prototype.mixin(this);
    //add a delayedAction by default!
    this.delayedAction = new alex.utils.DelayedAction();
    this.addUpdateItem(this.delayedAction);
};
alex.screens.ScreenBase.prototype = Object.create(PIXI.Container.prototype);
alex.screens.ScreenBase.prototype.constructor = alex.screens.ScreenBase;

/**
 * set up screen content
 */
alex.screens.ScreenBase.prototype.run = function(){};

/**
 *
 * @param p_w
 * @param p_h
 */
alex.screens.ScreenBase.prototype.resize = function(p_w, p_h){
    this.screenW = p_w;
    this.screenH = p_h;
};

/**
 *
 */
alex.screens.ScreenBase.prototype.getSceneConfig  = function(){
    return {
        screenW: this.screenW, screenH: this.screenH,
        defaultW: this.defaultW, defaultH: this.defaultH,
        eventQueue: this.eventQueue,
        snd: this.snd,
        resolution: this.resolution
    };
};

/**
 * @param SceneClass {class}
 */
alex.screens.ScreenBase.prototype.createScene  = function(SceneClass){
    var scene = new SceneClass();
    scene.init(this.getSceneConfig());
    this.addChild(scene.root);
    this.addUpdateItem(scene.updateList);
    var self = this;
    scene.on('screen', function(event){
        self.newScreen(event.id);
    });
    return scene;
};

/**
 * convenience method
 * @param callback
 * @param p_ms
 */
alex.screens.ScreenBase.prototype.delay = function(callback, p_ms){
    this.delayedAction.delay(callback, p_ms);
};

/**
 * use this to run dragonBones content or anything needing to run off RAF
 * @param delta
 */
alex.screens.ScreenBase.prototype.render = function(delta){};

/**
 *
 * @param p_screenId
 */
alex.screens.ScreenBase.prototype.newScreen = function(p_screenId){
    var event;
    if(typeof p_screenId === 'string'){
        event = {type: "new_screen", screenId: p_screenId};
    } else {
        event = p_screenId;
        event.type = "new_screen";
    }
    this.eventQueue.queueEvent(event);
};

/**
 *
 */
alex.screens.ScreenBase.prototype.dispose = function(){
	//remove self!
	this.removeFromParent();
	//destroy screen content
    this.updateItems.length = 0;
    //
    this.delayedAction.dispose();
	// remove all listeners
    this.removeAllListeners();
};