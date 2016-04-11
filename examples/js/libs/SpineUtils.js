/**
 *
 * @constructor
 */
cc.core.utils.SpineUtils = function () {
    this.jsonCache = null;
    this.imageLoader = null;
    this.spine = null;
};

/**
 *
 * @param config
 */
cc.core.utils.SpineUtils.prototype.init = function (config) {
    this.jsonCache = config.jsonCache;
    this.imageLoader = config.imageLoader;

    this.spine = PIXI.spine.SpineRuntime;

    this.spine.SkeletonData.prototype.purge = function () {
	    this.bones.length = 0;
	    this.slots.length = 0;
	    this.skins.length = 0;
	    this.events.length = 0;
	    this.animations.length = 0;
	    this.ikConstraints.length = 0;
	};

};

Object.defineProperty(PIXI, 'AnimCache', {
    get: function(){
        return PIXI.spine.loaders.atlasParser.AnimCache;
    }
});


/**
 *
 * @param spineJsonId
 * @param atlasId
 * @param p_animScale
 * @returns {*|PIXI.spine.Spine}
 */
cc.core.utils.SpineUtils.prototype.createSpineSprite = function (spineJsonId, atlasId, p_animScale) {
    if (!PIXI.AnimCache.hasOwnProperty(spineJsonId)) {
        if (Array.isArray(atlasId)) {
            this.createMultiAtlasSprite(spineJsonId, atlasId, p_animScale);
        } else {
            this.createSingleAtlasSprite(spineJsonId, atlasId, p_animScale);
        }
    }
    // create a spine sprite
    var spineSprite = PIXI.spine.Spine.fromAtlas(spineJsonId);
    //turn off autoupdate!
    spineSprite.autoUpdate = false;
    return spineSprite;
};

/**
 *
 * @param spineJsonId
 * @param atlasId
 * @param p_animScale
 */
cc.core.utils.SpineUtils.prototype.createSingleAtlasSprite = function (spineJsonId, atlasId, p_animScale) {
    var dataString = this.generateSingleAtlas(spineJsonId, atlasId);

    //need texturepath
    var baseURL = this.getBaseURL(atlasId);
    //TODO - work out how to handle cross origin!
    var crossOrigin = false;
    //TODO - work out what this callback is for!
    var callback = null;
    var loaderFunction = function(line, callback) {
        callback(PIXI.BaseTexture.fromImage(baseURL + line, crossOrigin));
    };
    // create a spine atlas using the loaded text and a spine texture loader instance 
    var spineAtlas = new this.spine.Atlas(dataString, loaderFunction, callback);
    // now we use an atlas attachment loader //
    var attachmentLoader = new this.spine.AtlasAttachmentParser(spineAtlas);
    // spine animation
    var spineJsonParser = new this.spine.SkeletonJsonParser(attachmentLoader);
    spineJsonParser.scale = p_animScale || 0.5;//default to this because designed at 2x, but pixi co-ords are at 1x;
    var spineData = spineJsonParser.readSkeletonData(this.jsonCache[spineJsonId]);
    PIXI.AnimCache[spineJsonId] = spineData;
    return spineData;
};

/**
 *
 * @param spineJsonId
 * @param atlasIdList
 * @param p_animScale
 */
cc.core.utils.SpineUtils.prototype.createMultiAtlasSprite = function (spineJsonId, atlasIdList, p_animScale) {
    var dataString = this.generateMultiAtlas(spineJsonId, atlasIdList);

    //TODO - work out how to fix this... need a base url for each one

    var self = this;
    // create a new instance of a spine texture loader for this spine object //
    var textureLoader = {
        load: function (page, file) {
            page.rendererObject = page.rendererObject = self.getBaseTextureByFileName(file);
        }
    };
    // create a spine atlas using the loaded text and a spine texture loader instance //
    var spineAtlas = new this.spine.Atlas(dataString, textureLoader);


    // now we use an atlas attachment loader //
    var attachmentLoader = new this.spine.AtlasAttachmentParser(spineAtlas);
    // spine animation
    var spineJsonParser = new this.spine.SkeletonJsonParser(attachmentLoader);
    spineJsonParser.scale = p_animScale || 0.5;//default to this because designed at 2x, but pixi co-ords are at 1x;
    var spineData = spineJsonParser.readSkeletonData(this.jsonCache[spineJsonId]);
    PIXI.AnimCache[spineJsonId] = spineData;
    return spineData;
};

/**
 *
 * @param spineJsonId
 * @param atlasIdList
 * @returns {string}
 */
cc.core.utils.SpineUtils.prototype.generateMultiAtlas = function (spineJsonId, atlasIdList) {
    var dataString = '';
    var i, atlasId, n = atlasIdList.length;
    for (i = 0; i < n; i++) {
        atlasId = atlasIdList[i];
        dataString += this.generateSingleAtlas(spineJsonId, atlasId, true);
    }
    //console.log(dataString)
    return dataString;
};

/**
 *
 * @param spineJsonId
 * @param atlasId
 * @param isMulti
 */
cc.core.utils.SpineUtils.prototype.generateSingleAtlas = function (spineJsonId, atlasId, isMulti) {
    var spineJsonData = this.jsonCache[spineJsonId];
    // *************************************************
    //get the atlas json
    var atlasJson = this.jsonCache[atlasId];
    // - need to get all skins, not just default!
    var partsList = [];
    var skins = spineJsonData.skins, skinSet;
    for (var s in skins) {
        if (skins.hasOwnProperty(s)) {
            skinSet = skins[s];
            this.getPartNames(skinSet, partsList);
        }
    }
    //generate the spine format atlas as string
    return this.generateSpineAtlas(partsList, atlasJson, isMulti);
};

/**
 *
 * @param parts
 * @param atlasJson
 * @param isMulti
 * @returns {string}
 */
cc.core.utils.SpineUtils.prototype.generateSpineAtlas = function (parts, atlasJson, isMulti) {
    var imageName = atlasJson.meta.image;
    var spineAtlas = "\n" + imageName + "\nformat: RGBA8888\nfilter: Linear,Linear\nrepeat: none\n";
    var indent = '  ';
    var type = '.png';
    //assume hash format...
    var frames = atlasJson.frames;
    var n = parts.length, i, item, frame, size, name, file;
    for (i = 0; i < n; i++) {
        name = parts[i];
        file = name + type;
        // - error check
        if (frames.hasOwnProperty(file)) {
            item = frames[file];
            frame = item.frame;
            size = item.sourceSize;
            spineAtlas += name + '\n';
            spineAtlas += indent + 'rotate: false\n';
            spineAtlas += indent + 'xy: ' + frame.x + ', ' + frame.y + '\n';
            spineAtlas += indent + 'size: ' + size.w + ', ' + size.h + '\n';
            spineAtlas += indent + 'orig: ' + size.w + ', ' + size.h + '\n';
            spineAtlas += indent + 'offset: 0, 0\n';
            spineAtlas += indent + 'index: -1\n';
            /*
             L_rear_thigh
             rotate: false
             xy: 895, 20
             size: 91, 148
             orig: 91, 149
             offset: 0, 0
             index: -1
             */
        } else {
            //TODO - now there could be more than one atlas - this warning can be misleading... frame might be in the other atlas!!
            if (!isMulti) console.log('!!! generateSpineAtlas -> Missing frame: ' + name);
        }
    }
    return spineAtlas;
};

/**
 *
 * @param itemHash
 * @param inputParts
 * @returns {*|Array}
 */
cc.core.utils.SpineUtils.prototype.getPartNames = function (itemHash, inputParts) {
    var parts = inputParts || [];
    for (var s1 in itemHash) {
        var item = itemHash[s1];
        for (var s2 in item) {
            if (parts.indexOf(s2) === -1) {
                parts[parts.length] = s2;
            }
        }
    }
    return parts;
};

/**
 *
 * @param atlasId
 * @returns {string}
 */
cc.core.utils.SpineUtils.prototype.getBaseURL = function(atlasId){
    var baseTexture = this.getBaseTextureForAtlas(atlasId);
    var imgSrc = baseTexture.source.src;
    var end = imgSrc.lastIndexOf('/') + 1;
    return imgSrc.substr(0, end);
};

/**
 *
 * @param imgName
 * @returns {*}
 */
cc.core.utils.SpineUtils.prototype.getBaseTextureByFileName = function (imgName) {
    var baseTexture = null;
    // - should be passing in the full path here, not just the name!!!!
    var imgSrc = game_shell.loader.urls.pathForFile(imgName);
    //
    if (PIXI.utils.BaseTextureCache.hasOwnProperty(imgSrc)) {
        baseTexture = PIXI.utils.BaseTextureCache[imgSrc];
    } else {
        console.log('SpineUtils Error - base texture not found for ' + imgName);
    }
    return baseTexture;
};

/**
 *
 * @param atlasId
 * @returns {*}
 */
cc.core.utils.SpineUtils.prototype.getBaseTextureForAtlas = function (atlasId) {
    var atlasJson = this.jsonCache[atlasId];
    //get a base texture of the whole atlas
    var imgName = atlasJson.meta.image;
    return this.getBaseTextureByFileName(imgName);
};

/**
 *
 */
cc.core.utils.SpineUtils.prototype.purge = function () {

    //TODO - spine.atlas has a dispose method

    for (var s in PIXI.AnimCache) {
        if (PIXI.AnimCache.hasOwnProperty(s)) {
            var skeletonData = PIXI.AnimCache[s];
            skeletonData.purge();
            delete PIXI.AnimCache[s];
        }
    }
};

// ******************************************************
// spine sprite wrapper
// ******************************************************

/**
 * 
 * @constructor
 */
game_shell.SpineSprite = function(){
    this.spineSprite = null;
    this.trackIndex = 0;
    this.eventComplete = {type: 'complete', timeline: null};
};
game_shell.SpineSprite.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);

/**
 *
 * @param config
 */
game_shell.SpineSprite.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.spineSprite = this.createArmature(config, config.x, config.y);
};

/**
 *
 * @param delta
 */
game_shell.SpineSprite.prototype.update = function(delta){
    //convert ms to secs
    this.spineSprite.update(delta * 0.001);
};

/**
 * @method createArmature
 * @param config
 *   config.skeletonId
 *   config.atlasId
 * @param x
 * @param y
 */
game_shell.SpineSprite.prototype.createArmature = function (config, x, y) {
    var spineSprite = game_shell.spineUtils.createSpineSprite(config.skeletonId, config.atlasId);
    spineSprite.x = x;
    spineSprite.y = y;
    return spineSprite;
};


/**
 * @method play
 * @param animationId
 * @param loop
 */
game_shell.SpineSprite.prototype.play = function (animationId, loop) {
    if (!animationId) animationId = 'idle';
    return this.spineSprite.state.setAnimationByName(this.trackIndex, animationId, loop);
};

game_shell.SpineSprite.prototype.stop = function () {
    //TODO
    //this.armature.animation.stop();
};

game_shell.SpineSprite.prototype.gotoAndStop = function (label) {
    //TODO
    //this.armature.animation.gotoAndStop(label);
};

game_shell.SpineSprite.prototype.animationComplete = function (event) {
    this.eventComplete.timeline = event.animationState.name;
    this.emit(this.eventComplete);
};

game_shell.SpineSprite.prototype.queue = function(animationId, loop){
    return this.spineSprite.state.addAnimationByName(this.trackIndex, animationId, loop, 0);
};

/**
 *
 * @returns {String}
 */
game_shell.SpineSprite.prototype.currentAnimation = function(){
    var track = this.spineSprite.state.tracks[this.trackIndex];
    return (track)? track.animation.name : null;
};

/**
 *
 */
game_shell.SpineSprite.prototype.dispose = function () {
    //TODO - dispose?
    //if (this.spineSprite) this.spineSprite.dispose();
    this.spineSprite.dispose();
    this.spineSprite = null;
};

Object.defineProperty(game_shell.SpineSprite.prototype, 'root', {
    get: function () {
        return this.spineSprite;
    }
});

