/**
 * @class RandomTimer
 * @param p_interval
 * @constructor
 */
alex.utils.RandomTimer = function(p_interval){
	if(!p_interval) p_interval = 3000;
	alex.utils.Timer.call(this, p_interval);
	this.baseInterval = this.interval;
};
alex.utils.RandomTimer.prototype = Object.create(alex.utils.Timer.prototype);
alex.utils.RandomTimer.constructor = alex.utils.RandomTimer;

/**
 *
 */
alex.utils.RandomTimer.prototype.start = function(){
	alex.utils.Timer.prototype.start.call(this);
	this.currentTime = Math.floor(Math.random() * this.baseInterval);
};

/**
 * 
 */
alex.utils.RandomTimer.prototype.tick = function(){
	alex.utils.Timer.prototype.tick.call(this);
	//now randomise
	this.interval = this.baseInterval + Math.floor(Math.random() * this.baseInterval);
};