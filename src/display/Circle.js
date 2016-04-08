/**
 * This i mostly for debugging!
 * @class Circle
 * @param p_radius
 * @param p_color
 * @constructor
 */
alex.display.Circle = function(p_radius, p_color){
	PIXI.Graphics.call(this);
	//
	this.tint = (typeof p_color !== "undefined")? p_color : 0xff0000;
	//now draw
	this.radius = (typeof p_radius !== "undefined")? p_radius : 50;
};
alex.display.Circle.prototype = Object.create( PIXI.Graphics.prototype );
alex.display.Circle.prototype.constructor = alex.display.Circle;
//
Object.defineProperty(alex.display.Circle.prototype, 'radius', {
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