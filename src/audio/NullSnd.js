/**
 * Created with IntelliJ IDEA.
 * User: alex
 * Date: 2014/10/08
 * Time: 3:08 PM
 * To change this template use File | Settings | File Templates.
 */

//null object for completely disabled sound...
alex.audio.SndNone = function(){
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