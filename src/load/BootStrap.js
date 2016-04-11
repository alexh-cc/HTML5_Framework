/**
 * Created by Alex on 2015-06-01.

example usage (in main game js)

    this.bootstrap = function () {
        //preload the loading bar!
        this.preload = new game_shell.BootStrap();
        this.preload.init({
            resolution: this.resolution,
            stageW: this.viewport.width,
            stageH: this.viewport.height,
            stage: this.stage.content//stage
        });
        var self = this;
        this.preload.on('complete', function(){
            self.start.call(self);
        });
        this.preload.start();
    };

 */
cc.core.load.BootStrap = function(){
    this.resolution = 2;//default
    this.stageW = 568;//default
    this.stage = null;
    this.barColor = 0xffffff;
};
cc.core.load.BootStrap.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);

cc.core.load.BootStrap.prototype.init = function(config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    //define the bundle to load
    this.bundle = {
        json: [],
        images: []
    };

    this.step = this.stageW / 2;

    this.createLoadBar();

    this.defineBundle();

};

//override this
cc.core.load.BootStrap.prototype.defineBundle = function(){
    //for example

    /*var imgFolder = cc.core.statics.IMG_DIR;
    var jsonFolder = cc.core.statics.JSON_DIR;

    this.addJson({
        src: imgFolder + 'loader_@' + this.resolution + 'x.json',
        id: 'loader'
    });

    this.addImage({
        src: imgFolder + 'loader_@' + this.resolution + 'x.png',
        id: 'loader'
    });*/

};

cc.core.load.BootStrap.prototype.start = function(){
    //start loading
    this.loadJson();
};

cc.core.load.BootStrap.prototype.addJson = function(item){
    this.bundle.json[this.bundle.json.length] = item;
};

cc.core.load.BootStrap.prototype.addImage = function(item){
    this.bundle.images[this.bundle.images.length] = item;
};

cc.core.load.BootStrap.prototype.loadJson = function () {
    var items = this.bundle.json;
    if(items.length === 0){
        this.loadImages();
    } else {
        var loader = new cc.core.load.JsonQueue();
        var self = this;
        loader.on('loaded', function (event) {
            game_shell.json[event.id] = event.jsonData;
            self.growBar();
        });
        loader.on('complete', function (event) {
            self.loadImages.call(self);
        });

        loader.load(items);

        var i, n = items.length, item;
        for(i =0; i < n; i++){
            item = items[i];
            game_shell.loader.urls.add(item);
        }
    }
};

cc.core.load.BootStrap.prototype.loadImages = function(){
    var items = this.bundle.images, n = items.length;

    this.loadedImages = 0;

    if(n === 0){
        this.finished();
    } else {
        for(var i = 0; i < n; i++){
            this.loadImage(items[i]);          
        }
    }
};

cc.core.load.BootStrap.prototype.loadImage = function(item){
    var id = item.id, self = this;
    game_shell.loader.urls.add(item);
    var baseTexture = PIXI.BaseTexture.fromImage(item.src, false);
    if(baseTexture.hasLoaded){
        this.imageLoaded(baseTexture, id)
    } else {
        baseTexture.on('loaded', function(event){
            self.imageLoaded(baseTexture, id);
        });
    }
}

cc.core.load.BootStrap.prototype.imageLoaded = function(baseTexture, id){
    this.loadedImages++;

    //check if there was a matching json file
    var isAtlas = false;
    var json = this.bundle.json, item, n = json.length;
    for(var i = 0; i < n; i++){
        item = json[i];
        if(item.id === id){
            isAtlas = true;
            break;
        }
    }
     
    //was it an atlas?
    if(isAtlas){
        var atlasJson = game_shell.json[id];
        game_shell.loader.imageLoad.addAtlasData(baseTexture, atlasJson);
    } else {
        PIXI.utils.TextureCache[id] = new PIXI.Texture(baseTexture)
    }

    if(this.loadedImages === this.bundle.images.length){
        this.growBar();
        this.finished();
    }
};

cc.core.load.BootStrap.prototype.createLoadBar = function(){
    var w = 10, h = 20;
    this.bar = new cc.core.display.Quad(w, h, this.barColor);
    this.bar.x = (this.stageW * -0.5);
    //put it at the bottom!
    this.bar.y = (this.stageH * 0.5) - (h * 0.5);
    this.stage.addChild(this.bar);
};

cc.core.load.BootStrap.prototype.growBar = function(){
    new TWEEN.Tween(this.bar).to({width: this.bar.width + this.step}, 50).start();
};

cc.core.load.BootStrap.prototype.finished = function(){
    this.stage.removeChild(this.bar);
    this.emit({type:'complete'});
};