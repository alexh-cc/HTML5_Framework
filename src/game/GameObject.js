/**
 * @class GameObject
 * @param config
 * @constructor
 */
cc.core.game.GameObject = function(config){
    this.body = null;
    this.shape = null;
    this.graphics = null;
    this.type = -1;

    this.scaling = 100;
    //graphics offset
    this.offsetR = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    // only things that move have needsDraw true
    // (its not like a 'dirty' var, it doesn't get reset...)
    this.needsDraw = true;

    this.frame = new PIXI.Rectangle();//AABB
};
cc.core.game.GameObject.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);

/**
 * @method createMultiShape
 */
cc.core.game.GameObject.prototype.createMultiShape = function(config, isSensor){
    var x = config.x / this.scaling,
        y = config.y / this.scaling;
    //passing no mass value caused this to default to static body type
    this.body = new p2.Body({
        position:[x, y],
        mass: config.mass || 0
    });
    // all shapes should be rects
    var i, n = config.shapes.length, rect, shape, w, h, shapes = [];
    for(i =0; i < n; i++){
        rect = config.shapes[i];
        w = rect.width / this.scaling;
        h = rect.height / this.scaling;
        x = rect.x / this.scaling;
        y = rect.y / this.scaling;
        shape = new p2.Rectangle(w, h);
        shape.material = config.friction;
        if(isSensor) shape.sensor = true;
        this.body.addShape(shape, [x, y], rect.angle);
        shapes[i] = shape;
    }

    return shapes;
};

/**
 * @method createRectangle
 */
cc.core.game.GameObject.prototype.createRectangle = function(config){
    var w = config.width / this.scaling,
        h = config.height / this.scaling,
        x = config.x / this.scaling,
        y = config.y / this.scaling;

    var boxShape = new p2.Rectangle(w, h),
        boxBody = new p2.Body({
        position:[x, y]
    });
    boxBody.addShape(boxShape);
    boxBody.userData = this;
    this.body = boxBody;
    this.shape = boxShape;
    this.parse(config);

    return boxShape;
};

/**
 * @method createCircle
 */
cc.core.game.GameObject.prototype.createCircle = function(config){
    var diameter = config.diameter / this.scaling,
        x = config.x / this.scaling,
        y = config.y / this.scaling;
    var circleShape = new p2.Circle(diameter / 2);
    var circleBody = new p2.Body({
        position:[x, y]
    });
    circleBody.addShape(circleShape);
    circleBody.userData = this;
    this.frame.width = this.frame.height = config.diameter;
    this.body = circleBody; this.shape = circleShape;
    this.parse(config);
    return circleShape;
};

/**
 *
 * @param config
 * @returns {null}
 */
cc.core.game.GameObject.prototype.createPolygon = function (config) {
    this.body = new p2.Body({
        position: [0, 0]
    });
    var shape = config.shapes[0];

    var vertices = [];
    var i, vert, n = shape.vertices.length;
    for (i = 0; i < n; i++) {
        vert = shape.vertices[i];
        var x = vert.x / this.scaling;
        //invert the y!
        var y = vert.y / -this.scaling;
        vertices[i] = [x, y];
    }
    //uh-oh, they need to be anti clockwise!
    // - check whether clockwise

    var isClockwise = cc.core.utils.Maths.isClockwise(vertices);
    if(isClockwise){
        vertices.reverse();
    }

    //this seems to empy the array
    this.body.fromPolygon(vertices);

    this.parse(config);
    return shape.vertices;

};

/**
 * @method draw
 */
cc.core.game.GameObject.prototype.draw = function(force){
    if(!this.graphics) return;
    if(!this.needsDraw && !force) return;
    var x = this.graphics.position.x = -(this.body.position[0] * this.scaling);
    var y = this.graphics.position.y = -(this.body.position[1] * this.scaling);
    this.graphics.rotation =   this.body.angle;
    //
    this.frame.x = x - (this.frame.width * 0.5);
    this.frame.y = y - (this.frame.height * 0.5);
};

/**
 * @method parse
 * @param config
 */
cc.core.game.GameObject.prototype.parse = function(config){
    this.resolution = config.resolution;
    this.setPosition(config);
    this.body.angle = (config.angle) || 0;
    this.body.mass = (config.mass) || 1;
    //this.body.updateMassProperties();//NOTE - calling this will break EVERYTHING!

    //this bit is redundant actually
    if(config.rotated){
        this.offsetR = -this.body.angle;
        this.offsetX = config.imgX;
        this.offsetY = config.imgY;
    }
};

/**
 * @method makeSprite
 */
cc.core.game.GameObject.prototype.makeSprite = function(image){
    return new PIXI.Sprite(PIXI.utils.TextureCache[image]);
};

/**
 * @method updateFrame
 * @returns {Object}
 */
cc.core.game.GameObject.prototype.updateFrame = function(){
    //hmmm... how to get the x & y?
    //var bounds = this.graphics.getLocalBounds();
    var bounds = this.graphics.getBounds();
    //still not working with rotation!
    this.frame.width = bounds.width;
    this.frame.height = bounds.height;
    this.frame.x = bounds.x;
    this.frame.y = bounds.y;

    // if(this.graphics.anchor){
    //   if(this.graphics.anchor.x !== 0){
    //         this.frame.x -= (this.frame.width * this.graphics.anchor.x);
    //     }
    //     if(this.graphics.anchor.y !== 0){
    //         this.frame.y -= (this.frame.height * this.graphics.anchor.y);
    //     }  
    // }
    return bounds;
};

/**
 * @method 
 */
cc.core.game.GameObject.prototype.setPosition = function(pt){
    this.body.position[0] = (pt.x / this.scaling);// || 0;
    this.body.position[1] = (pt.y / this.scaling);// || 0;
};

/**
 * @method 
 */
Object.defineProperties(cc.core.game.GameObject.prototype, {
    x: {
        get: function(){
            return this.body.position[0] * this.scaling;
        }
    },
    y: {
        get: function(){
            return this.body.position[1] * this.scaling;
        }
    },
    height: {
        get: function(){
            return this.frame.height;
        }
    },
    shapes: {
        get: function(){
            return this.body.shapes;
        }
    },
    bottomEdge: {
        get: function(){
            return this.frame.y + this.frame.height;
        }
    },
    leftEdge: {
        get: function(){
            return this.frame.x;
        }
    },
    rightEdge: {
        get: function(){
            return this.frame.x + this.frame.width;
        }
    },
    topEdge: {
        get: function(){
            //TODO - don't use frame! breaks if hit area is smaller...
            var shapes = this.body.shapes;
            if(shapes.length === 1 && shapes[0].type === p2.Shape.RECTANGLE){
                return this.y + ((shapes[0].height * 0.5) * this.scaling);
            } else {
                return this.frame.y;
            }

            
        }
    }
});

// *****************************************************************
// stubs

cc.core.game.GameObject.prototype.update = function(time){ };

cc.core.game.GameObject.prototype.preUpdate = function(time){ };

// *****************************************************************

/**
 * draws multiple shapes, each with a different graphcis object
 * @method debugGraphics
 */
cc.core.game.GameObject.prototype.debugGraphics = function(shapes, positions, parent){
    var holder = parent || new PIXI.Container();
    var i, n = shapes.length, shape, gfx, position;
    for( i= 0; i < n; i++){
        shape = shapes[i];
        position = positions[i];
        gfx = this.graphicsRect(shape);
        gfx.x = -position.x; gfx.y = -position.y;//don't scale as in pixi co-ords already
        gfx.rotation = position.angle;
        holder.addChild(gfx);
    }

    return holder;
};

cc.core.game.GameObject.prototype.debugCircle = function(shape){
    var graphics = new PIXI.Graphics();
    var color = 0xff0000, fillAlpha =0.4;
    graphics.lineStyle(2, color);
    graphics.beginFill(color, fillAlpha);
    var radius = (shape.diameter * this.scaling) / 2;
    graphics.drawCircle(0, 0, radius);
    graphics.endFill();

    return graphics;
};

/**
 * creates a single graphics rect corresponding to a given box
 * @method graphicsRect
 */
cc.core.game.GameObject.prototype.graphicsRect = function(boxShape){
    var graphics = new PIXI.Graphics();
    var color = 0xff0000, fillAlpha =0.4;
    graphics.lineStyle(2, color);
    graphics.beginFill(color,fillAlpha);
    var w = boxShape.width * this.scaling;
    var h = boxShape.height * this.scaling;
    graphics.drawRect(-w/2, -h/2, w, h);
    graphics.endFill();

    return graphics;
};

/**
 * creates a single graphics rect for singe shape items
 * @method debugRect
 */
cc.core.game.GameObject.prototype.debugRect = function(shape){
    if(!shape) shape = this.shape;
    var gfx = this.graphicsRect(shape);
    gfx.x = -(this.body.position[0] * this.scaling);
    gfx.y = -(this.body.position[1] * this.scaling);
    gfx.rotation = this.body.angle;
    return gfx;
};

cc.core.game.GameObject.prototype.debugFrame = function(){
    var q = new cc.core.display.Quad();
    q.fromRect(this.frame);
    q.alpha = 0.5;
    return q;
}