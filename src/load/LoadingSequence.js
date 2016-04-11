
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