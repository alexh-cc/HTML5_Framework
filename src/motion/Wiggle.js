cc.core.motion.Wiggle = function(p_displayObj, p_maxRotation){
	cc.core.utils.EventDispatcher.call(this);
	//*************************************
	this.img = p_displayObj;
	this.baseR = p_displayObj.rotation;
	//*********************************
	//TODO - use a config object!
	if(p_maxRotation === undefined) p_maxRotation = 0.15;
	this.maxR = Math.PI * p_maxRotation;
	this.speed = 0.017;
	//*********************************
	this.counter = 0;
	//*********************************
	this.duration = 30;

};
//*******************************
cc.core.motion.Wiggle.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.motion.Wiggle.prototype.constructor = cc.core.motion.Wiggle;

cc.core.motion.Wiggle.prototype.startWiggle = function() {
	this.counter = 0;
};

cc.core.motion.Wiggle.prototype.update = function(delta) {
	this.wiggle(delta);
};

cc.core.motion.Wiggle.prototype.wiggle = function(time) {
	this.counter += (this.speed * time);
	var l_nSin = Math.sin(this.counter);
	var l_nNewRotation = this.baseR - (l_nSin * this.maxR);
	this.img.rotation = l_nNewRotation;
	return l_nNewRotation;
};