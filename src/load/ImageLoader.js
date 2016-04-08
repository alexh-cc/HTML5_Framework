/**
 * @class ImageLoader
 * @constructor
 */
alex.load.ImageLoader = function () {
    alex.utils.EventDispatcher.call(this);
    this.manifest = null;//array of objects with src and id strings > {src:"./img/bg1.jpg", id:"bg"},

    this.eventLoaded = {
        type: "loaded",
        progress: 0,
        img: null,
        success: false,
        data: null
    }

};
alex.load.ImageLoader.prototype = Object.create(alex.utils.EventDispatcher.prototype);
alex.load.ImageLoader.prototype.constructor = alex.load.ImageLoader;

/**
 * asset load manifest
 @param: items < Array of objects with src and id strings eg {src:"./img/bg1.jpg", id:"bg"},
 */
alex.load.ImageLoader.prototype.load = function (items) {
    this.numTotal = items.length;
    this.numLoaded = 0;
    //set loadstate flags
    var item, i;
    for (i = 0; i < this.numTotal; i++) {
        item = items[i];
        item.loadState = 0;
    }
    if (!this.manifest) {
        this.manifest = items;
    } else {
        this.manifest = this.manifest.concat(items);
    }
    this.loadNext();
};

/**
 *
 * @returns {Object}
 */
alex.load.ImageLoader.prototype.findNext = function () {
    //find next item that is not loaded
    var checkObj, assetData = null, n = this.manifest.length;
    for (var i = 0; i < n; i++) {
        checkObj = this.manifest[i];
        //is there an asset with this id?
        if (checkObj.loadState === 0) {
            assetData = checkObj;
            break;
        }
    }
    return assetData;
};

/**
 *
 */
alex.load.ImageLoader.prototype.loadNext = function () {
    var assetData = this.findNext();
    //create an Image instance to load the item
    if (assetData) {
        this.loadImage(assetData);
    } else {
        //load complete!
        this.manifest.length = 0;
        //switch to event dispatch model
        this.loadComplete();
    }
};

/**
 *
 * @param assetData
 * @returns {Image}
 */
alex.load.ImageLoader.prototype.loadImage = function (assetData) {
    var img = new Image();
    var self = this;
    img.onload = function () {
        img.onerror = null;//clear the onerror!
        assetData.loadState = 1;
        //switch to event dispatch model
        self.imageLoaded(img, assetData);
    };
    //configure a onError handler (if possible) to allow ignoring missing files
    img.onerror = function (e) {
        //self._assets[assetData.id] = null;
        //log or something
        console.log("ERROR - image load failed: " + assetData.src)
        console.log(e);
        assetData.loadState = 2;
        self.imageLoaded(null, assetData);
    };
    img.src = assetData.src;
    return img;
};

/**
 *
 * @param img
 * @param assetData
 */
alex.load.ImageLoader.prototype.imageLoaded = function (img, assetData) {
    this.numLoaded++;

    this.eventLoaded.progress = this.numLoaded / this.numTotal;
    this.eventLoaded.success = img !== null;
    this.eventLoaded.data = assetData;
    this.eventLoaded.img = img;
    this.emit(this.eventLoaded);

    this.loadNext();
};

/**
 *
 */
alex.load.ImageLoader.prototype.loadComplete = function () {
    this.emit({type: "complete"});
};

