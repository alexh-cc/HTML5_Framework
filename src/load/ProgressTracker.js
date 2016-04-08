// progress tracker
alex.load.ProgressTracker = function(webAudio){
    this.webAudio = webAudio;
    this.reset();
    this.total = (this.webAudio)? 4 : 3;	
};

//
alex.load.ProgressTracker.prototype.totalProgress = function(){
    var prg = this.progressJSON + this.progressImages + this.progressFonts;
    if(this.webAudio) prg += this.progressSounds;
    return prg;
};
//
alex.load.ProgressTracker.prototype.overallProgress = function(){
    var prg = this.totalProgress();
    return prg / this.total;
};

//
alex.load.ProgressTracker.prototype.reset = function(){
    this.progressJSON = 0;  this.progressImages = 0;
    this.progressSounds = 0;  this.progressFonts = 0;
};

alex.load.ProgressTracker.prototype.debugLog = function(){
    var s = "* ProgressTracker: \n\r";
    s += " - total: " + this.total + " \n\r";
    s += " - overall: " + this.totalProgress() + " \n\r";
    s += " - progressJSON: " + this.progressJSON + " \n\r";
    s += " - progressImages: " + this.progressImages + " \n\r";
    s += " - progressSounds: " + this.progressSounds + " \n\r";
    s += " - progressFonts: " + this.progressFonts + " \n\r";
    return s;
};