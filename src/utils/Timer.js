/**
 *
 * @param p_interval {number}  ms between ticks
 * @param p_repeat {number} total number of ticks
 * @constructor
 */
cc.core.utils.Timer = function(p_interval, p_repeat){
	cc.core.utils.EventDispatcher.call(this);
	//*******************************
	this.interval = p_interval || 1000;//default to once per second	
	if(typeof p_repeat != "undefined"){
		this.repeat = p_repeat;
	} else {
		this.repeat = -1;//infinite!
	}
	//*******************************
	this.running = false;
	this.currentTime = 0;
	this.tickCount = 0;
	//
	this.evt = {time:0,count:0};
	//*******************************
	//
	this.onTimer = function(p_count){
		//tick
	};
	//*******************************
	//
	this.onTimerComplete = function(){
		//the end!
	};
};
cc.core.utils.Timer.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.utils.Timer.prototype.constructor = cc.core.utils.Timer;

/**
 *
 */
cc.core.utils.Timer.prototype.start = function(){
	this.running = true;
	this.currentTime = 0;
	this.tickCount = 0;
};

/**
 *
 */
cc.core.utils.Timer.prototype.stop = function(){
	this.running = false;
};

/**
 *
 */
cc.core.utils.Timer.prototype.resume = function(){
	this.running = true;
};

/**
 *
 */
cc.core.utils.Timer.prototype.reset = function(){
	this.running = false;
	this.currentTime = 0;
	this.tickCount = 0;
};

/**
 *
 */
Object.defineProperties(cc.core.utils.Timer.prototype, {
    isComplete: {
        get: function () {
            return this.tickCount === this.repeat;
        }
    },
    remaining: {
        get: function() {
            return this.repeat - this.tickCount;
        }
    }
});

/**
 * update loop
 * @param elapsed
 */
cc.core.utils.Timer.prototype.update = function(elapsed){
	if(this.running){
		this.currentTime += elapsed;
		if(this.currentTime > this.interval){
			//tick!
			this.tick();
		}
	}	
};

/**
 * 
 */
cc.core.utils.Timer.prototype.tick = function(){
	this.currentTime -= this.interval;
	this.tickCount++;
	//
	this.evt.time = this.currentTime;
	this.evt.count = this.tickCount;
	this.evt.countDown = this.repeat - this.tickCount;
	this.evt.type = "timer";
	this.dispatchEvent(this.evt);
	this.onTimer(this.tickCount);
	//
	if(this.tickCount === this.repeat){
		this.stop();
		this.evt.type = "complete";
		this.dispatchEvent(this.evt);
		this.onTimerComplete();
	}	
};

/**
 * 
 */
cc.core.utils.Timer.prototype.dispose = function(){
	this.onTimer = null;
	this.onTimerComplete = null;
	cc.core.utils.EventDispatcher.prototype.dispose.call(this);
};