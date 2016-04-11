/**
 *
 * @constructor
 */
cc.core.utils.EventQueue = function(){
	cc.core.utils.EventDispatcher.call(this);

	this.queue = [];
};
cc.core.utils.EventQueue.prototype = Object.create(cc.core.utils.EventDispatcher.prototype);
cc.core.utils.EventQueue.prototype.constructor = cc.core.utils.EventQueue;

/**
 *
 * @param event
 */
cc.core.utils.EventQueue.prototype.queueEvent = function(event){
    this.queue[this.queue.length] = event;
};

/**
 *
 */
cc.core.utils.EventQueue.prototype.dispatchQueuedEvents = cc.core.utils.EventQueue.prototype.update = function(delta){
    while(this.queue.length > 0){
        this.dispatchEvent(this.queue.shift());
    }
};