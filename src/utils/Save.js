/**
 * Save data to localStorage
 * @class Save
 * @constructor
 */
alex.utils.Save = function(key){
    this.key = key || 'game_data';

    this.isSupported = this.checkSupported();
};

/**
 *
 * @param config
 */
alex.utils.Save.prototype.init = function(config){
    for(var s in config) if(config.hasOwnProperty(s)) this[s] = config[s];
};

/**
 *
 * @param data
 */
alex.utils.Save.prototype.save = function(data){
    if(this.isSupported && data){
        if(typeof data !== 'string') data = JSON.stringify(data);

        this._saveItem(this.key, data);
    }
};

/**
 *
 * @returns {Object}
 */
alex.utils.Save.prototype.restore = function(){
    if(this.isSupported){
        try {
            var stringValue = localStorage[this.key];
            if(typeof stringValue !== "undefined"){
                // - restore the data
                var data = JSON.parse(stringValue);
                return data;
            }
        } catch(e){
            console.log('ERROR - alex.utils.Save.restore:');
            console.log(e);
        }
    }
    return null;
};

/**
 *
 * @returns {boolean}
 * @private
 */
alex.utils.Save.prototype.checkSupported = function(){
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
};

/**
 *
 * @param p_key
 * @param p_value
 * @returns {boolean}
 * @private
 */
alex.utils.Save.prototype._saveItem = function(p_key, p_value){
    var success = true;
    try{
        localStorage.removeItem(p_key);
        localStorage.setItem(p_key, p_value);
    } catch(e){
        console.log("*** LOCAL STORAGE ERROR! " + e.message);
        success = false;
    }
    return success;
};
