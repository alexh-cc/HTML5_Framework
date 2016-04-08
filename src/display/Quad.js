alex.display.Quad = function(p_w, p_h, p_color, p_alpha){
	PIXI.Graphics.call(this);
	//set defaults
	if(typeof p_color === "undefined") p_color = 0xFF0000;
	this.tint = p_color;
    if(typeof p_h === "undefined") p_h = 100;
	if(typeof p_w === "undefined"){
        p_w = 100;
    }
    if(typeof p_w === "object"){
        this.fromRect(p_w);
    } else {
        this._width = p_w;
        this._height = p_h;
    }
	//now draw
	this.drawQuad();
	//
    if(typeof p_alpha === "undefined") p_alpha = 1;
    this.alpha = p_alpha;
	//for interactivity, need to have a hitArea rect!
    //NOTE - ignoring the pivot issue for now...
    this.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);

};
alex.display.Quad.prototype = Object.create( PIXI.Graphics.prototype );
alex.display.Quad.prototype.constructor = alex.display.Quad;

alex.display.Quad.prototype.fromRect = function(rect){
    this._width = this.hitArea.width = rect.width;
    this._height = this.hitArea.height = rect.height;
    this.x = rect.x;
    this.y = rect.y;
    //now draw
    this.drawQuad();
};

alex.display.Quad.prototype.drawQuad = function(){
    this.clear();
    this.beginFill(this.tint);
    this.drawRect(0, 0, this._width, this._height);
    this.endFill();
};

Object.defineProperties(alex.display.Quad.prototype, {
    width: {
        get: function() {
            return  this._width;
        },
        set: function(value) {
            this._width = value;
            this.drawQuad();
            this.hitArea.width = value;
        }
    },
    height: {
        get: function() {
            return  this._height;
        },
        set: function(value) {
            this._height = value;
            this.drawQuad();
            this.hitArea.height = value;
        }
    } 
});