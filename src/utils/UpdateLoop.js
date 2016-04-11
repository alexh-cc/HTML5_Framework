/**
 *
 * @param fps
 * @constructor
 */
cc.core.utils.UpdateLoop = function(fps){
	this.gameLoopId = -1;//interval id
	this.fps = fps || 60;
	this.interval = 1000/this.fps;//60 fps
	this.accumulator = 0;
    this.currentTime = 0;//Date.now()
	//
	this.gameLoop = this._gameLoop.bind(this);

};

/**
 *
 */
cc.core.utils.UpdateLoop.prototype.start = function(){
    clearInterval(this.gameLoopId);
    this.currentTime = Date.now();
    this.gameLoopId = setInterval(this.gameLoop, this.interval);
};

/**
 *
 */
cc.core.utils.UpdateLoop.prototype.stop = function(){
    clearInterval(this.gameLoopId);
};

/**
 *
 * @param p_time
 */
cc.core.utils.UpdateLoop.prototype.updateGame = function(p_time){
    //override this
};

/**
 * 
 * @private
 */
cc.core.utils.UpdateLoop.prototype._gameLoop = function(){
	var newTime = Date.now();
    var elapsed = newTime - this.currentTime;
    this.currentTime = newTime;
    this.accumulator += elapsed;
    //use accumulator system for processing time with fixed time step
    var chunk = this.interval;
    while(this.accumulator > chunk){
        this.accumulator -= chunk;
        this.updateGame(chunk);
    }
};