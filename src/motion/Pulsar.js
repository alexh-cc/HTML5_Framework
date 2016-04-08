/*
 -- example usage:

game_shell.screens.TitleScreen.prototype.startPulse  = function(){
    this.pulse = new alex.motion.Pulsar();
    this.pulse.init({
        scale: this.startBtn.scale,
        autostart: true
    });
    this.addUpdateItem(this.pulse);
};

*/
alex.motion.Pulsar = function(config){
	if(typeof config !== 'undefined'){
		this.init(config);
	}
};

/*
	config.target = sprite OR config.scale = sprite.scale
	config.maxScale - default = 1
	config.minScale - default = 0.95
	config.startScale - default = minScale
	config.autostart - default false
	config.rate - default = 0.002
*/
alex.motion.Pulsar.prototype.init = function(config){
	//just reference the scale object directly, not store the sprite...
	this.target = config.target;//actually could be useful to store the sprite too...
	if(config.hasOwnProperty('target')){
		this.scale = config.target.scale;
	} else if(config.hasOwnProperty('scale')){
		this.scale = config.scale;
	}
	this.maxScale = config.maxScale || 1.0;
	this.minScale = config.minScale || 0.95;
	this.scaleAmount = this.maxScale - this.minScale;
	var startScale = (config.hasOwnProperty('startScale'))? config.startScale : this.minScale;
	this.scale.x = this.scale.y = startScale;
	this.rate = config.rate || 0.002;

	this.active = config.autostart || false;

	this.count = (startScale === this.maxScale)? 0 : Math.PI;
};

alex.motion.Pulsar.prototype.start = function(){
	this.active = true;
};

alex.motion.Pulsar.prototype.stop = function(){
	this.active = false;
};

alex.motion.Pulsar.prototype.reset = function(){
	this.count = 0;
};

alex.motion.Pulsar.prototype.update = function(delta){
	if(this.active){
		this.count += delta * this.rate;
		var sin = Math.sin(this.count);
		var scale = this.minScale + (sin * this.scaleAmount);
		this.scale.x = this.scale.y = scale;
	}
};