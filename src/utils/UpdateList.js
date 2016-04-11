/**
 * class UpdateList
 * @constructor
 */
cc.core.utils.UpdateList = function(){
    this.updateItems = [];
	this.removeItems = [];
};

/**
 * could have been called apply....
 * @param target
 */
cc.core.utils.UpdateList.prototype.mixin = function(target){
    target.updateItems = [];
	target.removeItems = [];
	target.update = cc.core.utils.UpdateList.prototype.update;
    target.addUpdateItem = cc.core.utils.UpdateList.prototype.addUpdateItem;
	target.removeUpdateItem = cc.core.utils.UpdateList.prototype.removeUpdateItem;
    target.purge = cc.core.utils.UpdateList.prototype.purge;
};

/**
 *
 * @param p_delta
 */
cc.core.utils.UpdateList.prototype.update = function(p_delta){
    var n = this.updateItems.length;
    var item, i;
    for(i = n-1; i > -1; i--){
        item = this.updateItems[i];
        item.update(p_delta);
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

/**
 *
 */
cc.core.utils.UpdateList.prototype.purge = function(){
    this.updateItems.length = 0;
    this.removeItems.length = 0;
};

/**
 *
 * @type {cc.core.utils.UpdateList.add}
 */
cc.core.utils.UpdateList.prototype.addUpdateItem = cc.core.utils.UpdateList.prototype.add = function(p_item){
    //don't allow adding more than once!
    if(this.updateItems.indexOf(p_item) === -1){
        this.updateItems[this.updateItems.length] = p_item;
    }    
};

/**
 * this just adds to the remove list so that items aren't removed mid-loop
 * @type {cc.core.utils.UpdateList.remove}
 */
cc.core.utils.UpdateList.prototype.removeUpdateItem = cc.core.utils.UpdateList.prototype.remove = function(p_item){
    this.removeItems[this.removeItems.length] = p_item;
};

/**
 * actually remove the item...
 * @type {cc.core.utils.UpdateList._remove}
 */
cc.core.utils.UpdateList.prototype.removeUpdateItem = cc.core.utils.UpdateList.prototype._remove = function(p_item){
    var index = this.updateItems.indexOf(p_item);
    if(index > -1) this.updateItems.splice(index,1);
};

/**
 *
 */
Object.defineProperty(cc.core.utils.UpdateList.prototype, 'length', {
    get: function(){
        return this.updateItems.length;
    }
});