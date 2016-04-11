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