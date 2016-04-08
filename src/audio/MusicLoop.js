/**
 *
 * @param config
 * @constructor
 */
alex.audio.MusicLoop = function(config){    
    this.type = alex.audio.AudioModes.MUSIC_LOOP;
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
alex.audio.MusicLoop.prototype.init = function(config){
    this.sound = this.initSnd(config);
};

/**
 *
 * @param config
 * @returns {Element}
 */
alex.audio.MusicLoop.prototype.initSnd = function(config){
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
alex.audio.MusicLoop.prototype.pause = function(b){
    this.isPaused = b;
    //TODO - perhaps check its loaded, etc
    if(this.isPaused){
        this.sound.pause();
    } else {
        this.sound.play();
    }
};
alex.audio.MusicLoop.prototype.isPlaying = function() {
    return !this.isPaused;
};
//************************
alex.audio.MusicLoop.prototype.update = function(elapsedTime){
    //TODO?
};
//************************
alex.audio.MusicLoop.prototype.dispose = function(){
    if(this.sound !== null){
        this.sound.pause();
        this.sound = null;
    }
};
//************************
alex.audio.MusicLoop.prototype.mute = function(bool){
    this.isMuted = bool;
    this.sound.muted = bool;
    this.sound.volume = (bool)? 0 : this.volume;
};
alex.audio.MusicLoop.prototype.muteGroup = function(grp, bool){
    if(grp == this.grp){
        this.mute(bool);
    }
};
alex.audio.MusicLoop.prototype.isGroupMuted = function(grp){
    if(grp == this.grp){
        return this.isMuted;
    } else {
        return false;
    }
};

//************************
/*alex.audio.MusicLoop.prototype.start = function(){
    this.sound.play();
};

alex.audio.MusicLoop.prototype.end = function(){
    this.sound.pause();
};*/
//************************
alex.audio.MusicLoop.prototype.play = function(p_id, p_vol, p_loop){
   this.sound.play();
};
alex.audio.MusicLoop.prototype.preload = function(p_id){
    //ignore
};
alex.audio.MusicLoop.prototype.stop = function(p_id){
    this.sound.pause();
};
alex.audio.MusicLoop.prototype.addSounds = function(p_id){
    //ignore
};
alex.audio.MusicLoop.prototype.stopAll = function(){
    //ignore
};
//************************