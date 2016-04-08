/**
 * For use with p2 physics game objects
 * @class GameLoop
 * @constructor
 */
alex.game.GameLoop = function(){
    this.gameObjects = [];
    this.itemsToRemove = [];//items to remove
    this.cameraCulling = false;
    this.userPreUpdate = false;
    //
    this.isPaused = true;
};

//
alex.game.GameLoop.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
};

alex.game.GameLoop.prototype.add = function(item){
    var i = this.gameObjects.length;
    this.gameObjects[i] = item;
    return i;
};

alex.game.GameLoop.prototype.remove = function(item){
    this.itemsToRemove[this.itemsToRemove.length] = item;
};

alex.game.GameLoop.prototype.start = function(){
    this.isPaused = false;
};

alex.game.GameLoop.prototype.stop = function(){
    this.isPaused = true;
};

alex.game.GameLoop.prototype.pause = function(bool){
    this.isPaused = bool;
};

//
alex.game.GameLoop.prototype.update = function(p_delta){
    if(!this.isPaused){
         //****************************
        //move game objects
        this.updateGameObjects(p_delta);
        //****************************
        //collision detect
        this.postUpdate(p_delta);
        //****************************
        //call draw on all game objects
        this.drawGameObjects();
        //
        this.input.check(p_delta);
    }
};

/*
 * move game objects
 */
alex.game.GameLoop.prototype.updateGameObjects = function(p_delta){
    //**********************************
    var i, n = this.gameObjects.length, obj;
    //**************************************
    for (i = 0; i < n; i++) {
        obj = this.gameObjects[i];
        if(this.userPreUpdate) obj.preUpdate();
        obj.update(p_delta);
        if (obj.remove) {
            this.itemsToRemove[this.itemsToRemove.length] = obj;
        }
    }
};

/*
 * bounds check
 */
alex.game.GameLoop.prototype.postUpdate = function(p_delta){
    //**************************************
    //**********************************
    var i, n = this.itemsToRemove.length, obj, index;
    for (i = 0; i < n; i++) {
        obj = this.itemsToRemove[i];
        index = this.gameObjects.indexOf(obj);
        if(index > -1){
            this.gameObjects.splice(index);
        }
    }
    this.itemsToRemove.length = 0;
    //**********************************
    n = this.gameObjects.length;
    //**************************************
    if(this.cameraCulling){
        for (i = 0; i < n; i++) {
            obj = this.gameObjects[i];
            if(obj.graphics){
                obj.graphics.visible = (this.camera.isInFrame(obj.frame));
            }
        }   
    }
    
};

/*
 * write all game co-ords to their display objects
 */
alex.game.GameLoop.prototype.drawGameObjects = function(){
    var i, obj, n = this.gameObjects.length;
    for (i = 0; i < n; i++) {
        obj = this.gameObjects[i];
        //NOTE - checks for needsDraw boolean
        if(obj.needsDraw) obj.draw();
    }
};

/*
 * 
 */
alex.game.GameLoop.prototype.getGameObject = function(id){
    var i, obj, n = this.gameObjects.length, target = null;
    for (i = 0; i < n; i++) {
        obj = this.gameObjects[i];
        if(obj.id === id){
            target = obj;
            break;
        }
    }
    return target;
};