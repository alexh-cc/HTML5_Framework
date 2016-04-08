var __extends = this.__extends || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }

        __.prototype = b.prototype;
        d.prototype = new __();
    };
var dragonBones;
(function (dragonBones) {
    (function (display) {
        var PixiDisplayBridge = (function () {
            function PixiDisplayBridge(resolution) {
                this.resolution = resolution;
            }

            PixiDisplayBridge.prototype.getVisible = function () {
                return this._display ? this._display.visible : false;
            };
            PixiDisplayBridge.prototype.setVisible = function (value) {
                if (this._display) {
                    this._display.visible = value;
                }
            };

            PixiDisplayBridge.prototype.getDisplay = function () {
                return this._display;
            };
            PixiDisplayBridge.prototype.setDisplay = function (value) {
                if (this._display == value) {
                    return;
                }
                var index = -1;
                if (this._display) {
                    var parent = this._display.parent;
                    if (parent) {
                        index = this._display.parent.children.indexOf(this._display);
                    }
                    this.removeDisplay();
                }
                this._display = value;
                this.addDisplay(parent, index);
            };

            PixiDisplayBridge.prototype.dispose = function () {
                this._display = null;
            };

            PixiDisplayBridge.prototype.updateTransform = function (matrix, transform) {
                //TODO - update this now pixi supports skewing
                this._display.x = matrix.tx;
                this._display.y = matrix.ty;
                this._display.rotation = transform.skewX;
                this._display.scale.x = transform.scaleX;
                this._display.scale.y = transform.scaleY;
            };

            PixiDisplayBridge.prototype.updateColor = function (aOffset, rOffset, gOffset, bOffset, aMultiplier, rMultiplier, gMultiplier, bMultiplier) {
                if (this._display) {
                    this._display.alpha = aMultiplier;
                }
            };

            PixiDisplayBridge.prototype.addDisplay = function (container, index) {
                var parent = container;
                if (parent && this._display) {
                    if (index < 0) {
                        parent.addChild(this._display);
                    } else {
                        parent.addChildAt(this._display, Math.min(index, parent.children.length));
                    }
                }
            };

            PixiDisplayBridge.prototype.removeDisplay = function () {
                if (this._display && this._display.parent) {
                    this._display.parent.removeChild(this._display);
                }
            };
            PixiDisplayBridge.RADIAN_TO_ANGLE = 180 / Math.PI;
            return PixiDisplayBridge;
        })();
        display.PixiDisplayBridge = PixiDisplayBridge;
    })(dragonBones.display || (dragonBones.display = {}));
    var display = dragonBones.display;

    (function (textures) {
        var PixiTextureAtlas = (function () {
            function PixiTextureAtlas(image, textureAtlasRawData, scale) {
                if (typeof scale === "undefined") {
                    scale = 1;
                }
                this._regions = {};
                this.image = image;
                this.scale = scale;
                this.parseData(textureAtlasRawData);
            }

            PixiTextureAtlas.prototype.dispose = function () {
                this.image = null;
                this._regions = null;
            };
            PixiTextureAtlas.prototype.getRegion = function (subTextureName) {
                return this._regions[subTextureName];
            };
            PixiTextureAtlas.prototype.parseData = function (textureAtlasRawData) {
                var textureAtlasData = dragonBones.objects.DataParser.parseTextureAtlasData(textureAtlasRawData, this.scale);
                this.name = textureAtlasData.__name;
                delete textureAtlasData.__name;

                for (var subTextureName in textureAtlasData) {
                    if (textureAtlasData.hasOwnProperty(subTextureName)) {
                        this._regions[subTextureName] = textureAtlasData[subTextureName];
                    }
                }
            };
            return PixiTextureAtlas;
        })();
        textures.PixiTextureAtlas = PixiTextureAtlas;
    })(dragonBones.textures || (dragonBones.textures = {}));
    var textures = dragonBones.textures;

    (function (factorys) {
        var PixiFactory = (function (_super) {
            __extends(PixiFactory, _super);
            function PixiFactory(resolution) {
                _super.call(this);
                this.resolution = resolution;
            }

            PixiFactory.prototype._generateArmature = function () {
                var container = new PIXI.Container();
                //normally you don't want the animation interactive
                container.interactiveChildren = false;
                return new dragonBones.Armature(container);
            };
            PixiFactory.prototype._generateSlot = function () {
                return new dragonBones.Slot(new display.PixiDisplayBridge(this.resolution));
            };
            PixiFactory.prototype._generateDisplay = function (textureAtlas, fullName, pivotX, pivotY) {
                var sprite = new PIXI.Sprite(PIXI.utils.TextureCache[fullName + ".png"]);
                sprite.pivot.x = pivotX;
                sprite.pivot.y = pivotY;
                return sprite;
            };
            return PixiFactory;
        })(factorys.BaseFactory);
        factorys.PixiFactory = PixiFactory;
    })(dragonBones.factorys || (dragonBones.factorys = {}));
    var factorys = dragonBones.factorys;
})(dragonBones || (dragonBones = {}));

/**
 * generate a dragonbones atlas out of a TexturePacker JSONArray or Hash format atlas
 * @param atlasJson
 * @param name
 * @param partsList
 * @returns {{}}
 */
dragonBones.parseJSONAtlas = function (atlasJson, name, partsList) {
    var bonesAtlas = {
        name: name,
        SubTexture: []
    };

    var n = partsList.length,
        subTextures = atlasJson.frames;

    var isArray = Array.isArray(subTextures);

    var k = (isArray) ? subTextures.length : 0;

    //part name is the image file name without file extension
    var partName, txData, filename, hasExtension;

    for (var i = 0; i < n; i++) {
        partName = partsList[i];
        hasExtension = partName.match(/.png/i) !== null;
        if (hasExtension) {
            filename = partName;
            partName = filename.substr(0, filename.length - 4);
        } else {
            filename = partName + ".png";
        }
        //find the subtexture
        if (isArray) {
            for (var j = 0; j < k; j++) {
                txData = subTextures[j];
                if (txData.filename === filename) {
                    bonesAtlas.SubTexture[i] = dragonBones.createAtlasFrame(txData, partName);
                    break;
                }
            }
        } else {
            for (var s in subTextures) {
                if (subTextures.hasOwnProperty(s) && s === filename) {
                    bonesAtlas.SubTexture[i] = dragonBones.createAtlasFrame(subTextures[s], partName);
                    break;
                }

            }
        }
    }
    return bonesAtlas;
};

/**
 * @method createAtlasFrame
 * @param txData
 * @param p_partName
 * @returns {Subtexture}
 */
dragonBones.createAtlasFrame = function (txData, p_partName) {
    var frame = txData.frame;
    //make a subTexture
    var subTexture = {name: p_partName};
    subTexture.x = frame.x;
    subTexture.y = frame.y;
    subTexture.width = frame.w;
    subTexture.height = frame.h;
    return subTexture;
};


dragonBones.fadeTime = 0;//.1;

/**
 * @method makeArmaturePIXI
 * @param config
 * @param skeletonJSON
 * @param atlasJson
 * @param texture
 */
dragonBones.makeArmaturePIXI = function (config, skeletonJSON, atlasJson, texture) {
    var skeletonId = config.skeletonId,
        armatureName = config.armatureName,
        animationId = config.animationId,
        atlasData = config.atlasJson || atlasJson,
        skeleton = config.skeletonJSON || skeletonJSON,
        partsList = config.partsList,
        textureData = dragonBones.parseJSONAtlas(atlasData, skeletonId, partsList);
    if (!texture) texture = null;

    var factory = new dragonBones.factorys.PixiFactory(config.resolution);
    var skeletonData = dragonBones.objects.DataParser.parseSkeletonData(skeleton);
    factory.addSkeletonData(skeletonData);
    var atlas = new dragonBones.textures.PixiTextureAtlas(texture, textureData);
    factory.addTextureAtlas(atlas);
    return factory.buildArmature(armatureName, animationId, skeletonId);

};

// ************************************************************************
// Bones sprite template
// ************************************************************************
/**
 *
 * @constructor
 */
dragonBones.BonesSprite = function () {
    this.armatureData = null;
    this.armature = null;
    this.bonesBase = null;
    this.fadeTime = dragonBones.fadeTime;//0.1;
    this.eventComplete = {type: 'complete', timeline: null};
};
dragonBones.BonesSprite.prototype = Object.create(alex.utils.EventDispatcher.prototype);

/**
 *
 * @param config
 */
dragonBones.BonesSprite.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.armature = this.createArmature(this.armatureData);
    //make the main container
    this.bonesBase = this.armature.getDisplay();
    this.bonesBase.x = config.x || 0;
    this.bonesBase.y = config.y || 0;
    //set first frame
    this.play(this.armatureData.animationId);
    this.armature.animation.advanceTime(0.001);
    this.armature.animation.stop();
};

/**
 * @method createArmature
 * @param armatureData
 *  armatureData.armatureName: 'fred',
 *  armatureData.skeletonJSON: game_shell.json['fred_skeleton'],
 *  armatureData.atlasJson: game_shell.json['fred_atlas'],
 *  armatureData.animationId: 'fred',
 *  armatureData.resolution: game_shell.resolution,
 *  armatureData.partsList: []
 * @returns armature
 */
dragonBones.BonesSprite.prototype.createArmature = function (armatureData) {
    var armature = dragonBones.makeArmaturePIXI(armatureData);
    //
    var evt = dragonBones.events.AnimationEvent.COMPLETE, self = this;
    armature.addEventListener(evt, function (event) {
        self.animationComplete(event);
    });
    dragonBones.animation.WorldClock.clock.add(armature);
    return armature;
};

/**
 * //TODO - maybe a 'loop' argument would help here!
 * @param id
 */
dragonBones.BonesSprite.prototype.play = function (id) {
    if (!id) id = 'idle';
    return this.armature.animation.gotoAndPlay(id, this.fadeTime);
};

dragonBones.BonesSprite.prototype.stop = function () {
    this.armature.animation.stop();
};

dragonBones.BonesSprite.prototype.gotoAndStop = function (label) {
    this.armature.animation.gotoAndStop(label);
};

dragonBones.BonesSprite.prototype.animationComplete = function (event) {
    this.eventComplete.timeline = event.animationState.name;
    this.emit(this.eventComplete);
};

/**
 *
 */
dragonBones.BonesSprite.prototype.dispose = function () {
    if (this.armature) this.armature.dispose();
    this.armature = null;
    this.bonesBase = null;
};


Object.defineProperty(dragonBones.BonesSprite.prototype, 'root', {
    get: function () {
        return this.bonesBase;
    }
});