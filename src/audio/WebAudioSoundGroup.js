/**
 *
 * @param name
 * @param gainNode
 * @constructor
 */
alex.audio.WebAudioSoundGroup = function(name, gainNode){
    this.id = name;
    this.node = gainNode;
    this.isMuted = false;
    this.connect = function(dest){
        this.node.connect(dest);
    };
};

Object.defineProperty(alex.audio.WebAudioSoundGroup.prototype,'volume', {
    get: function() {
        return this.node.gain.value;
    },
    set: function(value) {
        this.node.gain.value = value;
    }
});