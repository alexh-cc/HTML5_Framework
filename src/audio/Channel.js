/**
 * Basically a wrapper for an AudioBufferSourceNode
 * @class Channel
 * @param config
 * @constructor
 */
alex.audio.Channel = function(config){
    alex.utils.EventDispatcher.call(this);
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
alex.audio.Channel.prototype = Object.create(alex.utils.EventDispatcher.prototype);
alex.audio.Channel.prototype.constructor = alex.audio.Channel;

/**
 *
 * @param config
 */
alex.audio.Channel.prototype.createChannel = function(config){
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
alex.audio.Channel.prototype.createGainNode = function(){
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
alex.audio.Channel.prototype.connect = function(p_muteNode){
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
alex.audio.Channel.prototype.play = function(){
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
alex.audio.Channel.prototype.stop = function(){
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
Object.defineProperty(alex.audio.Channel.prototype, 'volume', {
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
alex.audio.Channel.prototype.fadeOut = function(p_time){
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
alex.audio.Channel.prototype.fadeIn = function(p_vol, p_time){
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
alex.audio.Channel.prototype.fadeTo = function(p_vol, p_secs){
    var time = (p_secs === undefined)? 1 : p_secs;
    this.gainNode.gain.linearRampToValueAtTime(p_vol, this.context.currentTime + time);
    //would have to use update cycle with timeout or something like that
};

/**
 *
 * @returns {TWEEN.Tween}
 */
alex.audio.Channel.prototype.createTween = function(){
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
alex.audio.Channel.prototype.dispose = function(){
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