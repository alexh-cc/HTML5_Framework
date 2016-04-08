/**
 *
 * @constructor
 */
alex.utils.SystemInfo = function(){
    this.browser = -1;//identify browser type
    this.os = -1;//operating system
    this.device = -1;//device type (desktop or mobile)
    
    //*************************
    //possible browser types
    this.browserUnknown = -1;
    this.browserSafari = 1;
    this.browserIE = 2;
    this.browserFirefox = 3;
    this.browserChrome = 4;
    this.browserAndroidStock = 5;
    this.browserKindleSilk = 6;
    this.browserOpera = 7;
    //*************************
    //possible device types
    this.deviceUnknown = -1;
    this.deviceDesktop = 1;
    this.deviceMobile = 2;
    //TODO - distinguish between phone & tablet?
    //*************************
    //possible os types
    this.osUnknown = -1;
    this.osWindows = 1;
    this.osOSX = 2;
    this.osLinux = 3;
    this.osIOS = 4;//TODO - should this check for different versions? eg iOS5, iOS6?
    this.osAndroid = 5;
    this.osBlackberry = 6;
    //*************************
    //os version
    this.osVersion = -1;
    //*************************
    //audio type
    this.audioType = '';
    this.webAudio = false;
};
/**
 *
 */
alex.utils.SystemInfo.prototype.run = function(){
    this._checkDevice();
    this._checkAudio();
};

/**
 * user agent sniffing
 * @private
 */
alex.utils.SystemInfo.prototype._checkDevice = function(){
    var systemString = navigator.userAgent;
    if (systemString.length > 0) {
        //reg exp
        //The i modifier is used to perform case-insensitive matching.
        //string.match > The match() method searches a string for a match against a regular expression,
        //and returns the matches, as an Array object (or null if no match is found).
        
        //*****************************************
        //identify the device
        //*****************************************
        if (systemString.match(/mobile/i) !== null) {
            this.device = this.deviceMobile;
        } else if (systemString.match(/tablet/i) !== null) {
            this.device = this.deviceMobile;
        } else if (systemString.match(/android/i) !== null) {
            this.device = this.deviceMobile;
        } else {
            this.device = this.deviceDesktop;
        }
        //*****************************************
        //identify the OS
        //*****************************************
        if (systemString.match(/windows/i) !== null) {
            this.os = this.osWindows;
        } else if (systemString.match(/iphone os/i) !== null){
            this.os = this.osIOS;  
        } else if (systemString.match(/ipad/i) !== null){
            this.os = this.osIOS;  
        } else if (systemString.match(/mac os x/i) !== null) {
            if (this.device === this.deviceMobile) {
                this.os = this.osIOS; 
            } else {
                this.os = this.osOSX;  
            }
        } else if (systemString.match(/android/i) !== null) {
            this.os = this.osAndroid;
        } else if (systemString.match(/linux/i) !== null) {
            this.os = this.osLinux;
        }
        //*****************************************
        //identify the browser
        //*****************************************
        if (systemString.match(/MSIE/i) !== null || systemString.match(/rv:11.0/i) !== null) {
            this.browser = this.browserIE;
        } else if (this.os === this.osAndroid && (systemString.match(/samsung/i) !== null || systemString.match(/534.30/i) !== null || systemString.match(/535.19/i) !== null)) {
            this.browser = this.browserAndroidStock;
        } else if (systemString.match(/silk/i) !== null || systemString.match(/kindle fire/i) !== null) {
           this.browser = this.browserKindleSilk;
        } else if (systemString.match(/chrome/i) !== null) {
            this.browser = this.browserChrome;
        } else if (systemString.match(/CriOS/i) !== null) {
            this.browser = this.browserChrome;
        } else if (systemString.match(/Firefox/i) !== null) {
            this.browser = this.browserFirefox;
        } else if (systemString.match(/safari/i) !== null) {
            this.browser = this.browserSafari;
        }
        //*****************************************
        //try to check os version!
        //*****************************************
        if(this.os === this.osIOS){
            //TODO - this needs to be future proof!
            if(systemString.match(/iPhone OS 5/i) !== null) {
                this.osVersion = 5;
            } else if(systemString.match(/iPhone OS 6/i) !== null) {
                this.osVersion = 6;
            } else if(systemString.match(/(iPad|iPhone);.*CPU.*OS 7_\d/i) !== null){
                this.osVersion = 7;
            } else if(systemString.match(/(iPad|iPhone);.*CPU.*OS 8_\d/i) !== null){
                this.osVersion = 8;
            }else if(systemString.match(/(iPad|iPhone);.*CPU.*OS 9_\d/i) !== null){
                this.osVersion = 9;
            }
        } else if(this.os === this.osAndroid){
            try{
                var androidVersionString = systemString.match(/Android [\d+(?:\.\d+]{3,5}/)[0].replace('Android ','');
                this.osVersion = parseFloat(androidVersionString);
            } catch(e){
               // db.log("OSVERSION ERROR - ");// + e.message);
                this.osVersion = -1;
            }

            //http://stackoverflow.com/questions/5293394/get-android-os-version-from-user-agent/5293488#5293488
            // (\d+(?:\.\d+)+);
            // (\d+(?:\.\d+){1,2});
        }
       // db.log("* this.osVersion: "+this.osVersion);
        //*****************************************
    }
};

/**
 * check audio support
 * @private
 */
alex.utils.SystemInfo.prototype._checkAudio = function(){
    //*****************************        
    //var canPlay = 'probably';
    //var canPlayOgg = Modernizr.audio.ogg;    
    /*
    "probably" - the browser most likely supports this audio/video type
    "maybe" - the browser might support this audio/video type
    "" - (empty string) the browser does not support this audio/video type
    */
    //boolean
    var canPlayOgg = true;//oggCheck.call(this);
    if (this.isIOS || this.browser === this.browserSafari) {
        canPlayOgg = false;
    } else {
        var a = document.createElement('audio');
        canPlayOgg = !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
    }
    
    if(canPlayOgg){
        this.audioType = '.ogg'
    } else {
        this.audioType = '.m4a'
    }
    //
    if (window.AudioContext) {
        this.webAudio = true;
    } else if (window.webkitAudioContext) {
        this.webAudio = true;
    } else {
        this.webAudio = false;
    }
};


//********************************
// helper getters
//********************************

Object.defineProperties(alex.utils.SystemInfo.prototype, {
    isAndroidStock: {
        get: function() {
            return this.browser === this.browserAndroidStock;
        }
    },
    isIOS: {
        get: function() {
            return this.os === this.osIOS;
        }
    },
    isMobile: {
        get: function() {
            return this.device === this.deviceMobile;
        }
    },
    isDesktop: {
        get: function() {
            return this.device === this.deviceDesktop;
        }
    },
    isAndroid: {
        get: function() {
            return this.os === this.osAndroid;
        }
    },
    isSafari: {
        get: function() {
            return (this.browser === this.browserSafari);
        }
    },
    isMobileSafari: {
        get: function() {
            return (this.os === this.osIOS) && this.isSafari;
        }
    },
    isIE: {
        get: function() {
            return (this.browser === this.browserIE);
        }
    }
});