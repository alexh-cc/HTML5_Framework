/**
 * @class WebAudioMgr
 * @param config
 * @constructor
 */
alex.audio.WebAudioMgr = function(config){
    //************************************
    this.type = alex.audio.AudioModes.WEB_AUDIO;
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
    this.globalMute = new alex.audio.WebAudioSoundGroup('master', this.createGainNode());
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
alex.audio.WebAudioMgr.prototype.createContext = function(){
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
alex.audio.WebAudioMgr.prototype.createGainNode = function(){
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
alex.audio.WebAudioMgr.prototype.play = function(id, p_vol, p_loop){

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
        channel = new alex.audio.Channel(config);
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
alex.audio.WebAudioMgr.prototype.isPlaying = function(id){
    return this.channels.hasOwnProperty(id);
};

/**
 * stop sound by id
 * @param id
 */
alex.audio.WebAudioMgr.prototype.stop = function(id){
    if(this.channels.hasOwnProperty(id)){
        var channel = this.channels[id];
        this.stopChannel(channel);
    }
};
/*
 * stop ALL sounds...!
 */
alex.audio.WebAudioMgr.prototype.stopAll = function(){
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
alex.audio.WebAudioMgr.prototype.stopChannel = function(channel){
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
alex.audio.WebAudioMgr.prototype.fadeOut = function(id, p_time){
    //console.log("* WebAudioMgr - fadeOut " + id);
    if(this.channels.hasOwnProperty(id)){
        var channel = this.channels[id];
        var fadeTime = (p_time === undefined)? 1000 : p_time;
        channel.fadeOut(fadeTime);
    }
};
//fade in
alex.audio.WebAudioMgr.prototype.fadeIn = function(id, p_vol, p_time){
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
alex.audio.WebAudioMgr.prototype.addSounds = function(p_assets){
    var audioData, jsonData, id;//String
    //changed this, the assets dictionary now holds data objects, the sound buffer is a property of that object

    for(id in p_assets){
        if(p_assets.hasOwnProperty(id)){
            //ignore if already loaded
            if(!this.sounds.hasOwnProperty(id)){
                jsonData = p_assets[id];
                //only register ones that loaded succesfully
                if(jsonData.soundData !== null) {
                    audioData = new alex.audio.WebAudioData(jsonData);
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
alex.audio.WebAudioMgr.prototype.removeSounds = function(webAudioManifest){
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
alex.audio.WebAudioMgr.prototype.purge = function(){
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
alex.audio.WebAudioMgr.prototype.addToCatalog = function(audioData){
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
alex.audio.WebAudioData = function(config){
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

alex.audio.WebAudioMgr.prototype.addSoundGroup = function(p_id){
    var gainNode = this.createGainNode();
    var group = new alex.audio.WebAudioSoundGroup(p_id, gainNode);
    group.connect(this.globalMute.node);
    this.soundGroups[p_id] = group;
    return group;
};

alex.audio.WebAudioMgr.prototype.isGroupMuted = function(groupId){
    var group = this.soundGroups[groupId];
    //validate
    return (group === undefined)? false : group.isMuted;
};

///****************************************************

//************************************
// MUTING
//************************************

//
alex.audio.WebAudioMgr.prototype.mute = function(b){
    this.globalMute.isMuted = b;
    //muteNode.gain.value = b? 0 : 1.0;
    this.globalMute.volume = b? 0 : 1.0;
};

alex.audio.WebAudioMgr.prototype.muteGroup = function(grp,b){
    var grpNode = this.soundGroups[grp];  //TODO - validate?
    grpNode.volume = b? 0 : 1.0;
    grpNode.isMuted = b;
};

alex.audio.WebAudioMgr.prototype.muteAllGroups = function(b){
    for(var s in this.soundGroups){
        if(this.soundGroups.hasOwnProperty(s)){
            this.muteGroup(s, b);
        }
    }
};

//bit of a cheat... mute instead of pause
alex.audio.WebAudioMgr.prototype.pause = function(bool){
    if(bool){
        this.globalMute.volume = 0;
    } else {
        if(!this.globalMute.isMuted){
            this.globalMute.volume = 1.0;
        }
    }
};

alex.audio.WebAudioMgr.prototype.update = function(delta){
    //nothing for now...
};
///****************************************************
/*
 * call this in response to a touch event to wake the audio system on iOS!
 */
alex.audio.WebAudioMgr.prototype.wakeAudioSystem = function(){
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
