cc.core.utils.TweenGroup = function(){
	cc.core.utils.UpdateList.call(this);
};
cc.core.utils.TweenGroup.prototype = Object.create(cc.core.utils.UpdateList.prototype);

cc.core.utils.TweenGroup.prototype.update = function(p_delta){
    var n = this.updateItems.length;
    var item, isComplete;
    for(var i = n-1; i > -1; i--){
        item = this.updateItems[i];
        isComplete = item.update(p_delta);
        if(isComplete){
        	this.removeItems[this.removeItems.length] = item;
        }
    }
    //now remove items
    n = this.removeItems.length;
    if(n > 0){
        for(i = 0; i < n; i++){
            item = this.removeItems[i];
            this._remove(item);
        }
        this.removeItems.length = 0;
    }
};
