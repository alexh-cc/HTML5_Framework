/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/07/01
 * Time: 8:59 AM
 * To change this template use File | Settings | File Templates.
 */
cc.core.display.Stage = function(){  
    this.centerV = true;//whether to vertically align
    this.scaleModes = cc.core.settings.SCALE_MODES;
};

/**
 *
 * @param config
 */
cc.core.display.Stage.prototype.init = function(config){

    this.forceCanvas = config.forceCanvas;

    this.stage = new PIXI.Container();
    //
    this.createRenderer(config);
    //
    this.createHolder(config);
    //
    this.addToDOM();   
};

/**
 *
 * @param config
 */
cc.core.display.Stage.prototype.createRenderer = function(config){
    /*
    * @param [options] {object} The optional renderer parameters
    * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias. If not available natively then FXAA antialiasing is used
 * @param [options.forceFXAA=false] {boolean} forces FXAA antialiasing to be used over native. FXAA is faster, but may not always look as great
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass. If you wish to set this to false, you *must* set preserveDrawingBuffer to `true`.
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if
 *      you need to call toDataUrl on the webgl context.
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
    */
    // create a renderer instance, allow forcing canvas
    var settings = config.settings;
    if(typeof settings.backgroundColor === "undefined") settings.backgroundColor = 0x000000;
    if(this.forceCanvas){
        this.renderer = new PIXI.CanvasRenderer(config.width, config.height, settings);
    } else {
        this.renderer = PIXI.autoDetectRenderer(config.width, config.height, settings);
    }
};

/**
 * content holder - centered
 * @param config
 */
cc.core.display.Stage.prototype.createHolder = function(config){
    this.content = new PIXI.Container();
    this.content.x = config.width * 0.5;
    this.stage.addChild(this.content);
};

//TODO - rename to render?
cc.core.display.Stage.prototype.draw = function(){
    this.renderer.render(this.stage);
};

/**
 *
 * @param settings
 */
cc.core.display.Stage.prototype.resize = function(settings){
    var resolution = this.renderer.resolution;
    var pixelW = settings.pixelWidth / resolution;
    var pixelH = settings.pixelHeight / resolution;
    this.renderer.resize(pixelW, pixelH);//resize canvas
    // - set vertical position if its match width scaleMode
    if(settings.scaleMode === this.scaleModes.MATCH_WIDTH){
        var dif = (settings.windowHeight - settings.pixelHeight) * 0.5;
        if(dif > 0){
            var view = this.renderer.view;
            view.style.position = "absolute";
            view.style.top = dif + "px";
        }    
        this.content.y = pixelH * 0.5;       
    } else if(this.centerV){
        this.content.y = pixelH * 0.5; 
    }
    this.content.x = pixelW * 0.5;//center content horizontally
    this.content.scale.x = this.content.scale.y = settings.scale / resolution;//scale it

    this.draw();
};

/**
 *
 */
cc.core.display.Stage.prototype.addToDOM = function(){
    // add the renderer view element to the DOM
    var view = this.renderer.view;
    //get the parent div
    var gameDiv = document.getElementById("game");
    gameDiv.appendChild(view);
    view.style.marginLeft = "auto";
    view.style.marginRight = "auto";
    view.style.display = "block";
};