/**
 * @class ImageLoadState
 *
 * @constructor
 */
alex.load.ImageLoadState = function () {
    this.bulkLoader = null;

    this.imageLoader = new alex.load.ImageLoader();

    //store loaded assets
    this._assets = {};//TODO - is this actually used for anything?
    this._srcPaths = {};

    this.resolution = 1;
};

/**
 * @method init
 * @param config
 */
alex.load.ImageLoadState.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];
    this.imageLoaded = this._imageLoaded.bind(this);
    this.imageProgress = this._imageProgress.bind(this);
    this.loadComplete = this._loadComplete.bind(this);
};

/**
 *
 */
alex.load.ImageLoadState.prototype.load = function () {
    //allow not having images
    var files = this.bulkLoader.imgManifest;
    if (files.length === 0) {
        this.bulkLoader.sequence.next();
    } else {

        this.storeSourcePaths(files);

        this.imageLoader.on("loaded", this.imageLoaded);
        this.imageLoader.on("progress", this.imageProgress);
        this.imageLoader.on("complete", this.loadComplete);
        // load            
        this.imageLoader.load(files);
    }
};

/**
 *
 * @param event
 * @private
 */
alex.load.ImageLoadState.prototype._imageLoaded = function (event) {
    var img = event.img,
        success = event.success,
        assetData = event.data;

    //check for success?
    if (success) {
        if (assetData.hasOwnProperty("atlasData")) {
            this.addAtlas(img, assetData.atlasData, assetData.src);
        } else {
            //add it to the PIXI texture cache
            this.addTexture(img, assetData.src);
        }
    }

    this._assets[assetData.id] = img;

    this.imageProgress(event);
};

alex.load.ImageLoadState.prototype.getAsset = function (id) {
    return this._assets[id];
};

/**
 *
 * @param event
 * @private
 */
alex.load.ImageLoadState.prototype._imageProgress = function (event) {
    this.bulkLoader.imageLoaded(event.progress);
};

/**
 * source paths are used when unloading
 * @param files
 */
alex.load.ImageLoadState.prototype.storeSourcePaths = function (files) {
    var item, i, n = files.length;
    for (i = 0; i < n; i++) {
        item = files[i];
        this._srcPaths[item.id] = item.src;
    }
};

/**
 *
 * @private
 */
alex.load.ImageLoadState.prototype._loadComplete = function () {
    this.imageLoader.offAll();//remove all listeners!
    // now continue
    this.bulkLoader.sequence.next()
};

/**
 *
 * @param img
 * @param src
 * @returns {Texture}
 */
alex.load.ImageLoadState.prototype.addTexture = function (img, src) {
    var tx = null;
    //bare in mind that the img could be null if load failed!
    if (img !== null) {
        var baseTexture = this.createBaseTexture(img, src);
        tx = new PIXI.Texture(baseTexture);
        PIXI.utils.TextureCache[src] = tx;
    }
    return tx;
};

/**
 *
 * @param img
 * @param src
 * @returns {PIXI.BaseTexture}
 */
alex.load.ImageLoadState.prototype.createBaseTexture = function (img, src) {
    var baseTexture = new PIXI.BaseTexture(img, null, PIXI.utils.getResolutionOfUrl(src));
    baseTexture.imageUrl = src;
    PIXI.utils.BaseTextureCache[src] = baseTexture;
    return baseTexture;
};

/**
 *
 * @param p_img
 * @param p_json
 * @param p_src
 */
alex.load.ImageLoadState.prototype.addAtlas = function (p_img, p_json, p_src) {
    var baseTexture = this.createBaseTexture(p_img, p_src);
    this.addAtlasData(baseTexture, p_json);
};

/**
 *
 * @param baseTexture
 * @param p_json
 */
alex.load.ImageLoadState.prototype.addAtlasData = function (baseTexture, p_json) {
    var frameData = p_json.frames;
    var frameId, item;
    //check if it is an array!
    if (Array.isArray(frameData)) {
        var i, n = frameData.length;
        for (i = 0; i < n; i++) {
            item = frameData[i];
            this.addAtlasFrame(item, item.filename, baseTexture);
        }
    } else {
        for (frameId in frameData) {
            if (frameData.hasOwnProperty(frameId)) {
                item = frameData[frameId];
                this.addAtlasFrame(item, frameId, baseTexture);
            }
        }
    }
};

/**
 * @method addAtlasFrame
 * @param item
 * @param key
 * @param baseTexture
 * @returns {*}
 */
alex.load.ImageLoadState.prototype.addAtlasFrame = function (item, key, baseTexture) {
    var rect = item.frame,
        tx = null,
        resolution = this.resolution;
    if (rect) {
        var size = null;
        var trim = null;

        if (item.rotated) {
            size = new PIXI.Rectangle(rect.x, rect.y, rect.h, rect.w);
        }
        else {
            size = new PIXI.Rectangle(rect.x, rect.y, rect.w, rect.h);
        }
        //  Check to see if the sprite is trimmed
        if (item.trimmed) {
            trim = new core.Rectangle(
                item.spriteSourceSize.x / resolution,
                item.spriteSourceSize.y / resolution,
                item.sourceSize.w / resolution,
                item.sourceSize.h / resolution
            );
        }
        // flip the width and height!
        if (item.rotated) {
            var temp = size.width;
            size.width = size.height;
            size.height = temp;
        }
        size.x /= resolution;
        size.y /= resolution;
        size.width /= resolution;
        size.height /= resolution;
        tx = new PIXI.Texture(baseTexture, size, size.clone(), trim, item.rotated);
        PIXI.utils.TextureCache[key] = tx;
    }
    return tx;
};


alex.load.ImageLoadState.prototype.purge = function () {
    this._assets = {};
};
/**
 *
 * @param id
 */
alex.load.ImageLoadState.prototype.unloadImage = function (id) {
    delete this._assets[id];
    //need to remove any textures from the texturecache...
    //need the original src path to do that...
    var src = this._srcPaths[id];
    delete this._srcPaths[id];
    //
    this.unloadTextures(src);
};

/**
 * @param src
 */
alex.load.ImageLoadState.prototype.unloadTextures = function (src) {
    // - if it was an atlas then work out if any subtextures came from it
    // and delete the.
    var baseTextureCache = PIXI.utils.BaseTextureCache;
    var textureCache = PIXI.utils.TextureCache;
    var baseTexture = baseTextureCache[src];
    if (baseTexture) {
        var tx;
        for (var s in textureCache) {
            if (textureCache.hasOwnProperty(s)) {
                tx = textureCache[s];
                if (tx.baseTexture === baseTexture) {
                    delete textureCache[s];
                }
            }
        }
        delete baseTextureCache[src];
        baseTexture.destroy();
    }
};

/**
 *
 * @param items
 */
alex.load.ImageLoadState.prototype.unload = function (items) {
    var i, n = items.length, id;
    for (i = 0; i < n; i++) {
        id = items[i];
        this.unloadImage(id);
    }
    this.purge();
};
