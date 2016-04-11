/**
 * @class RandomTimer
 * @param p_interval
 * @constructor
 */
cc.core.utils.RandomTimer = function(p_interval){
	if(!p_interval) p_interval = 3000;
	cc.core.utils.Timer.call(this, p_interval);
	this.baseInterval = this.interval;
};
cc.core.utils.RandomTimer.prototype = Object.create(cc.core.utils.Timer.prototype);
cc.core.utils.RandomTimer.constructor = cc.core.utils.RandomTimer;

/**
 *
 */
cc.core.utils.RandomTimer.prototype.start = function(){
	cc.core.utils.Timer.prototype.start.call(this);
	this.currentTime = Math.floor(Math.random() * this.baseInterval);
};

/**
 * 
 */
cc.core.utils.RandomTimer.prototype.tick = function(){
	cc.core.utils.Timer.prototype.tick.call(this);
	//now randomise
	this.interval = this.baseInterval + Math.floor(Math.random() * this.baseInterval);
};