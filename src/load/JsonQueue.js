alex.load.JsonQueue = function(){
	alex.utils.EventDispatcher.call(this);
	this.queue = [];//an array
	this.results = {};
};
alex.load.JsonQueue.prototype = Object.create(alex.utils.EventDispatcher.prototype);
alex.load.JsonQueue.prototype.constructor = alex.load.JsonQueue;

/*
manifest is a list of objects with name and path 
*/
alex.load.JsonQueue.prototype.load = function(p_manifest){
	this.queue = this.queue.concat(p_manifest);
	this.numTotal = this.queue.length;
	this.numLoaded = 0;
	this.boundCallback = this._jsonLoaded.bind(this);

	this.loadNext();
};

alex.load.JsonQueue.prototype.loadNext = function(){
	if(this.queue.length > 0){
		// - don't load the list backwards!
		//use shift!
		var obj = this.queue.shift();
		var id = obj.id, src = obj.src;
		this.results[id] = null;
		//
		var loader = new alex.load.JsonLoader(src);
		loader.id = id;
		loader.on("loaded",this.boundCallback);
		loader.load();
	} else {
		//load complete
		//console.log("load complete");
		this.emit({type: "complete", results: this.results});
	}	
};

alex.load.JsonQueue.prototype._jsonLoaded = function(p_evt){
	//console.log("alex.utils.JsonQueue.prototype.onJsonLoaded: " + p_evt)
	var loader = p_evt.target;
	var jsonData = loader.jsonData;
	var id = loader.id;
	this.results[id] = jsonData;
	loader.removeEventListeners();
	this.numLoaded++;
	//this really ought to pass through index of total
	this.emit({type: "loaded",
			id: id,
			url: loader.url,
			loader: loader,
			numLoaded: this.numLoaded,
			numTotal: this.numTotal,
			jsonData:jsonData });
	//
	this.loadNext();
    return jsonData;
};