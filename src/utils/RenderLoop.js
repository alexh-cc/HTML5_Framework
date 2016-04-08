/**
 * @class RenderLoop
 * @constructor
 */
alex.utils.RenderLoop = function(){
    this.currentTime = 0;
    this.requestId = -1;
    this.stage = null;
    this.screenMgr = null;
};

/**
 *
 * @param p_config
 */
alex.utils.RenderLoop.prototype.init = function(p_config){
    this.stage = p_config.stage;
    this.screenMgr = p_config.screenMgr;
    //************************************************
    //render loop
    if(p_config.useStats){
        this.render = this._statsRender.bind(this);
    } else {
        this.render = this._defaultRender.bind(this);
    }
    
};

/**
 *
 */
alex.utils.RenderLoop.prototype._defaultRender = function(){
    var newTime = Date.now(), 
        elapsed = newTime - this.currentTime;
        this.currentTime = newTime;
        this.stage.draw();
        this.screenMgr.render(elapsed);
        //loop
        this.requestId = requestAnimationFrame(this.render);
};

/**
 *
 */
alex.utils.RenderLoop.prototype._statsRender = function(){
    stats.begin();
    var newTime = Date.now(), 
        elapsed = newTime - this.currentTime;
    this.currentTime = newTime;
    this.stage.draw();
    this.screenMgr.render(elapsed);
    stats.end();   
    //loop
    this.requestId = requestAnimationFrame(this.render);
};

/**
 *
 */
alex.utils.RenderLoop.prototype.start = function(){
    this.currentTime = Date.now();
    this.render();
};

/**
 *
 */
alex.utils.RenderLoop.prototype.stop = function(){
    cancelAnimationFrame(this.requestId);
};
