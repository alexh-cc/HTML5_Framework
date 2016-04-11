/**
 * @class FontLoadState
 * @constructor
 */
cc.core.load.FontLoadState = function(){
    this.bulkLoader = null;
    this.loadedFonts = [];
    this.resolution = 1;
};

/**
 *
 * @param config
 */
cc.core.load.FontLoadState.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
};

/**
 *
 */
cc.core.load.FontLoadState.prototype.unload = function(){
    var i, n = this.loadedFonts.length;
    for(i = 0; i < n; i++){
        this.removeFont(this.loadedFonts[i]);
    }
};

/**
 * @method removeFont
 * @param fontName
 */
cc.core.load.FontLoadState.prototype.removeFont = function(fontName){
    var fontCache = PIXI.extras.BitmapText.fonts;
    //validate!
    if(fontCache.hasOwnProperty(fontName)){
       var fontData = fontCache[fontName];
        var chars = fontData.chars;
        for(var charCode in chars){
            if(chars.hasOwnProperty(charCode)){
                delete PIXI.utils.TextureCache[charCode];
            }
        }
        delete fontCache[fontName];
    }   
};

/**
 * @method load
 */
cc.core.load.FontLoadState.prototype.load = function(){
    var files = this.bulkLoader.fontManifest;
    var n = files.length;
    if(n === 0){
        this.bulkLoader.sequence.next();
    } else{
        var numLoaded = 0,
            loader = null,
            dataItem = null,
            bulkLoader = this.bulkLoader;
        // - why is this loading in parallel not series?
        //actually unlikely to load more than one at once since the character textures are keyed by charCode and would overwrite each other
        var self = this;
        for(var i = 0; i < n;i++){
            dataItem = files[i];
            loader = new cc.core.load.BitmapFontLoader(dataItem.src, this.resolution);
            loader.on('loaded', function(event){
                numLoaded++;
                bulkLoader.fontLoaded(numLoaded / n);
                //store the name
                self.loadedFonts[self.loadedFonts.length] = event.name;

                if(numLoaded === n){
                    bulkLoader.sequence.next();
                }
            });
            // - also handle error events!
            loader.on('error', function(event){
                numLoaded++;
                bulkLoader.fontLoaded(numLoaded / n);
                if(numLoaded === n){
                    bulkLoader.sequence.next();
                }
            });

            loader.load();
        }
    }
};