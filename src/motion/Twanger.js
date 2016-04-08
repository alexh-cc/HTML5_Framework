//add this to framework! (motion)
alex.motion.Twanger = function(p_displayObj,p_max){
	alex.motion.Wiggle.call(this,p_displayObj,p_max);
	//**************************************************
	//TODO - use a config object!
	this.scale = 1.0;//flip to -1.0 to invert the twang!
	this.decay = 0.95;
	this.MAX_R = 0.349;//20;
	this.maxR = 0;
	this.minR = 0.017;//0
};
alex.motion.Twanger.prototype = Object.create(alex.motion.Wiggle.prototype);
alex.motion.Twanger.prototype.constructor = alex.motion.Twanger;

/**
 *
 */
alex.motion.Twanger.prototype.start = function() {
	this.maxR = this.MAX_R;
};

/**
 * getter function for location point!
 */
Object.defineProperty(alex.motion.Twanger.prototype, 'isTwanging', {
    get: function() {
        return this.maxR > 0;
    }
});

/**
 *
 */
alex.motion.Twanger.prototype.update = function(time) {
	//if (this.isTwanging) {
	var isMoving = false;
	if (this.maxR > this.minR) {
		this.wiggle(time);
		this.maxR *= this.decay;	
		if (this.maxR < 0.00001) {
			this.stopTwang();
			this.dispatchEvent({type:"complete"});
		}	
		isMoving = true;
	}	
	return isMoving;
};

/**
 *
 */
alex.motion.Twanger.prototype.wiggle = function(time) {
	this.counter += (this.speed * time);
	var l_nSin = Math.sin(this.counter);
	var l_nNewRotation = this.baseR - (l_nSin * this.maxR);
	this.img.rotation = l_nNewRotation * this.scale;
};

/**
 *
 */
alex.motion.Twanger.prototype.stopTwang = function() {
	this.maxR = 0;
	this.img.rotation = this.baseR;
};
