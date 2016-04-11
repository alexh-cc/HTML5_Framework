/**
 * @class PhysicsBuilder
 * @constructor
 */
game_shell.physics.PhysicsBuilder = function () {
    this.world = null;//p2 physics world
    this.gameLoop = null;//GameLoop instance
    this.gameBus = null;//shared event dispatcher
    this.resolution = 1;
    this.gravity = -20;//10;
};

/**
 * @method init
 * @param config
 */
game_shell.physics.PhysicsBuilder.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.scene.world = this.world = this.createWorld();
    this.scene.input.world = this.world;

    this.scene.gameLoop = this.gameLoop = this.createGameLoop();

    this.parse(config.data);

};

/**
 *
 * @returns {PIXI.Graphics}
 */
game_shell.physics.PhysicsBuilder.prototype.createPerspectiveLayer = function(){
    var graphics = new PIXI.Graphics();
    this.scene.content.addChild(graphics);
    return graphics;
};

/**
 *
 */
game_shell.physics.PhysicsBuilder.prototype.createDebugLayer = function(){
    var debugLayer = new PIXI.Graphics();
    debugLayer.alpha = 0.5;
    debugLayer.lineStyle(1, 0x0);

    return debugLayer;
};

/**
 *
 */
game_shell.physics.PhysicsBuilder.prototype.parse = function(data){
    this.parseList(data.blocks);
    this.parseList(data.walls);
};

/**
 *
 */
game_shell.physics.PhysicsBuilder.prototype.parseList = function(objects){
    var n = objects.length, i;
    for(i = 0; i < n;i++) this.createPhysicsItem(objects[i]);
};

/**
 * @method createPhysicsItem
 * @param config
 * @returns {GameObject}
 */
game_shell.physics.PhysicsBuilder.prototype.createPhysicsItem = function(config){
    var type = config.type, types = game_shell.physics.BodyTypes;
    config.resolution = this.resolution;
    config.debugLayer = this.scene.debugLayer;
    config.perspectiveLayer = this.scene.perspectiveLayer;
    var physicsItem = null;
    switch(type){
        case types.POLYGON:
        case types.BLOCK:
            //this.setShape(config);
            physicsItem = this.createObject(game_shell.physics.BuildingBlock, config);
            this.scene.blocks.push(physicsItem);

            break;
        case types.PLATFORM:
            physicsItem = this.createObject(game_shell.physics.BasicPlatform, config);
            //remove hidden items from display list
            if(!config.image){
                physicsItem.graphics.removeFromParent();
            }
            physicsItem.needsDraw = false;
    }
    return physicsItem;
};

/**
 *
 */
game_shell.physics.PhysicsBuilder.prototype.createObject = function(TypeClass, config, parent){
    var gameObject = new TypeClass();
    gameObject.init(config);
    gameObject.world = this.world;
    //console.log('config.type: ' + config.type);
    if(!parent) parent = this.scene.content;
    //go in a physics layer
    parent.addChild(gameObject.graphics);
    this.world.addBody(gameObject.body);
    gameObject.uid = this.gameLoop.add(gameObject);
    gameObject.draw(true);//<- this fixes startup glitch!

    //transform must be valid before calling updateFrame
    //and this depends on having a parent
    gameObject.graphics.updateTransform();
    gameObject.updateFrame();

    return gameObject;
};

/**
 *
 * @param config
 * @returns {*}

game_shell.physics.PhysicsBuilder.prototype.setShape = function(config){
    var shapes = game_shell.physics.shapes[config.image];
    if(shapes){
        config.shapes = shapes;
    }
    return shapes;
};*/


/**
 *
 * @returns {p2.World}
 */
game_shell.physics.PhysicsBuilder.prototype.createWorld = function() {
    return new p2.World({
        gravity: [0, this.gravity]
    });
};

/**
 *
 * @returns {cc.core.game.GameLoop}
 */
game_shell.physics.PhysicsBuilder.prototype.createGameLoop = function() {
    var gameLoop = new cc.core.game.GameLoop();
    this.scene.updateList.add(gameLoop);
    gameLoop.init({
        cameraCulling: false,
        input: this.scene.input,
        camera: this.scene.camera
    });
    return gameLoop;
};

game_shell.physics.PhysicsBuilder.prototype.getTestData = function () {
    return {
        "name": "test",
        "walls": [
            {
                "x": -4.55,
                "y": 437.175,
                "angle": 0,
                "shapes": [
                    {
                        "x": 0,
                        "y": 0,
                        "width": 542.9,
                        "height": 47.85,
                        "angle": 0
                    }
                ],
                "type": 2
            },
            {
                "x": 1.925,
                "y": -25.375,
                "angle": 0,
                "shapes": [
                    {
                        "x": 0,
                        "y": 0,
                        "width": 542.9,
                        "height": 47.85,
                        "angle": 0
                    }
                ],
                "type": 2
            },
            {
                "x": -278.05,
                "y": 205.975,
                "angle": 0,
                "shapes": [
                    {
                        "x": 0,
                        "y": 0,
                        "width": 73.75,
                        "height": 413.55,
                        "angle": 0
                    }
                ],
                "type": 2
            },
            {
                "x": 277.9,
                "y": 206.925,
                "angle": 0,
                "shapes": [
                    {
                        "x": 0,
                        "y": 0,
                        "width": 73.75,
                        "height": 414,
                        "angle": 0
                    }
                ],
                "type": 2
            }
        ],
        "blocks": [
            {
                "x": 51,
                "y": 49.85,
                "angle": 0,
                "shapes": [
                    {
                        "x": 0,
                        "y": 0,
                        "width": 53.45,
                        "height": 59.5,
                        "angle": 0
                    }
                ],
                "type": 1,
                "image": "block_a.png"
            },
            {
                "x": 47.525,
                "y": 170.425,
                "angle": 0,
                "shapes": [
                    {
                        "x": 0,
                        "y": 0,
                        "width": 53.45,
                        "height": 59.5,
                        "angle": 0
                    }
                ],
                "type": 1,
                "image": "block_c.png"
            },
            {
                "x": 49.675,
                "y": 110.325,
                "angle": 0,
                "shapes": [
                    {
                        "x": 0,
                        "y": 0,
                        "width": 53.45,
                        "height": 59.5,
                        "angle": 0
                    }
                ],
                "type": 1,
                "image": "block_b.png"
            }
        ]
    }
};

