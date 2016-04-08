/**
 * asset url lookup helper
 * @constructor
 */
alex.utils.UrlLookup = function(){

};

/**
 * allow id reference rather than full path
 * @param p_list
 */
alex.utils.UrlLookup.prototype.storeLookup = function(p_list){
    if(p_list){
        //TODO - this fails if use for both json and image with same id!
        var n = p_list.length;
        var item;
        for(var i = 0; i < n;i++){
            item = p_list[i];
            this.add(item);
        }
    }
};
/**
 *
 * @param item
 */
alex.utils.UrlLookup.prototype.add = function(item){
    this[item.src] = item;
    this[item.id] = item;
};

/**
 *
 * @param key
 * @returns {*}
 */
alex.utils.UrlLookup.prototype.getAssetData = function(key){
    return this[key];
};

/**
 *
 * @param key
 * @returns {*}
 */
alex.utils.UrlLookup.prototype.getURL = function(key){
    var assetData = this[key];
    if(!assetData){
        console.log("ERROR - no asset found for key  -> " + key);
        return null;
    } else{
        return assetData.src;
    }
};

/**
 *
 * @param fileName
 * @returns {*}
 */
alex.utils.UrlLookup.prototype.pathForFile = function(fileName){
    var id, item, foundPath = null;
    for(id in this){
        if(this.hasOwnProperty(id)){
            item = this[id];
            if(item.hasOwnProperty('src')){
                if(item.src.indexOf(fileName) > -1){
                    foundPath = item.src;
                    break;
                }
            }
        }
    }
    return foundPath;
};