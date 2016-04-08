/**
 * Created by Alex on 2014/10/09.
 */

/**
 *
 * @param p_bulkLoader
 * @constructor
 */
alex.load.AudioLoadState = function(){
    this.bulkLoader = null;
    this.soundLoader = null;
};

/**
 *
 * @param config
 */
alex.load.AudioLoadState.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
};

/**
 *
 */
alex.load.AudioLoadState.prototype.load = function(){
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
