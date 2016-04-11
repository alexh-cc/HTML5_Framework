/**
 * @class Resolution
 * @constructor
 */
cc.core.utils.Resolution = function(){
	//resolution can be 1, 2 or 4
	//@1x = non-retina phone -> 480 x 320
	//@2x = retina phone or non-retina tablet -> ipad 1 (1024 x 768), iphone 4 (960 x 640), iPhone 5 (1136 x 640)
	//@4x = retina tablet -> ipad 3 (2048 x 1536)
    this.resolution = 1;
	//in order to truly support portrait, what this refers to as height
	//should just be called 'shorter edge'
	//and what this refers to as width
	//should just be called 'longer edge'
	this.minHeight2 = cc.core.settings.RES_2_MIN_H || 320;//640;
	this.minHeight4 = this.minHeight2 * 2;//640;//1280;
	//widths are for targetting ipad
	this.minWidth2 = cc.core.settings.RES_2_MIN_W || 512;//1024;//
	this.minWidth4 = this.minWidth2 * 2;//1024;//2048;

	this.maxResolution = cc.core.settings.MAX_RESOLUTON;

	this.pixelRatio = window.devicePixelRatio || 1;
};

/**
 * @method init
 * @param config
 */
cc.core.utils.Resolution.prototype.init = function(config){
	this.forceResolution = config.forceResolution;//normally force 2 for desktop maybe... or hack the minResolution2 to 321
	//this.renderer = config.renderer || {};
	if(this.forceResolution > -1) this.resolution = this.forceResolution;
};

/**
 * set resolution by comparing shortest screen edge to baseline
 */
cc.core.utils.Resolution.prototype.setByHeight = function(){
	//NOTE - this can't this use viewport values, runs before viewport is created - but why?
	if(this.forceResolution > -1){
		this.resolution = this.forceResolution;
	} else {

		var shortEdge = Math.min(window.innerHeight, window.innerWidth);

		var size = Math.round(shortEdge * this.pixelRatio);    
		if(size <= this.minHeight2){
			this.resolution = 1;
		} else if(size <= this.minHeight4){
			this.resolution = 2;
		} else {
			this.resolution = (this.maxResolution > 2)? 4 : 2;
		}	
	}	
	console.warn('resolution = ' + this.resolution);
	//this.renderer.resolution = this.resolution;
	return this.resolution;
};

/**
 * set resolution by comparing longest screen edge to baseline
 */
cc.core.utils.Resolution.prototype.setByWidth = function(){
	//NOTE - this can't this use viewport values, runs before viewport is created - but why?
	if(this.forceResolution > -1){
		this.resolution = this.forceResolution;
	} else {
		
		var longEdge = Math.max(window.innerHeight, window.innerWidth);

		var size = Math.round(longEdge * this.pixelRatio);    
		if(size <= this.minWidth2){
			this.resolution = 1;
		} else if(size <= this.minWidth4){
			this.resolution = 2;
		} else {
			this.resolution = (this.maxResolution > 2)? 4 : 2;
		}	
	}	
	console.log('Resolution -> setResolution: ' + this.resolution);
	//this.renderer.resolution = this.resolution;
	return this.resolution;
};