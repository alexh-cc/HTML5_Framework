//
alex.load.JsonLoader = function(url){
	alex.utils.EventDispatcher.call(this);
	this.url = url;
	this.id = null;
};
alex.load.JsonLoader.prototype = Object.create(alex.utils.EventDispatcher.prototype);
alex.load.JsonLoader.prototype.constructor = alex.load.JsonLoader;

/**
 * This will begin loading the JSON file
 */
alex.load.JsonLoader.prototype.load = function(){
	this.ajaxRequest = new PIXI.AjaxRequest();
	var scope = this;
	this.ajaxRequest.onreadystatechange = function() {
		scope.onJSONLoaded();
	};
	this.jsonData = null;	
	this.ajaxRequest.open("GET", this.url, true);
	if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/json");
	this.ajaxRequest.send(null)
};

/**
 */
alex.load.JsonLoader.prototype.onJSONLoaded = function(){
	if (this.ajaxRequest.readyState === 4) {
        if(this.ajaxRequest.status === 200){
            this.responseText = this.ajaxRequest.responseText;//also store the plain text... needed for spine
            this.jsonData = JSON.parse(this.responseText);
            this.dispatchEvent({type: "loaded", data: this.jsonData});
        } else if(this.ajaxRequest.status === 404){
            this.dispatchEvent({type: "error", data: null});
        } else if(this.ajaxRequest.status === 0){
            this.dispatchEvent({type: "error", data: null});
        }
    }	
};

//bring this over from PIXI v2
PIXI.AjaxRequest = function() {
    var activexmodes = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Microsoft.XMLHTTP']; //activeX versions to check for in IE
    //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
    if (window.ActiveXObject){
        for (var i=0; i<activexmodes.length; i++) {
            try{
                return new window.ActiveXObject(activexmodes[i]);
            }catch(e) {
                //suppress error
            }
        }
    } else if (window.XMLHttpRequest){ // if Mozilla, Safari etc
        return new window.XMLHttpRequest();
    } else {
        return null;
    }
};
