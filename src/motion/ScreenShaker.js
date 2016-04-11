/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/07/14
 * Time: 1:31 PM
 * To change this template use File | Settings | File Templates.
 */
cc.core.motion.ScreenShaker = function(p_target){
    cc.core.utils.EventDispatcher.call(this);
    var time = 0;
    this.rootPt = new PIXI.Point();
    this.target = p_target;
    if(this.target){
        this.rootPt.x = this.target.x;
        this.rootPt.y = this.target.y;
    }

    this.rangeX = 10;

    this.pulse = 0.005;

    this.duration = 3000;

    //TODO - why not on prototype?

    this.init = function(config){
        if(config.hasOwnProperty('rangeX')) this.rangeX = config.rangeX;
        if(config.hasOwnProperty('duration')) this.duration = config.duration;
        if(config.hasOwnProperty('pulse')) this.pulse = config.pulse;
        if(config.hasOwnProperty('target')) {
            this.target = config.target;
            this.rootPt.x = this.target.x;
            this.rootPt.y = this.target.y;
        }
    };

    this.update = function(p_delta){
        if(this.isActive){
            time += p_delta;
            var pulse = Math.sin(time * this.pulse);//0.005);
            var cos = Math.cos(time);
            this.target.x = this.rootPt.x + ((cos * this.rangeX) * pulse);
            if(time > this.duration){
                this.end();
            }
        }
    };

    this.activate = function(){
        time = 0;
        this.isActive = true;
        this.rootPt.x = this.target.x;
        this.rootPt.y = this.target.y;
    };

    this.end = function(){
        this.isActive = false;
        this.target.x = this.rootPt.x;
        this.dispatchEvent({type:"complete"});
    };

};
cc.core.motion.ScreenShaker.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.motion.ScreenShaker.prototype.constructor = cc.core.motion.ScreenShaker;