/**
 * This i mostly for debugging!
 * @class Circle
 * @param p_radius
 * @param p_color
 * @constructor
 */
cc.core.display.Circle = function(p_radius, p_color){
	PIXI.Graphics.call(this);
	//
	this.tint = (typeof p_color !== "undefined")? p_color : 0xff0000;
	//now draw
	this.radius = (typeof p_radius !== "undefined")? p_radius : 50;
};
cc.core.display.Circle.prototype = Object.create( PIXI.Graphics.prototype );
cc.core.display.Circle.prototype.constructor = cc.core.display.Circle;
//
Object.defineProperty(cc.core.display.Circle.prototype, 'radius', {
    get: function() {
        return  this._radius;
    },
    set: function(value) {
        this._radius = value;
        this.clear();
        this.beginFill(this.tint);
        this.drawCircle(0, 0, this._radius);
        this.endFill();
    }
});