cc.core.game.CameraCull = function(){
	this.gameObjects = [];
	this.camera = null;
	this.enabled = true;
};

cc.core.game.CameraCull.prototype.init = function(config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    if(!this.enabled){
        this.update = function(){};
    }
};

cc.core.game.CameraCull.prototype.add = function(item){
	this.gameObjects[this.gameObjects.length] = item;
};

cc.core.game.CameraCull.prototype.update = function(delta){
    //**********************************
    var i, n = this.gameObjects.length, obj;
    //**************************************
    for (i = 0; i < n; i++) {
        obj = this.gameObjects[i];
        if(obj.graphics){
            obj.graphics.visible = (this.camera.isInFrame(obj.frame));
        }
    }     
};
