/**
 * has a list of actions (stored on objects from a pool)
 * class DelayedAction
 * @param poolSize
 * @constructor
 */
alex.utils.DelayedAction = function(poolSize){
    var size = poolSize || 50;
    this.createPool(size);
    this._actions = [];
};

/**
 * optional facility to bind scope
 * @param size
 */
alex.utils.DelayedAction.prototype.createPool = function(size){
    this._pool = [];
    while(size > 0){
        this._pool[this._pool.length] = {_targetTime: -1, _callback: null};
        size--;
    }
};

/**
 *
 * @returns {T}
 * @private
 */
alex.utils.DelayedAction.prototype._next = function(){
    var item = this._pool.shift();
    this._pool[this._pool.length] = item;
    return item;
};

/**
 *
 * @param p_callback
 * @param p_ms
 * @param p_scope
 * @returns {T}
 */
alex.utils.DelayedAction.prototype.delay = function(p_callback, p_ms, p_scope){
    var action = this._next();
    action._targetTime = p_ms || -1;
    if(typeof p_scope !== 'undefined'){
        action._callback = function(){
            p_callback.call(p_scope);
        };
    } else {
        action._callback = p_callback || null;
    }
    this._actions[this._actions.length] = action;
    return action;
};

/**
 *
 * @param elapsedTime
 */
alex.utils.DelayedAction.prototype.update = function(elapsedTime){
    var n = this._actions.length;
    if(n > 0){
        var i, action;
        for(i = n - 1; i > -1; i--){
            action = this._actions[i];
            if(action._targetTime > 0 && action._callback){
                action._targetTime -= elapsedTime;
                if(action._targetTime <= 0){
                    var callback = action._callback;
                    action._callback = null;
                    action._targetTime = -1;
                    this._actions.splice(i, 1);
                    callback();
                }
            }
        }
    }
};

/**
 *
 */
alex.utils.DelayedAction.prototype.clear = alex.utils.DelayedAction.prototype.purge = function(){
    var n = this._actions.length;
    if(n > 0){
        var i, action;
        for(i = n - 1; i > -1; i--){
            action = this._actions[i];
            action._callback = null;
            action._targetTime = -1;
        }
    }
    this._actions.length = 0;
};

/**
 *
 */
alex.utils.DelayedAction.prototype.dispose = function(){
    this.clear();
    this._pool = null;
};
