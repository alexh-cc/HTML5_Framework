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