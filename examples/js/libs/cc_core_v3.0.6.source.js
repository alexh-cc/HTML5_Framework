var cc = window.cc || {};
cc.core = {
  version: '3.0.6'//<- framework release version number
};
console.log('cc.core.js - version ' + cc.core.version);
cc.core.load = {};
cc.core.utils = {};
cc.core.display = {};
cc.core.ui = {};
cc.core.motion = {};
cc.core.screens = {};
cc.core.audio = {};
cc.core.game = {};
// *************************************************************
//add missing method to display object
// *************************************************************
PIXI.DisplayObject.prototype.removeFromParent = function () {
    if (this.parent) this.parent.removeChild(this);
};
PIXI.Container.prototype.contains = function (child) {
    return this.children.indexOf(child) > -1;
};

/**
 * add resolution handling to BitmapText, also numLines
 */
PIXI.extras.BitmapText.prototype.updateText = function () {
    var data = PIXI.extras.BitmapText.fonts[this._font.name];
    var pos = new PIXI.Point();
    var prevCharCode = null;
    var chars = [];
    var lastLineWidth = 0;
    var maxLineWidth = 0;
    var lineWidths = [];
    var line = 0;
    //Added this reference to resolution (AH)
    var scale = (this._font.size / data.size) * data.baseTexture.resolution;
    var lastSpace = -1;
    var maxLineHeight = 0;

    for (var i = 0; i < this.text.length; i++) {
        var charCode = this.text.charCodeAt(i);
        lastSpace = /(\s)/.test(this.text.charAt(i)) ? i : lastSpace;

        if (/(?:\r\n|\r|\n)/.test(this.text.charAt(i))) {
            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        if (lastSpace !== -1 && this.maxWidth > 0 && pos.x * scale > this.maxWidth) {
            PIXI.utils.removeItems(chars, lastSpace, i - lastSpace);
            i = lastSpace;
            lastSpace = -1;

            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        var charData = data.chars[charCode];

        if (!charData) {
            continue;
        }

        if (prevCharCode && charData.kerning[prevCharCode]) {
            pos.x += charData.kerning[prevCharCode];
        }

        chars.push({
            texture: charData.texture,
            line: line,
            charCode: charCode,
            position: new PIXI.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)
        });
        lastLineWidth = pos.x + (charData.texture.width + charData.xOffset);
        pos.x += charData.xAdvance;
        maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
        prevCharCode = charCode;
    }

    lineWidths.push(lastLineWidth);
    maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
    //Added this
    this.numLines = (line + 1);//<--- added this (AH)

    var lineAlignOffsets = [];

    for (i = 0; i <= line; i++) {
        var alignOffset = 0;

        if (this._font.align === 'right') {
            alignOffset = maxLineWidth - lineWidths[i];
        }
        else if (this._font.align === 'center') {
            alignOffset = (maxLineWidth - lineWidths[i]) / 2;
        }

        lineAlignOffsets.push(alignOffset);
    }

    var lenChars = chars.length;
    var tint = this.tint;

    for (i = 0; i < lenChars; i++) {
        var c = this._glyphs[i]; // get the next glyph sprite

        if (c) {
            c.texture = chars[i].texture;
        }
        else {
            c = new PIXI.Sprite(chars[i].texture);
            this._glyphs.push(c);
        }

        c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
        c.position.y = chars[i].position.y * scale;
        c.scale.x = c.scale.y = scale;
        c.tint = tint;

        if (!c.parent) {
            this.addChild(c);
        }
    }

    // remove unnecessary children.
    for (i = lenChars; i < this._glyphs.length; ++i) {
        this.removeChild(this._glyphs[i]);
    }

    this.textWidth = maxLineWidth * scale;
    this.textHeight = (pos.y + data.lineHeight) * scale;
    this.maxLineHeight = maxLineHeight * scale;
};

/**
 * Grabs an interaction data object from the internal pool
 *
 * @param touchEvent {EventData} The touch event we need to pair with an interactionData object
 *
 * @private
 */
PIXI.interaction.InteractionManager.prototype.getTouchData = function (touchEvent){
    var touchData = this.interactiveDataPool.pop();
    if(!touchData) {
        touchData = new PIXI.interaction.InteractionData();
    }
    touchData.identifier = touchEvent.identifier;
    this.mapPositionToPoint( touchData.global, touchEvent.clientX, touchEvent.clientY );
    if(navigator.isCocoonJS){
        touchData.global.x = touchData.global.x / this.resolution;
        touchData.global.y = touchData.global.y / this.resolution;
    }
    touchEvent.globalX = touchData.global.x;
    touchEvent.globalY = touchData.global.y;

    //added this line!
    touchData.originalTouch = touchEvent;
    return touchData;
};

// *************************************************************
// add 'numLines' to wrapped text
// *************************************************************
//PIXI.Text.prototype.numLines = 1;
//PIXI.Text.prototype.wordWrap = function(text){
//    this.numLines = 1;
//    // Greedy wrapping algorithm that will wrap words as the line grows longer
//    // than its horizontal bounds.
//    var result = '';
//    var lines = text.split('\n');
//    for (var i = 0; i < lines.length; i++)
//    {
//        var spaceLeft = this.style.wordWrapWidth;
//        var words = lines[i].split(' ');
//        for (var j = 0; j < words.length; j++)
//        {
//            var wordWidth = this.context.measureText(words[j]).width;
//            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
//            if(j === 0 || wordWidthWithSpace > spaceLeft)
//            {
//                // Skip printing the newline if it's the first word of the line that is
//                // greater than the word wrap width.
//                if(j > 0)
//                {
//                    result += '\n';
//                    this.numLines++;
//                }
//                result += words[j];
//                spaceLeft = this.style.wordWrapWidth - wordWidth;
//            }
//            else
//            {
//                spaceLeft -= wordWidthWithSpace;
//                result += ' ' + words[j];
//            }
//        }
//
//        if (i < lines.length-1)
//        {
//            result += '\n';
//            this.numLines++;
//        }
//    }
//    return result;
//};
//this is more like global config than settings so poorly named
cc.core.settings = {
    DEFAULT_W: 568,//<- default stage width in points
	DEFAULT_H: 320,//<- default stage height in points
    STAGE_W: 568,//<- actual stage width in points
    STAGE_H: 320,//<- actual stage height in points
    MIN_W: 400,//<- minimum stage width in points
    MIN_H: 320,//<- minimum stage height in points
    IPAD_W: 512,
    IPAD_H: 384,
    IPAD_MIN: 288,
    //
    CONTENT_SCALE: 1.0,//<- content scaling to fill window
    FONT: 'Arial',//<- default TTF font (maybe redundant)
    BG_COLOR: '#000000',//<- default div background colour
    //iframe mode - 1 = measure parent, 2 = measure iframe
    IFRAME_MODE: 2,
    //make it easy to customise the minimum sizes for each resolution
    RES_2_MIN_H: 320,
    RES_2_MIN_W: 640,//512,
    MAX_RESOLUTON: 2,
    //
    ORIENTATION: 2,//default
    ORIENTATION_PORTRAIT: 1,
    ORIENTATION_LANDSCAPE: 2,
    USE_WIDTH: false,//<- match width for resolution scaling
    /**
     * scale mode
     */
    SCALE_MODES: {
        MATCH_HEIGHT: 1,
        MATCH_WIDTH: 2
    },
    //
    MUTE_STATE: false,//<- allow muting before game loads
    CHECK_ORIENTATION: true,
    FULLSCREEN_ENABLED: true,//<- whether to allow full screen
    DESKTOP_FULLSCREEN: false,//<- whether to go full screen on desktop
    DESKTOP_RESIZE: true,//<- whether to resize screen on desktop
    WEB_AUDIO_ENABLED: true,
    WEB_GL_ENABLED: true,
    AUDIO_ENABLED: true,
    //paths
    IMG_DIR: "./img/",
    SND_DIR: "./snd/",
    JSON_DIR: "./json/",
    FONT_DIR: "./font/",
    GAME_ID: "template_game",//override this
    FIRST_SCREEN: "title",//default
    /**
     *
     * @param vars
     */
	copy:function(vars){
        for(var s in vars) if(vars.hasOwnProperty(s)) this[s] = vars[s];
        //change root dir if required
        if(vars.ROOT_DIR) this.setRootDir(vars.ROOT_DIR);
    },
    /**
     * this is used for match width mode
     */
    setIpad:function(){
        var isLandscape = (this.ORIENTATION === this.ORIENTATION_LANDSCAPE);
        var w = this.IPAD_W, h = this.IPAD_H, min = this.IPAD_MIN;
        this.DEFAULT_W = this.STAGE_W = isLandscape? w : h;
        this.DEFAULT_H = this.STAGE_H = isLandscape? h : w;
        this.MIN_W = isLandscape? w : min;
        this.MIN_H = isLandscape? min : w;
    },
    /**
     * this is default
     */
    setIphone:function(){
        var isLandscape = (this.ORIENTATION === this.ORIENTATION_LANDSCAPE);
        var minW = this.MIN_W, minH = this.MIN_H,
        stageW = this.STAGE_W, stageH = this.STAGE_H;
        this.DEFAULT_W = this.STAGE_W = isLandscape? stageW : stageH;
        this.DEFAULT_H = this.STAGE_H = isLandscape? stageH : stageW;
        this.MIN_W = isLandscape? minW : minH;
        this.MIN_H = isLandscape? minH : minW;
    },
    /**
     *
     * @param root
     */
    setRootDir: function(root){
        //make sure there is a slash
        var lastChar = root.charAt(root.length - 1);
        if(lastChar != '/') root += '/';
        this.IMG_DIR = root + "img/";
        this.SND_DIR = root + "snd/";
        this.JSON_DIR = root + "json/";
        this.FONT_DIR = root + "font/";
    }
  
};
/**
 *
 *
 */
game_shell.Keys = {
	_pressed: {},
    //
	LEFT_KEY: 37,
    ENTER_KEY: 13,
	UP_KEY: 38,
	RIGHT_KEY: 39,
	DOWN_KEY: 40,
	SPACE_KEY: 32,
	SHIFT_KEY: 16,
	//key states
	UP:0,
	JUST_PRESSED:1,
	DOWN:2,
	onKeydown: function(event) {
		if(!this._pressed[event.keyCode]) this._pressed[event.keyCode] = this.JUST_PRESSED;
        var evt = event || window.event;
        if (evt.stopPropagation !== undefined) {
            evt.stopPropagation();
        } else {
            evt.cancelBubble = true;
        }
        if(evt.preventDefault) evt.preventDefault();
	},
	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
        var evt = event || window.event;
        if (evt.stopPropagation !== undefined) {
            evt.stopPropagation();
        } else {
            evt.cancelBubble = true;
        }
        if(evt.preventDefault) evt.preventDefault();
    },
    update:function(dt){
    	for(var s in this._pressed){
            if(this._pressed.hasOwnProperty(s)){
    		  if(this._pressed[s] === this.JUST_PRESSED) this._pressed[s] = this.DOWN;
            }
    	}
    },
    clear:function(){
        for(var s in this._pressed){
            if(this._pressed.hasOwnProperty(s)){
                delete this._pressed[s];
            }
        }
    },
    enable: function(bool){
        if(!this.boundKeyUp) this.boundKeyUp = this.onKeyup.bind(this);
        if(!this.boundKeyDown) this.boundKeyDown = this.onKeydown.bind(this);
        //support iframes!
        var isIframe = window.parent !== window;
        var w = (isIframe)? document : window;//parent || window;
		w.removeEventListener('keyup', this.boundKeyUp);
		w.removeEventListener('keydown', this.boundKeyDown);
    	if(bool){
    		w.addEventListener('keyup', this.boundKeyUp, false);
			w.addEventListener('keydown', this.boundKeyDown, false);
            //console.log("isIframe: " + isIframe)
            if(isIframe){
                window.focus();
            }
    	} else {
            this.clear();
        }
    },
    isDown: function(keyCode) {
        return this._pressed[keyCode] > 0;
    },
    wasPressed: function(keyCode) {
        return this._pressed[keyCode] === this.JUST_PRESSED;
    },
    keyState: function(code){
        return this._pressed[code] || this.UP;
    }
};

/**
 * 
 * @constructor
 */
game_shell.KeyListener = function(){};
game_shell.KeyListener.prototype = Object.create(game_shell.Keys);
game_shell.KeyListener.prototype.constructor = game_shell.KeyListener;
//

/**
 * @author mrdoob / http://mrdoob.com/
 */

cc.core.utils.EventDispatcher = function () {}

cc.core.utils.EventDispatcher.prototype = {

	constructor: cc.core.utils.EventDispatcher,

	apply: function ( object ) {

		object.addEventListener = cc.core.utils.EventDispatcher.prototype.addEventListener;
		object.on = cc.core.utils.EventDispatcher.prototype.addEventListener;
		object.hasEventListener = cc.core.utils.EventDispatcher.prototype.hasEventListener;
		object.has = cc.core.utils.EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = cc.core.utils.EventDispatcher.prototype.removeEventListener;
		object.off = cc.core.utils.EventDispatcher.prototype.removeEventListener;
		object.removeEventListeners = cc.core.utils.EventDispatcher.prototype.removeEventListeners;
		object.offAll = cc.core.utils.EventDispatcher.prototype.removeEventListeners;
		object.dispatchEvent = cc.core.utils.EventDispatcher.prototype.dispatchEvent;
		object.emit = cc.core.utils.EventDispatcher.prototype.dispatchEvent;

	},

	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var index = listeners[ type ].indexOf( listener );

		if ( index !== - 1 ) {

			listeners[ type ].splice( index, 1 );

		}

	},

	removeEventListeners: function(){
		//remove all!
		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		for( var s in listeners){
			delete listeners[s];
		};

	},

	dispatchEvent: function ( event ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {

				listenerArray[ i ].call( this, event );

			}

		}

	},

	dispose:function(){
		if ( this._listeners === undefined ) {
			return;
		} else {
			this._listeners.length = 0;
			this._listeners = null;
		}
	}
};
//terser syntax...
cc.core.utils.EventDispatcher.prototype.on = cc.core.utils.EventDispatcher.prototype.addEventListener;
cc.core.utils.EventDispatcher.prototype.emit = cc.core.utils.EventDispatcher.prototype.dispatchEvent;
cc.core.utils.EventDispatcher.prototype.has = cc.core.utils.EventDispatcher.prototype.hasEventListener;
cc.core.utils.EventDispatcher.prototype.off = cc.core.utils.EventDispatcher.prototype.removeEventListener;
cc.core.utils.EventDispatcher.prototype.offAll = cc.core.utils.EventDispatcher.prototype.removeEventListeners;

/**
 *
 * @constructor
 */
cc.core.utils.EventQueue = function(){
	cc.core.utils.EventDispatcher.call(this);

	this.queue = [];
};
cc.core.utils.EventQueue.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.utils.EventQueue.prototype.constructor = cc.core.utils.EventQueue;

/**
 *
 * @param event
 */
cc.core.utils.EventQueue.prototype.queueEvent = function(event){
    this.queue[this.queue.length] = event;
};

/**
 *
 */
cc.core.utils.EventQueue.prototype.dispatchQueuedEvents = cc.core.utils.EventQueue.prototype.update = function(delta){
    while(this.queue.length > 0){
        this.dispatchEvent(this.queue.shift());
    }
};
/**
 * Utility class for randomisation
 */
cc.core.utils.Randomise = {
	HOLDER: [],
	/**
     * randomises the content of an Array
     * @param p_list
     */
	randomise: function (p_list) {
		this.HOLDER.length = 0;
		//copy items into holder array
		var i, l_nItems = p_list.length;
		for (i = 0; i < l_nItems; i++) this.HOLDER[i] = p_list[i];
		//empty the source array;
		p_list.length = 0;
		//re-populate the source array
		while (this.HOLDER.length > 0) {
			var index = this.randomInt(this.HOLDER.length - 1);
			p_list[p_list.length] = this.HOLDER.splice(index, 1)[0];
		}
	},

    /**
     * this version makes randomised copy of the list it receives,
     * and returns the copy, leaving the source list unchanged
     * @param p_list
     * @returns {Array}
     */
	randomisedCopy: function (p_list) {
		var randomised = [], list = p_list.slice();
		while (list.length > 0) {
			var index = this.randomInt(list.length - 1);
			randomised[randomised.length] = list.splice(index, 1)[0];
		}
		return randomised;
	},

	/**
     * returns a random float
     * @param range
     * @returns {number}
     */
	randomNumber: function (range) {
		return Math.random() * range;
	},

    /**
     * returns a random float within a given range
     * @param p_min
     * @param p_max
     * @returns {*}
     */
	randomInRange: function (p_min, p_max) {
		var dif = p_max - p_min;
		return p_min + (Math.random() * dif);
	},

    /**
     * returns a rounded integer from zero up to and including range
     * @param range
     * @returns {number}
     */
	randomInt: function (range) {
		return Math.floor(Math.random() * (range + 1));
	}
};
/**
 *
 * @param p_interval {number}  ms between ticks
 * @param p_repeat {number} total number of ticks
 * @constructor
 */
cc.core.utils.Timer = function(p_interval, p_repeat){
	cc.core.utils.EventDispatcher.call(this);
	//*******************************
	this.interval = p_interval || 1000;//default to once per second	
	if(typeof p_repeat != "undefined"){
		this.repeat = p_repeat;
	} else {
		this.repeat = -1;//infinite!
	}
	//*******************************
	this.running = false;
	this.currentTime = 0;
	this.tickCount = 0;
	//
	this.evt = {time:0,count:0};
	//*******************************
	//
	this.onTimer = function(p_count){
		//tick
	};
	//*******************************
	//
	this.onTimerComplete = function(){
		//the end!
	};
};
cc.core.utils.Timer.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.utils.Timer.prototype.constructor = cc.core.utils.Timer;

/**
 *
 */
cc.core.utils.Timer.prototype.start = function(){
	this.running = true;
	this.currentTime = 0;
	this.tickCount = 0;
};

/**
 *
 */
cc.core.utils.Timer.prototype.stop = function(){
	this.running = false;
};

/**
 *
 */
cc.core.utils.Timer.prototype.resume = function(){
	this.running = true;
};

/**
 *
 */
cc.core.utils.Timer.prototype.reset = function(){
	this.running = false;
	this.currentTime = 0;
	this.tickCount = 0;
};

/**
 *
 */
Object.defineProperties(cc.core.utils.Timer.prototype, {
    isComplete: {
        get: function () {
            return this.tickCount === this.repeat;
        }
    },
    remaining: {
        get: function() {
            return this.repeat - this.tickCount;
        }
    }
});

/**
 * update loop
 * @param elapsed
 */
cc.core.utils.Timer.prototype.update = function(elapsed){
	if(this.running){
		this.currentTime += elapsed;
		if(this.currentTime > this.interval){
			//tick!
			this.tick();
		}
	}	
};

/**
 * 
 */
cc.core.utils.Timer.prototype.tick = function(){
	this.currentTime -= this.interval;
	this.tickCount++;
	//
	this.evt.time = this.currentTime;
	this.evt.count = this.tickCount;
	this.evt.countDown = this.repeat - this.tickCount;
	this.evt.type = "timer";
	this.dispatchEvent(this.evt);
	this.onTimer(this.tickCount);
	//
	if(this.tickCount === this.repeat){
		this.stop();
		this.evt.type = "complete";
		this.dispatchEvent(this.evt);
		this.onTimerComplete();
	}	
};

/**
 * 
 */
cc.core.utils.Timer.prototype.dispose = function(){
	this.onTimer = null;
	this.onTimerComplete = null;
	cc.core.utils.EventDispatcher.prototype.dispose.call(this);
};
/**
 * @class RandomTimer
 * @param p_interval
 * @constructor
 */
cc.core.utils.RandomTimer = function(p_interval){
	if(!p_interval) p_interval = 3000;
	cc.core.utils.Timer.call(this, p_interval);
	this.baseInterval = this.interval;
};
cc.core.utils.RandomTimer.prototype = Object.create(cc.core.utils.Timer.prototype);
cc.core.utils.RandomTimer.constructor = cc.core.utils.RandomTimer;

/**
 *
 */
cc.core.utils.RandomTimer.prototype.start = function(){
	cc.core.utils.Timer.prototype.start.call(this);
	this.currentTime = Math.floor(Math.random() * this.baseInterval);
};

/**
 * 
 */
cc.core.utils.RandomTimer.prototype.tick = function(){
	cc.core.utils.Timer.prototype.tick.call(this);
	//now randomise
	this.interval = this.baseInterval + Math.floor(Math.random() * this.baseInterval);
};
/**
 * has a list of actions (stored on objects from a pool)
 * class DelayedAction
 * @param poolSize
 * @constructor
 */
cc.core.utils.DelayedAction = function(poolSize){
    var size = poolSize || 50;
    this.createPool(size);
    this._actions = [];
};

/**
 * optional facility to bind scope
 * @param size
 */
cc.core.utils.DelayedAction.prototype.createPool = function(size){
    this._pool = [];
    while(size > 0){
        this._pool[this._pool.length] = {_targetTime: -1, _callback: null};
        size--;
    }
};

/**
 *
 * @returns {T}
 * @private
 */
cc.core.utils.DelayedAction.prototype._next = function(){
    var item = this._pool.shift();
    this._pool[this._pool.length] = item;
    return item;
};

/**
 *
 * @param p_callback
 * @param p_ms
 * @param p_scope
 * @returns {T}
 */
cc.core.utils.DelayedAction.prototype.delay = function(p_callback, p_ms, p_scope){
    var action = this._next();
    action._targetTime = p_ms || -1;
    if(typeof p_scope !== 'undefined'){
        action._callback = function(){
            p_callback.call(p_scope);
        };
    } else {
        action._callback = p_callback || null;
    }
    this._actions[this._actions.length] = action;
    return action;
};

/**
 *
 * @param elapsedTime
 */
cc.core.utils.DelayedAction.prototype.update = function(elapsedTime){
    var n = this._actions.length;
    if(n > 0){
        var i, action;
        for(i = n - 1; i > -1; i--){
            action = this._actions[i];
            if(action._targetTime > 0 && action._callback){
                action._targetTime -= elapsedTime;
                if(action._targetTime <= 0){
                    var callback = action._callback;
                    action._callback = null;
                    action._targetTime = -1;
                    this._actions.splice(i, 1);
                    callback();
                }
            }
        }
    }
};

/**
 *
 */
cc.core.utils.DelayedAction.prototype.clear = cc.core.utils.DelayedAction.prototype.purge = function(){
    var n = this._actions.length;
    if(n > 0){
        var i, action;
        for(i = n - 1; i > -1; i--){
            action = this._actions[i];
            action._callback = null;
            action._targetTime = -1;
        }
    }
    this._actions.length = 0;
};

/**
 *
 */
cc.core.utils.DelayedAction.prototype.dispose = function(){
    this.clear();
    this._pool = null;
};

/**
 *
 * @constructor
 */
cc.core.utils.SystemInfo = function(){
    this.browser = -1;//identify browser type
    this.os = -1;//operating system
    this.device = -1;//device type (desktop or mobile)
    
    //*************************
    //possible browser types
    this.browserUnknown = -1;
    this.browserSafari = 1;
    this.browserIE = 2;
    this.browserFirefox = 3;
    this.browserChrome = 4;
    this.browserAndroidStock = 5;
    this.browserKindleSilk = 6;
    this.browserOpera = 7;
    //*************************
    //possible device types
    this.deviceUnknown = -1;
    this.deviceDesktop = 1;
    this.deviceMobile = 2;
    //TODO - distinguish between phone & tablet?
    //*************************
    //possible os types
    this.osUnknown = -1;
    this.osWindows = 1;
    this.osOSX = 2;
    this.osLinux = 3;
    this.osIOS = 4;//TODO - should this check for different versions? eg iOS5, iOS6?
    this.osAndroid = 5;
    this.osBlackberry = 6;
    //*************************
    //os version
    this.osVersion = -1;
    //*************************
    //audio type
    this.audioType = '';
    this.webAudio = false;
};
/**
 *
 */
cc.core.utils.SystemInfo.prototype.run = function(){
    this._checkDevice();
    this._checkAudio();
};

/**
 * user agent sniffing
 * @private
 */
cc.core.utils.SystemInfo.prototype._checkDevice = function(){
    var systemString = navigator.userAgent;
    if (systemString.length > 0) {
        //reg exp
        //The i modifier is used to perform case-insensitive matching.
        //string.match > The match() method searches a string for a match against a regular expression,
        //and returns the matches, as an Array object (or null if no match is found).
        
        //*****************************************
        //identify the device
        //*****************************************
        if (systemString.match(/mobile/i) !== null) {
            this.device = this.deviceMobile;
        } else if (systemString.match(/tablet/i) !== null) {
            this.device = this.deviceMobile;
        } else if (systemString.match(/android/i) !== null) {
            this.device = this.deviceMobile;
        } else {
            this.device = this.deviceDesktop;
        }
        //*****************************************
        //identify the OS
        //*****************************************
        if (systemString.match(/windows/i) !== null) {
            this.os = this.osWindows;
        } else if (systemString.match(/iphone os/i) !== null){
            this.os = this.osIOS;  
        } else if (systemString.match(/ipad/i) !== null){
            this.os = this.osIOS;  
        } else if (systemString.match(/mac os x/i) !== null) {
            if (this.device === this.deviceMobile) {
                this.os = this.osIOS; 
            } else {
                this.os = this.osOSX;  
            }
        } else if (systemString.match(/android/i) !== null) {
            this.os = this.osAndroid;
        } else if (systemString.match(/linux/i) !== null) {
            this.os = this.osLinux;
        }
        //*****************************************
        //identify the browser
        //*****************************************
        if (systemString.match(/MSIE/i) !== null || systemString.match(/rv:11.0/i) !== null) {
            this.browser = this.browserIE;
        } else if (this.os === this.osAndroid && (systemString.match(/samsung/i) !== null || systemString.match(/534.30/i) !== null || systemString.match(/535.19/i) !== null)) {
            this.browser = this.browserAndroidStock;
        } else if (systemString.match(/silk/i) !== null || systemString.match(/kindle fire/i) !== null) {
           this.browser = this.browserKindleSilk;
        } else if (systemString.match(/chrome/i) !== null) {
            this.browser = this.browserChrome;
        } else if (systemString.match(/CriOS/i) !== null) {
            this.browser = this.browserChrome;
        } else if (systemString.match(/Firefox/i) !== null) {
            this.browser = this.browserFirefox;
        } else if (systemString.match(/safari/i) !== null) {
            this.browser = this.browserSafari;
        }
        //*****************************************
        //try to check os version!
        //*****************************************
        if(this.os === this.osIOS){
            //TODO - this needs to be future proof!
            if(systemString.match(/iPhone OS 5/i) !== null) {
                this.osVersion = 5;
            } else if(systemString.match(/iPhone OS 6/i) !== null) {
                this.osVersion = 6;
            } else if(systemString.match(/(iPad|iPhone);.*CPU.*OS 7_\d/i) !== null){
                this.osVersion = 7;
            } else if(systemString.match(/(iPad|iPhone);.*CPU.*OS 8_\d/i) !== null){
                this.osVersion = 8;
            }else if(systemString.match(/(iPad|iPhone);.*CPU.*OS 9_\d/i) !== null){
                this.osVersion = 9;
            }
        } else if(this.os === this.osAndroid){
            try{
                var androidVersionString = systemString.match(/Android [\d+(?:\.\d+]{3,5}/)[0].replace('Android ','');
                this.osVersion = parseFloat(androidVersionString);
            } catch(e){
               // db.log("OSVERSION ERROR - ");// + e.message);
                this.osVersion = -1;
            }

            //http://stackoverflow.com/questions/5293394/get-android-os-version-from-user-agent/5293488#5293488
            // (\d+(?:\.\d+)+);
            // (\d+(?:\.\d+){1,2});
        }
       // db.log("* this.osVersion: "+this.osVersion);
        //*****************************************
    }
};

/**
 * check audio support
 * @private
 */
cc.core.utils.SystemInfo.prototype._checkAudio = function(){
    //*****************************        
    //var canPlay = 'probably';
    //var canPlayOgg = Modernizr.audio.ogg;    
    /*
    "probably" - the browser most likely supports this audio/video type
    "maybe" - the browser might support this audio/video type
    "" - (empty string) the browser does not support this audio/video type
    */
    //boolean
    var canPlayOgg = true;//oggCheck.call(this);
    if (this.isIOS || this.browser === this.browserSafari) {
        canPlayOgg = false;
    } else {
        var a = document.createElement('audio');
        canPlayOgg = !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
    }
    
    if(canPlayOgg){
        this.audioType = '.ogg'
    } else {
        this.audioType = '.m4a'
    }
    //
    if (window.AudioContext) {
        this.webAudio = true;
    } else if (window.webkitAudioContext) {
        this.webAudio = true;
    } else {
        this.webAudio = false;
    }
};


//********************************
// helper getters
//********************************

Object.defineProperties(cc.core.utils.SystemInfo.prototype, {
    isAndroidStock: {
        get: function() {
            return this.browser === this.browserAndroidStock;
        }
    },
    isIOS: {
        get: function() {
            return this.os === this.osIOS;
        }
    },
    isMobile: {
        get: function() {
            return this.device === this.deviceMobile;
        }
    },
    isDesktop: {
        get: function() {
            return this.device === this.deviceDesktop;
        }
    },
    isAndroid: {
        get: function() {
            return this.os === this.osAndroid;
        }
    },
    isSafari: {
        get: function() {
            return (this.browser === this.browserSafari);
        }
    },
    isMobileSafari: {
        get: function() {
            return (this.os === this.osIOS) && this.isSafari;
        }
    },
    isIE: {
        get: function() {
            return (this.browser === this.browserIE);
        }
    }
});
/**
 * @class FullscreenMgr
 * @constructor
 */
cc.core.utils.FullscreenMgr = function(){
    this.canvas = null;
    this.isMobile = false;
    this.fullScreenState = false;//just for debugging
    this.isFullScreen = false;
    //
    this.fullscreenChanged = this._fullscreenChanged.bind(this);
    this.goFullscreen = this._goFullscreen.bind(this);
};

/**
 * @method init
 * @param config
 */
cc.core.utils.FullscreenMgr.prototype.init = function(config){
    this.canvas = config.canvas;//element
    this.isMobile = config.isMobile;//
    this.isAvailable = this.checkAvailable();
    //call activate by default
    this.activate(this.isAvailable);
};

/**
 * @method activate
 * @param state
 */
cc.core.utils.FullscreenMgr.prototype.activate = function(state){
    this.fullScreenState = state;
    this.canvas.removeEventListener("click", this.goFullscreen);
    this.canvas.removeEventListener("touchstart", this.goFullscreen);
    if(state){
        this.canvas.addEventListener("click", this.goFullscreen, false);
        //test!
        this.canvas.addEventListener("touchstart", this.goFullscreen, false);
    }
};

/**
 * @method _goFullscreen
 * @private
 */
cc.core.utils.FullscreenMgr.prototype._goFullscreen = function(){
    var gameDiv = document.documentElement;
    if (gameDiv.requestFullscreen) {
        gameDiv.requestFullscreen();
        //NOTE - capital S is intentional for firefox!!
    } else if (gameDiv.mozRequestFullScreen) {
        gameDiv.mozRequestFullScreen();
    } else if (gameDiv.webkitRequestFullscreen) {
        gameDiv.webkitRequestFullscreen();
    } else if (gameDiv.msRequestFullscreen) {
        gameDiv.msRequestFullscreen();
    }
    this.activate(false);
};

/**
 * @method reactivate
 */
cc.core.utils.FullscreenMgr.prototype.reactivate = function(){
    this.activate(!this.isFullScreen);
};

/**
 * @method checkAvailable
 * @returns {*}
 */
cc.core.utils.FullscreenMgr.prototype.checkAvailable = function(){
    var doc = document.documentElement;
    //this is only for iframes
    doc.allowfullscreen = true;
    //
    var available = doc.requestFullscreen
        || doc.webkitRequestFullscreen
        || doc.msRequestFullscreen
        || doc.mozRequestFullScreen;

    if(available){
        var self = this;
        //? this bit should be redundant...!
        document.onfullscreenchange = function(event) {
            self.fullscreenChanged(event);
        };
        document.onwebkitfullscreenchange = function(event) {
            self.fullscreenChanged(event);
        };
        document.onmozfullscreenchange = function(event) {
            self.fullscreenChanged(event);
        };
        document.onmsfullscreenchange = function(event) {
            self.fullscreenChanged(event);
        };
        //error logging *********************************************
        document.onfullscreenerror = function(event) {
            self.fullscreenError(event);
        };
        document.onmozfullscreenerror = function(event) {
            self.fullscreenError(event);
        };
        document.onwebkitfullscreenerror = function(event) {
            self.fullscreenError(event);
        };
        document.onmsfullscreenerror = function(event) {
            self.fullscreenError(event);
        };
    }
    return available;
};

/**
 * @method _fullscreenChanged
 * @param event
 * @private
 */
cc.core.utils.FullscreenMgr.prototype._fullscreenChanged = function(event){
    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    this.isFullScreen = fullscreenElement !== null && typeof fullscreenElement != "undefined";
    console.log("FullscreenMg -> fullscreenChanged -- isFullScreen: " + this.isFullScreen);
    if(!this.isFullScreen){
        //actually don't reset - its annoying otherwise!
        //well, ok then  but only if it is a mobile device.
        if(this.isMobile) this.activate(true);
    }
};

/**
 * @method fullscreenError
 * @param event
 */
cc.core.utils.FullscreenMgr.prototype.fullscreenError = function(event){
    console.log("* !!!! fullscreenError !!! * " + event);
    console.log("* event.message: " + event.message);
    this.fullscreenChanged(null);
};
/**
 *
 * @param fps
 * @constructor
 */
cc.core.utils.UpdateLoop = function(fps){
	this.gameLoopId = -1;//interval id
	this.fps = fps || 60;
	this.interval = 1000/this.fps;//60 fps
	this.accumulator = 0;
    this.currentTime = 0;//Date.now()
	//
	this.gameLoop = this._gameLoop.bind(this);

};

/**
 *
 */
cc.core.utils.UpdateLoop.prototype.start = function(){
    clearInterval(this.gameLoopId);
    this.currentTime = Date.now();
    this.gameLoopId = setInterval(this.gameLoop, this.interval);
};

/**
 *
 */
cc.core.utils.UpdateLoop.prototype.stop = function(){
    clearInterval(this.gameLoopId);
};

/**
 *
 * @param p_time
 */
cc.core.utils.UpdateLoop.prototype.updateGame = function(p_time){
    //override this
};

/**
 * 
 * @private
 */
cc.core.utils.UpdateLoop.prototype._gameLoop = function(){
	var newTime = Date.now();
    var elapsed = newTime - this.currentTime;
    this.currentTime = newTime;
    this.accumulator += elapsed;
    //use accumulator system for processing time with fixed time step
    var chunk = this.interval;
    while(this.accumulator > chunk){
        this.accumulator -= chunk;
        this.updateGame(chunk);
    }
};
/**
 * @class RenderLoop
 * @constructor
 */
cc.core.utils.RenderLoop = function(){
    this.currentTime = 0;
    this.requestId = -1;
    this.stage = null;
    this.screenMgr = null;
};

/**
 *
 * @param p_config
 */
cc.core.utils.RenderLoop.prototype.init = function(p_config){
    this.stage = p_config.stage;
    this.screenMgr = p_config.screenMgr;
    //************************************************
    //render loop
    if(p_config.useStats){
        this.render = this._statsRender.bind(this);
    } else {
        this.render = this._defaultRender.bind(this);
    }
    
};

/**
 *
 */
cc.core.utils.RenderLoop.prototype._defaultRender = function(){
    var newTime = Date.now(), 
        elapsed = newTime - this.currentTime;
        this.currentTime = newTime;
        this.stage.draw();
        this.screenMgr.render(elapsed);
        //loop
        this.requestId = requestAnimationFrame(this.render);
};

/**
 *
 */
cc.core.utils.RenderLoop.prototype._statsRender = function(){
    stats.begin();
    var newTime = Date.now(), 
        elapsed = newTime - this.currentTime;
    this.currentTime = newTime;
    this.stage.draw();
    this.screenMgr.render(elapsed);
    stats.end();   
    //loop
    this.requestId = requestAnimationFrame(this.render);
};

/**
 *
 */
cc.core.utils.RenderLoop.prototype.start = function(){
    this.currentTime = Date.now();
    this.render();
};

/**
 *
 */
cc.core.utils.RenderLoop.prototype.stop = function(){
    cancelAnimationFrame(this.requestId);
};

/**
 * @class Resolution
 * @constructor
 */
cc.core.utils.Resolution = function(){
	//resolution can be 1, 2 or 4
	//@1x = non-retina phone -> 480 x 320
	//@2x = retina phone or non-retina tablet -> ipad 1 (1024 x 768), iphone 4 (960 x 640), iPhone 5 (1136 x 640)
	//@4x = retina tablet -> ipad 3 (2048 x 1536)
    this.resolution = 1;
	//in order to truly support portrait, what this refers to as height
	//should just be called 'shorter edge'
	//and what this refers to as width
	//should just be called 'longer edge'
	this.minHeight2 = cc.core.settings.RES_2_MIN_H || 320;//640;
	this.minHeight4 = this.minHeight2 * 2;//640;//1280;
	//widths are for targetting ipad
	this.minWidth2 = cc.core.settings.RES_2_MIN_W || 512;//1024;//
	this.minWidth4 = this.minWidth2 * 2;//1024;//2048;

	this.maxResolution = cc.core.settings.MAX_RESOLUTON;

	this.pixelRatio = window.devicePixelRatio || 1;
};

/**
 * @method init
 * @param config
 */
cc.core.utils.Resolution.prototype.init = function(config){
	this.forceResolution = config.forceResolution;//normally force 2 for desktop maybe... or hack the minResolution2 to 321
	//this.renderer = config.renderer || {};
	if(this.forceResolution > -1) this.resolution = this.forceResolution;
};

/**
 * set resolution by comparing shortest screen edge to baseline
 */
cc.core.utils.Resolution.prototype.setByHeight = function(){
	//NOTE - this can't this use viewport values, runs before viewport is created - but why?
	if(this.forceResolution > -1){
		this.resolution = this.forceResolution;
	} else {

		var shortEdge = Math.min(window.innerHeight, window.innerWidth);

		var size = Math.round(shortEdge * this.pixelRatio);    
		if(size <= this.minHeight2){
			this.resolution = 1;
		} else if(size <= this.minHeight4){
			this.resolution = 2;
		} else {
			this.resolution = (this.maxResolution > 2)? 4 : 2;
		}	
	}	
	console.warn('resolution = ' + this.resolution);
	//this.renderer.resolution = this.resolution;
	return this.resolution;
};

/**
 * set resolution by comparing longest screen edge to baseline
 */
cc.core.utils.Resolution.prototype.setByWidth = function(){
	//NOTE - this can't this use viewport values, runs before viewport is created - but why?
	if(this.forceResolution > -1){
		this.resolution = this.forceResolution;
	} else {
		
		var longEdge = Math.max(window.innerHeight, window.innerWidth);

		var size = Math.round(longEdge * this.pixelRatio);    
		if(size <= this.minWidth2){
			this.resolution = 1;
		} else if(size <= this.minWidth4){
			this.resolution = 2;
		} else {
			this.resolution = (this.maxResolution > 2)? 4 : 2;
		}	
	}	
	console.log('Resolution -> setResolution: ' + this.resolution);
	//this.renderer.resolution = this.resolution;
	return this.resolution;
};
/**
 * @class Viewport
 * @constructor
 */
cc.core.utils.Viewport = function(){
    cc.core.utils.EventDispatcher.call(this);

    this.PORTRAIT = cc.core.settings.ORIENTATION_PORTRAIT;
    this.LANDSCAPE = cc.core.settings.ORIENTATION_LANDSCAPE;

    this.scaleModes = cc.core.settings.SCALE_MODES;

    this.settings = null;

    this.resize = cc.core.utils.Viewport.prototype.resize.bind(this);
};
cc.core.utils.Viewport.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.utils.Viewport.prototype.constructor = cc.core.utils.Viewport;


//iframe modes:
//IFRAME_MODE_1 -> measure the parent window
//IFRAME_MODE_2 -> measure the iframe window (default)
cc.core.utils.Viewport.prototype.IFRAME_MODE_1 = 1;
cc.core.utils.Viewport.prototype.IFRAME_MODE_2 = 2;

/**
 * @method init
 * @param config
 */
cc.core.utils.Viewport.prototype.init = function(config){
    //flags
    this.CHECK_ORIENTATION = config.CHECK_ORIENTATION;
    this.DESKTOP_RESIZE = config.DESKTOP_RESIZE;
    this.isMobile = config.isMobile;
    //dimensions
    this.DEFAULT_W = config.DEFAULT_W;
    this.DEFAULT_H = config.DEFAULT_H;
    this.MIN_W = config.MIN_W;
    this.MIN_H = config.MIN_H;
    //DOM objects
    this.rotateImg = config.rotateImg;
    this.gameDiv = config.gameDiv;
    //devicePixelRatio used for resolution check
    this.pixelRatio = window.devicePixelRatio || 1;
    //window needs to refer to the top level window in iframes to get innerwidth & height
    this.isIframe = window.parent !== window;
    //set the iframe mode for measuring the window
    this.iframeMode = config.iframeMode || this.IFRAME_MODE_2;

    this.settings =  this.createSettings(config);

    this.eventResize = {type:"resize", wrongOrientation: false, settings: this.settings};
    //
    this.initResize();
    //
    this.setScaleMode(config.scaleMode || this.settings.SCALE_MATCH_HEIGHT);
};

/**
 *
 */
cc.core.utils.Viewport.prototype.initResize = function(){
    window.addEventListener('resize', this.resize, false);
    window.addEventListener('orientationchange', this.resize, false);
};

/**
 *
 */
cc.core.utils.Viewport.prototype.resize = function(){
    this.eventResize.settings = this.getSize();
    this.emit(this.eventResize);
};

/**
 *
 * @param mode
 */
cc.core.utils.Viewport.prototype.setScaleMode = function(mode){
    this.settings.scaleMode = mode;
    //console.log('setScaleMode: ' + mode);
    //choose the aspect handler
    switch(this.settings.scaleMode){
        case this.settings.SCALE_MATCH_HEIGHT:
            this.setAspect = this._matchHeight;
            break;
        case this.settings.SCALE_MATCH_WIDTH:
            this.setAspect = this._matchWidth;
            break;
    }
};

/**
 * enable choosing scaleMode (match height, match width, etc)
 * @param config
 */
cc.core.utils.Viewport.prototype.createSettings = function(config){
    var settings = {};
    settings.windowWidth = -1;
    settings.windowHeight = -1;
    settings.width = config.STAGE_W;
    settings.height = config.STAGE_H;
    settings.scale = 1;
    settings.shouldResize = (!(!this.isMobile && !this.DESKTOP_RESIZE));
    //portrait / landscape or either!
    settings.ORIENTATION_PORTRAIT = this.PORTRAIT;
    settings.ORIENTATION_LANDSCAPE = this.LANDSCAPE;//make this default!
    settings.ORIENTATION_ANY = 3;
    //choose orientation
    settings.orientation = config.orientation || settings.ORIENTATION_LANDSCAPE;
    ////scaleMode definitions
    settings.SCALE_MATCH_HEIGHT = this.scaleModes.MATCH_HEIGHT;//crop sides
    settings.SCALE_MATCH_WIDTH = this.scaleModes.MATCH_WIDTH;//crop vertical
    //TODO - support more scale modes

    //choose scalemode
    settings.scaleMode = -1;
    return settings;
};

/**
 *
 * @returns {Object || null}
 */
cc.core.utils.Viewport.prototype.getSize = function(){
    //***********************************************
    //show landscape only image on rotation...!
    var dimensions = this.checkWindowSize();
    //check rotation
    var showRotate = this.checkRotation(dimensions.width, dimensions.height);
    this.eventResize.wrongOrientation = showRotate;
    if(showRotate) return null;
    //
    this.setAspect(dimensions.width, dimensions.height);

    return this.settings;
};

/**
 * @method checkWindowSize
 */
cc.core.utils.Viewport.prototype.checkWindowSize = function(){
    var dstW, dstH;
    try{
        dstW = window.innerWidth;
        dstH = window.innerHeight;    
    } catch(e){
        //getting zero for both values in iWin framework - maybe an iframe issue?
        //default everything
        this.restoreDefaults();
        return null;
    }  
   
    if(this.isIframe && this.iframeMode === 1){
        //if iframe & iframeMode is 1 then reference parent window
        //but get an error when on a different domain!
        try{
            dstW = window.parent.innerWidth;
            dstH = window.parent.innerHeight;
        } catch(e){
            //use the parent window size then - leave as is
        }
    }

    this.settings.windowWidth = dstW;
    this.settings.windowHeight = dstH;

    return {
        width: dstW,
        height: dstH
    };
};

/**
 *
 */
cc.core.utils.Viewport.prototype.restoreDefaults = function(){
    this.settings.pixelWidth = this.DEFAULT_W;
    this.settings.pointWidth = this.DEFAULT_W;
    this.settings.windowWidth = this.DEFAULT_W;
    //
    this.settings.pixelHeight = this.DEFAULT_H;
    this.settings.pointHeight = this.DEFAULT_H;
    this.settings.windowHeight = this.DEFAULT_H;
};

//naming is all screwed now that portrait is in the equation
//width should just be called long edge
//height should just be called short edge



/**
 * @param dstW
 * @param dstH
 */
cc.core.utils.Viewport.prototype._matchWidth = function(dstW, dstH){
    var fullW = this.DEFAULT_W,
        fullH = this.DEFAULT_H;
    //
    if(!this.settings.shouldResize){
        dstW = fullW;
        dstH = fullH;
    }
    // ******************************************************
    // - allow expanding aspect ratio
    // ******************************************************

    var maxRatio = fullW / this.MIN_H,//
        aspectRatio = fullW / fullH,//the required aspect
        windowAspect = dstW / dstH;
        //
    this.settings.targetH = Math.ceil(dstW / aspectRatio);//store on settings for use in stage resize
    //
    if (windowAspect > aspectRatio) {
        if (windowAspect <= maxRatio) {
            aspectRatio = windowAspect;
        } else {
            aspectRatio = maxRatio;
        }
    }
    // ******************************************************
    var w = dstW, h = dstH; 
    //width always fixed to full width, height will crop
    var targetH = Math.ceil(dstW / aspectRatio);
    //if window height bigger than necessary
    if (dstH > targetH) {
        h = targetH;
    } else {
        //cap the width
        w = Math.ceil(aspectRatio * dstH);
    }

    // if(this.settings.orientation === this.settings.ORIENTATION_LANDSCAPE){
    //     //width always fixed to full width, height will crop
    //     var targetH = Math.ceil(dstW / aspectRatio);
    //     //if window height bigger than necessary
    //     if (dstH > targetH) {
    //         h = targetH;
    //     } else {
    //         //cap the width
    //         w = Math.ceil(aspectRatio * dstH);
    //     }
    // } else {
    //     //handle portrait!
    //     if (dstH > aspectRatio * dstW) {
    //         h = Math.ceil(aspectRatio * dstW);
    //     } else {
    //         w = Math.ceil(dstH / aspectRatio);
    //     }
    //     /*if (dstW > aspectRatio * dstH) {
    //         w = Math.ceil(aspectRatio * dstH);
    //     } else {
    //         h = Math.ceil(dstW / aspectRatio);
    //     }*/
    // }
    // ******************************************************
    //
    var scale = w / fullW;
    var stageW = Math.floor(w / scale);
    var stageH = Math.floor(h / scale);  
    //
    this.settings.pixelWidth = w;
    this.settings.pointWidth = stageW;
    this.settings.pixelHeight = h;
    this.settings.pointHeight = stageH;
    this.settings.scale = scale;
};

/**
 *
 * @param dstW
 * @param dstH
 * @private
 */
cc.core.utils.Viewport.prototype._matchHeight = function(dstW, dstH){       
    var fullW = this.DEFAULT_W,
        fullH = this.DEFAULT_H;
    //
    if(!this.settings.shouldResize){
        dstW = fullW;
        dstH = fullH;
    }
    // ******************************************************
    // allow cropping aspect ratio
    // ******************************************************
    
    //this is where it needs to consider whether in portrait!
    var isInPortrait = fullW < fullH;
    var minRatio, aspectRatio, windowAspect;
    if(isInPortrait){
        minRatio = this.MIN_H / fullW;
        aspectRatio = fullH / fullW;
        windowAspect = dstH / dstW;
    } else {
        minRatio = this.MIN_W / fullH;
        aspectRatio = fullW / fullH;
        windowAspect = dstW / dstH;
    }
    //
    if (windowAspect < aspectRatio) {
        if (windowAspect >= minRatio) {
            aspectRatio = windowAspect;
        } else {
            aspectRatio = minRatio;
        }
    }
    // ******************************************************
    var w = dstW, h = dstH, scale = 1;
    if(isInPortrait){
        //in this case we want to match the width
        if (dstH > aspectRatio * dstW) {
            h = Math.ceil(aspectRatio * dstW);
        } else {
            //destination height is less than what it needs to be, so adjust width accordingly
            w = Math.ceil(dstH / aspectRatio);
        }
        scale = w / fullW;
    } else {
        if (dstW > aspectRatio * dstH) {
            w = Math.ceil(aspectRatio * dstH);
        } else {
            h = Math.ceil(dstW / aspectRatio);
        }   
        scale = h / fullH;
    }
    //
    var stageW = Math.floor(w / scale);
    var stageH = Math.floor(h / scale);  
    //
    this.settings.pixelWidth = w;
    this.settings.pointWidth = stageW;
    this.settings.pixelHeight = h;
    this.settings.pointHeight = stageH;
    this.settings.scale = scale;
};

/**
 *
 * @param ww
 * @param hh
 * @returns {boolean}
 */
cc.core.utils.Viewport.prototype.checkRotation = function(ww, hh){
    var showRotate = false;
    if (this.CHECK_ORIENTATION){
        if(this.settings.orientation === this.settings.ORIENTATION_LANDSCAPE && hh > ww){
            showRotate = true;
        } else if(this.settings.orientation === this.settings.ORIENTATION_PORTRAIT && ww > hh){
            showRotate = true;
        }
    }

    if(showRotate){
        // hide the game divs
        this.gameDiv.style.display = "none";
        // show the rotate image
        this.rotateImg.style.display = "block";
    } else {
        //hide rotate image
        this.rotateImg.style.display = "none";
        this.gameDiv.style.display = "block";
    }
    return showRotate;
};

/**
 *
 */
Object.defineProperties(cc.core.utils.Viewport.prototype, {
        height: {
            get: function(){
                return this.settings.height;
            }
        },
        width: {
            get: function(){
                return this.settings.width;
            }
        }
    }
);


/**
 * @class PauseController
 * @constructor
 */
cc.core.utils.PauseController = function(){
    this.isPaused = false;
    this.wrongOrientation = false;//whether it was going portrait that caused the pause (need to know whether to restart..)
    this.pause = this._pause.bind(this);
    this.onResized = this._resized.bind(this);
};

/**
 * 
 * @param config
 */
cc.core.utils.PauseController.prototype.init = function(config){
    this.updateLoop = config.updateLoop;
    this.renderLoop = config.renderLoop;
    this.snd = config.snd;

    this.initPageHidden();
};

/**
 * 
 */
cc.core.utils.PauseController.prototype.initPageHidden = function(){
    var self = this;
    // blur / focus
    window.addEventListener("blur", function(){
        self.pause.call(self, true);
    }, false);
    window.addEventListener("focus", function(){
        self.pause.call(self, false);
    }, false);
    //
    //************************************************
    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    //************************************************
    document.addEventListener(visibilityChange, function(e){
        if (document[hidden]) {
            self.pause.call(self, true);
        } else {
            self.pause.call(self, false);
        }
    });
};

/**
 * 
 * @param event
 * @private
 */
cc.core.utils.PauseController.prototype._resized = function(event){
    if(event.wrongOrientation){
        //pause the game
        if(!this.isPaused) {
            this.pause(true);
            this.wrongOrientation = true;
        }
    } else {
        //uh oh... don't necessarily want to restart it though!
        if(this.wrongOrientation){
            this.pause(false);
        }
        this.wrongOrientation = false;
    }
};

/**
 * 
 * @param p_state
 * @private
 */
cc.core.utils.PauseController.prototype._pause = function(p_state){
    if(p_state && !this.isPaused){
        console.log("PauseController -> " + p_state);
        TWEEN.pause();
        //pause run loop
        this.updateLoop.stop();
        //pause render loop
        this.renderLoop.stop();
        //mute sound
        this.snd.mute(true);
        this.isPaused = true;
    } else if(!p_state && this.isPaused){
        console.log("PauseController -> " + p_state);
        TWEEN.unpause();
        //restart run loop
        this.updateLoop.start();
        //restart render loop
        this.renderLoop.start();
        //unmute sound
        this.snd.mute(false);

        this.isPaused = false;
    }
};


/**
 * class UpdateList
 * @constructor
 */
cc.core.utils.UpdateList = function(){
    this.updateItems = [];
	this.removeItems = [];
};

/**
 * could have been called apply....
 * @param target
 */
cc.core.utils.UpdateList.prototype.mixin = function(target){
    target.updateItems = [];
	target.removeItems = [];
	target.update = cc.core.utils.UpdateList.prototype.update;
    target.addUpdateItem = cc.core.utils.UpdateList.prototype.addUpdateItem;
	target.removeUpdateItem = cc.core.utils.UpdateList.prototype.removeUpdateItem;
    target.purge = cc.core.utils.UpdateList.prototype.purge;
};

/**
 *
 * @param p_delta
 */
cc.core.utils.UpdateList.prototype.update = function(p_delta){
    var n = this.updateItems.length;
    var item, i;
    for(i = n-1; i > -1; i--){
        item = this.updateItems[i];
        item.update(p_delta);
    }
    //now remove items
    n = this.removeItems.length;
    if(n > 0){
        for(i = 0; i < n; i++){
            item = this.removeItems[i];
            this._remove(item);
        }
        this.removeItems.length = 0;
    }
};

/**
 *
 */
cc.core.utils.UpdateList.prototype.purge = function(){
    this.updateItems.length = 0;
    this.removeItems.length = 0;
};

/**
 *
 * @type {cc.core.utils.UpdateList.add}
 */
cc.core.utils.UpdateList.prototype.addUpdateItem = cc.core.utils.UpdateList.prototype.add = function(p_item){
    //don't allow adding more than once!
    if(this.updateItems.indexOf(p_item) === -1){
        this.updateItems[this.updateItems.length] = p_item;
    }    
};

/**
 * this just adds to the remove list so that items aren't removed mid-loop
 * @type {cc.core.utils.UpdateList.remove}
 */
cc.core.utils.UpdateList.prototype.removeUpdateItem = cc.core.utils.UpdateList.prototype.remove = function(p_item){
    this.removeItems[this.removeItems.length] = p_item;
};

/**
 * actually remove the item...
 * @type {cc.core.utils.UpdateList._remove}
 */
cc.core.utils.UpdateList.prototype.removeUpdateItem = cc.core.utils.UpdateList.prototype._remove = function(p_item){
    var index = this.updateItems.indexOf(p_item);
    if(index > -1) this.updateItems.splice(index,1);
};

/**
 *
 */
Object.defineProperty(cc.core.utils.UpdateList.prototype, 'length', {
    get: function(){
        return this.updateItems.length;
    }
});
/**
 *
 * @param stuff
 * @param randomise
 * @constructor
 */
cc.core.utils.Sequence = function(stuff, randomise){
	this.list = [];
	if(stuff){
		this.add(stuff, randomise);
	}
};
/**
 *
 * @param stuff
 * @param randomise
 */
cc.core.utils.Sequence.prototype.add = function(stuff, randomise){
	if(Array.isArray(stuff)){
		var i, n = stuff.length;
		for(i =0; i < n;i++){
			this.list[this.list.length] = stuff[i];
		}
	} else {
		this.list[this.list.length] = stuff;
	}
	if(randomise) this.randomise();
};
/**
 *
 * @param stuff
 */
cc.core.utils.Sequence.prototype.remove = function(stuff){
	var index;
	if(Array.isArray(stuff)){
		var i, n = stuff.length, item;
		for(i =0; i < n;i++){
			item = stuff[i];
			index = this.list.indexOf(item);
			if(index > -1) this.list.splice(index, 1);
		}
	} else {
		index = this.list.indexOf(stuff);
		if(index > -1) this.list.splice(index, 1);
	}
};
/**
 *
 */
cc.core.utils.Sequence.prototype.randomise = function(){
	cc.core.utils.Randomise.randomise(this.list);
};
/**
 *
 * @returns {*}
 */
cc.core.utils.Sequence.prototype.next = function(){
	var item = null;
	if(this.list.length > 0){
		item = this.list.shift();
		this.list[this.list.length] = item;
	}
	return item;
};
/**
 *
 */
Object.defineProperty(cc.core.utils.Sequence.prototype, 'length', {
	get: function(){
		return this.list.length;
	}
});
/**
 * Save data to localStorage
 * @class Save
 * @constructor
 */
cc.core.utils.Save = function(key){
    this.key = key || 'game_data';

    this.isSupported = this.checkSupported();
};

/**
 *
 * @param config
 */
cc.core.utils.Save.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
};

/**
 *
 * @param data
 */
cc.core.utils.Save.prototype.save = function(data){
    if(this.isSupported && data){
        if(typeof data !== 'string') data = JSON.stringify(data);

        this._saveItem(this.key, data);
    }
};

/**
 *
 * @returns {Object}
 */
cc.core.utils.Save.prototype.restore = function(){
    if(this.isSupported){
        try {
            var stringValue = localStorage[this.key];
            if(typeof stringValue !== "undefined"){
                // - restore the data
                var data = JSON.parse(stringValue);
                return data;
            }
        } catch(e){
            console.log('ERROR - cc.core.utils.Save.restore:');
            console.log(e);
        }
    }
    return null;
};

/**
 *
 * @returns {boolean}
 * @private
 */
cc.core.utils.Save.prototype.checkSupported = function(){
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
};

/**
 *
 * @param p_key
 * @param p_value
 * @returns {boolean}
 * @private
 */
cc.core.utils.Save.prototype._saveItem = function(p_key, p_value){
    var success = true;
    try{
        localStorage.removeItem(p_key);
        localStorage.setItem(p_key, p_value);
    } catch(e){
        console.log("*** LOCAL STORAGE ERROR! " + e.message);
        success = false;
    }
    return success;
};

/**
 * Collection of useful maths functions for dealing with vectors, etc
 */
cc.core.utils.Maths = {

    /**
     * @method rotate
     * @param point {Point}
     * @param angle {Number}
     * @param output {Point}
     * @returns {*}
     */
    rotate: function (point, angle, output) {
        var x = point.x, y = point.y;
        if(!output) output = point;
        output.x = ((Math.cos(-angle) * x) + (Math.sin(-angle) * y));
        output.y = ((-Math.sin(-angle) * x) + (Math.cos(-angle) * y));
        return output;
    },

    /**
     * @method matrixRotatePoint
     * @param p {Point}
     * @param m {Matrix}
     * @param pt {Point}
     * @returns {*}
     */
    matrixRotatePoint: function (p, m, pt) {
        var x = p.x, y = p.y;
        var output = pt || p;
        output.x = m.a * x + m.c * y;
        output.y = m.d * y + m.b * x;
        return output;
    },
    /**
     * @method dot
     * @param a {Vector}
     * @param b {Vector}
     * @returns {number}
     */
    dot: function (a, b) {
        return (a.x * b.x) + (a.y * b.y);
    },
    /**
     *
     * @param vector
     * @returns {number}
     */
    vectorLengthSquared: function (vector) {
        return ((vector.x * vector.x) + (vector.y * vector.y));
    },
    /**
     *
     * @param vector
     * @returns {number}
     */
    vectorLength: function (vector) {
        return Math.sqrt(this.vectorLengthSquared(vector));
    },
    /**
     *
     * @param vectorA
     * @param vectorB
     * @returns {*}
     */
    vectorDistanceSquared: function (vectorA, vectorB) {
        return this.vectorLengthSquared(this.relativeVector(vectorA, vectorB));
    },
    /**
     *
     * @param origin
     * @param target
     * @param output
     * @returns {*}
     */
    relativeVector: function (origin, target, output) {
        if (!output) output = {};
        output.x = target.x - origin.x;
        output.y = target.y - origin.y;

        return output;
    },
    /**
     *
     * @param vectorA
     * @param vectorB
     * @returns {number}
     */
    vectorDistance: function (vectorA, vectorB) {
        return Math.sqrt(this.vectorDistanceSquared(vectorA, vectorB));
    },
    /**
     *
     * @param vector
     * @returns {*}
     */
    normaliseVector: function (vector) {
        return this.scaleVector(vector, 1 / this.vectorLength(vector));
    },
    /**
     *
     * @param vector
     * @param scale
     * @param output
     * @returns {*}
     */
    scaleVector: function(vector,scale, output) {
        if(!output) output = vector;
        output.x = vector.x * scale;
        output.y = vector.y * scale;
        return output;
    },

    /**
     *
     * @param vertices {Array}
     * @returns {number}
     */
    polygonDirection: function(vertices){
        //http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
        var i, v1, v2, next, value, n = vertices.length, total = 0;
        for(i = 0; i < n; i++){
            next = (i + 1) % n;
            v1 = vertices[i];
            v2 = vertices[next];
            value = (v2.x - v1.x) * (v2.y - v1.y);
            total += value;
        }
        //NOTE - because y axis points down
        //clockwise is indicated by the result being LESS than zero
        //if its GREATER than zero then its anticlockwise
        return total;
    },

    /**
     *
     * @param vertices
     * @returns {boolean}
     */
    isClockwise: function(vertices){
        var total = this.polygonDirection(vertices);
        return total < 0;
    }
};

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
/**
 * @class ImageLoader
 * @constructor
 */
cc.core.load.ImageLoader = function () {
    cc.core.utils.EventDispatcher.call(this);
    this.manifest = null;//array of objects with src and id strings > {src:"./img/bg1.jpg", id:"bg"},

    this.eventLoaded = {
        type: "loaded",
        progress: 0,
        img: null,
        success: false,
        data: null
    }

};
cc.core.load.ImageLoader.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.load.ImageLoader.prototype.constructor = cc.core.load.ImageLoader;

/**
 * asset load manifest
 @param: items < Array of objects with src and id strings eg {src:"./img/bg1.jpg", id:"bg"},
 */
cc.core.load.ImageLoader.prototype.load = function (items) {
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
cc.core.load.ImageLoader.prototype.findNext = function () {
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
cc.core.load.ImageLoader.prototype.loadNext = function () {
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
cc.core.load.ImageLoader.prototype.loadImage = function (assetData) {
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
cc.core.load.ImageLoader.prototype.imageLoaded = function (img, assetData) {
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
cc.core.load.ImageLoader.prototype.loadComplete = function () {
    this.emit({type: "complete"});
};


/**
 * @class LoadManifest
 * @constructor
 */
cc.core.load.LoadManifest = function(){
    this.bulkLoader = null;
    //
    this.resolution = 1;
    this.audioType = null;
    this.audioFolder = null;
    //store the manifest JSON data
    this.manifest = null;
};

/**
 *
 * @param config
 */
cc.core.load.LoadManifest.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
    this.resolution = this.bulkLoader.resolution;
    this.audioType = this.bulkLoader.audioType;
    this.audioFolder = this.bulkLoader.audioFolder;
};

/**
 * load the manifest json file
 */
cc.core.load.LoadManifest.prototype.load = function(){
    var path = this.bulkLoader.manifestPath;
    var loader = new cc.core.load.JsonLoader(path);
    var self = this;
    loader.on("loaded",function(event){
        var jsonData = event.data;
        // - need to be able to insert stuff here really....
        self.bulkLoader.emit({type: "manifest_json", data: jsonData});

        //store the data structure in the bulkloader manifests map
        self.parseConfig.call(self, jsonData);

        //bail if manifest is empty
        if(self.isEmpty){
            //delay the call slightly though otherwise the loadscreen is not ready
            game_shell.timeout.delay(function(){
                self.bulkLoader.loadComplete();
            }, 100);
        } else {
            //load stuff
            self.bulkLoader.sequence.next();
        }      
    });
    loader.load();
};



/**
 *
 * @param p_data
 */
cc.core.load.LoadManifest.prototype.parseConfig = function(p_data){
    //NOTE - this is no longer compatible with hd / sd format!
    this.manifest = p_data;

    //set manifest paths according to resolution
    var res = this.resolution.toString() + "x";
    //fallback to hd / sd - TODO - this is probably redundant now...
    var fallback = (this.resolution === 1)? 'sd' : 'hd';

    //console.log('LoadManifest ' + res);
    var bulkLoader = this.bulkLoader;
    // revert to hd / sd if res version not found...
    bulkLoader.jsonManifest = this.getManifestSection('json_', res, fallback);
    //fix the paths of the atlas json - to image dir!
    this.setRoot(bulkLoader.jsonManifest, cc.core.settings.IMG_DIR);
    //
    bulkLoader.imgManifest = this.getManifestSection('img_', res, fallback);
    bulkLoader.fontManifest = this.getManifestSection('bm_font_', res, fallback);

    //get it to load non resolutionified json too
    if(this.manifest.hasOwnProperty("json")){
        this.setRoot(this.manifest.json, cc.core.settings.JSON_DIR);//fix json root
        bulkLoader.jsonManifest = bulkLoader.jsonManifest.concat(this.manifest.json);
    }
    //fix the other paths
    bulkLoader.imgManifest = this.setRoot(bulkLoader.imgManifest, cc.core.settings.IMG_DIR);
    bulkLoader.fontManifest = this.setRoot(bulkLoader.fontManifest, cc.core.settings.FONT_DIR);


    bulkLoader.urls.storeLookup(bulkLoader.jsonManifest);
    bulkLoader.urls.storeLookup(bulkLoader.imgManifest);
    bulkLoader.urls.storeLookup(bulkLoader.fontManifest);
    
    //and the sound
    bulkLoader.webAudioManifest = this.parseAudio(this.manifest.snd_webaudio);
    bulkLoader.audioSpriteManifest = this.manifest.snd_sprite || {};
};

/**
 *
 * @param list
 * @param root
 * @returns {*}
 */
cc.core.load.LoadManifest.prototype.setRoot = function(list, root){
    if(!list) return [];//allow missing manifest section
    var item;
    var n = list.length;
    for(var i = 0; i < n;i++){
        item = list[i];
        //check its not already there
        if(item.src.indexOf(root) === -1){
            item.src = root + item.src;
        }
    }
    return list;
};

/**
 *
 * @param name
 * @param res
 * @param fallback
 * @returns {*}
 */
cc.core.load.LoadManifest.prototype.getManifestSection = function(name, res, fallback){
    var list = null;
    var nameWithResolution = name + res;
    if(this.manifest.hasOwnProperty(nameWithResolution)){
        list = this.manifest[nameWithResolution];
    } else {
        //try the fallback!
        nameWithResolution = name + fallback;
        if(this.manifest.hasOwnProperty(nameWithResolution)){
            list = this.manifest[nameWithResolution];
        }
    }
    //prevent breaking!
    if(!list) list = [];
    return list;
};

/**
 *
 * @param input
 * @returns {*}
 */
cc.core.load.LoadManifest.prototype.parseAudio = function(input){
    if(!input) return [];//allow missing manifest section
    var item, folder = this.audioFolder;
    var n = input.length;
    for(var i = 0; i < n;i++){
        item = input[i];
        item.src = folder + item.src + this.audioType;
    }
    return input;
};

Object.defineProperties(cc.core.load.LoadManifest.prototype, {
    /**
     * @property isEmpty
     * type {boolean} true if no files in manifest
     */
    isEmpty: {
        get: function(){
            var loader = this.bulkLoader, count = 0;
            if(loader.jsonManifest) count += loader.jsonManifest.length;
            if(loader.imgManifest) count += loader.imgManifest.length;
            if(loader.fontManifest) count += loader.fontManifest.length;
            if(loader.webAudioManifest) count += loader.webAudioManifest.length;
            return count === 0;
        }
    }
});
/**
 * Created by Alex on 2014/10/09.
 */

// JSON
cc.core.load.JSONLoadState = function(){
    this.bulkLoader = null;
    this.jsonCache = null;
    this.numLoaded = 0;
    this.numTotal = 0;
};

cc.core.load.JSONLoadState.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
    this.jsonLoaded = this._jsonLoaded.bind(this);
};


cc.core.load.JSONLoadState.prototype.unload = function(ids){
    var i, id, n = ids.length;
    for(i = 0; i < n; i++){
        id = ids[i];
        delete this.jsonCache[id];
    }
};

cc.core.load.JSONLoadState.prototype.load = function(){
    var self = this;
    this.queue = new cc.core.load.JsonQueue();
    this.queue.on("complete", function(){
        self.bulkLoader.sequence.next();
    });
    this.queue.on("loaded", this.jsonLoaded);
    this.queue.load(this.bulkLoader.jsonManifest);

};

cc.core.load.JSONLoadState.prototype._jsonLoaded = function(event){
    var filePath = event.url;
    var assetData = this.bulkLoader.urls.getAssetData(filePath);
    //store the jsonData on the assetData
    assetData.jsonData = event.jsonData;
    assetData.loaded = true;
    this.jsonProgress(event.numLoaded, event.numTotal);
    //check for some key properties to work out what it is
    var isAtlas = (assetData.jsonData.hasOwnProperty('frames')&&
        assetData.jsonData.hasOwnProperty('meta')) || assetData.type == "atlas";
    if(isAtlas){
        this.addImageToQueue(assetData.id, assetData.jsonData, filePath);
    }
    // - don't hardcode game_shell reference here
    this.jsonCache[assetData.id] = assetData.jsonData;
};

//progress event
cc.core.load.JSONLoadState.prototype.jsonProgress = function(numLoaded, total){
    this.bulkLoader.jsonLoaded(numLoaded / total);
};

cc.core.load.JSONLoadState.prototype.toString = function(){
    return "[JSONLoadState]";
};

/**
 *
 * @param id
 * @param jsonData
 * @param jsonFilePath
 */
cc.core.load.JSONLoadState.prototype.addImageToQueue = function(id, jsonData, jsonFilePath){
    var imgFilename = jsonData.meta.image;
    var imgManifest = this.bulkLoader.imgManifest;
    var n = imgManifest.length;
    //check it's not already in the list!
    //doh, could just use the id...
    var item = null;
    for(var i = 0 ; i < n;i++){
        item = imgManifest[i];
        //check for the filename....
        if(item.src.indexOf(imgFilename) > -1) {
            item.atlasData = jsonData;
            return;
        }
    }
    //add a manifest entry
    var data = {};
    //allow subfolders! -> strip the folderpath from the json filepath
    var lastSlash = jsonFilePath.lastIndexOf('/');
    var folderpath = jsonFilePath.substr(0, lastSlash + 1);
    //
    data.src = folderpath + imgFilename;
    data.id = id;//
    data.atlasData = jsonData;

    imgManifest[imgManifest.length] = data;

    //add it to the lookup!
    this.bulkLoader.urls.add(data);
};
/**
 * @class ImageLoadState
 *
 * @constructor
 */
cc.core.load.ImageLoadState = function () {
    this.bulkLoader = null;

    this.imageLoader = new cc.core.load.ImageLoader();

    //store loaded assets
    this._assets = {};//TODO - is this actually used for anything?
    this._srcPaths = {};

    this.resolution = 1;
};

/**
 * @method init
 * @param config
 */
cc.core.load.ImageLoadState.prototype.init = function (config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];
    this.imageLoaded = this._imageLoaded.bind(this);
    this.imageProgress = this._imageProgress.bind(this);
    this.loadComplete = this._loadComplete.bind(this);
};

/**
 *
 */
cc.core.load.ImageLoadState.prototype.load = function () {
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
cc.core.load.ImageLoadState.prototype._imageLoaded = function (event) {
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

cc.core.load.ImageLoadState.prototype.getAsset = function (id) {
    return this._assets[id];
};

/**
 *
 * @param event
 * @private
 */
cc.core.load.ImageLoadState.prototype._imageProgress = function (event) {
    this.bulkLoader.imageLoaded(event.progress);
};

/**
 * source paths are used when unloading
 * @param files
 */
cc.core.load.ImageLoadState.prototype.storeSourcePaths = function (files) {
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
cc.core.load.ImageLoadState.prototype._loadComplete = function () {
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
cc.core.load.ImageLoadState.prototype.addTexture = function (img, src) {
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
cc.core.load.ImageLoadState.prototype.createBaseTexture = function (img, src) {
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
cc.core.load.ImageLoadState.prototype.addAtlas = function (p_img, p_json, p_src) {
    var baseTexture = this.createBaseTexture(p_img, p_src);
    this.addAtlasData(baseTexture, p_json);
};

/**
 *
 * @param baseTexture
 * @param p_json
 */
cc.core.load.ImageLoadState.prototype.addAtlasData = function (baseTexture, p_json) {
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
cc.core.load.ImageLoadState.prototype.addAtlasFrame = function (item, key, baseTexture) {
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


cc.core.load.ImageLoadState.prototype.purge = function () {
    this._assets = {};
};
/**
 *
 * @param id
 */
cc.core.load.ImageLoadState.prototype.unloadImage = function (id) {
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
cc.core.load.ImageLoadState.prototype.unloadTextures = function (src) {
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
cc.core.load.ImageLoadState.prototype.unload = function (items) {
    var i, n = items.length, id;
    for (i = 0; i < n; i++) {
        id = items[i];
        this.unloadImage(id);
    }
    this.purge();
};

/**
 * Created by Alex on 2014/10/09.
 */

/**
 *
 * @param p_bulkLoader
 * @constructor
 */
cc.core.load.AudioLoadState = function(){
    this.bulkLoader = null;
    this.soundLoader = null;
};

/**
 *
 * @param config
 */
cc.core.load.AudioLoadState.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
};

/**
 *
 */
cc.core.load.AudioLoadState.prototype.load = function(){
    var bulkLoader = this.bulkLoader;
    var soundLoader = this.soundLoader;
    //allow having no sounds
    if(bulkLoader.webAudioManifest.length === 0){
        bulkLoader.sequence.next();
    } else{

        //TODO refactor with bind
        //****************************************
        soundLoader.on('progress',function(event){
           // console.log('sound progress ' + event.value)
            bulkLoader.audioLoaded(event.value);
        });
        //****************************************
        soundLoader.on('complete', function(event){
            soundLoader.offAll();
            bulkLoader.audioLoaded(1.0);
            bulkLoader.sequence.next();
        });
        //****************************************
        //start audio load - NOTE send through a copy!
        soundLoader.load(bulkLoader.webAudioManifest.slice());
    }
};

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
cc.core.load.BulkLoader = function(){
	cc.core.utils.EventDispatcher.call(this);

    this.resolution = 1;
    //reference to game_shell.json
    this.jsonCache = null;
    //**************************************
    // MANIFESTS - populated in loadManifestState  
    //**************************************
    this.jsonManifest = null;
    this.imgManifest = null;
    this.fontManifest = null;
    this.webAudioManifest = null;
    this.audioSpriteManifest = null;

};
//*******************************
cc.core.load.BulkLoader.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.load.BulkLoader.prototype.constructor = cc.core.load.BulkLoader;

/**
 *
 * @param config
 */
cc.core.load.BulkLoader.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];

    this.webAudio = this.settings.WEB_AUDIO_ENABLED && this.system.webAudio;//bool

    //**************************************
    //loaders
    //**************************************
    cc.core.load.soundLoader = new cc.core.audio.SoundLoader();
    //**************************************
    //load states
    //**************************************
    this.loadManifest = this.createLoadManifest();
    this.jsonLoad = this.createJsonLoad();
    this.imageLoad = this.createImageLoad();
    this.audioLoad = this.createAudioLoad();
    this.fontLoad = this.createFontLoad();

    //**************************************
    // Sequence control (Switch statement)
    //**************************************
    this.sequence = new cc.core.load.LoadingSequence(this, this.webAudio);

    //**************************************
    // url lookup component
    //**************************************
    this.urls = new cc.core.utils.UrlLookup();//use for id lookup

    //**************************************
    // OVERALL PROGRESS
    //**************************************
    this.progressTracker = new cc.core.load.ProgressTracker(this.webAudio);
};


/**
 * add a file to the manifest before loading it
 * @param filepath
 * @param id
 * @param type
 * @returns {*}
 */
cc.core.load.BulkLoader.prototype.addFile = function(filepath, id, type){
    var manifest = this.getManifestByExtension(filepath);
    var item = null;
    if(manifest !== null){
        item = {
            "src": filepath,
            "id": id
        };
        if(typeof type != 'undefined'){
            item.type = type;
        }
        manifest[manifest.length] = item;
        this.urls.add(item);
    }
    return item;//return then can modify if necessary
};

cc.core.load.BulkLoader.prototype.getManifest = function(){
    return this.loadManifest.manifest;
};


/**
 *
 * @param file
 * @returns {*}
 */
cc.core.load.BulkLoader.prototype.getManifestByExtension = function(file){
    //choose appropriate manifest
    var ext = file.match(/\.(\w+)$/)[0];
    var manifest = null;
    switch(ext){
        case '.png':
        case '.jpg':
            manifest = this.imgManifest;
            break;
        case '.json':
            manifest = this.jsonManifest;
            break;
        case '.fnt':
        case '.xml':
            manifest = this.fontManifest;
            break;
        case '.ogg':
        case '.m4a':
        case '.mp3':
        case '.wav':
            manifest = this.webAudioManifest;
            break;
    }
    return manifest;
};

//
/**
 * not too useful actually due to @2x, @4x etc
 * @param file
 * @returns {boolean}
 */
cc.core.load.BulkLoader.prototype.contains = function(file){
    var manifest = this.getManifestByExtension(file);
    var item = null, i, n = manifest.length, itemFound = false;
    for(i = 0; i < n; i++){
        item = manifest[i];
        //allow just filename maybe - indexOf
        if(item.src.indexOf(file) > -1){
            itemFound = true;
            break;
        }           
    }
    return itemFound;
};

/**
 *
 * @param id
 * @param fileType
 * @returns {boolean}
 */
cc.core.load.BulkLoader.prototype.containsId = function(id, fileType){
    var manifest = this.getManifestByExtension(fileType);
    var item = null, i, n = manifest.length, itemFound = false;
    for(i = 0; i < n; i++){
        item = manifest[i];
        //allow just filename maybe - indexOf
        if(item.id.indexOf(id) > -1){
            itemFound = true;
            break;
        }           
    }
    return itemFound;
};

//**************************************
// START LOAD
//**************************************
cc.core.load.BulkLoader.prototype.load = function(manifestPath){
    this.manifestPath = manifestPath;
    this.progressTracker.reset();
    this.sequence.reset();
    this.sequence.next();
};

/**
 *
 */
cc.core.load.BulkLoader.prototype.loadProgress = function(){
    var overallProgress = this.progressTracker.overallProgress();
    //TODO - event reuse
    this.emit({type:"progress", value: overallProgress});
};

cc.core.load.BulkLoader.prototype.fontLoaded = function(percent){
    this.progressTracker.progressFonts = percent;
    this.loadProgress();
};

cc.core.load.BulkLoader.prototype.imageLoaded = function(percent){
    this.progressTracker.progressImages = percent;
    this.loadProgress();
};

cc.core.load.BulkLoader.prototype.jsonLoaded = function(percent){
    this.progressTracker.progressJSON = percent;
    this.loadProgress();
};

cc.core.load.BulkLoader.prototype.audioLoaded = function(percent){
    this.progressTracker.progressSounds = percent;
    this.loadProgress();
};

/**
 * pass sounds over to sound manager
 */
cc.core.load.BulkLoader.prototype.addSounds = function(){
    var soundData = {};
    if(this.webAudio){
        //get the loaded sound assets
        soundData.assets = this.audioLoad.soundLoader.assets;
        game_shell.snd.addSounds(soundData.assets);
    } else {
        //audio sprite
        var manifestData = this.audioSpriteManifest;
        soundData.autoplay = true;
        soundData.sprites = (manifestData.sprites)? manifestData.sprites : null;
        soundData.src = null;
        if(manifestData.src) soundData.src = cc.core.settings.SND_DIR + manifestData.src;       
        game_shell.snd.addSounds(soundData);
    }
};

/**
 *
 */
cc.core.load.BulkLoader.prototype.loadComplete = function(){

    this.addSounds();

    this.emit({type:"complete"});
    //now remove all event listeners!
    this.offAll();
};

//**************************************
// UN-LOAD
//**************************************
        
cc.core.load.BulkLoader.prototype.unload = function(){
    // - get the manifest json data
    var jsonData = this.loadManifest.manifest;
    if(jsonData){
        // - unload the images
        this.imageLoad.unload(this.getIds(this.imgManifest));
        // - unload the sounds
        cc.core.load.soundLoader.unload(this.getIds(this.webAudioManifest));
        // - unload the fonts
        this.fontLoad.unload();
        // - unload the json
        this.jsonLoad.unload(this.getIds(this.jsonManifest));
        // - null the other bits and bobs
        this.loadManifest.manifest = null;
        this.jsonManifest = null;
        this.imgManifest = null;
        this.fontManifest = null;
        this.webAudioManifest = null;
        this.audioSpriteManifest = null;

    }
};

/**
 *
 * @param data
 * @returns {Array}
 */
cc.core.load.BulkLoader.prototype.getIds = function(data){
    var ids = [];
    var n = data.length, i, item;
    for(i =0; i < n; i++){
        item = data[i];
        ids[i] = item.id;
    }
    return ids;
};


// **************************************************************
// move these to a builder
// **************************************************************

/**
 *
 * @returns {cc.core.load.FontLoadState}
 */
cc.core.load.BulkLoader.prototype.createFontLoad = function(){
    var fontLoad = new cc.core.load.FontLoadState();
    fontLoad.init({
        resolution: this.resolution,
        bulkLoader: this
    });
    return fontLoad;
};

/**
 *
 * @returns {cc.core.load.AudioLoadState}
 */
cc.core.load.BulkLoader.prototype.createAudioLoad = function(){
    var audioLoad = new cc.core.load.AudioLoadState();
    audioLoad.init({
        bulkLoader: this,
        soundLoader: cc.core.load.soundLoader
    });
    return audioLoad;
};

/**
 *
 * @returns {cc.core.load.ImageLoadState}
 */
cc.core.load.BulkLoader.prototype.createImageLoad = function(){
    var imageLoad = new cc.core.load.ImageLoadState(this);
    imageLoad.init({
        resolution: this.resolution,
        bulkLoader: this
    });
    return imageLoad;
};

/**
 *
 * @returns {cc.core.load.LoadManifest}
 */
cc.core.load.BulkLoader.prototype.createLoadManifest = function(){
    var loadManifest = new cc.core.load.LoadManifest();
    loadManifest.init({
        resolution: this.resolution,
        bulkLoader: this
    });
    return loadManifest;
};

/**
 *
 * @returns {cc.core.load.JSONLoadState}
 */
cc.core.load.BulkLoader.prototype.createJsonLoad = function(){
    var loader = new cc.core.load.JSONLoadState();
    loader.init({
        resolution: this.resolution,
        bulkLoader: this,
        jsonCache: this.jsonCache
    });
    return loader;
};

//control load sequence
// json -> image -> sound -> end
//or
//json -> image -> end (if no web audio)
cc.core.load.LoadingSequence = function(p_loader, webAudio){

    this.loader = p_loader;
    this.webAudio = webAudio;

    //load states
    this.currentState = null;

};

cc.core.load.LoadingSequence.prototype.reset = function(){
    this.currentState = null;
};


cc.core.load.LoadingSequence.prototype.next = function(){
    switch(this.currentState){
        case null:
            this.currentState = this.loader.loadManifest;
            break;
        case this.loader.loadManifest:

            //dispatch an event here, to allow adding to the manifest
            this.loader.emit({type:'manifest_loaded'});

            this.currentState = this.loader.jsonLoad;
            break;
        case this.loader.jsonLoad:
            this.currentState = this.loader.imageLoad;
            break;
        case this.loader.imageLoad:
            this.currentState = this.loader.fontLoad;
            break;
        case this.loader.fontLoad:
            if(this.webAudio){
                this.currentState = this.loader.audioLoad;
            } else {
                this.currentState = null;
            }
            break;
        case this.loader.audioLoad:
            this.loader.addSounds();
            this.currentState = null;
            break;
    }

    if(this.currentState !== null){
        this.currentState.load();
    } else {
        this.loader.loadComplete();
    }
};
/**
 * asset url lookup helper
 * @constructor
 */
cc.core.utils.UrlLookup = function(){

};

/**
 * allow id reference rather than full path
 * @param p_list
 */
cc.core.utils.UrlLookup.prototype.storeLookup = function(p_list){
    if(p_list){
        //TODO - this fails if use for both json and image with same id!
        var n = p_list.length;
        var item;
        for(var i = 0; i < n;i++){
            item = p_list[i];
            this.add(item);
        }
    }
};
/**
 *
 * @param item
 */
cc.core.utils.UrlLookup.prototype.add = function(item){
    this[item.src] = item;
    this[item.id] = item;
};

/**
 *
 * @param key
 * @returns {*}
 */
cc.core.utils.UrlLookup.prototype.getAssetData = function(key){
    return this[key];
};

/**
 *
 * @param key
 * @returns {*}
 */
cc.core.utils.UrlLookup.prototype.getURL = function(key){
    var assetData = this[key];
    if(!assetData){
        console.log("ERROR - no asset found for key  -> " + key);
        return null;
    } else{
        return assetData.src;
    }
};

/**
 *
 * @param fileName
 * @returns {*}
 */
cc.core.utils.UrlLookup.prototype.pathForFile = function(fileName){
    var id, item, foundPath = null;
    for(id in this){
        if(this.hasOwnProperty(id)){
            item = this[id];
            if(item.hasOwnProperty('src')){
                if(item.src.indexOf(fileName) > -1){
                    foundPath = item.src;
                    break;
                }
            }
        }
    }
    return foundPath;
};
// progress tracker
cc.core.load.ProgressTracker = function(webAudio){
    this.webAudio = webAudio;
    this.reset();
    this.total = (this.webAudio)? 4 : 3;	
};

//
cc.core.load.ProgressTracker.prototype.totalProgress = function(){
    var prg = this.progressJSON + this.progressImages + this.progressFonts;
    if(this.webAudio) prg += this.progressSounds;
    return prg;
};
//
cc.core.load.ProgressTracker.prototype.overallProgress = function(){
    var prg = this.totalProgress();
    return prg / this.total;
};

//
cc.core.load.ProgressTracker.prototype.reset = function(){
    this.progressJSON = 0;  this.progressImages = 0;
    this.progressSounds = 0;  this.progressFonts = 0;
};

cc.core.load.ProgressTracker.prototype.debugLog = function(){
    var s = "* ProgressTracker: \n\r";
    s += " - total: " + this.total + " \n\r";
    s += " - overall: " + this.totalProgress() + " \n\r";
    s += " - progressJSON: " + this.progressJSON + " \n\r";
    s += " - progressImages: " + this.progressImages + " \n\r";
    s += " - progressSounds: " + this.progressSounds + " \n\r";
    s += " - progressFonts: " + this.progressFonts + " \n\r";
    return s;
};
//
cc.core.load.JsonLoader = function(url){
	cc.core.utils.EventDispatcher.call(this);
	this.url = url;
	this.id = null;
};
cc.core.load.JsonLoader.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.load.JsonLoader.prototype.constructor = cc.core.load.JsonLoader;

/**
 * This will begin loading the JSON file
 */
cc.core.load.JsonLoader.prototype.load = function(){
	this.ajaxRequest = new PIXI.AjaxRequest();
	var scope = this;
	this.ajaxRequest.onreadystatechange = function() {
		scope.onJSONLoaded();
	};
	this.jsonData = null;	
	this.ajaxRequest.open("GET", this.url, true);
	if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/json");
	this.ajaxRequest.send(null)
};

/**
 */
cc.core.load.JsonLoader.prototype.onJSONLoaded = function(){
	if (this.ajaxRequest.readyState === 4) {
        if(this.ajaxRequest.status === 200){
            this.responseText = this.ajaxRequest.responseText;//also store the plain text... needed for spine
            this.jsonData = JSON.parse(this.responseText);
            this.dispatchEvent({type: "loaded", data: this.jsonData});
        } else if(this.ajaxRequest.status === 404){
            this.dispatchEvent({type: "error", data: null});
        } else if(this.ajaxRequest.status === 0){
            this.dispatchEvent({type: "error", data: null});
        }
    }	
};

//bring this over from PIXI v2
PIXI.AjaxRequest = function() {
    var activexmodes = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Microsoft.XMLHTTP']; //activeX versions to check for in IE
    //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
    if (window.ActiveXObject){
        for (var i=0; i<activexmodes.length; i++) {
            try{
                return new window.ActiveXObject(activexmodes[i]);
            }catch(e) {
                //suppress error
            }
        }
    } else if (window.XMLHttpRequest){ // if Mozilla, Safari etc
        return new window.XMLHttpRequest();
    } else {
        return null;
    }
};

cc.core.load.JsonQueue = function(){
	cc.core.utils.EventDispatcher.call(this);
	this.queue = [];//an array
	this.results = {};
};
cc.core.load.JsonQueue.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.load.JsonQueue.prototype.constructor = cc.core.load.JsonQueue;

/*
manifest is a list of objects with name and path 
*/
cc.core.load.JsonQueue.prototype.load = function(p_manifest){
	this.queue = this.queue.concat(p_manifest);
	this.numTotal = this.queue.length;
	this.numLoaded = 0;
	this.boundCallback = this._jsonLoaded.bind(this);

	this.loadNext();
};

cc.core.load.JsonQueue.prototype.loadNext = function(){
	if(this.queue.length > 0){
		// - don't load the list backwards!
		//use shift!
		var obj = this.queue.shift();
		var id = obj.id, src = obj.src;
		this.results[id] = null;
		//
		var loader = new cc.core.load.JsonLoader(src);
		loader.id = id;
		loader.on("loaded",this.boundCallback);
		loader.load();
	} else {
		//load complete
		//console.log("load complete");
		this.emit({type: "complete", results: this.results});
	}	
};

cc.core.load.JsonQueue.prototype._jsonLoaded = function(p_evt){
	//console.log("cc.core.utils.JsonQueue.prototype.onJsonLoaded: " + p_evt)
	var loader = p_evt.target;
	var jsonData = loader.jsonData;
	var id = loader.id;
	this.results[id] = jsonData;
	loader.removeEventListeners();
	this.numLoaded++;
	//this really ought to pass through index of total
	this.emit({type: "loaded",
			id: id,
			url: loader.url,
			loader: loader,
			numLoaded: this.numLoaded,
			numTotal: this.numTotal,
			jsonData:jsonData });
	//
	this.loadNext();
    return jsonData;
};
/**
 * @class BitmapFontLoader
 * @param url
 * @constructor
 */
cc.core.load.BitmapFontLoader = function (url, resolution) {
    cc.core.utils.EventDispatcher.call(this);
    this.url = url;
    this.resolution = resolution;
};
cc.core.load.BitmapFontLoader.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.load.BitmapFontLoader.prototype.constructor = cc.core.load.BitmapFontLoader;

/**
 * begin loading the font xml file
 */
cc.core.load.BitmapFontLoader.prototype.load = function () {
    this.ajaxRequest = new PIXI.AjaxRequest();
    var self = this;
    this.ajaxRequest.onreadystatechange = function () {
        self.onXMLLoaded();
    };
    this.jsonData = null;
    this.ajaxRequest.open("GET", this.url, true);
    if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/xml");
    this.ajaxRequest.send(null)
};

/**
 * if xml loaded succesfully then load the font image
 * @method onXMLLoaded
 */
cc.core.load.BitmapFontLoader.prototype.onXMLLoaded = function () {
    if (this.ajaxRequest.readyState === 4) {
        if (this.ajaxRequest.status === 200) {
            //get the response xml
            var responseXML = this.ajaxRequest.responseXML;
            if (!responseXML || /MSIE 9/i.test(navigator.userAgent) || navigator.isCocoonJS) {
                if (typeof(window.DOMParser) === 'function') {
                    var domparser = new DOMParser();
                    responseXML = domparser.parseFromString(this.ajaxRequest.responseText, 'text/xml');
                } else {
                    var div = document.createElement('div');
                    div.innerHTML = this.ajaxRequest.responseText;
                    responseXML = div;
                }
            }
            //load the font image
            this.loadFontImage(responseXML);
        } else if (this.ajaxRequest.status === 404 || this.ajaxRequest.status === 0) {
            this.emit({type: "error", data: null, name: null});
        }
    }
};

/**
 * @method loadFontImage
 * @param responseXML
 */
cc.core.load.BitmapFontLoader.prototype.loadFontImage = function (responseXML) {
    //get the file name
    var imageFile = responseXML.getElementsByTagName('page')[0].getAttribute('file');
    var slashIndex = this.url.lastIndexOf('/');
    var folderURL = this.url.substr(0, slashIndex + 1);
    //concat the folder path
    var textureUrl = folderURL + imageFile;
    //check if image exists
    var texture = PIXI.utils.TextureCache[textureUrl];
    if (texture) {
        this.parseFontData(responseXML, texture);
    } else {
        //load the image!
        var img = new Image(),
            self = this;
        img.onload = function () {
            //create image
            var baseTexture = cc.core.load.ImageLoadState.prototype.createBaseTexture(img, textureUrl);
            texture = new PIXI.Texture(baseTexture);
            PIXI.utils.TextureCache[textureUrl] = texture;
            self.parseFontData(responseXML, texture)
        };
        img.src = textureUrl;
    }
};

/**
 * copied from pixi code
 * @method parseFontData
 * @param responseXML
 * @param texture
 * @returns {{}}
 */
cc.core.load.BitmapFontLoader.prototype.parseFontData = function (responseXML, texture) {
    var data = {};
    var info = responseXML.getElementsByTagName('info')[0];
    var common = responseXML.getElementsByTagName('common')[0];

    data.font = info.getAttribute('face');
    data.size = parseInt(info.getAttribute('size'), 10);
    data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
    data.chars = {};
    data.baseTexture = texture.baseTexture;

    //parse letters
    var letters = responseXML.getElementsByTagName('char');
    var letter = null;

    for (var i = 0; i < letters.length; i++) {
        letter = letters[i];
        var charCode = parseInt(letter.getAttribute('id'), 10);

        var textureRect = new PIXI.Rectangle(
            this.scaleValue(parseInt(letter.getAttribute('x'), 10) + texture.frame.x),
            this.scaleValue(parseInt(letter.getAttribute('y'), 10) + texture.frame.y),
            this.scaleValue(parseInt(letter.getAttribute('width'), 10)),
            this.scaleValue(parseInt(letter.getAttribute('height'), 10))
        );

        data.chars[charCode] = {
            xOffset: this.scaleValue(parseInt(letter.getAttribute('xoffset'), 10)),
            yOffset: this.scaleValue(parseInt(letter.getAttribute('yoffset'), 10)),
            xAdvance: this.scaleValue(parseInt(letter.getAttribute('xadvance'), 10)),
            kerning: {},
            texture: new PIXI.Texture(texture.baseTexture, textureRect)

        };
    }

    //parse kernings
    var kernings = responseXML.getElementsByTagName('kerning');
    for (i = 0; i < kernings.length; i++) {
        var first = this.scaleValue(parseInt(kernings[i].getAttribute('first'), 10));
        var second = this.scaleValue(parseInt(kernings[i].getAttribute('second'), 10));
        var amount = this.scaleValue(parseInt(kernings[i].getAttribute('amount'), 10));

        data.chars[second].kerning[first] = amount;
    }

    // store it in pixi fonts
    PIXI.extras.BitmapText.fonts[data.font] = data;

    this.emit({
        name: data.font,
        data: data,
        type: 'loaded'
    });
    return data;
};

/**
 *
 * @param value
 * @returns {number}
 */
cc.core.load.BitmapFontLoader.prototype.scaleValue = function (value) {
    return value / this.resolution;
};
/**
 *
 * @param config
 * @constructor
 */
cc.core.audio.MusicLoop = function(config){    
    this.type = cc.core.audio.AudioModes.MUSIC_LOOP;
    //this.sound = this.initSnd(config);
    if(config){
        for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];
    }    
    this.isMuted = false;
    this.isPaused = false;
    this.grp = 'music';
    this.volume = 1.0;
};

/**
 *
 * @param config
 */
cc.core.audio.MusicLoop.prototype.init = function(config){
    this.sound = this.initSnd(config);
};

/**
 *
 * @param config
 * @returns {Element}
 */
cc.core.audio.MusicLoop.prototype.initSnd = function(config){
    //choose appopriate audio file
    config.src += config.audioType;
    var snd = document.createElement('audio');
    snd.preload = 'auto';
    var self = this;
    //why need both?
    snd.addEventListener('loadeddata',function(){
        self.loadeddata = true;
    },false);
    snd.addEventListener('canplay',function(){
        self.loadeddata = true;
    },false);
    //
    snd.loop = true;
    var loopingSupported = typeof new Audio().loop == 'boolean';
    //loop is not well supported...
    if(!loopingSupported) {
        snd.addEventListener('ended', function () {
            snd.currentTime = 0;
            snd.play();
        }, false);
    }

    snd.autoplay = config.autoplay;
    //
    snd.src = config.src;
    //
    return snd;
};

//************************
cc.core.audio.MusicLoop.prototype.pause = function(b){
    this.isPaused = b;
    //TODO - perhaps check its loaded, etc
    if(this.isPaused){
        this.sound.pause();
    } else {
        this.sound.play();
    }
};
cc.core.audio.MusicLoop.prototype.isPlaying = function() {
    return !this.isPaused;
};
//************************
cc.core.audio.MusicLoop.prototype.update = function(elapsedTime){
    //TODO?
};
//************************
cc.core.audio.MusicLoop.prototype.dispose = function(){
    if(this.sound !== null){
        this.sound.pause();
        this.sound = null;
    }
};
//************************
cc.core.audio.MusicLoop.prototype.mute = function(bool){
    this.isMuted = bool;
    this.sound.muted = bool;
    this.sound.volume = (bool)? 0 : this.volume;
};
cc.core.audio.MusicLoop.prototype.muteGroup = function(grp, bool){
    if(grp == this.grp){
        this.mute(bool);
    }
};
cc.core.audio.MusicLoop.prototype.isGroupMuted = function(grp){
    if(grp == this.grp){
        return this.isMuted;
    } else {
        return false;
    }
};

//************************
/*cc.core.audio.MusicLoop.prototype.start = function(){
    this.sound.play();
};

cc.core.audio.MusicLoop.prototype.end = function(){
    this.sound.pause();
};*/
//************************
cc.core.audio.MusicLoop.prototype.play = function(p_id, p_vol, p_loop){
   this.sound.play();
};
cc.core.audio.MusicLoop.prototype.preload = function(p_id){
    //ignore
};
cc.core.audio.MusicLoop.prototype.stop = function(p_id){
    this.sound.pause();
};
cc.core.audio.MusicLoop.prototype.addSounds = function(p_id){
    //ignore
};
cc.core.audio.MusicLoop.prototype.stopAll = function(){
    //ignore
};
//************************
/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/10/08
 * Time: 3:08 PM
 * To change this template use File | Settings | File Templates.
 */

//null object for completely disabled sound...
cc.core.audio.SndNone = function(){
    this.mute = function(b){ };
    this.muteGroup = function(grp,b){ };
    this.muteAllGroups = function(b){ };
    this.isGroupMuted = function(blah){return true;};
    this.pause = function(b){ };
    this.isPlaying = function(){ return false; };
    this.update = function(elapsedTime){return false};
    this.play = function(p_id,p_vol,p_loop){};
    this.stop = function(p_id){};
    this.stopAll = function(){};
    this.dispose = function(){};
};
/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/10/08
 * Time: 3:29 PM
 * To change this template use File | Settings | File Templates.
 */
cc.core.audio.SoundLoader = function(){
    cc.core.utils.EventDispatcher.call(this);
    //
    this.assets = {};
    this.manifest = null;
    this.context = null;
    this.numLoaded = 0;
    this.evtProgress = {type:'progress', value: 0};
    this.evtComplete = {type:'complete', value: 1};
};
cc.core.audio.SoundLoader.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.audio.SoundLoader.prototype.constructor = cc.core.audio.SoundLoader;
/*
 * asset load manifest
 @param: items < Array of objects with src and id strings eg {src:"./img/bg1.jpg", id:"bg"},
 */
cc.core.audio.SoundLoader.prototype.load = function(items){
    if(!this.context) this.initContext();//only create context if not already in existence!
    if(!this.manifest){
        this.manifest = items;
    } else {
        this.manifest = this.manifest.concat(items);
    }
    this.loadNext();
};

// *****************************************************
// UNLOADING
// *****************************************************

cc.core.audio.SoundLoader.prototype.purge = function(){
    //remove references to loaded content
    //quick way is to ditch the whole assets object
    this.assets = {};
};

cc.core.audio.SoundLoader.prototype.unloadSound = function(id){
    delete this.assets[id];
};

cc.core.audio.SoundLoader.prototype.unload = function(sounds){
    var i, n = sounds.length, id;
    for(i = 0; i < n; i++){
        id = sounds[i];
        this.unloadSound(id);
    }
};
// *****************************************************

cc.core.audio.SoundLoader.prototype.initContext = function(){
    if (window.AudioContext) {
        this.context = new AudioContext();
    } else if (window.webkitAudioContext) {
        this.context = new webkitAudioContext();
    }
};

cc.core.audio.SoundLoader.prototype.nextItem = function(){
    //find next item that is not loaded
    var checkObj;
    var foundObj = null;
    var n = this.manifest.length;
    for(var i = 0; i < n; i++){
        checkObj = this.manifest[i];
        //is there an asset with this id?
        if(!this.assets.hasOwnProperty(checkObj.id)){
            foundObj = checkObj;
            break;
        }
    }
    return foundObj;
};

cc.core.audio.SoundLoader.prototype.countLoaded = function(){
    //find next item that is not loaded
    var checkObj, n = this.manifest.length;
    this.numLoaded = 0;
    for(var i = 0; i < n; i++){
        checkObj = this.manifest[i];
        //is there an asset with this id?
        if(this.assets.hasOwnProperty(checkObj.id)){
            this.numLoaded++;
        }
    }
};

cc.core.audio.SoundLoader.prototype.loadNext = function(){
    //find next item that is not loaded
    var itemData = this.nextItem();
    this.countLoaded();
    //console.log('SoundLoader.prototype.loadNext');
    //create an XMLHttpRequest to load the item
    if(itemData){
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", itemData.src, true);
        request.responseType = "arraybuffer";
        //
        var self = this;
        request.onload = function(){
            self.onSoundLoaded.call(self, itemData, request);
        };
        //
        request.onerror = function() {
            self.assets[itemData.id] = null;
            //update load bar
            self.loadProgress();
            self.loadNext();
        };
        //
        function updateProgress(evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                self.loadProgress(percentComplete);
                //console.log("updateProgress " + percentComplete)
                // var amount = self.numLoaded + percentComplete;
                // var total = self.manifest.length;
                // var progress = amount / total;
                // self.emit({type:"progress", value: progress})
                //if(self.onLoadProgress) self.onLoadProgress(progress);
           // } else {
                // Unable to compute progress information since the total size is unknown
            }
        }
        request.addEventListener("progress", updateProgress, false);


        //
        try{
            request.send();
        } catch(e){
            console.log('SoundLoader: XHR error ' + request.status);
        }

    } else {
        this.manifest.length = 0; //clear the manifest
        //load complete!
        //update load bar
        this.loadComplete();
    }
};

cc.core.audio.SoundLoader.prototype.onSoundLoaded = function(itemData, request) {
    var self = this;
    var id = itemData.id;
   // console.log('onSoundLoaded ' + id)
    if(typeof this.context.decodeAudioData == "function"){
        this.context.decodeAudioData(request.response,
            function onSuccess(decodedBuffer) {
                //Attach the buffer to the data as property 'soundData'
                itemData.soundData = decodedBuffer;
                //and put the data object itself into the assets array
                self.assets[id] = itemData;//context.createBuffer(request.response, true);
                //update load bar
                self.loadProgress();
                self.loadNext();
            },
            function onFailure() {
                self.assets[id] = null;
                //update load bar
                self.loadProgress();
                self.loadNext();
            }
        );
    } else {
        if(request.status === 200){
            if(window.AudioContext){
                itemData.soundData = this.context.createBuffer(request.response, 1, 44100);
            } else {
                //Attach the buffer to the data as property 'soundData'
                itemData.soundData = this.context.createBuffer(request.response, true);
            }
            //and put the data object itself into the assets array
            this.assets[id] = itemData;//context.createBuffer(request.response, true);
        } else {
            this.assets[id] = null;
        }
        //update load bar
        this.loadProgress();
        this.loadNext();
    }
};

cc.core.audio.SoundLoader.prototype.loadProgress = function(progress){
    if(progress === undefined) progress = 0;
    var total = this.manifest.length;
    var amount = (this.numLoaded + progress) / total;
    //console.log('SoundLoader progress ' + amount)
    this.evtProgress.value = amount;
    this.emit(this.evtProgress);
};

cc.core.audio.SoundLoader.prototype.loadComplete = function(){
    this.emit(this.evtComplete);
};
/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/10/07
 * Time: 4:39 PM
 * To change this template use File | Settings | File Templates.
 */
cc.core.audio.SndSprite = function(config){
    cc.core.utils.EventDispatcher.call(this);
    //************************
    this.type = cc.core.audio.AudioModes.AUDIO_SPRITE;
    //************************
    //playback vars
    this.endTime = -1;
    this.isMuted = false;

    this.audioType = config.audioType;
    //TODO - consolidate these three into a 'state' variable
    this.isReady = false;
    this.bufferingComplete	= false;
    this.secondsBuffered	= 0;
    this.loadeddata	= false;
    //************************************
    // default group keys
    //************************************
    this.SFX = 'sfx';
    this.MUSIC = 'music'; //
    this.soundGroups = {};
    this.addSoundGroup(this.SFX);
    this.addSoundGroup(this.MUSIC);
    //************************************
    if(config && config.src){
        this.setSounds(config); //NOTE - setSounds calls initSnd...
    }
    
};
cc.core.audio.SndSprite.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.audio.SndSprite.prototype.constructor = cc.core.audio.SndSprite;
//
cc.core.audio.SndSprite.prototype.addSoundGroup = function(p_id){
    var group = new cc.core.audio.SoundGroup(p_id);
    this.soundGroups[p_id] = group;
    return group;
};

// ***************************************
// SETUP
// ***************************************
//NOTE- this actually overwrites the old sounds, so setSounds would have been a better name..     
cc.core.audio.SndSprite.prototype.setSounds = function(config){

    this.sprites = this.parseManifest(config.sprites);
    //
    this.sound = this.initSnd(config);

    if(!config.isIOS) {
        this.preload();
    }  
};



cc.core.audio.SndSprite.prototype.parseManifest = function(p_data){
    if(!p_data) return [];
    var obj, i, n = p_data.length, soundData = [], soundGroup;
    for(i = 0;i < n;i++){
        obj = p_data[i];
        if(!obj.hasOwnProperty("end") && obj.hasOwnProperty("duration")){
            obj.end = obj.start + obj.duration;
        }
        //make sure it has a sound group
        if(!obj.hasOwnProperty("grp")) obj.grp = this.SFX;
        soundData[i] = obj;
        //add it to its group
        soundGroup = this.soundGroups[obj.grp];
        //TODO - validate the group!
        soundGroup.addSound(obj);
    }
    return soundData;
};

cc.core.audio.SndSprite.prototype.initSnd = function(config){
    if(!config.src) return null;
    //choose appopriate audio file
    config.src += this.audioType;//config.fileType;
    var snd = document.createElement('audio');
    snd.preload = 'auto';
    var self = this;

    //why need both?
    snd.addEventListener('loadeddata',function(){
        self.loadeddata = true;
    },false);
    snd.addEventListener('canplay',function(){
        self.loadeddata = true;
    },false);
    //
    snd.src = config.src;
    //check if buffering is supported...

    this.bufferSupported = (typeof snd.buffered !== "undefined");

    //
    return snd;
};

cc.core.audio.SndSprite.prototype.preload = function(){
    if(this.sound){
        this.sound.autoplay = true;
        //play 2.5 secs of silence at start to buffer it
        this.endTime = 2.5;//TODO - make this value configurable!
        this.sound.play();
    }
};

// ***************************************
// PLAYBACK
// ***************************************

/*
 * TODO p_vol & p_loop are currently ignored
 */
cc.core.audio.SndSprite.prototype.play = function(p_id,p_vol,p_loop){
    //trace("play " + p_id)
    //trace("bufferingComplete " + bufferingComplete)
    if (!this.bufferingComplete) return false;
    //check sound has buffered!
    var duration = this.sound.duration;
    if(isNaN(duration) || duration < 2) return false;
    //
    //trace("self.isMuted " + self.isMuted)
    if(this.isMuted) {
        this.stop();
        return false;
    }

    //trace("self.isGamePaused " + self.isGamePaused)
    if(this.isGamePaused) return;
    var foundObj = this.getSpriteData(p_id);
    //trace("foundObj " + foundObj)
    //**************************
    if(foundObj !== null){
        //check if the sound group is muted!
        var grpId = foundObj.grp;
        var soundGroup = this.soundGroups[grpId];
        if(soundGroup.isMuted) return false;
        //

        this.endTime = foundObj.end;//seconds
        var success = true;
        //try / catch this!
        try {
            //stop if already playing!
            if(!this.sound.paused) this.sound.pause();
            //
            this.sound.currentTime = foundObj.start;//seconds
            //trace("play from " + foundObj.start)
            this.sound.play();


        } catch(e){
            //trace("SndSprite - playback error");
            this.endTime = -1;
            success = false;
        }
        return success;

    } else {
        //	trace("SndSprite :: Could not find sound " + p_id);
        return false;
    }
};
cc.core.audio.SndSprite.prototype.stop = function(p_id){
    if(this.sound){
        //trace("SndSprite.stop");
        this.sound.pause();
        this.endTime = -1;
    }
};

/*
 *
 */
cc.core.audio.SndSprite.prototype.stopAll = function(){
    if(this.sound){
        this.sound.pause();
        this.endTime = -1;
    }
};

/*
 *
 */
cc.core.audio.SndSprite.prototype.dispose = function(){
    if(this.sound){
        this.sound.pause();
        this.endTime = -1;
        this.sound = null;
    }
};

cc.core.audio.SndSprite.prototype.getSpriteData = function(id){
    var obj;
    var foundObj = null;
    var n = this.sprites.length;
    for(var i =0; i < n;i++){
        obj = this.sprites[i];
        if(obj.id === id){
            foundObj = obj;
            break;
        }
    }
    return foundObj;
};

cc.core.audio.SndSprite.prototype.isPlaying = function() {
    //NOTE - this could also check if endTime > -1!
    if(!this.sound) return false;
    return !this.sound.paused;
};

/*
 * this needs to be called while playing
 */
cc.core.audio.SndSprite.prototype.update = function(elapsedTime){
    if(!this.loadeddata) return;
    //
    if(!this.bufferingComplete){
        //var secondsBuffered;
        if(this.bufferSupported){
            //check for complete buffering
            var timeRange = this.sound.buffered;
            try {
                this.secondsBuffered = timeRange.end(0);
            } catch(e){
                //checking buffer throws an error on stock browser
                this.secondsBuffered += elapsedTime / 10;//<-- buffer is seconds, update time is ms
            }
        } else {
            //checking buffer throws an error on stock browser
            this.secondsBuffered += elapsedTime / 10;//<-- buffer is seconds, update time is ms
        }
        //TODO - do I really need to buffer the whole thing?
       //console.log('duration: ' + this.sound.duration + ' secondsBuffered: ' + this.secondsBuffered)
        // if(this.sound.duration > 0 && this.secondsBuffered === this.sound.duration){
        if(this.sound.duration > 0 && this.secondsBuffered >= this.sound.duration){
            this.bufferingComplete = true;
            this.isReady = true;
            this.emit({type:'ready'});
        }
        //if sound is playing then check for end time
    } else if(this.endTime > -1){
        //check the currentTime!
        if (this.sound.currentTime >= this.endTime) {
            this.sound.pause();
            this.endTime = -1;
            this.bufferingComplete = true;
        }
    }
};


// ***************************************
// MUTE HANDLING
// ***************************************

cc.core.audio.SndSprite.prototype.mute = function(bool){
    this.isMuted = bool;
    if(bool){
        this.stop();
    }
};

cc.core.audio.SndSprite.prototype.muteGroup = function(grp,bool){
    var soundGroup = this.soundGroups[grp];
    soundGroup.isMuted = bool;
};

cc.core.audio.SndSprite.prototype.muteAllGroups = function(b){
    for(var s in this.soundGroups){
        if(this.soundGroups.hasOwnProperty(s)){
            this.muteGroup(s, b);
        }
    }
};

cc.core.audio.SndSprite.prototype.isGroupMuted = function(groupId){
    var soundGroup = this.soundGroups[groupId];
    //validate
    return (soundGroup === undefined)? false : soundGroup.isMuted;
};

cc.core.audio.SndSprite.prototype.pause = function(b){
    this.isGamePaused = b;
    if(b){
        this.stop();
    } else {
        //nothing really!
    }
};
/**
 * Created by Alex on 2014/10/09.
 */
cc.core.audio.SoundGroup = function(name){
    this.id = name;
    this.sounds = [];
    this.isMuted = false;

    this.addSound = function(sndData){
        this.sounds[this.sounds.length] = sndData;
    };
};
/**
 * Basically a wrapper for an AudioBufferSourceNode
 * @class Channel
 * @param config
 * @constructor
 */
cc.core.audio.Channel = function(config){
    cc.core.utils.EventDispatcher.call(this);
    this.id = config.id;
    this.context = config.context;
    this.channel = null;//AudioBufferSourceNode 

    this.eventComplete = {type:"complete"};

    this.start = config.start || 0;
    this.duration = config.duration || -1;
    //
    this.createChannel(config);
    //
    this.gainNode = this.createGainNode();
    // Connect the source to the gain node.
    this.channel.connect(this.gainNode);
    // connection to sound destination via mute node
    this.muteNode = null;
    //volume - see getter / setter!
    if(config.volume !== undefined){
        this.volume = config.volume;
    }
    //fader tween
    this.tw = null;//only create if needed
};
cc.core.audio.Channel.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.audio.Channel.prototype.constructor = cc.core.audio.Channel;

/**
 *
 * @param config
 */
cc.core.audio.Channel.prototype.createChannel = function(config){
    var self = this;
    this.channel = this.context.createBufferSource();//AudioBufferSourceNode 
    this.channel.buffer = config.buffer;
    this.channel.loop = config.loop === true;
    //console.log('this.channel.loop: ' + this.channel.loop)
    if(!config.loop){
        this.channel.onended = function(){
            self.emit(self.eventComplete);
        };
    } else {
        this.channel.loopStart = this.start;
        this.channel.loopEnd = this.start + this.duration;
    }
};

/**
 *
 * @returns {Gain Node}
 */
cc.core.audio.Channel.prototype.createGainNode = function(){
    if(this.context.createGainNode){
        return this.context.createGainNode();
    } else if(this.context.createGain){
        return this.context.createGain();
    } else {
        return null;
    }
};

/**
 *
 * @param p_muteNode
 */
cc.core.audio.Channel.prototype.connect = function(p_muteNode){
    this.muteNode = p_muteNode;
    // Connect the gain node to the destination via the muteNode
    this.gainNode.connect(this.muteNode);
};

// **********************************************
// PLAYBACK
// **********************************************

/**
 *
 */
cc.core.audio.Channel.prototype.play = function(){
    /*
     https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode.start
     Parameters
     when
     The when parameter defines when the play will start. If when represents a time in the past, the play will start immediately. If the method is called more than one time, or after a call to AudioBufferSourceNode.stop(), an exception is raised.
     offset
     The offset parameter, which defaults to 0, defines where the playback will start.
     duration
     The duration parameter, which defaults to the length of the asset minus the value of offset, defines the length of the portion of the asset to be played.
     */

    //NOTE - chrome audio loop bug
    //https://bugs.chromium.org/p/chromium/issues/detail?id=457099

    //workaround for looping bug
    var duration = (this.channel.loop)? 1<<25 : this.duration;

    if(this.channel.start){
        if(this.duration > -1){
            this.channel.start(0, this.start, duration);
        } else {
            this.channel.start(0);
        }
        //TODO - is this noteOn stuff still needed?
    } else if(this.channel.noteOn){
        if(this.duration > -1){
            this.channel.noteGrainOn(0, this.start, duration);
        } else {
            this.channel.noteOn();
        }
    }
};

/**
 *
 */
cc.core.audio.Channel.prototype.stop = function(){
    if(this.channel !== null){
        try{
            if(this.channel.stop){
                this.channel.stop(0);
            } else if(this.channel.noteOff){
                this.channel.noteOff(0);
            }
            //maybe check if this.channel.numberOfOutputs is bigger than zero?!
            if(this.channel.numberOfOutputs > 0){
                //hang on, disconnect doesn't take the target as an argument!
                //https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/disconnect
                this.channel.disconnect();//this.gainNode);  
            }              
        } catch(e){
            console.log('sound channel error on stop: ' + e.message);
            //eg - Failed to execute 'disconnect' on 'AudioNode': the given destination is not connected.
        }   
    }   
};

// **********************************************
// VOLUME
// **********************************************
Object.defineProperty(cc.core.audio.Channel.prototype, 'volume', {
    get: function() {
        return this.gainNode? this.gainNode.gain.value : 0;
    },
    set: function(value){
        if(this.gainNode) this.gainNode.gain.value = value;
    }
});

// **********************************************
// FADING
// **********************************************

/**
 * Fade the track out then stop.
 * @param p_time
 */
cc.core.audio.Channel.prototype.fadeOut = function(p_time){
    var time = (p_time === undefined)? 1000 : p_time;
    //use TWEEN with callback
    if(!this.tw) this.tw = this.createTween();
    this.tw.to({volume: 0}, time).start();
//    this.gainNode.gain.linearRampToValueAtTime(targetVol, fadeTime);
};

/**
 * @method fadeIn
 * @param p_vol
 * @param p_time
 */
cc.core.audio.Channel.prototype.fadeIn = function(p_vol, p_time){
    var time = (p_time === undefined)? 1000 : p_time;
    if(p_vol > 1) p_vol = 1;//safety measure!
    //use TWEEN with callback
    if(!this.tweenFadeIn) this.tweenFadeIn = new TWEEN.Tween(this);
    this.tweenFadeIn.to({volume: p_vol}, time).start();
//    this.gainNode.gain.linearRampToValueAtTime(p_vol, time);
};

/**
 * NO CALLBACK!
 * @param p_vol
 * @param p_secs
 */
cc.core.audio.Channel.prototype.fadeTo = function(p_vol, p_secs){
    var time = (p_secs === undefined)? 1 : p_secs;
    this.gainNode.gain.linearRampToValueAtTime(p_vol, this.context.currentTime + time);
    //would have to use update cycle with timeout or something like that
};

/**
 *
 * @returns {TWEEN.Tween}
 */
cc.core.audio.Channel.prototype.createTween = function(){
    //tween for fading
    var tw = new TWEEN.Tween(this);
    var self = this;
    tw.onComplete(function(){
        self.stop.call(self);
        self.emit(self.eventComplete);
    });
    return tw;
};

// **********************************************
// DESTRUCTOR
// **********************************************

/**
 *
 */
cc.core.audio.Channel.prototype.dispose = function(){
    this.removeEventListeners();
    // - cancel any tweening!
    if(this.tw) {
        this.tw.stop();
        this.tw = null;
    }
    if(this.context !== null){
        this.stop();
        this.channel = null;
        this.gainNode.disconnect();
        this.muteNode = null;
        this.gainNode = null;
        this.context = null;
    }
};
/**
 * @class WebAudioMgr
 * @param config
 * @constructor
 */
cc.core.audio.WebAudioMgr = function(config){
    //************************************
    this.type = cc.core.audio.AudioModes.WEB_AUDIO;
    //************************************
    this.context = config.context || this.createContext();
    //************************************
    this.sounds = {};//Collection of sound buffers
    this.channels = {};//Collection of sound channels > js/audio/Channel.js
    this.soundGroups = {};//mute groups for sfx / music
    this.catalog = {};//ids to play
    //************************************
    // Global Mute
    //************************************
    this.globalMute = new cc.core.audio.WebAudioSoundGroup('master', this.createGainNode());
    this.globalMute.connect(this.context.destination);
    //************************************
    // default group keys
    //************************************
    this.SFX = 'sfx';
    this.MUSIC = 'music';
    //************************************
    // create default sound groups sfx and music
    //TODO - also any others from config?
    //************************************
    this.addSoundGroup(this.SFX);
    this.addSoundGroup(this.MUSIC);
    //************************************
    if(config.assets) this.addSounds(config.assets);
    //************************************
};
///****************************************************
// Setup
///****************************************************
/**
 *
 * @returns {*}
 */
cc.core.audio.WebAudioMgr.prototype.createContext = function(){
    var ctx;
    if (window.AudioContext) {
        ctx = new AudioContext();
    } else if (window.webkitAudioContext){
        ctx = new webkitAudioContext();
    }
    return ctx;
};

/**
 *
 * @returns {*}
 */
cc.core.audio.WebAudioMgr.prototype.createGainNode = function(){
    if(this.context.createGainNode){
        return this.context.createGainNode();
    } else if(this.context.createGain){
        return this.context.createGain();
    } else {
        return null;
    }
};
//************************************
// PLAYBACK METHODS
//************************************
/**
 *
 * @param id
 * @param p_vol
 * @param p_loop
 * @returns {*}
 */
cc.core.audio.WebAudioMgr.prototype.play = function(id, p_vol, p_loop){

    // - need to be able to reference sprites, not just files!
    //need a new lookup called catalog or something that references sprites with start times

    var audioData = this.catalog[id];
    var channel = null;
    if(audioData === undefined) return channel;
    //
    var buffer = audioData.soundData;
    //TODO - can buffer really be undefined?
    if(buffer !== null && buffer !== undefined){
        //allow getting the volume and loop settings from the data!
        var vol = p_vol || audioData.volume || 1;
        var loop = p_loop || audioData.loop || false;
        var start = audioData.start || 0;
        //NOTE - can't use buffer.duration here due to chrome looping bug!
        var duration = audioData.duration || -1;// buffer.duration || -1;
        //switch to object argument
        var config = {
            id: id,
            context: this.context,
            buffer: buffer,
            loop: loop,
            start: start,
            duration: duration,
            volume: vol
        };
        channel = new cc.core.audio.Channel(config);
        var self = this;
        channel.on("complete", function(event){
            self.stopChannel(event.target);
        });
        //now check the sound group of the data object...
        var group = this.soundGroups[audioData.grp];
        channel.connect(group.node);
        //need to keep hold of this source object somewhere, to allow stopping the sound!
        this.channels[id] = channel;
        channel.play();
    }
    return channel;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
cc.core.audio.WebAudioMgr.prototype.isPlaying = function(id){
    return this.channels.hasOwnProperty(id);
};

/**
 * stop sound by id
 * @param id
 */
cc.core.audio.WebAudioMgr.prototype.stop = function(id){
    if(this.channels.hasOwnProperty(id)){
        var channel = this.channels[id];
        this.stopChannel(channel);
    }
};
/*
 * stop ALL sounds...!
 */
cc.core.audio.WebAudioMgr.prototype.stopAll = function(){
    var id, channel;
    for(id in this.channels){
        if(this.channels.hasOwnProperty(id)){
            channel = this.channels[id];
            this.stopChannel(channel);
        }
    }
};

/**
 *
 * @param channel
 */
cc.core.audio.WebAudioMgr.prototype.stopChannel = function(channel){
    var id = channel.id;
    //only delete the channel if it is a reference to the same channel object!
    //otherwise can get orphaned channel issues...
    if(this.channels[id] === channel){
        delete this.channels[id];
    } else {
        //console.log("* WebAudioMgr - !!!! NOT DELETING CHANNEL, IT WAS ALREADY REPLACED!!!")
    }
    channel.dispose();
    channel = null;
};
///****************************************************
// Fade
///****************************************************
//fade out
cc.core.audio.WebAudioMgr.prototype.fadeOut = function(id, p_time){
    //console.log("* WebAudioMgr - fadeOut " + id);
    if(this.channels.hasOwnProperty(id)){
        var channel = this.channels[id];
        var fadeTime = (p_time === undefined)? 1000 : p_time;
        channel.fadeOut(fadeTime);
    }
};
//fade in
cc.core.audio.WebAudioMgr.prototype.fadeIn = function(id, p_vol, p_time){
    if(this.channels.hasOwnProperty(id)){
        var channel = this.channels[id];
        if(channel){
            var fadeTime = (p_time === undefined)? 1000 : p_time;
            var fadeVol = (p_vol === undefined)? 1.0 : p_vol;
            channel.fadeIn(fadeVol, fadeTime);
        }
    }
};


///****************************************************
// Populate
///****************************************************
cc.core.audio.WebAudioMgr.prototype.addSounds = function(p_assets){
    var audioData, jsonData, id;//String
    //changed this, the assets dictionary now holds data objects, the sound buffer is a property of that object

    for(id in p_assets){
        if(p_assets.hasOwnProperty(id)){
            //ignore if already loaded
            if(!this.sounds.hasOwnProperty(id)){
                jsonData = p_assets[id];
                //only register ones that loaded succesfully
                if(jsonData.soundData !== null) {
                    audioData = new cc.core.audio.WebAudioData(jsonData);
                    this.sounds[id] = audioData;
                    this.addToCatalog(audioData);
                }
            }
        }
    }
};

/**
 *
 * @param webAudioManifest
 */
cc.core.audio.WebAudioMgr.prototype.removeSounds = function(webAudioManifest){
    var i, n = webAudioManifest.length, data;
    for(i = 0; i < n; i++){
        data = webAudioManifest[i];
        if(this.sounds.hasOwnProperty(data.id)){
            delete this.sounds[data.id];
        }
    }
};

/**
 *
 */
cc.core.audio.WebAudioMgr.prototype.purge = function(){
    for(var s in this.sounds){
        if(this.sounds.hasOwnProperty(s)){
            delete this.sounds[s];
        }
    }
};

/**
 *
 * @param audioData
 */
cc.core.audio.WebAudioMgr.prototype.addToCatalog = function(audioData){
    if(!audioData.sprites){
        this.catalog[audioData.id] = audioData;
    } else {
        var sprites = audioData.sprites;
        var i, sprite, n = sprites.length;
        for(i =0; i < n;i++){
            sprite = sprites[i];
            this.catalog[sprite.id] = sprite;
        }
    }
};

/**
 *
 * @param config
 * @constructor
 */
cc.core.audio.WebAudioData = function(config){
    this.src = config.src;
    this.soundData = config.soundData;
    this.id = config.id;
    this.grp = config.grp || 'sfx';
    this.volume = config.volume || 1.0;
    this.loop = config.hasOwnProperty('loop')? config.loop : false;
    this.sprites = null;
    // added audio sprite support
    if(config.hasOwnProperty('sprites')){
        //eg {id:'MATCH_3', start:3.96,duration:1.8}
        var i, n = config.sprites.length, item, grp, id, loop;
        if(n > 0){
            this.sprites = [];
            for(i = 0; i < n;i++){
                item = config.sprites[i];
                // - check for id 'music'here...
                //unfortunately loop still has to be mostly manual...
                id = item.id;
                grp = item.grp;
                if(!grp){
                    if(id.match(/music/i) !== null){
                        grp = 'music';
                        if(item.hasOwnProperty('loop')){
                            loop = item.loop;
                        } else {
                            loop = true;//default to loop if its music
                        }
                    } else {
                        grp = this.grp;
                        if(item.hasOwnProperty('loop')){
                            loop = item.loop;
                        } else {
                            loop = false;
                        }
                    }
                }
                this.sprites[i] = {
                    id: id,
                    start: item.start,
                    soundData: this.soundData,
                    grp: grp,
                    loop: loop,
                    duration: item.duration
                };
            }
        }
    }
};
///****************************************************
// Sound Group handling
///****************************************************

cc.core.audio.WebAudioMgr.prototype.addSoundGroup = function(p_id){
    var gainNode = this.createGainNode();
    var group = new cc.core.audio.WebAudioSoundGroup(p_id, gainNode);
    group.connect(this.globalMute.node);
    this.soundGroups[p_id] = group;
    return group;
};

cc.core.audio.WebAudioMgr.prototype.isGroupMuted = function(groupId){
    var group = this.soundGroups[groupId];
    //validate
    return (group === undefined)? false : group.isMuted;
};

///****************************************************

//************************************
// MUTING
//************************************

//
cc.core.audio.WebAudioMgr.prototype.mute = function(b){
    this.globalMute.isMuted = b;
    //muteNode.gain.value = b? 0 : 1.0;
    this.globalMute.volume = b? 0 : 1.0;
};

cc.core.audio.WebAudioMgr.prototype.muteGroup = function(grp,b){
    var grpNode = this.soundGroups[grp];  //TODO - validate?
    grpNode.volume = b? 0 : 1.0;
    grpNode.isMuted = b;
};

cc.core.audio.WebAudioMgr.prototype.muteAllGroups = function(b){
    for(var s in this.soundGroups){
        if(this.soundGroups.hasOwnProperty(s)){
            this.muteGroup(s, b);
        }
    }
};

//bit of a cheat... mute instead of pause
cc.core.audio.WebAudioMgr.prototype.pause = function(bool){
    if(bool){
        this.globalMute.volume = 0;
    } else {
        if(!this.globalMute.isMuted){
            this.globalMute.volume = 1.0;
        }
    }
};

cc.core.audio.WebAudioMgr.prototype.update = function(delta){
    //nothing for now...
};
///****************************************************
/*
 * call this in response to a touch event to wake the audio system on iOS!
 */
cc.core.audio.WebAudioMgr.prototype.wakeAudioSystem = function(){
    // create empty buffer
    var buffer = this.context.createBuffer(1, 1, 22050);
    var source = this.context.createBufferSource();
    source.buffer = buffer;
    // connect to output (your speakers)
    source.connect(this.context.destination);
    // play the file
    if(source.play){
        source.play(0);
    } else if(source.noteOn){
        source.noteOn(0);
    }
};

/**
 *
 * @param name
 * @param gainNode
 * @constructor
 */
cc.core.audio.WebAudioSoundGroup = function(name, gainNode){
    this.id = name;
    this.node = gainNode;
    this.isMuted = false;
    this.connect = function(dest){
        this.node.connect(dest);
    };
};

Object.defineProperty(cc.core.audio.WebAudioSoundGroup.prototype,'volume', {
    get: function() {
        return this.node.gain.value;
    },
    set: function(value) {
        this.node.gain.value = value;
    }
});
/**
 * @class SndMgr
 * @constructor
 */
cc.core.audio.SndMgr = function(){
    //use null object pattern here to begin with...
    this.snd = new cc.core.audio.SndNone();
    this.audioModes = cc.core.audio.AudioModes;
    this.audioType = null;
    //
    this.mode = -1; //no mode
    this.isMuted = false;

    this.updateList = new cc.core.utils.UpdateList();
};

/**
 *
 * @type {{NONE: number, WEB_AUDIO: number, AUDIO_SPRITE: number, MUSIC_LOOP: number}}
 */
cc.core.audio.AudioModes = {
    NONE: 0,//no sound
    WEB_AUDIO: 1,// web audio sound
    AUDIO_SPRITE: 2,//html5 audio tag sfx
    MUSIC_LOOP: 3 // html5 audio tag music loop
};

/**
 *
 * @param config
 * @returns {number|*}
 */
cc.core.audio.SndMgr.prototype.init = function(config){
    this.audioType = config.audioType;
    this.isMuted = config.isMuted;
    var isIOS = config.isIOS;
    var audioEnabled = config.audioEnabled;
    var webAudioEnabled = config.webAudioEnabled;
    //
    if(!audioEnabled){
        //Null object
        this.initNone();
    } else if(webAudioEnabled && cc.core.utils.system.webAudio){
        // web audio
        this.createWebAudio(config);
        if(!isIOS) this.prepare();
    } else {
        //HTML audio tag
        this.createAudioSprite(config);
    }
    //iOS requires a touch to get started
    if(isIOS && this.mode !== this.audioModes.NONE){
        //add a touch listener to the stage
        //iOS 9 changes this to only work with touch end...
        var canvas = game_shell.stage.renderer.view,
            self = this, event = "touchend";
        function touchHandler(){
            canvas.removeEventListener(event, touchHandler);
            self.prepare();
        }
        canvas.addEventListener(event, touchHandler, false);
    }
    return this.mode;
};

/**
 * add sound data
 * TODO - where is this called from? ScreenMgr.addSounds?
 * @param data
 */
cc.core.audio.SndMgr.prototype.addSounds = function(data){
    if(this.webAudio){
        this.snd.addSounds(data);
    } else {
        data.audioType = this.audioType;
        //may need to switch type
        var hasSprites = data.sprites !== null;
        var hasSrc = data.src !== null;
        if(!hasSrc){
            this.initNone();
        } else if(hasSprites){
            //is it currently an audio sprite?
            if(this.snd.type === this.audioModes.AUDIO_SPRITE){
                //just call setSounds
                this.snd.setSounds(data);
            } else {
                //switch to audio sprite
                this.createAudioSprite(data);
            }
        } else {
            //always just create a new music loop
            this.createAudioLoop(data);
        }

    }
};

/**
 *
 * @param config
 */
cc.core.audio.SndMgr.prototype.createWebAudio = function(config){
    this.snd = new cc.core.audio.WebAudioMgr(config);
    this.mode = this.audioModes.WEB_AUDIO;
};

/**
 *
 * @param config
 */
cc.core.audio.SndMgr.prototype.createAudioSprite = function(config){
    //kill previous
    if(this.snd){
        this.snd.dispose();
    }
    this.snd = new cc.core.audio.SndSprite(config);
    this.mode = this.audioModes.AUDIO_SPRITE;
};

/**
 *
 * @param config
 */
cc.core.audio.SndMgr.prototype.createAudioLoop = function(config){
    //kill previous
    if(this.snd){
        this.snd.dispose();
    }
    this.snd = new cc.core.audio.MusicLoop();
    this.snd.init(config);
    this.mode = this.audioModes.MUSIC_LOOP;
};

//**********************************************
// BASIC PLAYBACK
//**********************************************

/**
 *
 * @param p_b
 */
cc.core.audio.SndMgr.prototype.pause = function(p_b){
    this.snd.pause(p_b);
};

/**
 *
 * @param p_id
 * @param p_vol
 * @param p_loop
 */
cc.core.audio.SndMgr.prototype.play = function(p_id, p_vol, p_loop){
    return this.snd.play(p_id, p_vol, p_loop);
};

/**
 *
 * @param id
 */
cc.core.audio.SndMgr.prototype.stop = function(id){ this.snd.stop(id); };

/**
 *
 */
cc.core.audio.SndMgr.prototype.stopAll = function(){ this.snd.stopAll(); };

/**
 *
 * @param p_id
 * @param p_delay
 * @param p_vol
 * @param p_loop
 * @returns {*}
 */
cc.core.audio.SndMgr.prototype.playWithDelay = function(p_id, p_delay, p_vol, p_loop){
    var snd = this.snd;
    return new TWEEN.Tween({w:0}).to({w:1}, p_delay).onComplete(function(){
        snd.play(p_id, p_vol, p_loop);
    }).start();
};

/**
 *
 * @param id
 * @returns {boolean}
 */
cc.core.audio.SndMgr.prototype.isPlaying = function(id){
    if(this.webAudio){
        return this.snd.isPlaying(id);
    } else {
        return this.snd.isPlaying();
    }
};
/*
 * used for sound sprite so it can detect end of sounds
 */
cc.core.audio.SndMgr.prototype.update = function(delta){ 
    this.updateList.update(delta);
    this.snd.update(delta); 
};
//**********************************************
// FADE IN / OUT
//**********************************************

/**
 *
 * @param id
 * @param time
 */
cc.core.audio.SndMgr.prototype.fadeOut = function(id, time){
    if(this.webAudio) {
        this.snd.fadeOut(id, time);
    }
};

/**
 *
 * @param id
 * @param time
 */
cc.core.audio.SndMgr.prototype.fadeIn = function(id, time){
    if(this.webAudio) {
        this.snd.fadeIn(id, time);
    } else {
        this.snd.play(id);
    }
};

/**
 *
 * @param bool
 */
cc.core.audio.SndMgr.prototype.mute = function(bool){
    this.isMuted = bool;
    this.snd.mute(bool);
};

/**
 *
 * @param grp
 * @param bool
 */
cc.core.audio.SndMgr.prototype.muteGroup = function(grp, bool){
    this.snd.muteGroup(grp, bool);
};

/**
 *
 * @param groupId
 */
cc.core.audio.SndMgr.prototype.isGroupMuted = function(groupId){
    return this.snd.isGroupMuted(groupId);
};

/**
 *
 * @param bool
 */
cc.core.audio.SndMgr.prototype.muteAllGroups = function(bool){
    this.snd.muteAllGroups(bool);
};

/**
 * on ios need to fire up in response to a touch event
 */
cc.core.audio.SndMgr.prototype.prepare = function(){
    if(this.webAudio){
        this.snd.wakeAudioSystem();
    } else {
        //play the sound!
        this.snd.preload();
    }
};

//**********************************************
// UNLOAD
//**********************************************

/**
 *
 * @param data
 */
cc.core.audio.SndMgr.prototype.removeSounds = function(data){
    if(this.webAudio && data){
        this.snd.removeSounds(data);
    } else {
        //TODO
    }
};

/**
 *
 */
cc.core.audio.SndMgr.prototype.purge = function(){
    if(this.webAudio){
        this.snd.purge();
    } else {
        //TODO
    }
};
//**********************************************
// NULL OBJECT
//**********************************************

/**
 *
 */
cc.core.audio.SndMgr.prototype.initNone = function(){
    if(this.snd){
        this.snd.dispose();
    }
    this.mode = this.audioModes.NONE;
    this.snd = new cc.core.audio.SndNone();
};

//**********************************************
// CHECK
//**********************************************
//this is redundant since start with null object!
cc.core.audio.SndMgr.prototype.checkReady = function(){
    return this.snd !== null;
};

Object.defineProperties(cc.core.audio.SndMgr.prototype, {
    isReady: {
        get: function() {
            return this.checkReady();//snd !== null;
        }
    },
    webAudio: {
        get: function() {
            return this.mode === cc.core.audio.AudioModes.WEB_AUDIO;
        }
    }
});
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
cc.core.display.Quad = function(p_w, p_h, p_color, p_alpha){
	PIXI.Graphics.call(this);
	//set defaults
	if(typeof p_color === "undefined") p_color = 0xFF0000;
	this.tint = p_color;
    if(typeof p_h === "undefined") p_h = 100;
	if(typeof p_w === "undefined"){
        p_w = 100;
    }
    if(typeof p_w === "object"){
        this.fromRect(p_w);
    } else {
        this._width = p_w;
        this._height = p_h;
    }
	//now draw
	this.drawQuad();
	//
    if(typeof p_alpha === "undefined") p_alpha = 1;
    this.alpha = p_alpha;
	//for interactivity, need to have a hitArea rect!
    //NOTE - ignoring the pivot issue for now...
    this.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);

};
cc.core.display.Quad.prototype = Object.create( PIXI.Graphics.prototype );
cc.core.display.Quad.prototype.constructor = cc.core.display.Quad;

cc.core.display.Quad.prototype.fromRect = function(rect){
    this._width = this.hitArea.width = rect.width;
    this._height = this.hitArea.height = rect.height;
    this.x = rect.x;
    this.y = rect.y;
    //now draw
    this.drawQuad();
};

cc.core.display.Quad.prototype.drawQuad = function(){
    this.clear();
    this.beginFill(this.tint);
    this.drawRect(0, 0, this._width, this._height);
    this.endFill();
};

Object.defineProperties(cc.core.display.Quad.prototype, {
    width: {
        get: function() {
            return  this._width;
        },
        set: function(value) {
            this._width = value;
            this.drawQuad();
            this.hitArea.width = value;
        }
    },
    height: {
        get: function() {
            return  this._height;
        },
        set: function(value) {
            this._height = value;
            this.drawQuad();
            this.hitArea.height = value;
        }
    } 
});
/**
 * This i mostly for debugging!
 * @class Circle
 * @param p_radius
 * @param p_color
 * @constructor
 */
cc.core.display.Circle = function(p_radius, p_color){
	PIXI.Graphics.call(this);
	//
	this.tint = (typeof p_color !== "undefined")? p_color : 0xff0000;
	//now draw
	this.radius = (typeof p_radius !== "undefined")? p_radius : 50;
};
cc.core.display.Circle.prototype = Object.create( PIXI.Graphics.prototype );
cc.core.display.Circle.prototype.constructor = cc.core.display.Circle;
//
Object.defineProperty(cc.core.display.Circle.prototype, 'radius', {
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
/**
 * @class Button
 * @param p_upImgId {String|PIXI.Texture}
 * @param p_downImgId {String|PIXI.Texture}
 * @param p_disabledImgId {String|PIXI.Texture}
 */
cc.core.display.Button = function(p_upImgId, p_downImgId, p_disabledImgId){
    if(typeof p_upImgId === 'string'){
        this.txUp = PIXI.utils.TextureCache[p_upImgId];
    } else {
        //assume it was a PIXI.Texture!
        this.txUp = p_upImgId;
    }
    PIXI.Sprite.call(this, this.txUp);
    this.upScale = 1;
    this.downScale = 1;
    this._pressed = false;
    //!!! can't use my event dispatcher, have to use pixi one!
    this.evtPress = "press";//{type:"press"};
    this.evtRelease = "release";//{type:"release"};
    this.evtReleaseOutside = "release_outside";//{type:"release_outside"};
    // touch start
    this.touchstart = this._touchstart.bind(this);
    this.on('mousedown', this.touchstart);
    this.on('touchstart', this.touchstart);

    // touch end
    this.touchend = this._touchend.bind(this);
    this.on('mouseup', this.touchend);
    this.on('touchend', this.touchend);

    //_touchendoutside
    this.touchendoutside = this._touchendoutside.bind(this);
    this.on('mouseupoutside', this.touchendoutside);
    this.on('touchendoutside', this.touchendoutside);
    //
    this.enabled = true;//enable by default (annoying otherwise!)

    //create hit area - use resolution of the baseTexture!
    this.createHitArea();

    this.setAdditionalTextures(p_downImgId, p_disabledImgId);
};
cc.core.display.Button.prototype = Object.create(PIXI.Sprite.prototype);
cc.core.display.Button.prototype.constructor = cc.core.display.Button;

/**
 * @method setAdditionalTextures
 * @param p_downImgId
 * @param p_disabledImgId
 */
cc.core.display.Button.prototype.setAdditionalTextures = function(p_downImgId, p_disabledImgId) {
//NOTE center reg point only applies when no down state!
    var downType = typeof p_downImgId;

    if(!p_downImgId || downType === "undefined"){
        this.txDown = null;
        this.downScale = 0.95;
        //center it
        this.pivot.x = this.hitArea.width * 0.5;
        this.pivot.y = this.hitArea.height * 0.5;
        // this.hitArea.x =-this.pivot.x;
        // this.hitArea.y =-this.pivot.y;
    } else {
        if(downType === 'string'){
            this.txDown = PIXI.utils.TextureCache[p_downImgId];
        } else {
            // - allow it to be a texture!
            this.txDown = p_downImgId;
        }

        this.downScale = 1;
    }
    // disabled image
    var disabledType = typeof p_disabledImgId;
    if(!disabledType || disabledType === "undefined"){
        this.txDisabled = null;
    } else {
        if(disabledType === 'string'){
            this.txDisabled = PIXI.utils.TextureCache[disabledType];
        } else {
            // - allow it to be a texture!
            this.txDisabled = disabledType;
        }
    }
};

/**
 *
 */
cc.core.display.Button.prototype.createHitArea = function() {
    //this.resolution = this.txUp.baseTexture.resolution;
    var w = this.txUp.frame.width;//(this.txUp.frame.width / this.resolution);
    var h = this.txUp.frame.height;//(this.txUp.frame.height / this.resolution);
    this.hitArea = new PIXI.Rectangle(0, 0, w, h);
};

/**
 *
 * @private
 */
cc.core.display.Button.prototype._touchstart = function() {
    if(!this.txDown){
        this.scale.x = this.scale.y = this.downScale;
    } else {
        this.setTexture(this.txDown);
    }
    this._pressed = true;
    this.emit(this.evtPress);
};

/**
 *
 * @private
 */
cc.core.display.Button.prototype._touchend = function() {
    if(this._pressed){
        this._pressed = false;
        this.restore();
        this.emit(this.evtRelease);
    }   
};

/**
 *
 * @private
 */
cc.core.display.Button.prototype._touchendoutside = function() {
    if(this._pressed){
        this._pressed = false;
        this.restore();
        this.emit(this.evtReleaseOutside);
    }
};

/**
 *
 * @private
 */
cc.core.display.Button.prototype.restore = function() {
    if(this.downScale < 1){
        this.scale.x = this.scale.y = this.upScale;
    } 
    if(this.texture !== this.txUp) {
        this.setTexture(this.txUp);
    }
};

/**
 *
 * @private
 */
Object.defineProperty(cc.core.display.Button.prototype, 'enabled', {
    get: function() {
        return  this.interactive;
    },
    set: function(bool) {
        this.interactive = bool;
        this.buttonMode = bool;
        if(this.txDisabled){
            if(bool){
                this.setTexture(this.txUp);
            } else {
                this.setTexture(this.txDisabled);
            }
        }
    }
});

/**
 * @class Toggle
 * @param p_onImg
 * @param p_offImg
 * @param p_on
 * @constructor
 */
cc.core.display.Toggle = function (p_onImg, p_offImg, p_on) {
    this.isOn = (p_on !== false);
    //*******************************
    // - support the arguments being textures

    this.txOn = this.getTexture(p_onImg);
    this.txOff = this.getTexture(p_offImg);

    this.upScale = 1;
    this.downScale = 0.95;

    //set start texture
    var tx = (this.isOn) ? this.txOn : this.txOff;
    PIXI.Sprite.call(this, tx);
    //
    //!!! can't use my event dispatcher, have to use pixi one!
    // touch start
    this.touchstart = this._touchstart.bind(this);
    this.on('mousedown', this.touchstart);
    this.on('touchstart', this.touchstart);

    // touch end
    this.touchend = this._touchend.bind(this);
    this.on('mouseup', this.touchend);
    this.on('touchend', this.touchend);

    //_touchendoutside
    this.touchendoutside = this._touchendoutside.bind(this);
    this.on('mouseupoutside', this.touchendoutside);
    this.on('touchendoutside', this.touchendoutside);

    //center the anchor for consistency with buttons
    this.anchor.x = this.anchor.y = 0.5;

    //create hit area - use resolution of the baseTexture!
    this.createHitArea();

    this.enabled = true;

};
cc.core.display.Toggle.prototype = Object.create(PIXI.Sprite.prototype);
cc.core.display.Toggle.prototype.constructor = cc.core.display.Toggle;

/**
 * @method getTexture
 * @param p_img
 * @returns {PIXI.Texture}
 */
cc.core.display.Toggle.prototype.getTexture = function (p_img) {
    var tx = null;
    if (typeof p_img === 'string') {
        tx = PIXI.utils.TextureCache[p_img];
    } else {
        //assume it was a PIXI.Texture!
        tx = p_img;
    }
    return tx;
};

/**
 *
 */
cc.core.display.Toggle.prototype.createHitArea = function () {
    //this.resolution = this.txOn.baseTexture.resolution;
    var w = this.txOn.frame.width;
    var h = this.txOn.frame.height;
    var x = w * -this.anchor.x;
    var y = h * -this.anchor.x;
    this.hitArea = new PIXI.Rectangle(x, y, w, h);
};

/**
 *
 */
cc.core.display.Toggle.prototype._touchstart = function (event) {
    this._pressed = true;
    this.scale.x = this.scale.y = this.downScale;
};

/**
 *
 */
cc.core.display.Toggle.prototype._touchend = function (event) {
    if (this._pressed) {
        this._pressed = false;
        if(this.downScale < 1) this.scale.x = this.scale.y = this.upScale;
        this.toggle();
    }
};

/**
 *
 */
cc.core.display.Toggle.prototype._touchendoutside = function (event) {
    if (this._pressed) {
        if(this.downScale < 1) this.scale.x = this.scale.y = this.upScale;
        this._pressed = false;
    }
};

/**
 *
 */
cc.core.display.Toggle.prototype.toggle = function () {
    this.isOn = !this.isOn;
    if (this.isOn) {
        this.texture = this.txOn;
    } else {
        this.texture = this.txOff;
    }
    this.emit("toggle");
};

/**
 *
 */
cc.core.display.Toggle.prototype.setOff = function () {
    this.texture = this.txOff;
    this.isOn = false;
};

/**
 *
 */
cc.core.display.Toggle.prototype.setOn = function () {
    this.texture = this.txOn;
    this.isOn = true;
};

/**
 *
 */
Object.defineProperty(cc.core.display.Toggle.prototype, 'enabled', {
    get: function () {
        return this.interactive;
    },
    set: function (value) {
        this.interactive = value;
        this.buttonMode = value;
    }
});
/**
 * @class MovieClip
 * @param textures
 * @constructor
 */
cc.core.display.MovieClip = function(textures) {
    PIXI.Sprite.call(this, textures[0]);
    //make it dispatch events
    // cc.core.utils.EventDispatcher.prototype.apply(this);
    //
    this.textures = textures;
    this.eventComplete = "complete";//{type:"complete"};
    this.loop = true;
    this._fps = 25;//made a setter for this!
    this.onComplete = null;
    this.currentFrame = 0;
    this.currentTime = 0;
    this.playing = false;
    this.duration = 0;
    this.lastFrame = 0;

    this.setDuration();
};
cc.core.display.MovieClip.prototype = Object.create( PIXI.Sprite.prototype );
cc.core.display.MovieClip.prototype.constructor = cc.core.display.MovieClip;

/**
 * @method gotoAndPlay
 * @param frameNumber
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.gotoAndPlay = function(frameNumber) {
    this.gotoAndStop(frameNumber);
    this.playing = true;
    return this;
};

/**
 * @method gotoAndStop
 * @param frameNumber
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.gotoAndStop = function(frameNumber) {
    this.playing = false;
    this.currentTime = frameNumber * (1000 / this._fps);
    this.currentFrame = frameNumber;
    //not sure where this technique came from?!
    var round = (this.currentFrame + 0.5) | 0;
    this.texture = this.textures[round % this.textures.length];
    return this;
};

/**
 *
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.stop = function()  {
    this.playing = false;
    return this;
};

/**
 *
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.play = function() {
    this.playing = true;
    return this;
};

/**
 *
 * @param fps
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.setFPS = function(fps) {
    this._fps = fps;
    this.setDuration();
    return this;
};

/**
 *
 */
cc.core.display.MovieClip.prototype.updateTransform = function()  {
    PIXI.Sprite.prototype.updateTransform.call(this);
};

/**
 *
 * @returns {cc.core.display.MovieClip}
 */
cc.core.display.MovieClip.prototype.setDuration = function(){
    var l = this.textures.length;
    this.duration = (1000 / this._fps) * l;
    this.lastFrame = l - 1;
    return this;
};

/**
 *
 * @param elapsed
 */
cc.core.display.MovieClip.prototype.update = function(elapsed){//milliseconds
    if(this.playing){
        this.currentTime += elapsed;
        if(this.currentTime > this.duration){
            //loop (make this optional!)
            if(this.loop){
                this.currentTime -= this.duration;
            } else {
                this.currentTime = this.duration;
                this.stop();
                this.isComplete = true;
                //callback
                if(this.onComplete) this.onComplete();
                //dispatch an event!
                this.emit(this.eventComplete);
            }
        }
        var frameIndex = Math.floor((this.currentTime / this.duration) * (this.lastFrame + 1));
//            //
        if(frameIndex > this.lastFrame) frameIndex = this.lastFrame;//not sure how to avoid including this line!
        //alternative would be var frameIndex = Math.floor((currentTime / duration) * lastFrame);
        this.currentFrame = frameIndex;
        this.texture = this.textures[this.currentFrame];
    }
};

/**
 *
 */
Object.defineProperties(cc.core.display.MovieClip.prototype, {
    totalFrames: {
        get: function() {
            return this.textures.length;
        }
    },
    fps: {
        get: function() {
            return this._fps;
        },
        set: function(value){
            this.setFPS(value);
        }
    }
});

cc.core.display.MaskJpeg = function(jpegImg,pngMask,callback){
	var txImg = jpegImg;
	var txMask = pngMask;
	//create new canvas object and draw each image into it
	var canvasImg = document.createElement('canvas');
	//what are the dimensions?
	canvasImg.width = txImg.width;
	canvasImg.height = txImg.height;
	var ctxImg = canvasImg.getContext("2d");
	ctxImg.drawImage(txImg,0,0);
	ctxImg.globalCompositeOperation = 'xor';
	ctxImg.drawImage(txMask,0,0);
	var img = new Image();
	if(callback){
		img.onload = function(){
			callback(img);
		};
	}	
	img.src = canvasImg.toDataURL();
	return img;
};
/**
 * has a sprite that can crop vertically or horizontally
 * @class CropSprite
 * @constructor
 */
cc.core.display.CropSprite = function(sprite){
    this.sprite = null;
    this.useCopy = true;//if true then makes a new texture instance
    cc.core.utils.EventDispatcher.call(this);

    if(sprite){
        this.init({sprite: sprite});
    }
};
cc.core.display.CropSprite.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);

/**
 * @method init
 * @param config
 */
cc.core.display.CropSprite.prototype.init = function(config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    this.copyFrame();
};

/**
 *
 */
cc.core.display.CropSprite.prototype.copyFrame = function() {
    this.realFrame = this.sprite.texture.frame;
    this.frame = new PIXI.Rectangle(
        this.realFrame.x,
        this.realFrame.y,
        this.realFrame.width,
        this.realFrame.height
    );
    //use a copy texture too!
    if(this.useCopy){
        var baseTexture = this.sprite.texture.baseTexture;
        this.sprite.texture = new PIXI.Texture(baseTexture, this.frame)
    } else {
        this.sprite.texture.frame = this.frame;
    }
};

/**
 *
 */
Object.defineProperties(cc.core.display.CropSprite.prototype,{
    width: {
        get: function(){
            return this.frame.width;
        },
        set: function(value){
            this.setWidth(value);
        }
    },
    height: {
        get: function(){
            return this.frame.height;
        },
        set: function(value){
            this.setHeight(value);
        }
    },
    heightAlt: {
        get: function(){
            return this.frame.height;
        },
        set: function(value){
            this.setHeightAlt(value);
        }
    },
    x: {
        get: function(){
            return this.sprite.x;
        },
        set: function(value){
            this.sprite.x = value;
        }
    },
    y: {
        get: function(){
            return this.sprite.y;
        },
        set: function(value){
            this.sprite.y = value;
        }
    },
    visible: {
        get: function(){
            return this.sprite.visible;
        },
        set: function(bool){
            this.sprite.visible = bool;
        }
    },
    fullHeight: {
        get: function(){
            return this.realFrame.height;
        }
    },
    fullWidth: {
        get: function(){
            return this.realFrame.width;
        }
    }
});

/**
 *
 * @param value
 */
cc.core.display.CropSprite.prototype.setWidth = function(value){
    this.frame.width = value;
    this.sprite.texture.crop.width = this.frame.width;
    this.sprite.texture.width = this.frame.width;
    this.sprite.texture.requiresUpdate = true;
    this.sprite.texture._updateUvs();
    this.sprite.width = this.frame.width;
};

/**
 *
 * @param value
 */
cc.core.display.CropSprite.prototype.setHeight = function(value){
    this.frame.height = value;
    this.sprite.texture.crop.height = this.frame.height;
    this.sprite.texture.height = this.frame.height;
    this.sprite.texture.requiresUpdate = true;
    this.sprite.texture._updateUvs();
    this.sprite.height = this.frame.height;
};

/**
 * I think this adjusts y position at the same time as height
 * @param value
 */
cc.core.display.CropSprite.prototype.setHeightAlt = function(value){
    this.setHeight(value);
    this.frame.y = this.realFrame.y + this.realFrame.height - value;
    this.sprite.texture.crop.y = this.frame.y;
};

/**
 *
 */
cc.core.display.CropSprite.prototype.restore = function(){
    this.sprite.texture.frame = this.realFrame;
    this.sprite.texture.crop.width = this.realFrame.width;
    this.sprite.texture.width = this.realFrame.width;
    this.sprite.texture.crop.y = this.realFrame.y;
    this.sprite.texture.crop.height = this.realFrame.height;
    this.sprite.texture.height = this.realFrame.height;
    this.sprite.texture.requiresUpdate = true;
    this.sprite.texture._updateUvs();
};

/**
 *
 * @param y
 * @param time
 * @param amount
 */
cc.core.display.CropSprite.prototype.slideUp = function(y, time, amount) {
    var fullH = amount || this.realFrame.height;
    var distY = (fullH / this.resolution);
    this.y = y + distY;
    this.height = 0;
    new TWEEN.Tween(this)
        .to({height: fullH, y: y}, time)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(this.onUp)
        .start();
};

/**
 *
 * @param y
 * @param time
 * @param amount
 */
cc.core.display.CropSprite.prototype.revealUp = function(y, time, amount) {
    var fullH = amount || this.realFrame.height;
    if(!time) time = 600;
    this.heightAlt = 0;
    new TWEEN.Tween(this)
        .to({heightAlt: fullH}, time)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(this.onUp)
        .start();
};

/**
 *
 * @param time
 * @param amount
 */
cc.core.display.CropSprite.prototype.revealDown = function(time, amount) {
    new TWEEN.Tween(this)
        .to({heightAlt: 0}, time)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(this.onDown)
        .start();
};

/**
 *
 * @param time
 * @param delay
 */
cc.core.display.CropSprite.prototype.slideDown = function(time, delay) {
    var y = this.y, delay = delay || 0;
    var targetY = y + (this.height / this.resolution);
    new TWEEN.Tween(this)
        .to({height: 0, y: targetY}, time)
        .delay(delay)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(this.onDown)
        .start();
};

cc.core.display.CropSprite.prototype.onUp = function() { };

cc.core.display.CropSprite.prototype.onDown = function() { };

/**
 * @class ScreenBase
 * @param config
 * @constructor
 */
cc.core.screens.ScreenBase = function(config){
	PIXI.Container.call(this);
	//these vars all come from config
    this.screenW = 0; this.screenH = 0;
    this.defaultW = 0;  this.defaultH = 0;
    this.resolution = 1;
    this.eventQueue = null;
    this.lastScreenId = null;
    this.snd = null;
    //get screenW, screenH, defaultW, defaultH - actual screen width in points
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
    //
    cc.core.utils.UpdateList.prototype.mixin(this);
    //add a delayedAction by default!
    this.delayedAction = new cc.core.utils.DelayedAction();
    this.addUpdateItem(this.delayedAction);
};
cc.core.screens.ScreenBase.prototype = Object.create(PIXI.Container.prototype);
cc.core.screens.ScreenBase.prototype.constructor = cc.core.screens.ScreenBase;

/**
 * set up screen content
 */
cc.core.screens.ScreenBase.prototype.run = function(){};

/**
 *
 * @param p_w
 * @param p_h
 */
cc.core.screens.ScreenBase.prototype.resize = function(p_w, p_h){
    this.screenW = p_w;
    this.screenH = p_h;
};

/**
 *
 */
cc.core.screens.ScreenBase.prototype.getSceneConfig  = function(){
    return {
        screenW: this.screenW, screenH: this.screenH,
        defaultW: this.defaultW, defaultH: this.defaultH,
        eventQueue: this.eventQueue,
        snd: this.snd,
        resolution: this.resolution
    };
};

/**
 * @param SceneClass {class}
 */
cc.core.screens.ScreenBase.prototype.createScene  = function(SceneClass){
    var scene = new SceneClass();
    scene.init(this.getSceneConfig());
    this.addChild(scene.root);
    this.addUpdateItem(scene.updateList);
    var self = this;
    scene.on('screen', function(event){
        self.newScreen(event.id);
    });
    return scene;
};

/**
 * convenience method
 * @param callback
 * @param p_ms
 */
cc.core.screens.ScreenBase.prototype.delay = function(callback, p_ms){
    this.delayedAction.delay(callback, p_ms);
};

/**
 * use this to run dragonBones content or anything needing to run off RAF
 * @param delta
 */
cc.core.screens.ScreenBase.prototype.render = function(delta){};

/**
 *
 * @param p_screenId
 */
cc.core.screens.ScreenBase.prototype.newScreen = function(p_screenId){
    var event;
    if(typeof p_screenId === 'string'){
        event = {type: "new_screen", screenId: p_screenId};
    } else {
        event = p_screenId;
        event.type = "new_screen";
    }
    this.eventQueue.queueEvent(event);
};

/**
 *
 */
cc.core.screens.ScreenBase.prototype.dispose = function(){
	//remove self!
	this.removeFromParent();
	//destroy screen content
    this.updateItems.length = 0;
    //
    this.delayedAction.dispose();
	// remove all listeners
    this.removeAllListeners();
};
/**
 * default load screen!
 * @param config
 * @constructor
 */
cc.core.screens.LoadScreen = function(config){
	cc.core.screens.ScreenBase.call(this, config);
};
cc.core.screens.LoadScreen.prototype = Object.create(cc.core.screens.ScreenBase.prototype);
cc.core.screens.LoadScreen.prototype.constructor = cc.core.screens.LoadScreen;

/**
 *
 */
cc.core.screens.LoadScreen.prototype.run  = function(){
    this.loadBar = this.createBar();

    //NOTE - loader events are automatically removed on complete
    var self = this;
    game_shell.loader.on("progress", function(event){
        self.loadBar.progress(event.value);
    });
    game_shell.loader.on("complete", function(){
        self.loadBar.progress(1);
        self.fadeOut.call(self);
    });

};

/**
 *
 */
cc.core.screens.LoadScreen.prototype.fadeOut = function(){
    var self = this;
    new TWEEN.Tween(this.loadBar)
            .to({alpha: 0}, 500)
            .onComplete(function(){
                self.newScreen(self.targetScreen);
            })
            .start();
};

/**
 *
 * @returns {cc.core.ui.LoadBar}
 */
cc.core.screens.LoadScreen.prototype.createBar = function(){
    var w = 200, h = 30;
    var loadBar = new cc.core.ui.LoadBar(w, h, 0x000000, 0xffffff);
    loadBar.pivot.x = w * 0.5; loadBar.pivot.y = h * 0.5;
    this.addChild(loadBar);
    return loadBar;
};
cc.core.screens.TitleScreen = function(config){
	cc.core.screens.ScreenBase.call(this, config);
};
cc.core.screens.TitleScreen.prototype = Object.create(cc.core.screens.ScreenBase.prototype);
cc.core.screens.TitleScreen.prototype.constructor = cc.core.screens.TitleScreen;
//
cc.core.screens.TitleScreen.prototype.run  = function(){
    //your code goes here
};
/**
 * @class ScreenMgr
 * @constructor
 */
cc.core.screens.ScreenMgr = function(){
    this.currentScreen = null;
    this.lastScreenId = null;
    this.stage = null;
    this.snd = null;
    this.eventQueue = null;
    //
    this.resolution = 1;
};
cc.core.screens.ScreenMgr.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.screens.ScreenMgr.prototype.constructor = cc.core.screens.ScreenMgr;

/**
 * @method init
 * @param config
 */
cc.core.screens.ScreenMgr.prototype.init = function(config){
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];
    
    this.showScreen = this._showScreen.bind(this);
    
    this.eventQueue.on("new_screen", this.showScreen);
};

/**
 * @method getScreenConfig
 * @param p_event
 * @returns {{screenId: *}}
 */
cc.core.screens.ScreenMgr.prototype.getScreenConfig = function(p_event){
    var config = (typeof p_event === "string")? {screenId: p_event} : p_event;
    config.screenW = this.settings.STAGE_W;
    config.screenH = this.settings.STAGE_H;
    config.defaultW = this.settings.DEFAULT_W;
    config.defaultH = this.settings.DEFAULT_H;
    config.resolution = this.resolution;
    config.eventQueue = this.eventQueue;
    config.lastScreenId = this.lastScreenId;
    config.snd = this.snd;
    //decided not to pass through cc.core.settings, its a bit redundant
    //config.settings = this.settings;
    return config; 
};

/**
 * @method resize
 * @param settings
 */
cc.core.screens.ScreenMgr.prototype.resize = function(settings){
    if(this.currentScreen !== null){
        //call resize on current screen
        var pointW = settings.pointWidth;
        var pointH = settings.pointHeight;
        this.currentScreen.resize(pointW, pointH);
    }
};

/**
 * @method displayScreen
 * @param p_event
 */
cc.core.screens.ScreenMgr.prototype.displayScreen = function(event){
    //kill old screen
    this.disposeScreen();
    var config = this.getScreenConfig(event);
    this.currentScreen = this.createScreen(config);
    this.stage.content.addChild(this.currentScreen);
    this.currentScreen.run();
};

/**
 * @method _showScreen
 * @param data
 * @param callback
 */
cc.core.screens.ScreenMgr.prototype._showScreen = function(data, callback){
    var config = (typeof data === "string")? {screenId: data} : data;
    var screenId = config.screenId;
    var manifest = this.getManifestPath(screenId);
    if(config.reload){
        delete config.reload;
        this.loadWithManifest(config, manifest, callback);
    } else {
        //check its not already loaded!
        if(!manifest || this.currentManifest === manifest){
            this.displayScreen(config);
        } else {
            // - unload this screen!
            this.unloadScreen();
            this.loadWithManifest(config, manifest, callback);
        }
    }
};

/**
 * @method loadWithManifest
 * @param screenId
 * @param manifest
 * @param callback
 */
cc.core.screens.ScreenMgr.prototype.loadWithManifest = function(screenId, manifest, callback){
    this.currentManifest = manifest;
    //NOTE - loader removes event listeners on load complete
    var self = this;
    game_shell.loader.on("manifest_json", function(event){
        self.addToManifestJSON(screenId, event.data);
    });
    game_shell.loader.on("manifest_loaded", function(){
        var data = game_shell.loader.getManifest();
        self.customizeManifest(screenId, data);
    });
    if(typeof callback === 'function'){
        game_shell.loader.on('complete', function(){
            callback();
        });
    }
    //now load the new manifest
    game_shell.loader.load(manifest, false);
    // show the preload bar
    this.eventQueue.queueEvent({type: "new_screen",
        screenId: "load",
        targetScreen:screenId});
};

//append source array content to target array
cc.core.screens.ScreenMgr.prototype.merge = function(target, source){
    var i, n = source.length;
    for(i = 0; i < n; i++){
        target[target.length] = source[i];
    }
};

/**
 *
 * @param screenId
 * @returns {string}
 */
cc.core.screens.ScreenMgr.prototype.getManifestPath = function(screenId){
    //override this, just return default
    return cc.core.settings.JSON_DIR + 'asset_manifest.json';
};

/**
 * this is BEFORE manifest json is parsed
 * @param screenId
 * @param jsonData
 */
cc.core.screens.ScreenMgr.prototype.addToManifestJSON = function(screenId, jsonData){
    //override this
};

/**
 * this is AFTER manifest json is parsed
 * @param screenId
 * @param data
 */
cc.core.screens.ScreenMgr.prototype.customizeManifest = function(screenId, data){
    //override this
};

/**
 *
 */
cc.core.screens.ScreenMgr.prototype.unloadScreen = function(){
    if(game_shell.spineUtils) game_shell.spineUtils.purge();
    game_shell.snd.removeSounds(game_shell.loader.webAudioManifest);//NOTE - could also call purge
    game_shell.loader.unload();
};

/**
 * override this - this stuff is just default
 * @param p_event
 * @returns {*}
 */
cc.core.screens.ScreenMgr.prototype.createScreen = function(p_event){
    var screen, scr = cc.core.screens;
    var screenId = (typeof p_event === "string")? p_event : p_event.screenId;
    switch(screenId){
        case "load": screen = new scr.LoadScreen(p_event); break;
        case "title": screen = new scr.TitleScreen(p_event); break;
    }
    return screen;
};

/**
 *
 * @param p_time
 */
cc.core.screens.ScreenMgr.prototype.update = function(p_time){
    if(this.currentScreen) this.currentScreen.update(p_time);
};

/**
 *
 * @param p_delta
 */
cc.core.screens.ScreenMgr.prototype.render = function(p_delta){
    if(this.currentScreen) this.currentScreen.render(p_delta);
};

/**
 *
 */
cc.core.screens.ScreenMgr.prototype.disposeScreen = function(){
    if(this.currentScreen !== null){
        //ignore the load screen!
        if(this.currentScreen.screenId !== 'load'){
            this.lastScreenId = this.currentScreen.screenId;
        }
        this.currentScreen.dispose();
        this.currentScreen = null;
    }
};
/**
 * Base builder file for scene
 * @class SceneBuilder
 * @constructor
 */
cc.core.screens.SceneBuilder = function(){
    this.scene = null;
    this.root = null;
    this.screenW = 0;
    this.screenH = 0;
    this.resolution = 1;
};

/**
 * @method init
 * @param config
 */
cc.core.screens.SceneBuilder.prototype.init = function(config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];
    //
    this.scene.root = new PIXI.Container();
    this.scene.timeout = new cc.core.utils.DelayedAction();
    this.scene.updateList = this.updateList = new cc.core.utils.UpdateList();
    //add screen to update
    this.updateList.add(this.scene);
};
/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/07/04
 * Time: 10:20 AM
 * Default loading bar
 */
cc.core.ui.LoadBar = function(p_w, p_h, p_color, p_color2){
    PIXI.Container.call(this);
    //
    
    var c1 = p_color || 0x000000;
    //draw a empty loadbar rect with a white outline
    var bg = new PIXI.Graphics();
    bg.beginFill(c1, 1.0);
    var lineW = 5;// * scaleFactor;//
    var half = lineW * 0.5;
    bg.lineStyle(lineW, 0xffffff, 1.0);
    bg.drawRect(-half, -half, p_w + lineW, p_h + lineW);
    bg.endFill();
    this.addChild(bg);

    //draw the progress bar rect
    var c2 = p_color2 || 0xCC9900;
    var barW = p_w + lineW;
    var barH = p_h + lineW;
    
    this.fullW = barW;

    var prgBar =  new cc.core.display.Quad(barW, barH, c2);
    prgBar.x = -half;
    prgBar.y = -half;
    //

    var fg = new PIXI.Graphics();
    fg.beginFill(c1, 0.0);
    fg.lineStyle(lineW, 0xffffff, 1.0);
    fg.moveTo(0, 0);
    fg.lineTo(p_w, 0);
    fg.lineTo(p_w, p_h);
    fg.lineTo(0, p_h);
    fg.lineTo(0, 0);
    fg.endFill();
    this.addChild(fg);
    //
    //p_amount = 0 - 1
    this.progress = function(p_amount){
        prgBar.width = p_amount * this.fullW;
        if(p_amount === 1){
            this.complete();
        }
    };
    this.complete = function(){
        prgBar.width = this.fullW;
        fg.visible = false;//hide line for fade out! 
        bg.visible = false;//hide line for fade out! 
    };
    this.progress(0);
    this.addChild(prgBar);

};
cc.core.ui.LoadBar.prototype = Object.create(PIXI.Container.prototype);
cc.core.ui.LoadBar.prototype.constructor = cc.core.ui.LoadBar;

//
cc.core.ui.PopupBase = function(){
	this.quadAlpha = 0.5;
	this.fadeTime = 250;
	this.tweenTime = 750;
	this.minScale = 0.001;
    //
    this.eventOpen = {type: 'open'};
    this.eventShut = {type: 'shut'};
    this.states = {HIDDEN:0, OPENING: 1, SHOWN: 2, CLOSING: 3};
    this.state = this.states.HIDDEN;
    // TODO this stuff could happen on init...
    this.root = new PIXI.Container();
	this.bgQuad = this.createQuad();
	this.content = this.createContentHolder();
    //
    this.tweenOpen = this.createTweenOpen();
    this.tweenShut = this.createTweenShut();
    this.tweenQuadIn = this.createTweenQuadIn();
    this.tweenQuadOut = this.createTweenQuadOut();

};
//*******************************
cc.core.ui.PopupBase.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.ui.PopupBase.prototype.constructor = cc.core.ui.PopupBase;
//*******************************************************
// CREATE STUFF
//*******************************************************

cc.core.ui.PopupBase.prototype.createQuad = function(){
	var w = cc.core.settings.DEFAULT_W + 2,
        h = cc.core.settings.DEFAULT_H;
	var bgQuad = new cc.core.display.Quad(w, h, 0x000000);
	bgQuad.alpha = 0;
    bgQuad.x = w * -0.5; bgQuad.y = h * -0.5;
	this.root.addChild(bgQuad);
	return bgQuad;
};

cc.core.ui.PopupBase.prototype.createContentHolder = function(){
	var content = new PIXI.Container();
	this.root.addChild(content);
	return content;
};

//*******************************************************
// SHOW
//*******************************************************

cc.core.ui.PopupBase.prototype.show = function(){
	if(this.state === this.states.HIDDEN){
        this.state = this.states.OPENING;
        this.bgQuad.alpha = 0;
        this.content.scale.x = this.minScale;
        this.content.scale.y = this.minScale;
        //
        this.tweenQuadIn.start();
        this.tweenOpen.start();  
    }   
};

cc.core.ui.PopupBase.prototype.createTweenQuadIn = function(){
    return new TWEEN.Tween(this.bgQuad).to({alpha:this.quadAlpha}, this.fadeTime);
};

cc.core.ui.PopupBase.prototype.createTweenQuadOut = function(){
    return new TWEEN.Tween(this.bgQuad).to({alpha: 0}, this.fadeTime);
};

cc.core.ui.PopupBase.prototype.createTweenOpen = function(){
    var self = this;
    return new TWEEN.Tween(this.content.scale)
                .to({x: 1, y: 1}, this.tweenTime)
                .easing(TWEEN.Easing.Back.Out)
                .onComplete(function(){
                    self.state = self.states.SHOWN;
                    self.onShown();
                });
};

cc.core.ui.PopupBase.prototype.onShown = function(){
	//override this
    this.emit(this.eventOpen);
};

//*******************************************************
// HIDE
//*******************************************************

cc.core.ui.PopupBase.prototype.hide = function(){
    if(this.state !== this.states.CLOSING){
        this.state = this.states.CLOSING;
        this.tweenQuadOut.start();
        this.tweenShut.start();    
    }   
};

cc.core.ui.PopupBase.prototype.createTweenShut = function(){
    var self = this;
    return new TWEEN.Tween(this.content.scale)
                .to({x: this.minScale, y: this.minScale}, this.tweenTime)
                .easing(TWEEN.Easing.Back.In)
                .onComplete(function(){
                    self.state = self.states.HIDDEN;
                    self.onHidden();
                });
};

cc.core.ui.PopupBase.prototype.onHidden = function(){
	this.emit(this.eventShut);
};

//make isShown into a getter
Object.defineProperty(cc.core.ui.PopupBase.prototype, "isShown", {
    get:function(){
        var isShownVar = this.state === this.states.SHOWN;
        var isOpening = this.state === this.states.OPENING;
        return isShownVar || isOpening;
    }
});

cc.core.motion.Wiggle = function(p_displayObj, p_maxRotation){
	cc.core.utils.EventDispatcher.call(this);
	//*************************************
	this.img = p_displayObj;
	this.baseR = p_displayObj.rotation;
	//*********************************
	//TODO - use a config object!
	if(p_maxRotation === undefined) p_maxRotation = 0.15;
	this.maxR = Math.PI * p_maxRotation;
	this.speed = 0.017;
	//*********************************
	this.counter = 0;
	//*********************************
	this.duration = 30;

};
//*******************************
cc.core.motion.Wiggle.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.motion.Wiggle.prototype.constructor = cc.core.motion.Wiggle;

cc.core.motion.Wiggle.prototype.startWiggle = function() {
	this.counter = 0;
};

cc.core.motion.Wiggle.prototype.update = function(delta) {
	this.wiggle(delta);
};

cc.core.motion.Wiggle.prototype.wiggle = function(time) {
	this.counter += (this.speed * time);
	var l_nSin = Math.sin(this.counter);
	var l_nNewRotation = this.baseR - (l_nSin * this.maxR);
	this.img.rotation = l_nNewRotation;
	return l_nNewRotation;
};
//add this to framework! (motion)
cc.core.motion.Twanger = function(p_displayObj,p_max){
	cc.core.motion.Wiggle.call(this,p_displayObj,p_max);
	//**************************************************
	//TODO - use a config object!
	this.scale = 1.0;//flip to -1.0 to invert the twang!
	this.decay = 0.95;
	this.MAX_R = 0.349;//20;
	this.maxR = 0;
	this.minR = 0.017;//0
};
cc.core.motion.Twanger.prototype = Object.create(cc.core.motion.Wiggle.prototype);
cc.core.motion.Twanger.prototype.constructor = cc.core.motion.Twanger;

/**
 *
 */
cc.core.motion.Twanger.prototype.start = function() {
	this.maxR = this.MAX_R;
};

/**
 * getter function for location point!
 */
Object.defineProperty(cc.core.motion.Twanger.prototype, 'isTwanging', {
    get: function() {
        return this.maxR > 0;
    }
});

/**
 *
 */
cc.core.motion.Twanger.prototype.update = function(time) {
	//if (this.isTwanging) {
	var isMoving = false;
	if (this.maxR > this.minR) {
		this.wiggle(time);
		this.maxR *= this.decay;	
		if (this.maxR < 0.00001) {
			this.stopTwang();
			this.dispatchEvent({type:"complete"});
		}	
		isMoving = true;
	}	
	return isMoving;
};

/**
 *
 */
cc.core.motion.Twanger.prototype.wiggle = function(time) {
	this.counter += (this.speed * time);
	var l_nSin = Math.sin(this.counter);
	var l_nNewRotation = this.baseR - (l_nSin * this.maxR);
	this.img.rotation = l_nNewRotation * this.scale;
};

/**
 *
 */
cc.core.motion.Twanger.prototype.stopTwang = function() {
	this.maxR = 0;
	this.img.rotation = this.baseR;
};

/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/06/17
 * Time: 2:56 PM
 * To change this template use File | Settings | File Templates.
 */
cc.core.motion.Oscillator = function(){
    this.speedX = 0.0005;
    this.speedY = 0.0005;
    this.time = 0;
    this.x = 0;
    this.y = 0; 
};

cc.core.motion.Oscillator.prototype.init = function(config){
    if(config.speedX) this.speedX = config.speedX;
    if(config.speedY) this.speedY = config.speedY;
    if(config.time) this.time = config.time;
    if(config.x) this.x = config.x;
    if(config.y) this.y = config.y;
};

cc.core.motion.Oscillator.prototype.randomise = function(){
    this.speedX = 0.0005 + (Math.random() * 0.001);
    this.speedY = 0.0005 + (Math.random() * 0.001);
};
//
cc.core.motion.Oscillator.prototype.reset = function(){
    this.time = 0;
    this.x = 0;
    this.y = 0; 
};

cc.core.motion.Oscillator.prototype.update = function(p_delta){
    this.time += p_delta;
    this.x = Math.cos(this.time * this.speedX);
    this.y = Math.sin(this.time * this.speedY);
};



cc.core.motion.SawTooth = function(){    
    this._value = 0;
    this._min = 0;
    this._max = 1;
    //oscillate once per second
    this.oscillationsPerSec = 1;  
    
};

cc.core.motion.SawTooth.prototype.update = function(delta){
    var newValue = this._value + (delta * this._step);   
    if(newValue > this._max){
        newValue -= this._max; 
    } 
    this._value = newValue; 
};

cc.core.motion.SawTooth.prototype.reset = function(){
    this._value = 0;
};

Object.defineProperty(cc.core.motion.SawTooth.prototype, 'oscillationsPerSec', {
    set: function(oscillations){
        this._step = oscillations / 1000;   
    }
});

Object.defineProperty(cc.core.motion.SawTooth.prototype, 'value', {
    get: function(){
        return this._value;   
    }
});


cc.core.motion.TriangleWave = function(){    
    this._value = 0;
    this._min = 0;
    this._max = 1;
    //oscillate once per second
    this.oscillationsPerSec = 1;
    
};

cc.core.motion.TriangleWave.prototype.update = function(delta){
    var newValue = this._value + (delta * this._step);   
    if(newValue > this._max){
        this._value = this._max; 
        this._step = -this._step;
    } else if(newValue < this._min){
        this._value = this._min; 
        this._step = -this._step;
    } else {
        this._value = newValue; 
    }
    //console.log(this._value);
};

cc.core.motion.TriangleWave.prototype.reset = function(){
    this._value = this._min;
    if(this._step < 0) this._step = -this._step;
};

Object.defineProperty(cc.core.motion.TriangleWave.prototype, 'oscillationsPerSec', {
    set: function(oscillations){
        this._step = oscillations / 500; //half a second as has to go from one side to the other and back for an oscillation  
    }
});

Object.defineProperty(cc.core.motion.TriangleWave.prototype, 'value', {
    get: function(){
        return this._value;   
    }
});
/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/07/14
 * Time: 1:31 PM
 * To change this template use File | Settings | File Templates.
 */
cc.core.motion.ScreenShaker = function(p_target){
    cc.core.utils.EventDispatcher.call(this);
    var time = 0;
    this.rootPt = new PIXI.Point();
    this.target = p_target;
    if(this.target){
        this.rootPt.x = this.target.x;
        this.rootPt.y = this.target.y;
    }

    this.rangeX = 10;

    this.pulse = 0.005;

    this.duration = 3000;

    //TODO - why not on prototype?

    this.init = function(config){
        if(config.hasOwnProperty('rangeX')) this.rangeX = config.rangeX;
        if(config.hasOwnProperty('duration')) this.duration = config.duration;
        if(config.hasOwnProperty('pulse')) this.pulse = config.pulse;
        if(config.hasOwnProperty('target')) {
            this.target = config.target;
            this.rootPt.x = this.target.x;
            this.rootPt.y = this.target.y;
        }
    };

    this.update = function(p_delta){
        if(this.isActive){
            time += p_delta;
            var pulse = Math.sin(time * this.pulse);//0.005);
            var cos = Math.cos(time);
            this.target.x = this.rootPt.x + ((cos * this.rangeX) * pulse);
            if(time > this.duration){
                this.end();
            }
        }
    };

    this.activate = function(){
        time = 0;
        this.isActive = true;
        this.rootPt.x = this.target.x;
        this.rootPt.y = this.target.y;
    };

    this.end = function(){
        this.isActive = false;
        this.target.x = this.rootPt.x;
        this.dispatchEvent({type:"complete"});
    };

};
cc.core.motion.ScreenShaker.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.motion.ScreenShaker.prototype.constructor = cc.core.motion.ScreenShaker;
/*
 -- example usage:

game_shell.screens.TitleScreen.prototype.startPulse  = function(){
    this.pulse = new cc.core.motion.Pulsar();
    this.pulse.init({
        scale: this.startBtn.scale,
        autostart: true
    });
    this.addUpdateItem(this.pulse);
};

*/
cc.core.motion.Pulsar = function(config){
	if(typeof config !== 'undefined'){
		this.init(config);
	}
};

/*
	config.target = sprite OR config.scale = sprite.scale
	config.maxScale - default = 1
	config.minScale - default = 0.95
	config.startScale - default = minScale
	config.autostart - default false
	config.rate - default = 0.002
*/
cc.core.motion.Pulsar.prototype.init = function(config){
	//just reference the scale object directly, not store the sprite...
	this.target = config.target;//actually could be useful to store the sprite too...
	if(config.hasOwnProperty('target')){
		this.scale = config.target.scale;
	} else if(config.hasOwnProperty('scale')){
		this.scale = config.scale;
	}
	this.maxScale = config.maxScale || 1.0;
	this.minScale = config.minScale || 0.95;
	this.scaleAmount = this.maxScale - this.minScale;
	var startScale = (config.hasOwnProperty('startScale'))? config.startScale : this.minScale;
	this.scale.x = this.scale.y = startScale;
	this.rate = config.rate || 0.002;

	this.active = config.autostart || false;

	this.count = (startScale === this.maxScale)? 0 : Math.PI;
};

cc.core.motion.Pulsar.prototype.start = function(){
	this.active = true;
};

cc.core.motion.Pulsar.prototype.stop = function(){
	this.active = false;
};

cc.core.motion.Pulsar.prototype.reset = function(){
	this.count = 0;
};

cc.core.motion.Pulsar.prototype.update = function(delta){
	if(this.active){
		this.count += delta * this.rate;
		var sin = Math.sin(this.count);
		var scale = this.minScale + (sin * this.scaleAmount);
		this.scale.x = this.scale.y = scale;
	}
};
cc.core.motion.Interpolation = {
	/**
    * A Catmull Rom Interpolation Method taken from Phaser.
    *
    * @method cc.core.motion.Interpolation#catmullRomInterpolation
    * @param {Array} v - The input array of values to interpolate between.
    * @param {number} k - The percentage of interpolation, between 0 and 1.
    * @return {number} The interpolated value
    */
    catmullRomInterpolation: function (v, k) {

        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);

        if (v[0] === v[m])
        {
            if (k < 0)
            {
                i = Math.floor(f = m * (1 + k));
            }

            return this.catmullRom(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        }
        else
        {
            if (k < 0)
            {
                return v[0] - (this.catmullRom(v[0], v[0], v[1], v[1], -f) - v[0]);
            }

            if (k > 1)
            {
                return v[m] - (this.catmullRom(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            }

            return this.catmullRom(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }

    },    
    /**
    * Calculates a catmum rom value.
    *
    * @method cc.core.motion.Interpolation#catmullRom
    * @protected
    * @param {number} p0
    * @param {number} p1
    * @param {number} p2
    * @param {number} p3
    * @param {number} t
    * @return {number}
    */
    catmullRom: function (p0, p1, p2, p3, t) {

        var v0 = (p2 - p0) * 0.5, v1 = (p3 - p1) * 0.5, t2 = t * t, t3 = t * t2;

        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

    },
    /**
    * A Bezier Interpolation Method taken from Phaser.
    *
    * @method cc.core.motion.Interpolation#bezierInterpolation
    * @param {Array} v - The input array of values to interpolate between.
    * @param {number} k - The percentage of interpolation, between 0 and 1.
    * @return {number} The interpolated value
    */
    bezierInterpolation: function (v, k) {

        var b = 0;
        var n = v.length - 1;

        for (var i = 0; i <= n; i++)
        {
            b += Math.pow(1 - k, n - i) * Math.pow(k, i) * v[i] * this.bernstein(n, i);
        }

        return b;

    },

    /**
    * Calculates a linear (interpolation) value over t.
    *
    * @method cc.core.motion.Interpolation#linear
    * @param {number} p0
    * @param {number} p1
    * @param {number} t
    * @return {number}
    */
    linear: function (p0, p1, t) {
        return (p1 - p0) * t + p0;
    },
    /**
    * A Linear Interpolation Method taken from Phaser.
    *
    * @method cc.core.motion.Interpolation#linearInterpolation
    * @param {Array} v - The input array of values to interpolate between.
    * @param {number} k - The percentage of interpolation, between 0 and 1.
    * @return {number} The interpolated value
    */
    linearInterpolation: function (v, k) {

        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);

        if (k < 0)
        {
            return this.linear(v[0], v[1], f);
        }

        if (k > 1)
        {
            return this.linear(v[m], v[m - 1], m - f);
        }

        return this.linear(v[i], v[i + 1 > m ? m : i + 1], f - i);

    }
};
cc.core.game.HitTest = {
    intersects: function(Object1, Object2){
        var overlap = this._intersection(Object1, Object2);
        return overlap > 0;
    },
    radius: function(pt1, pt2, radius){
        var dist = this._distance(pt1, pt2);
        return dist < radius;
    },
    _intersection: function(Object1, Object2){
        var overlap = 0;//return value
        var obj1R = Object1.x + Object1.width, obj2R = Object2.x + Object2.width,
            obj1B = Object1.y + Object1.height, obj2B = Object2.y + Object2.height;
        if(obj1R > Object2.x && Object1.x < obj2R &&
            obj1B > Object2.y && Object1.y < obj2B){
            //find biggest x & smallest r
            var biggestX = Math.max(Object1.x, Object2.x);
            var smallestR = Math.min(obj1R, obj2R);
            var overlapX = smallestR - biggestX;
            //now do the y
            var biggestY = Math.max(Object1.y, Object2.y);
            var smallestB = Math.min(obj1B, obj2B);
            var overlapY = smallestB - biggestY;
            //return the bigger of the two
            overlap = Math.max(overlapX, overlapY);
        }
        return overlap;
    },
    _distance: function(pt1, pt2){
        var distX = Math.abs(pt2.x - pt1.x),
            distY = Math.abs(pt2.y - pt1.y);
        return Math.sqrt((distX * distX) + (distY * distY));
    },
    containsPoint: function(point, rect){
        var left = rect.x;
        var right = left + rect.width;
        var inX = (x > left && x < right);
        if (!inX) return false;
        //y axis points down
        var bottom = rect.y;
        var top = bottom + rect.height;
        var inY = (y > bottom && y < top);
        return inY;
    }
};

cc.core.game.Camera = function(){
    this.maxY = 0;
    this.minY = 0;
    this.maxX = 0;
    this.minX = 0;
    this.trackX = 0;
    this.defaultTrackX = 0;
    this.trackY = 0;
    this.defaultTrackY = 0;
    this.moveY = false;
    /**
    * object the camera tracks (should be called target really!)
    */
    this.target = null;
};
cc.core.game.Camera.prototype = Object.create(cc.core.game.HitTest);
cc.core.game.Camera.prototype.constructor = cc.core.game.Camera;

/*

 config.scene <- container
 config.target <- player position (point)
 config.screenW <- width of viewport in points
 config.bgW <- width of background in points

 */
cc.core.game.Camera.prototype.init = function(config){
    //
    this.oldX = -100;
    this.defaultTrackX = this.trackX = 0;
    this.defaultTrackY = this.trackY = 0;
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];

    // - set limits - TODO - add a default bgW?
    this.maxX = this.bgW - (this.screenW * 0.5);
    this.minX = -this.maxX;//1024 - this.screenW;

    //TODO - perhaps this should start off in the right place...
    this.viewport = new PIXI.Rectangle(0, 0, this.screenW, this.screenH);

    this.isInFrame = this._frameCheckRect;

    //optional y axis movement
    if(this.moveY){
        this.update = this._updateBoth;
    } else {
        this.update = this._update;
    }
};

cc.core.game.Camera.prototype.reset = function(){
    this.trackX = this.defaultTrackX;
    this.trackY = this.defaultTrackY;
};

//default is to just move x
cc.core.game.Camera.prototype._update = function(delta){
    this.move(this.target.x);
};

//default is to just move x
cc.core.game.Camera.prototype.move = function(px){
    if (px !== this.oldX) {
        this.oldX = px;
        this.scrollX(px + this.trackX);
    }
};

cc.core.game.Camera.prototype._updateBoth = function(delta){
    this.moveBoth(this.target);
};

cc.core.game.Camera.prototype.moveBoth = function(pt){
    if (pt.x !== this.oldX) {
        this.oldX = pt.x;
        this.scrollX(pt.x + this.trackX);
    }
    if (pt.y !== this.oldY) {
        this.oldY = pt.y;
        this.scrollY(pt.y + this.trackY);
    }
};

cc.core.game.Camera.prototype.scrollX = function(px) {
    //console.log('px: ' + px)
    if(px > this.maxX){
        px = this.maxX;
    } else if(px < this.minX){
        px = this.minX;
    }
    // *= this.resolution;
    //this.scene.pivot.x = px;
    this.scene.x = -px;
    //update viewport
    this.viewport.x = px - (this.viewport.width * 0.5);
};

cc.core.game.Camera.prototype.scrollY = function(py) {
    //console.log('px: ' + px)
    if(py > this.maxY){
        py = this.maxY;
    } else if(py < this.minY){
        py = this.minY;
    }
    // *= this.resolution;
    //this.scene.pivot.x = px;
    this.scene.y = -py;
    //update viewport
    this.viewport.y = py - (this.viewport.height * 0.5);
};


cc.core.game.Camera.prototype._frameCheckPoint = function(x, y){
    if(this.moveY){
        var inX = (x > this.viewport.x && x < this.viewport.x + this.viewport.width);
        if(!inX) return false;
        var inY = (y > this.viewport.y && y < this.viewport.y + this.viewport.height);
        return inX && inY;
    } else {
        return (x > this.viewport.x && x < this.viewport.x + this.viewport.width);
    }    
};

cc.core.game.Camera.prototype._frameCheckRect = function(rect){
    if(this.moveY){
        return this.intersects(rect, this.viewport);
    } else {
        var obj1R = rect.x + rect.width, obj2R = this.viewport.x + this.viewport.width;
        return (obj1R > this.viewport.x && rect.x < obj2R);
    }    
};


cc.core.game.Camera.prototype.getX = function(){
    return this.scene.pivot.x;
};

cc.core.game.Camera.prototype.getY = function(){
    return this.scene.pivot.y;
};
cc.core.game.CameraCull = function(){
	this.gameObjects = [];
	this.camera = null;
	this.enabled = true;
};

cc.core.game.CameraCull.prototype.init = function(config) {
    for (var s in config) if (config.hasOwnProperty(s)) this[s] = config[s];

    if(!this.enabled){
        this.update = function(){};
    }
};

cc.core.game.CameraCull.prototype.add = function(item){
	this.gameObjects[this.gameObjects.length] = item;
};

cc.core.game.CameraCull.prototype.update = function(delta){
    //**********************************
    var i, n = this.gameObjects.length, obj;
    //**************************************
    for (i = 0; i < n; i++) {
        obj = this.gameObjects[i];
        if(obj.graphics){
            obj.graphics.visible = (this.camera.isInFrame(obj.frame));
        }
    }     
};

/**
 * For use with p2 physics game objects
 * @class GameLoop
 * @constructor
 */
cc.core.game.GameLoop = function(){
    this.gameObjects = [];
    this.itemsToRemove = [];//items to remove
    this.cameraCulling = false;
    this.userPreUpdate = false;
    //
    this.isPaused = true;
};

//
cc.core.game.GameLoop.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
};

cc.core.game.GameLoop.prototype.add = function(item){
    var i = this.gameObjects.length;
    this.gameObjects[i] = item;
    return i;
};

cc.core.game.GameLoop.prototype.remove = function(item){
    this.itemsToRemove[this.itemsToRemove.length] = item;
};

cc.core.game.GameLoop.prototype.start = function(){
    this.isPaused = false;
};

cc.core.game.GameLoop.prototype.stop = function(){
    this.isPaused = true;
};

cc.core.game.GameLoop.prototype.pause = function(bool){
    this.isPaused = bool;
};

//
cc.core.game.GameLoop.prototype.update = function(p_delta){
    if(!this.isPaused){
         //****************************
        //move game objects
        this.updateGameObjects(p_delta);
        //****************************
        //collision detect
        this.postUpdate(p_delta);
        //****************************
        //call draw on all game objects
        this.drawGameObjects();
        //
        this.input.check(p_delta);
    }
};

/*
 * move game objects
 */
cc.core.game.GameLoop.prototype.updateGameObjects = function(p_delta){
    //**********************************
    var i, n = this.gameObjects.length, obj;
    //**************************************
    for (i = 0; i < n; i++) {
        obj = this.gameObjects[i];
        if(this.userPreUpdate) obj.preUpdate();
        obj.update(p_delta);
        if (obj.remove) {
            this.itemsToRemove[this.itemsToRemove.length] = obj;
        }
    }
};

/*
 * bounds check
 */
cc.core.game.GameLoop.prototype.postUpdate = function(p_delta){
    //**************************************
    //**********************************
    var i, n = this.itemsToRemove.length, obj, index;
    for (i = 0; i < n; i++) {
        obj = this.itemsToRemove[i];
        index = this.gameObjects.indexOf(obj);
        if(index > -1){
            this.gameObjects.splice(index);
        }
    }
    this.itemsToRemove.length = 0;
    //**********************************
    n = this.gameObjects.length;
    //**************************************
    if(this.cameraCulling){
        for (i = 0; i < n; i++) {
            obj = this.gameObjects[i];
            if(obj.graphics){
                obj.graphics.visible = (this.camera.isInFrame(obj.frame));
            }
        }   
    }
    
};

/*
 * write all game co-ords to their display objects
 */
cc.core.game.GameLoop.prototype.drawGameObjects = function(){
    var i, obj, n = this.gameObjects.length;
    for (i = 0; i < n; i++) {
        obj = this.gameObjects[i];
        //NOTE - checks for needsDraw boolean
        if(obj.needsDraw) obj.draw();
    }
};

/*
 * 
 */
cc.core.game.GameLoop.prototype.getGameObject = function(id){
    var i, obj, n = this.gameObjects.length, target = null;
    for (i = 0; i < n; i++) {
        obj = this.gameObjects[i];
        if(obj.id === id){
            target = obj;
            break;
        }
    }
    return target;
};
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
/**
 * @class DragSprite
 * @constructor
 */
cc.core.game.DragSprite = function(){
    this.useClickAndStick = false;
    this.minSize = 60;//TODO - configure this with devicePixelRatio?
    this.y = 0;
    this.x = 0;
    this.autoEnable = true;
};
cc.core.game.DragSprite.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);

/**
 *
 * @param config
 */
cc.core.game.DragSprite.prototype.init = function(config){

    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];

    if(!this.texture){
        this.texture = PIXI.utils.TextureCache[this.img];
    }
    this.root = new PIXI.Sprite(this.texture);

    this.root.anchor.x = 0.5;
    this.root.anchor.y = 0.5;
    this.root.x = this.x;
    this.root.y = this.y;
    this.startPt = new PIXI.Point(this.x, this.y);

    var w = this.texture.frame.width / this.resolution;
    var h = this.texture.frame.height / this.resolution;
    this.rect = new PIXI.Rectangle(0, 0, w, h);

    //apply a minimum size for hit area
    w = Math.max(w, this.minSize);
    h = Math.max(h, this.minSize);

    var y = h * -0.5;
    var x = w * -0.5;
    this.root.hitArea = new PIXI.Rectangle(x, y, w, h);

    //TODO - debug mode, draw the hit area

    this.initDrag();

    this.enable(this.autoEnable);
};

/**
 * this is where it all happens
 */
cc.core.game.DragSprite.prototype.initDrag = function(){
    var pt = new PIXI.Point(), global = new PIXI.Point(), dragOffset = new PIXI.Point();
    var root = this.root, self = this, modeDefault = 1, modeClick = 2;//dragging = 0,
    var pressTime = 0, useClickAndStick = this.useClickAndStick;
    var clickThreshold = 500, maxDist = 20;
    // - also click and stick
    this.dragging = 0;
    // * mousedown *

    // touch start
    this.touchstart = (function(event){
        var iData = event.data;
        iData.getLocalPosition(root, pt);
        dragOffset.x = pt.x;
        dragOffset.y = pt.y;
        if(useClickAndStick) {
            pressTime = game_shell.time;
            global.x = iData.global.x;
            global.y = iData.global.y;
        }
        if(self.dragging === 0){
            self.dragging = modeDefault;
            self.toFront();
        }
    }).bind(this);
    root.on('mousedown', this.touchstart);
    root.on('touchstart', this.touchstart);

    // * mousemove *
    this.touchmove = (function(event){
        var iData = event.data;
        if(self.dragging > 0){
            iData.getLocalPosition(root.parent, pt);
            root.x = pt.x - dragOffset.x;
            root.y = pt.y - dragOffset.y;
        }
    }).bind(this);
    root.on('mousemove', this.touchmove);
    root.on('touchmove', this.touchmove);

    // * mouseup *
    this.touchend = (function(event){
        var iData = event.data;
        //click and stick
        var didClick = false;
        //check for click and stick
        if(useClickAndStick){
            var clickTime = game_shell.time - pressTime;
            if(clickTime < clickThreshold){
                //check how far moved
                var distX = Math.abs(iData.global.x - global.x);
                var distY = Math.abs(iData.global.y - global.y);
                if(distX < maxDist && distY < maxDist){
                    didClick = true;
                }
            }
        }
        //
        if(didClick && self.dragging === modeDefault){
            self.dragging = modeClick;
        } else {
            if(self.dragging > 0){
                self.dropped.call(self);
            }
            self.dragging = 0;
            dragOffset.x = 0;
            dragOffset.y = 0;
        }
    }).bind(this);
    root.on('mouseup', this.touchend);
    root.on('touchend', this.touchend);
    root.on('mouseupoutside', this.touchend);
    root.on('touchendoutside', this.touchend);
};

/**
 *
 * @param bool
 */
cc.core.game.DragSprite.prototype.enable = function(bool){
    this.root.interactive = bool;
    this.root.buttonMode = bool;
};
/**
 *
 */
cc.core.game.DragSprite.prototype.updateRect = function(){
    this.rect.x = this.root.x - (this.rect.width * 0.5);
    this.rect.y = this.root.y - (this.rect.height * 0.5);
};

/**
 *
 */
cc.core.game.DragSprite.prototype.dropped = function(){
    this.updateRect();
    this.emit({type: 'dropped', rect: this.rect});
};

/**
 *
 */
cc.core.game.DragSprite.prototype.toFront = function(){
    var p = this.root.parent;
    this.root.removeFromParent();
    p.addChild(this.root);
};

/**
 *
 * @param pt
 */
cc.core.game.DragSprite.prototype.setStart = function(pt){
    this.startPt.x = pt.x;
    this.startPt.y = pt.y;
    this.root.x = pt.x;
    this.root.y = pt.y;
    this.updateRect();
};
/**
 * @class ParticleBase
 * @constructor
 */
cc.core.game.ParticleBase = function(){
    this.root = null;
    this.texture = null;
    this.life = 3;
    this.poolSize = 150;
    //emitter instance
    this.proton = new Proton();
    this.rad = Math.PI / 180;
    this.deg = 180 / Math.PI;
};

/**
 *
 * @param config
 */
cc.core.game.ParticleBase.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];

    this.emitter = this.createEmitter();
    this.proton.addEmitter(this.emitter);

    this._spritePool = this._createPool(this.poolSize);

    this.renderer = this.createRenderer();

    this.move(config.x, config.y);

    this.renderer.start();
};

/**
 *
 */
cc.core.game.ParticleBase.prototype.dispose = function(){
    if(this.proton) this.proton.destroy();
    this.proton = null;
};

/**
 *
 * @param px
 * @param py
 * @param duration
 */
cc.core.game.ParticleBase.prototype.fire = function(px, py, duration){
    var time = duration || 0.5;
    this.move(px,py);
    this.emit(time);
};

/**
 *
 * @param px
 * @param py
 */
cc.core.game.ParticleBase.prototype.move = function(px,py){
    this.emitter.p.x = px || 0;
    this.emitter.p.y = py || 0;
};

/**
 *
 * @param p_time
 */
cc.core.game.ParticleBase.prototype.update = function(p_time){
    this.proton.update(p_time);
};

/**
 *
 * @param p_secs
 */
cc.core.game.ParticleBase.prototype.emit = function(p_secs){
    var secs = p_secs || Infinity;
    this.emitter.emit(secs);
};

/**
 *
 * @param andRemove
 */
cc.core.game.ParticleBase.prototype.stop = function(andRemove){
    this.emitter.stopEmit();
    if(andRemove){
        this.emitter.removeAllParticles();
    }
};

/**
 * a single emission burst
 */
cc.core.game.ParticleBase.prototype.burst = function(){
    this.emitter.emit(0.2);
};

/**
 *
 * @param radians
 */
cc.core.game.ParticleBase.prototype.rotate = function(radians){
    var degrees = ((radians * this.deg) % 360) - 180;
    this.emitter.velocity.thaPan.a = degrees;
};

/**
 *
 * @returns {Proton.BehaviourEmitter}
 */
cc.core.game.ParticleBase.prototype.createEmitter = function() {
    var texture = this.texture;
    //
    var vx = (this.life * 0.5), vy = this.life;
    var mass = 1, gravity = 2;
    var lx = this.life * 0.35, ly = this.life * 0.5;
    //
    var emitter = new Proton.BehaviourEmitter();
    emitter.addInitialize(new Proton.ImageTarget(texture));
    //* @param {Array or Number or Proton.Span} numpan the number of each emission;
    //* @param {Array or Number or Proton.Span} timepan the time of each emission;
    //emitter.rate = new Proton.Rate(new Proton.Span(15, 30), new Proton.Span(.2, .5));
    //emitter.rate = new Proton.Rate(new Proton.Span(6, 8), new Proton.Span(.05, .1));
    emitter.rate = new Proton.Rate(10, 0.1);
    emitter.addInitialize(new Proton.Mass(mass));
    //
    emitter.addBehaviour(new Proton.Gravity(gravity));
    emitter.addInitialize(new Proton.Life(lx, ly));
    emitter.addInitialize(new Proton.Velocity(new Proton.Span(vx, vy), new Proton.Span(0, 360), 'polar'));
    emitter.addBehaviour(new Proton.Scale(Proton.getSpan(.5, 1.5)));
    emitter.addBehaviour(new Proton.Alpha(1, 0, Infinity, Proton.easeInQuart));
    emitter.addBehaviour(new Proton.Rotate(Proton.getSpan(0, 360), Proton.getSpan(-3, 3), 'add'));
    return emitter;
};

/**
 *
 * @param particleSprite
 * @param particle
 */
cc.core.game.ParticleBase.prototype.transformSprite = function(particleSprite, particle) {
    particleSprite.x = particle.p.x;
    particleSprite.y = particle.p.y;
    particleSprite.scale.x = particle.scale;
    particleSprite.scale.y = particle.scale;
    particleSprite.alpha = particle.alpha;
    particleSprite.rotation = particle.rotation * this.rad;
};

/**
 *
 * @param size
 * @returns {Array}
 * @private
 */
cc.core.game.ParticleBase.prototype._createPool = function(size) {
    var _spritePool = [];
    var sp, tx = this.texture;
    while (size > 0) {
        size--;
        sp = new PIXI.Sprite(tx);
        //TODO - if use pivot then need to factor in resolution!
        sp.anchor.x = 0.5;
        sp.anchor.y = 0.5;
        _spritePool[_spritePool.length] = sp;
    }
    return _spritePool;
};

/**
 *
 */
cc.core.game.ParticleBase.prototype.createRenderer = function() {
    var renderer = new Proton.Renderer('other', this.proton);
    //renderer.onProtonUpdate = function() { };
    var self = this;
    renderer.onParticleCreated = function(particle) {
        particle.sprite = self.nextSprite();
        self.root.addChild(particle.sprite);
    };
    renderer.onParticleUpdate = function(particle) {
        self.transformSprite(particle.sprite, particle);
    };
    renderer.onParticleDead = function(particle) {
        particle.sprite.removeFromParent();
    };
    return renderer;
};

/**
 *
 * @returns {Pixi.Sprite}
 */
cc.core.game.ParticleBase.prototype.nextSprite = function() {
    var sp = this._spritePool.shift();
    this._spritePool[this._spritePool.length] = sp;
    return sp;
};

/**
 *
 * @constructor
 */
cc.core.game.NullParticles = function(){
    //************************************************
    this.dispose = function(){ };
    //
    this.init = function(cfg){ };
    this.fire = function(px,py, duration){ };
    this.move = function(px,py){ };
    //
    this.update = function(p_time){ };
    this.emit = function(p_secs){ };
    //************************************************
};
/**
 * mixin to handle generic game init
 * @constructor
 */
cc.core.GenericGame = function () {

    //*************************************
    //set div color
    //*************************************
    this.gameDiv = cc.core.GenericGame.prototype.setGameDiv.call(this, 'game');
    //*************************************
    // system analysis
    //*************************************
    this.system = cc.core.GenericGame.prototype.createSystemInfo.call(this);
    //*************************************
    //create a central event queue
    this.eventQueue = cc.core.GenericGame.prototype.createEventQueue.call(this);
    //*************************************
    this.resolutionController = cc.core.GenericGame.prototype.initResolution.call(this);//<- do this before creating viewport!
    //*************************************
    this.viewport = cc.core.GenericGame.prototype.createViewport.call(this);
    //*************************************
    // create pixi stage instance
    //*************************************
    this.stage = cc.core.GenericGame.prototype.createStage.call(this, cc.core.settings);
    //*************************************
    //instantiate sound manager
    this.snd = cc.core.GenericGame.prototype.createSoundManager.call(this);
    //*************************************
    // create screen manager
    //*************************************
    this.screenMgr = cc.core.GenericGame.prototype.createScreenManager.call(this);
    //*************************************
    // create the render loop
    //*************************************
    this.renderLoop = cc.core.GenericGame.prototype.createRenderLoop.call(this);
    //*************************************
    //have a global updateList instance for things that need to run independently of screens
    this.updateList = new cc.core.utils.UpdateList();
    //have a global timeout
    this.timeout = new cc.core.utils.DelayedAction();
    this.updateList.add(this.timeout);
    //*************************************
    this.updateLoop = cc.core.GenericGame.prototype.createUpdateLoop.call(this);
    //*************************************
    // game pause handling
    //*************************************
    this.pauseController = cc.core.GenericGame.prototype.createPauseController.call(this);
    //*************************************
    // full screen handling
    //*************************************
    this.fullscreen = cc.core.GenericGame.prototype.createFullscreenManager.call(this);
    //*************************************
    //create loader
    this.loader = cc.core.GenericGame.prototype.createLoader.call(this);
    //*************************************
    //invoke callback - for customisation
    if (typeof this.onReady === "function") this.onReady();
    //*************************************
    //invoke resize
    this.viewport.resize();
    //*************************************
    cc.core.GenericGame.prototype.begin.call(this);
    //************************************************
    this.getURL = function (id) {
        return this.loader.urls.getURL(id);
    };
};

/**
 *
 * @returns {cc.core.load.BulkLoader}
 */
cc.core.GenericGame.prototype.createLoader = function () {
    var loader = new cc.core.load.BulkLoader();
    loader.init({
        resolution: this.resolution,
        system: this.system,
        settings: cc.core.settings,
        jsonCache: this.json,
        audioType: this.system.audioType,
        audioFolder: cc.core.settings.SND_DIR
    });
    return loader;
};

/**
 * @method updateGame
 * @param delta
 */
cc.core.GenericGame.prototype.updateGame = function (delta) {
    //update tweens
    TWEEN.update(this.updateLoop.currentTime);
    //the global update list
    this.updateList.update(delta);
    //update screen content
    this.screenMgr.update(delta);
    //and the sound manager...
    this.snd.update(delta);
    //finally deal with queued events
    this.eventQueue.dispatchQueuedEvents();
};

//************************************************
//these want to be overrideable
//************************************************

/**
 * @method start
 */
cc.core.GenericGame.prototype.begin = function () {
    this.updateLoop.start();
    //kick off the render loop
    this.renderLoop.start();
};

/**
 * @method setGameDiv
 * @param name
 * @returns {Element}
 */
cc.core.GenericGame.prototype.setGameDiv = function (name) {
    var gameDiv = document.getElementById(name);
    gameDiv.style.backgroundColor = cc.core.settings.BG_COLOR;
    return gameDiv;
};

/**
 * @method createEventQueue
 * @returns {cc.core.utils.EventQueue}
 */
cc.core.GenericGame.prototype.createEventQueue = function () {
    var eventQueue = new cc.core.utils.EventQueue();
    eventQueue.on("game_event", this.onGameEvent.bind(this));
    return eventQueue;
};

/**
 * @method createScreenManager
 * @returns {cc.core.screens.ScreenMgr}
 */
cc.core.GenericGame.prototype.createScreenManager = function () {
    var screenMgr = new cc.core.screens.ScreenMgr();//
    screenMgr.init({
        stage: this.stage, 
        snd: this.snd, 
        eventQueue: this.eventQueue, 
        resolution: this.resolution, 
        settings: cc.core.settings
    });
    return screenMgr;
};

/**
 * @method createSystemInfo
 * @returns {cc.core.utils.SystemInfo}
 */
cc.core.GenericGame.prototype.createSystemInfo = function () {
    var system = new cc.core.utils.SystemInfo();
    system.run(true);
    //allow overriding the audio type with mp3
    if (cc.core.settings.AUDIO_TYPE) system.audioType = cc.core.settings.AUDIO_TYPE;
    cc.core.utils.system = system;//for legacy reasons, store here too
    return system;
};

/**
 * @method createPauseGame
 * @returns {cc.core.utils.PauseController}
 */
cc.core.GenericGame.prototype.createPauseController = function () {
    var pauseController = new cc.core.utils.PauseController();
    pauseController.init({
        updateLoop: this.updateLoop,
        renderLoop: this.renderLoop,
        snd: this.snd
    });
    return pauseController;
};

/**
 * @method createFullscreenManager
 * @returns {cc.core.utils.FullscreenMgr}
 */
cc.core.GenericGame.prototype.createFullscreenManager = function () {
    var fullscreenMgr = null;
    if (cc.core.utils.system.isMobile) {
        window.scrollTo(0, 1); //can't use fullscreen API here, only on user interaction!
    }
    if (cc.core.settings.FULLSCREEN_ENABLED) {
        var disabledOnDesktop = cc.core.utils.system.isDesktop && !cc.core.settings.DESKTOP_FULLSCREEN;
        if (!disabledOnDesktop) {
            fullscreenMgr = new cc.core.utils.FullscreenMgr();
            fullscreenMgr.init({
                canvas: this.stage.renderer.view,
                isMobile: cc.core.utils.system.isMobile
            });
        }
    }
    return fullscreenMgr;
};

/**
 * @method createRenderLoop
 * @returns {cc.core.utils.RenderLoop}
 */
cc.core.GenericGame.prototype.createRenderLoop = function () {
    var renderLoop = new cc.core.utils.RenderLoop();
    renderLoop.init({
        stage: this.stage,
        screenMgr: this.screenMgr,
        useStats: this.config.SHOW_STATS === true
    });
    return renderLoop;
};

/**
 * @method createStage
 * @param config
 * @returns {cc.core.display.Stage}
 */
cc.core.GenericGame.prototype.createStage = function (config) {
    var stage = new cc.core.display.Stage();
    stage.init({
        width: config.STAGE_W,
        height: config.STAGE_H,
        forceCanvas: !config.WEB_GL_ENABLED,
        settings: {
            backgroundColor: parseInt(config.BG_COLOR.substr(1), 16),
            resolution: this.resolutionController.resolution
        }
    });
    return stage;
};

/**
 * @method createUpdateLoop
 * @returns {cc.core.utils.UpdateLoop}
 */
cc.core.GenericGame.prototype.createUpdateLoop = function () {
    //run loop controller component that uses setInterval to run an update loop
    var updateLoop = new cc.core.utils.UpdateLoop();
    updateLoop.updateGame = cc.core.GenericGame.prototype.updateGame.bind(this);
    return updateLoop;
};

/**
 * @method initResolution
 * @returns {cc.core.utils.Resolution}
 */
cc.core.GenericGame.prototype.initResolution = function () {
    var resolutionController = new cc.core.utils.Resolution();
    var forceResolution = cc.core.GenericGame.prototype.checkForceResolution(this.config);
    resolutionController.init({
        forceResolution: forceResolution
    });
    if (cc.core.settings.SCALE_MODE === 2) {
        //match width
        cc.core.settings.setIpad();
        resolutionController.setByWidth();
    } else {
        //match height
        cc.core.settings.setIphone();
        resolutionController.setByHeight();
    }
    return resolutionController;
};

/**
 * under some conditions a specific resolution may be forced
 */
cc.core.GenericGame.prototype.checkForceResolution = function(config){
    var forceResolution = config.RESOLUTION || -1;
    var system = cc.core.utils.system, version = system.osVersion;
    if (system.isAndroid && version < 4 ||
        system.isAndroidStock) {
        //always force resolution 1 for these older systems
        forceResolution = 1;
    }
    return forceResolution;
};

/**
 * @method createSoundManager
 * @returns {cc.core.audio.SndMgr}
 */
cc.core.GenericGame.prototype.createSoundManager = function () {
    var sndMgr = new cc.core.audio.SndMgr();
    var sndConfig = cc.core.GenericGame.prototype.getSoundConfig();
    sndMgr.init(sndConfig);
    return sndMgr;
};

/**
 *
 * @returns {Object}
 */
cc.core.GenericGame.prototype.getSoundConfig = function(){
    var settings = cc.core.settings,
        system = cc.core.utils.system;
    return {
        isIOS: system.isIOS,
        audioType: system.audioType,
        audioEnabled: settings.AUDIO_ENABLED,
        webAudioEnabled: settings.WEB_AUDIO_ENABLED,
        isMuted: settings.MUTE_STATE
    };
};

/**
 * @method createViewport
 * @returns {cc.core.utils.Viewport}
 */
cc.core.GenericGame.prototype.createViewport = function () {
    var settings = cc.core.settings;
    //scaleMode
    var scaleMode = settings.SCALE_MODE || 1;
    var isMobile = cc.core.utils.system.isMobile;
    var viewport = new cc.core.utils.Viewport();
    viewport.init({
        //don't bother showing please rotate screen on desktop!
        CHECK_ORIENTATION: settings.CHECK_ORIENTATION && isMobile,
        DESKTOP_RESIZE: settings.DESKTOP_RESIZE,
        DEFAULT_W: settings.DEFAULT_W,
        DEFAULT_H: settings.DEFAULT_H,
        MIN_W: settings.MIN_W,
        MIN_H: settings.MIN_H,
        STAGE_W: settings.STAGE_W,
        STAGE_H: settings.STAGE_H,
        iframeMode: settings.IFRAME_MODE,
        orientation: settings.ORIENTATION,
        isMobile: isMobile,
        scaleMode: scaleMode,
        rotateImg: document.getElementById("rotate"),
        gameDiv: document.getElementById('game')
    });
    var self = this;
    viewport.on("resize", function (event) {
        self.pauseController.onResized.call(self.pauseController, event);
        if (!event.wrongOrientation) {
            settings.STAGE_W = event.settings.pointWidth;
            settings.STAGE_H = event.settings.pointHeight;
            self.stage.resize(event.settings);
            self.screenMgr.resize(event.settings);
        }
        if (isMobile) window.scrollTo(0, 1);
    });

    return viewport;
};
cc.core.utils.TweenGroup = function(){
	cc.core.utils.UpdateList.call(this);
};
cc.core.utils.TweenGroup.prototype = Object.create(cc.core.utils.UpdateList.prototype);

cc.core.utils.TweenGroup.prototype.update = function(p_delta){
    var n = this.updateItems.length;
    var item, isComplete;
    for(var i = n-1; i > -1; i--){
        item = this.updateItems[i];
        isComplete = item.update(p_delta);
        if(isComplete){
        	this.removeItems[this.removeItems.length] = item;
        }
    }
    //now remove items
    n = this.removeItems.length;
    if(n > 0){
        for(i = 0; i < n; i++){
            item = this.removeItems[i];
            this._remove(item);
        }
        this.removeItems.length = 0;
    }
};

/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

	Date.now = function () {

		return new Date().valueOf();

	};

}

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '14',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},
		//********************************************
		// Alex -- added pause handling
		//********************************************
		pausedTweens: [],
		pauseTime: -1,
		pause: function(){
			//fetch all tweens
			this.pausedTweens = _tweens.slice();
			this.removeAll();
			this.pauseTime = Date.now();
		},
		unpause: function(){
			//fetch all tweens
			var unpauseTime = Date.now();
			var pauseDuration = unpauseTime - this.pauseTime;
			var numTweens = this.pausedTweens.length;
			var tween;
			for(var i = 0; i < numTweens;i++){
				tween = this.pausedTweens[i];
				tween.restart(pauseDuration);
				this.add(tween);
			}
			this.pausedTweens.length = 0;
		},
		//********************************************
		
		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			//time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	//Alex - enabled strt without adding to TWEEN update
	this.start = function ( time ) {
		TWEEN.add( this );
		this._start(time);
	};

	this._start = function ( time ) {

		_isPlaying = true;

		_onStartCallbackFired = false;

		//Alex - removed defaulting to window.performace.now since my update loop runs off date.now which returns a completely different range number!
		//_startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
		_startTime = time !== undefined ? time : Date.now();
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
		return this;

	};

	//************************************
	//cc.core.- added this to support pausing
	this.restart = function(pause_duration){
		_startTime += pause_duration;
	};
	//and this to change duration on the fly
	this.changeDuration = function(new_duration){
		_duration = new_duration;
	};
	//************************************

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
				if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed === 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};

TWEEN.UpdateTween = function ( object ) {
	var self = TWEEN.Tween.call(this, object);

	this.passedTime = 0;
	this.isCompleted = true;

	this.baseUpdate = this.update;
	this.baseStart = this._start;

	this.start = function(delta){
		this.isCompleted = false;
		this.passedTime = Date.now();
		this.baseStart();
		return this;
	};

	this.update = function(delta){
		if(!this.isCompleted){
			this.passedTime += delta;
			this.isCompleted = !this.baseUpdate(this.passedTime);
		}	
		if(this.isCompleted){
			//remove self from list somehow!
		}
		return this.isCompleted;	
	};
	return self;
};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};

if(typeof module !== 'undefined' && module.exports) {
	module.exports = TWEEN;
}
