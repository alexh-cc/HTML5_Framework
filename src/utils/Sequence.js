/**
 *
 * @param stuff
 * @param randomise
 * @constructor
 */
alex.utils.Sequence = function(stuff, randomise){
	this.list = [];
	if(stuff){
		this.add(stuff, randomise);
	}
};
/**
 *
 * @param stuff
 * @param randomise
 */
alex.utils.Sequence.prototype.add = function(stuff, randomise){
	if(Array.isArray(stuff)){
		var i, n = stuff.length;
		for(i =0; i < n;i++){
			this.list[this.list.length] = stuff[i];
		}
	} else {
		this.list[this.list.length] = stuff;
	}
	if(randomise) this.randomise();
};
/**
 *
 * @param stuff
 */
alex.utils.Sequence.prototype.remove = function(stuff){
	var index;
	if(Array.isArray(stuff)){
		var i, n = stuff.length, item;
		for(i =0; i < n;i++){
			item = stuff[i];
			index = this.list.indexOf(item);
			if(index > -1) this.list.splice(index, 1);
		}
	} else {
		index = this.list.indexOf(stuff);
		if(index > -1) this.list.splice(index, 1);
	}
};
/**
 *
 */
alex.utils.Sequence.prototype.randomise = function(){
	alex.utils.Randomise.randomise(this.list);
};
/**
 *
 * @returns {*}
 */
alex.utils.Sequence.prototype.next = function(){
	var item = null;
	if(this.list.length > 0){
		item = this.list.shift();
		this.list[this.list.length] = item;
	}
	return item;
};
/**
 *
 */
Object.defineProperty(alex.utils.Sequence.prototype, 'length', {
	get: function(){
		return this.list.length;
	}
});