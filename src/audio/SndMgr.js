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